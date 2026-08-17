/**
 * The life, laid along the world axis.
 *
 * A single source of truth for "where am I, how old am I, what am I wearing".
 * Age is interpolated continuously between keyframes, so growth is something
 * you feel across a chapter rather than something you catch happening.
 */

import { clamp, inverseLerp, lerp } from "@/engine/space";
import type { ChapterId } from "@/engine/types";
import type { Outfit } from "@/character/character";

export const WORLD_START = -600;
/** End of the vertical slice. The full journey continues to 28,400. */
export const WORLD_END = 13400;

type StageKey = { x: number; stage: number };

/** stage 0 ≈ age 6 · stage 1 ≈ age 23 */
const STAGE_KEYS: StageKey[] = [
  { x: -600, stage: 0.04 },
  { x: 1200, stage: 0.08 },
  { x: 2600, stage: 0.26 },
  { x: 5000, stage: 0.36 },
  // Glasses arrive around here — 7th–8th grade, in a corridor, unannounced.
  { x: 5800, stage: 0.44 },
  { x: 7200, stage: 0.62 },
  { x: 9000, stage: 0.66 },
  { x: 10800, stage: 0.68 },
  { x: 12000, stage: 0.72 },
  { x: 13400, stage: 0.76 },
];

export function stageAt(x: number): number {
  if (x <= STAGE_KEYS[0].x) return STAGE_KEYS[0].stage;
  const last = STAGE_KEYS[STAGE_KEYS.length - 1];
  if (x >= last.x) return last.stage;
  for (let i = 0; i < STAGE_KEYS.length - 1; i++) {
    const a = STAGE_KEYS[i];
    const b = STAGE_KEYS[i + 1];
    if (x >= a.x && x < b.x) {
      return lerp(a.stage, b.stage, inverseLerp(a.x, b.x, x));
    }
  }
  return last.stage;
}

export const progressAt = (x: number) =>
  clamp(inverseLerp(WORLD_START, WORLD_END, x), 0, 1);

// ---------------------------------------------------------------------------
// Wardrobe
// ---------------------------------------------------------------------------

export const OUTFITS: Record<ChapterId, Outfit> = {
  threshold: {
    top: "#2a3040",
    topShade: "#202633",
    bottom: "#232833",
    bottomShade: "#1b202a",
    shoes: "#171b24",
  },
  /** A kid in a football shirt in the hour before he gets called inside. */
  yard: {
    top: "#d64d3f",
    topShade: "#b03a2f",
    bottom: "#2f6b46",
    bottomShade: "#245538",
    shoes: "#f0ece2",
    accent: "#f2ede3",
  },
  /** The hoodie years. */
  room: {
    top: "#2e3d63",
    topShade: "#243050",
    bottom: "#8a7856",
    bottomShade: "#6f6045",
    shoes: "#e8e4da",
    extra: "hood",
  },
  school: {
    top: "#eceef2",
    topShade: "#cfd4dc",
    bottom: "#2b3450",
    bottomShade: "#212940",
    shoes: "#2a2d34",
    extra: "backpack",
  },
  /** Gown and stole. */
  stage: {
    top: "#171821",
    topShade: "#101119",
    bottom: "#1c1d26",
    bottomShade: "#141520",
    shoes: "#25262e",
    accent: "#e0a63c",
    extra: "gown",
  },
  /** One jacket, one suitcase. */
  goodbye: {
    top: "#26303f",
    topShade: "#1d2632",
    bottom: "#3c4657",
    bottomShade: "#2f3746",
    shoes: "#e6e2d8",
    extra: "backpack",
    carries: "suitcase",
  },
  crossing: {
    top: "#26303f",
    topShade: "#1d2632",
    bottom: "#3c4657",
    bottomShade: "#2f3746",
    shoes: "#e6e2d8",
    carries: "suitcase",
  },
  /** Colder. Everything is bigger now. */
  arrival: {
    top: "#1f3348",
    topShade: "#182838",
    bottom: "#4a5666",
    bottomShade: "#3a4552",
    shoes: "#e6e2d8",
    extra: "coat",
  },
};
