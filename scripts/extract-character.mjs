/**
 * Character sheet → runtime assets.
 *
 * The supplied sheets are the canonical visual source of truth. This script
 * cuts them into individual sprites exactly once: flood-fill the background from
 * the edges, label what is left, crop tightly, and write a manifest recording
 * each sprite's ground-contact point.
 *
 * Two rules drive the implementation:
 *
 * 1. **Never colour-key the background.** The cream sheet ground (#f2ede6) is
 *    within a few values of the EPFL quarter-zip and the graduation shirt. A
 *    global key eats them. Flood-filling inward from the edges only removes
 *    background that is actually *connected* to the edge, so enclosed whites
 *    survive.
 * 2. **Never resample.** Crop is a straight pixel copy. The art keeps the
 *    resolution and the authored lighting it was drawn with.
 *
 * Usage:
 *   node scripts/extract-character.mjs --probe    report what it finds
 *   node scripts/extract-character.mjs            write sprites + manifest
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "characters");
const PROBE = process.argv.includes("--probe");

/**
 * Which sheet is which era, and what the rows mean.
 * `rows` are fractions of sheet height used only to classify detected sprites,
 * never to crop them — cropping is always driven by actual pixels.
 */
const SHEETS = [
  {
    file: "ChatGPT Image 15 août 2026, 18_50_51.png",
    era: "childhood",
    label: "ERA_01_CHILDHOOD",
    ageRange: "7-9",
    bands: [
      { yMax: 0.46, kind: "orientation", names: ["front", "threeQuarter", "side", "back"] },
      { yMax: 0.78, kind: "stance", names: ["idle", "walk", "run"] },
      { yMax: 1.0, kind: "expression", names: ["neutral", "curiosity", "concentration", "happiness", "determination", "wonder"] },
    ],
  },
  {
    file: "ChatGPT Image 15 août 2026, 19_01_12.png",
    era: "earlyTeen",
    label: "ERA_02_EARLY_TEEN",
    ageRange: "11-13",
    // A bonus full-height hero portrait sits in a right-hand column. It spans
    // every band, so it has to be excluded before banding, not filtered after.
    ignoreX: 1150,
    bands: [
      { yMax: 0.44, kind: "orientation", names: ["front", "threeQuarter", "side", "back"] },
      { yMax: 0.76, kind: "stance", names: ["idle", "walk", "run"] },
      { yMax: 1.0, kind: "expression", names: ["neutral", "curiosity", "concentration", "happiness", "determination", "wonder"] },
    ],
  },
  {
    file: "ChatGPT Image 15 août 2026, 19_07_58.png",
    era: "highSchool",
    label: "ERA_03_HIGH_SCHOOL",
    ageRange: "15-18",
    ignoreX: 1150,
    bands: [
      { yMax: 0.47, kind: "orientation", names: ["front", "threeQuarter", "side", "back"] },
      { yMax: 0.79, kind: "stance", names: ["idle", "walk", "run"] },
      { yMax: 1.0, kind: "expression", names: ["neutral", "curiosity", "concentration", "happiness", "determination", "wonder"] },
    ],
  },
  {
    file: "ChatGPT Image 15 août 2026, 19_26_07.png",
    era: "graduation",
    label: "ERA_04_GRADUATION",
    ageRange: "17-18",
    bands: [
      { yMax: 0.46, kind: "orientation", names: ["front", "threeQuarter", "side", "back"] },
      { yMax: 0.78, kind: "stance", names: ["idle", "walk", "run"] },
      { yMax: 1.0, kind: "expression", names: ["neutral", "curiosity", "concentration", "happiness", "determination", "wonder"] },
    ],
  },
  {
    file: "ChatGPT Image 15 août 2026, 17_45_09.png",
    era: "epflCurrent",
    label: "ERA_05_EPFL_CURRENT",
    ageRange: "20-23",
    bands: [
      { yMax: 0.6, kind: "orientation", names: ["front", "threeQuarter", "side", "back"] },
      { yMax: 1.0, kind: "stance", names: ["idle", "walk", "run"] },
    ],
  },
  {
    file: "ChatGPT Image 15 août 2026, 18_44_42.png",
    era: "epflCurrent",
    label: "ERA_05_EPFL_CURRENT",
    ageRange: "20-23",
    bands: [
      { yMax: 1.0, kind: "expression", names: ["neutral", "curiosity", "concentration", "happiness", "determination", "wonder"] },
    ],
  },
];

/**
 * Colour distance tolerance when deciding "this pixel is sheet background".
 *
 * Set high enough to consume the sheets' soft baked drop shadows, which
 * otherwise survive as grey smudges and double up with the shadow the world
 * casts. This is safe because the art carries strong dark linework everywhere —
 * the fill reaches the shadow and stops dead at the outlines, so white shoes
 * and light clothing inside those outlines are untouched.
 *
 * A colour-keyed strip was tried instead and ate the white sneakers.
 */
const BG_TOLERANCE = 62;

/*
 * Rejected: a pass that cleared background-coloured regions trapped inside the
 * silhouette (the gap between the legs). Interior white details — collars,
 * cuffs, waistbands, shoe highlights — are small background-coloured regions
 * too, so no size threshold separates them, and the pass punched holes through
 * the clothing. The faint residue under a few feet is much less harmful than
 * destroying the art, so it stays until there is a shape-aware fix.
 */
/** Components smaller than this are text labels and drop-shadow fragments. */
const MIN_AREA = 2600;
const MIN_HEIGHT = 60;
/** Components whose boxes are within this many px get merged (ball at a foot). */
const MERGE_GAP = 26;

function loadPng(path) {
  return PNG.sync.read(readFileSync(path));
}

/** Flood-fill inward from every edge pixel, marking connected background. */
function backgroundMask(png) {
  const { width: w, height: h, data } = png;
  const bg = [data[0], data[1], data[2]];
  const isBg = (i) => {
    const dr = data[i] - bg[0];
    const dg = data[i + 1] - bg[1];
    const db = data[i + 2] - bg[2];
    return Math.sqrt(dr * dr + dg * dg + db * db) <= BG_TOLERANCE;
  };

  const mask = new Uint8Array(w * h); // 1 = background
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (mask[p]) return;
    if (!isBg(p * 4)) return;
    mask[p] = 1;
    stack.push(p);
  };

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (stack.length) {
    const p = stack.pop();
    const x = p % w;
    const y = (p / w) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  return mask;
}

/** Label connected foreground components; return their bounding boxes. */
function components(mask, w, h) {
  const seen = new Uint8Array(w * h);
  const boxes = [];
  const stack = [];
  for (let start = 0; start < w * h; start++) {
    if (mask[start] || seen[start]) continue;
    let x0 = w, y0 = h, x1 = 0, y1 = 0, area = 0;
    stack.push(start);
    seen[start] = 1;
    while (stack.length) {
      const p = stack.pop();
      const x = p % w;
      const y = (p / w) | 0;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      area++;
      const nb = [p + 1, p - 1, p + w, p - w];
      const xs = [x + 1, x - 1, x, x];
      const ys = [y, y, y + 1, y - 1];
      for (let k = 0; k < 4; k++) {
        const nx = xs[k];
        const ny = ys[k];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const q = nb[k];
        if (seen[q] || mask[q]) continue;
        seen[q] = 1;
        stack.push(q);
      }
    }
    boxes.push({ x0, y0, x1, y1, area, w: x1 - x0 + 1, h: y1 - y0 + 1 });
  }
  return boxes;
}

/**
 * Absorb small detached fragments into a nearby large one — the football under
 * the child's foot, a stray shoe highlight.
 *
 * Only ever merges a *small* box into a *large* one. Merging two comparable
 * boxes cascades: the graduation sheet collapsed into a single 1262x987 blob
 * before this constraint existed.
 */
const FRAGMENT_RATIO = 0.3;

function mergeBoxes(boxes) {
  const out = boxes.slice();
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i];
        const b = out[j];
        const small = Math.min(a.area, b.area);
        const large = Math.max(a.area, b.area);
        if (small > large * FRAGMENT_RATIO) continue;
        const gapX = Math.max(0, Math.max(a.x0, b.x0) - Math.min(a.x1, b.x1));
        const gapY = Math.max(0, Math.max(a.y0, b.y0) - Math.min(a.y1, b.y1));
        if (gapX <= MERGE_GAP && gapY <= MERGE_GAP) {
          out[i] = {
            x0: Math.min(a.x0, b.x0),
            y0: Math.min(a.y0, b.y0),
            x1: Math.max(a.x1, b.x1),
            y1: Math.max(a.y1, b.y1),
            area: a.area + b.area,
            w: Math.max(a.x1, b.x1) - Math.min(a.x0, b.x0) + 1,
            h: Math.max(a.y1, b.y1) - Math.min(a.y0, b.y0) + 1,
          };
          out.splice(j, 1);
          merged = true;
          break outer;
        }
      }
    }
  }
  return out;
}

/** Straight pixel copy into a new PNG, background pixels made transparent. */
function crop(png, mask, box) {
  const out = new PNG({ width: box.w, height: box.h });
  for (let y = 0; y < box.h; y++) {
    for (let x = 0; x < box.w; x++) {
      const sx = box.x0 + x;
      const sy = box.y0 + y;
      const s = (sy * png.width + sx) * 4;
      const d = (y * box.w + x) * 4;
      const isBg = mask[sy * png.width + sx];
      out.data[d] = png.data[s];
      out.data[d + 1] = png.data[s + 1];
      out.data[d + 2] = png.data[s + 2];
      out.data[d + 3] = isBg ? 0 : png.data[s + 3];
    }
  }
  return out;
}

/**
 * The ground-contact row: the lowest row with meaningful opaque coverage.
 * Soft drop shadows taper, so a coverage threshold finds the feet rather than
 * the last stray shadow pixel. This is the value the whole age-transition
 * system depends on — feet stay put, the body grows upward.
 */
function baseline(sprite) {
  const { width: w, height: h, data } = sprite;
  for (let y = h - 1; y >= 0; y--) {
    let solid = 0;
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 160) solid++;
    }
    if (solid >= Math.max(2, w * 0.03)) return y;
  }
  return h - 1;
}

// ---------------------------------------------------------------------------

const manifest = { generated: new Date().toISOString(), eras: {} };

for (const sheet of SHEETS) {
  const path = join(ROOT, sheet.file);
  let png;
  try {
    png = loadPng(path);
  } catch {
    console.log(`SKIP (missing): ${sheet.file}`);
    continue;
  }

  const mask = backgroundMask(png);
  const raw = components(mask, png.width, png.height);
  const kept = mergeBoxes(
    raw.filter(
      (b) =>
        b.area >= MIN_AREA &&
        b.h >= MIN_HEIGHT &&
        (sheet.ignoreX === undefined || b.x0 < sheet.ignoreX),
    ),
  ).sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);

  // Group into the sheet's declared bands by vertical centre.
  const bands = sheet.bands.map((b) => ({ ...b, items: [] }));
  for (const box of kept) {
    const cy = (box.y0 + box.y1) / 2 / png.height;
    const band = bands.find((b) => cy <= b.yMax) ?? bands[bands.length - 1];
    band.items.push(box);
  }
  for (const b of bands) b.items.sort((p, q) => p.x0 - q.x0);

  console.log(`\n${sheet.label}  (${sheet.file})`);
  console.log(`  ${png.width}x${png.height}, ${raw.length} components → ${kept.length} sprites`);

  const era = (manifest.eras[sheet.era] ??= {
    label: sheet.label,
    ageRange: sheet.ageRange,
    sources: [],
    orientation: {},
    stance: {},
    expression: {},
  });
  if (!era.sources.includes(sheet.file)) era.sources.push(sheet.file);

  for (const band of bands) {
    const expected = band.names.length;
    const got = band.items.length;
    const flag = got === expected ? "ok" : `MISMATCH expected ${expected}`;
    console.log(`  ${band.kind.padEnd(11)} ${got} ${flag}`);

    band.items.forEach((box, i) => {
      const name = band.names[i] ?? `extra${i}`;
      console.log(
        `    ${name.padEnd(14)} ${box.w}x${box.h} at ${box.x0},${box.y0}`,
      );
      if (PROBE) return;

      const sprite = crop(png, mask, box);
      const dir = join(OUT, sheet.era, band.kind);
      mkdirSync(dir, { recursive: true });
      const rel = `characters/${sheet.era}/${band.kind}/${name}.png`;
      writeFileSync(join(dir, `${name}.png`), PNG.sync.write(sprite));

      era[band.kind][name] = {
        src: `/${rel}`,
        w: box.w,
        h: box.h,
        // Ground contact, in pixels from the top of this sprite.
        baseline: baseline(sprite),
        // Pivot: horizontal centre, vertical ground contact. Scaling happens
        // around this point so feet never leave the floor.
        pivot: { x: 0.5, y: baseline(sprite) / box.h },
        source: { sheet: sheet.file, x: box.x0, y: box.y0 },
      };
    });
  }
}

if (!PROBE) {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));

  // Also emit a typed module so the runtime imports the manifest rather than
  // fetching it — no request, no loading state, exact types.
  const ts = `// GENERATED by scripts/extract-character.mjs — do not edit.
// Source of truth: the supplied character sheets in the repository root.

export type SpriteMeta = {
  src: string;
  w: number;
  h: number;
  /** Ground-contact row, in pixels from the top of the sprite. */
  baseline: number;
  /** Scale/rotate around this, so the feet never leave the floor. */
  pivot: { x: number; y: number };
  source: { sheet: string; x: number; y: number };
};

export type EraSprites = {
  label: string;
  ageRange: string;
  sources: string[];
  orientation: Record<string, SpriteMeta>;
  stance: Record<string, SpriteMeta>;
  expression: Record<string, SpriteMeta>;
};

export const SPRITE_MANIFEST = ${JSON.stringify(manifest.eras, null, 2)} as const satisfies Record<string, EraSprites>;

export type SpriteEraId = keyof typeof SPRITE_MANIFEST;
`;
  writeFileSync(join(ROOT, "character", "manifest.generated.ts"), ts);
  const n = readdirSync(OUT).length;
  console.log(`\nwrote ${OUT} (${n} entries) + manifest.json`);
} else {
  console.log("\n(probe only — nothing written)");
}
