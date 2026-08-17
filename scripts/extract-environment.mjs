/**
 * Extract the panels from the Casablanca environment reference sheet.
 *
 * The sheet is a grid of painted panels on an off-white ground, each with a
 * label above it. We find the panels by scanning for large rectangular regions
 * that differ from the background, then crop them losslessly — one crop, no
 * resampling, so the authored painting survives intact.
 *
 * These become the real environment textures. Hand-painting canvas approximations
 * of artwork we already have was never the right call.
 */
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "public", "env");
mkdirSync(OUT, { recursive: true });

const sheetName = readdirSync(ROOT).find((f) => f.includes("01_27_44") && f.endsWith(".png"));
if (!sheetName) throw new Error("environment sheet not found in repo root");

const png = PNG.sync.read(readFileSync(join(ROOT, sheetName)));
const { width: W, height: H, data } = png;
console.log(`sheet ${sheetName}  ${W}x${H}`);

const at = (x, y) => {
  const i = (y * W + x) << 2;
  return [data[i], data[i + 1], data[i + 2]];
};

// Background is the paper the panels sit on — sample a margin pixel.
const BG = at(4, 4);
const isBg = (x, y) => {
  const [r, g, b] = at(x, y);
  return Math.abs(r - BG[0]) < 16 && Math.abs(g - BG[1]) < 16 && Math.abs(b - BG[2]) < 16;
};

// Mark non-background pixels, coarsely (every 2px is plenty at this size).
const STEP = 2;
const cw = Math.ceil(W / STEP);
const ch = Math.ceil(H / STEP);
const mask = new Uint8Array(cw * ch);
for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    mask[y * cw + x] = isBg(Math.min(W - 1, x * STEP), Math.min(H - 1, y * STEP)) ? 0 : 1;
  }
}

// Flood-fill connected components; keep the big rectangular ones (the panels).
const seen = new Uint8Array(cw * ch);
const boxes = [];
const stack = [];
for (let sy = 0; sy < ch; sy++) {
  for (let sx = 0; sx < cw; sx++) {
    const s = sy * cw + sx;
    if (!mask[s] || seen[s]) continue;
    let x0 = sx, x1 = sx, y0 = sy, y1 = sy, n = 0;
    stack.push(s);
    seen[s] = 1;
    while (stack.length) {
      const i = stack.pop();
      const x = i % cw;
      const y = (i / cw) | 0;
      n++;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue;
        const j = ny * cw + nx;
        if (mask[j] && !seen[j]) {
          seen[j] = 1;
          stack.push(j);
        }
      }
    }
    const w = (x1 - x0 + 1) * STEP;
    const h = (y1 - y0 + 1) * STEP;
    const fill = n / ((x1 - x0 + 1) * (y1 - y0 + 1));
    // Panels are large, roughly rectangular, and densely filled. Labels are not.
    if (w > 180 && h > 110 && fill > 0.72) {
      boxes.push({ x: x0 * STEP, y: y0 * STEP, w, h });
    }
  }
}

// Reading order: top-to-bottom in rows, then left-to-right.
boxes.sort((a, b) => (Math.abs(a.y - b.y) > 60 ? a.y - b.y : a.x - b.x));
console.log(`found ${boxes.length} panels`);

const manifest = [];
boxes.forEach((b, i) => {
  const out = new PNG({ width: b.w, height: b.h });
  for (let y = 0; y < b.h; y++) {
    for (let x = 0; x < b.w; x++) {
      const si = ((b.y + y) * W + (b.x + x)) << 2;
      const di = (y * b.w + x) << 2;
      out.data[di] = data[si];
      out.data[di + 1] = data[si + 1];
      out.data[di + 2] = data[si + 2];
      out.data[di + 3] = 255;
    }
  }
  const name = `panel-${String(i + 1).padStart(2, "0")}.png`;
  writeFileSync(join(OUT, name), PNG.sync.write(out));
  manifest.push({ name, ...b });
  console.log(`  ${name}  ${b.w}x${b.h}  at ${b.x},${b.y}`);
});

writeFileSync(join(OUT, "panels.json"), JSON.stringify(manifest, null, 2));
console.log(`\nwrote ${manifest.length} panels to public/env/`);
