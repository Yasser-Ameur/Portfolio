/**
 * Chapter palettes and atmospheric perspective.
 *
 * No colour is hard-coded anywhere in the world. Each chapter declares a
 * palette; geometry is authored in that palette's vocabulary and pushed toward
 * `haze` by depth. Distance is *computed*, not painted — the same silhouette is
 * a far mountain or a near rock depending only on its depth value.
 */

import { mix, shade, withAlpha } from "./color";

export type Palette = {
  id: string;
  /** Vertical sky gradient: zenith → mid → horizon. */
  sky: [string, string, string];
  /** Directional light colour. */
  key: string;
  /** Ambient / shadow colour. */
  fill: string;
  /** The colour distance mixes toward. */
  haze: string;
  /** The surface he walks on. */
  ground: string;
  /** The one saturated colour this chapter is allowed. */
  accent: string;
  /** −1 warm … +1 cold. Drives the character's rim light. */
  temp: number;
  /** Text colour in this chapter. */
  ink: string;
};

/** How hard distance washes toward haze. Higher = thicker air. */
const ATMOSPHERE = 2.4;

/** Depth 0 (the playable plane) → 1 (the horizon). */
export const atmosphereMix = (depth: number) =>
  1 - Math.exp(-Math.max(0, depth) * ATMOSPHERE);

/**
 * Push an authored colour into the distance.
 * Everything a chapter draws behind the ground plane goes through this.
 */
export const atmo = (p: Palette, color: string, depth: number) =>
  mix(color, p.haze, atmosphereMix(depth));

/** Surface catching the key light. */
export const lit = (p: Palette, color: string, amount = 0.22) =>
  mix(color, p.key, amount);

/** Surface turned away from it. */
export const shadowed = (p: Palette, color: string, amount = 0.35) =>
  mix(color, p.fill, amount);

/** A light source's glow colour at a given falloff. */
export const glow = (p: Palette, color: string, alpha: number) =>
  withAlpha(color, alpha);

// ---------------------------------------------------------------------------
// The palettes
// ---------------------------------------------------------------------------

export const PALETTES = {
  /** Before the story. Almost nothing, and one warm point of light. */
  threshold: {
    id: "threshold",
    sky: ["#080b11", "#0d121b", "#141b27"],
    key: "#ffd9a0",
    fill: "#0a0e15",
    haze: "#111825",
    ground: "#0b0f16",
    accent: "#ffbf6e",
    temp: 0,
    ink: "#e8e2d6",
  },

  /** Morocco, late afternoon. The hour before you get called inside. */
  yard: {
    id: "yard",
    sky: ["#3f7fb0", "#93bacf", "#f2c98d"],
    key: "#ffd9a0",
    fill: "#57466a",
    haze: "#e6c79c",
    ground: "#c9a06a",
    accent: "#d94f7a",
    temp: -0.85,
    ink: "#3a2a20",
  },

  /** The bedroom at night. A lamp, a monitor, and the hallway light still on. */
  room: {
    id: "room",
    sky: ["#0c1422", "#152137", "#28334d"],
    key: "#ffbf6e",
    fill: "#151d2e",
    haze: "#1b2740",
    ground: "#2b2a35",
    accent: "#5fd4e8",
    temp: -0.3,
    ink: "#d8dce8",
  },

  /** School years. Flat, unglamorous morning — deliberately the plainest palette. */
  school: {
    id: "school",
    sky: ["#7fa8c4", "#bacfd9", "#e0e7e5"],
    key: "#f6f2e6",
    fill: "#59636f",
    haze: "#c4ced4",
    ground: "#9a9280",
    accent: "#2f4a7a",
    temp: 0.1,
    ink: "#2c3440",
  },

  /** The hall. Warm, ceremonial, the widest light in the first half. */
  stage: {
    id: "stage",
    sky: ["#251a1e", "#3d2a26", "#6d4730"],
    key: "#ffcf8a",
    fill: "#37282f",
    haze: "#7c5439",
    ground: "#4a3428",
    accent: "#e0a63c",
    temp: -0.6,
    ink: "#f0e0c8",
  },

  /** The road out. Warmth draining from the frame. */
  goodbye: {
    id: "goodbye",
    sky: ["#2c3c5c", "#6b6b82", "#cb9c7c"],
    key: "#e8b48a",
    fill: "#383849",
    haze: "#8a8090",
    ground: "#57505e",
    accent: "#f0b070",
    temp: -0.2,
    ink: "#e6ddd4",
  },

  /** Altitude. The only chapter with no ground. */
  crossing: {
    id: "crossing",
    sky: ["#1d4d8a", "#5a9ec9", "#dfeaf2"],
    key: "#ffffff",
    fill: "#7a9ab5",
    haze: "#cfe2ee",
    ground: "#e8f0f5",
    accent: "#ffffff",
    temp: 0.5,
    ink: "#1b3550",
  },

  /** Switzerland. Everything is bigger and colder. */
  arrival: {
    id: "arrival",
    sky: ["#7ba9cd", "#c0d6e5", "#e9f0f3"],
    key: "#eaf2ff",
    fill: "#63788f",
    haze: "#cddce6",
    ground: "#8b9aa5",
    accent: "#2f7f9e",
    temp: 0.85,
    ink: "#22323f",
  },
} as const satisfies Record<string, Palette>;

export type PaletteId = keyof typeof PALETTES;

/** Blend two palettes — used across transition corridors. */
export function blendPalettes(a: Palette, b: Palette, t: number): Palette {
  if (t <= 0) return a;
  if (t >= 1) return b;
  return {
    id: `${a.id}~${b.id}`,
    sky: [
      mix(a.sky[0], b.sky[0], t),
      mix(a.sky[1], b.sky[1], t),
      mix(a.sky[2], b.sky[2], t),
    ],
    key: mix(a.key, b.key, t),
    fill: mix(a.fill, b.fill, t),
    haze: mix(a.haze, b.haze, t),
    ground: mix(a.ground, b.ground, t),
    accent: mix(a.accent, b.accent, t),
    temp: a.temp + (b.temp - a.temp) * t,
    ink: mix(a.ink, b.ink, t),
  };
}

/**
 * The CSS custom properties the world root carries.
 * Written once per palette change, never per frame unless the blend is moving.
 */
export function paletteVars(p: Palette): Record<string, string> {
  return {
    "--sky-0": p.sky[0],
    "--sky-1": p.sky[1],
    "--sky-2": p.sky[2],
    "--key": p.key,
    "--fill": p.fill,
    "--haze": p.haze,
    "--ground": p.ground,
    "--accent": p.accent,
    "--ink": p.ink,
    // Rim light on the character: warm chapters rim warm, cold rim cold.
    "--rim": p.temp < 0 ? shade(p.key, 0.06) : mix(p.key, "#cfe6ff", 0.5),
    "--rim-strength": String(0.35 + Math.abs(p.temp) * 0.25),
    "--grade": withAlpha(p.haze, 0.16),
    "--vignette": withAlpha(p.fill, 0.55),
  };
}
