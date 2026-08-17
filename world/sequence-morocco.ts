"use client";

/**
 * SEQUENCE 01 — MOROCCO
 *
 * The seventeen beats of `docs/STORYBOARD-01-MOROCCO.md`, as timeline data.
 * The storyboard should be readable straight off this file; if the two ever
 * disagree, the storyboard wins.
 *
 * Every beat is a **pure sample**. No triggers, no latches, no side effects —
 * which is the only reason scrubbing backward works without being a second
 * implementation.
 */

import type { Beat, BeatSample, Sampled, Timeline } from "@/engine/timeline";
import { easeInOut, easeOut, hold as holdEase, smoothstep, span } from "@/engine/timeline";

/** Named world positions, in metres, matching world/morocco.ts. */
export const P = {
  /** The home building's street-facing wall, and its entrance. */
  homeX: 2.7,
  homeZ: -5.6,
  /** Standing spot outside the front door. */
  doorX: 2.7,
  doorZ: -3.4,
  /** Where the street football happens. */
  ballX: 0.9,
  ballZ: -0.6,
  /** The 5v5 pitch centre. */
  pitchX: 19.8,
  pitchZ: -10.2,
  /** The western overlook, where the view opens. */
  viewX: -14.5,
  viewZ: 1.2,
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Interior planes sit at third-floor height but **in front of everything else**
 * (z = 8, ahead of the parapet at 5.9). Putting them inside the building volume
 * meant the façade sprite occluded them and "pushing through the window" just
 * showed brickwork — the camera is on the +z side, so the nearest thing wins.
 */
export const INTERIOR = {
  living: { x: P.homeX, y: 9.4, z: 8.0 },
  stairs: { x: P.homeX + 4.6, y: 7.0, z: 8.0 },
  bedroom: { x: P.homeX, y: 9.4, z: 8.0 },
};

/** Helper: a camera pose with sensible defaults. */
const cam = (
  targetX: number,
  targetY: number,
  targetZ: number,
  frustum: number,
  extra: Partial<Sampled["camera"]> = {},
): Sampled["camera"] => ({
  targetX,
  targetY,
  targetZ,
  frustum,
  pitchDeg: 24,
  yawDeg: 24,
  follow: 0,
  ...extra,
});

export const MOROCCO_BEATS: Beat[] = [
  // 01 ─────────────────────────────────────────────── First light
  {
    id: "01-first-light",
    range: [0.0, 0.05],
    sample: (u) => ({
      camera: cam(P.homeX, 9.6, -7.0, 5.0),
      world: { daylight: 0.0, haze: 0, fade: 1 - span(u, 0.0, 0.35, easeOut), pattern: 0 },
      character: { gait: 0 },
      audio: { beds: [{ id: "roomtone", gain: 0.35 }], score: 0 },
      text: null,
    }),
  },

  // 02 ─────────────────────────────────────────────── The building
  {
    id: "02-the-building",
    range: [0.05, 0.11],
    sample: (u) => ({
      camera: cam(
        P.homeX,
        lerp(9.6, 7.2, smoothstep(u)),
        lerp(-7.0, -2.0, smoothstep(u)),
        lerp(5.0, 11.0, easeInOut(u)),
      ),
      world: { daylight: lerp(0.0, 0.18, u), haze: 0, fade: 0, pattern: 0 },
      audio: { beds: [{ id: "roomtone", gain: 0.3 }, { id: "traffic", gain: u * 0.25 }], score: 0 },
    }),
  },

  // 03 ─────────────────────────────────────────────── Casablanca
  {
    id: "03-casablanca",
    range: [0.11, 0.175],
    chapter: "CHILDHOOD",
    sample: (u) => ({
      camera: cam(
        lerp(P.homeX, P.homeX + 1.2, u),
        lerp(7.2, 2.4, easeInOut(u)),
        lerp(-2.0, 0.6, smoothstep(u)),
        // out to 16, then settle back to 9 — the world assembling, then framing
        u < 0.6 ? lerp(11, 16, easeOut(u / 0.6)) : lerp(16, 9, easeInOut((u - 0.6) / 0.4)),
      ),
      world: { daylight: lerp(0.18, 1, easeOut(u)), haze: 0.15, fade: 0, pattern: 0 },
      text:
        u > 0.1 && u < 0.78
          ? { line: "", opacity: Math.min(span(u, 0.1, 0.24), 1 - span(u, 0.6, 0.78)), chapter: "Casablanca" }
          : null,
      audio: { beds: [{ id: "street", gain: lerp(0.25, 0.9, u) }], score: 0 },
    }),
  },

  // 04 ─────────────────────────────────────────────── The room (push through glass)
  {
    id: "04-the-room",
    range: [0.175, 0.25],
    chapter: "CHILDHOOD",
    sample: (u) => ({
      camera: cam(
        lerp(P.homeX + 1.2, INTERIOR.living.x, easeInOut(u)),
        lerp(2.4, INTERIOR.living.y, easeInOut(u)),
        lerp(0.6, INTERIOR.living.z, easeInOut(u)),
        lerp(9, 5.0, easeInOut(u)),
      ),
      world: { daylight: 1, haze: lerp(0.15, 0, u), fade: 0, pattern: 0 },
      character: { expression: "happiness", expressionWeight: 0.5, gait: 0 },
      // the street ducks under as the camera crosses the glass
      audio: {
        beds: [
          { id: "street", gain: lerp(0.9, 0.06, easeInOut(u)) },
          { id: "roomtone", gain: lerp(0.1, 0.7, easeInOut(u)) },
          { id: "tv", gain: lerp(0, 0.55, easeInOut(u)) },
        ],
        score: 0,
      },
    }),
  },

  // 05 ─────────────────────────────────────────────── The glance ★
  {
    id: "05-the-glance",
    range: [0.25, 0.285],
    chapter: "CHILDHOOD",
    sample: () => ({
      // COMPLETELY LOCKED. No drift, no handheld, no zoom. The stillness is the beat.
      camera: cam(INTERIOR.living.x, INTERIOR.living.y, INTERIOR.living.z, 4.7),
      world: { daylight: 1, haze: 0, fade: 0, pattern: 0 },
      character: { expression: "happiness", expressionWeight: 0.55, gait: 0 },
      audio: { beds: [{ id: "roomtone", gain: 0.5 }, { id: "tv", gain: 0.6 }], score: 0 },
      text: null,
    }),
  },

  // 06 ─────────────────────────────────────────────── Out
  {
    id: "06-out",
    range: [0.285, 0.33],
    chapter: "CHILDHOOD",
    sample: (u) => ({
      camera: cam(
        INTERIOR.living.x,
        lerp(INTERIOR.living.y, INTERIOR.living.y + 0.6, u),
        INTERIOR.living.z,
        lerp(4.7, 6.2, smoothstep(u)),
      ),
      world: { daylight: 1, haze: 0, fade: 0, pattern: 0 },
      character: { expression: "neutral", expressionWeight: 1, gait: lerp(0, 0.3, u) },
      audio: { beds: [{ id: "roomtone", gain: lerp(0.5, 0.3, u) }, { id: "tv", gain: lerp(0.6, 0, u) }], score: 0 },
    }),
  },

  // 07 ─────────────────────────────────────────────── The stairwell
  {
    id: "07-stairwell",
    range: [0.33, 0.4],
    chapter: "CHILDHOOD",
    sample: (u) => ({
      // descends WITH him — three floors made physical
      camera: cam(
        INTERIOR.stairs.x,
        lerp(INTERIOR.stairs.y + 3.4, INTERIOR.stairs.y - 5.2, easeInOut(u)),
        INTERIOR.stairs.z,
        4.6,
      ),
      world: { daylight: 1, haze: 0, fade: 0, pattern: 0 },
      character: { expression: "neutral", expressionWeight: 1, gait: 0.42 },
      audio: { beds: [{ id: "stairwell", gain: 0.8 }, { id: "street", gain: lerp(0.02, 0.2, u) }], score: 0 },
    }),
  },

  // 08 ─────────────────────────────────────────────── The street (door wipe)
  {
    id: "08-the-street",
    range: [0.4, 0.47],
    chapter: "CHILDHOOD",
    sample: (u) => ({
      camera: cam(
        lerp(P.doorX, P.doorX - 0.6, u),
        lerp(1.6, 1.5, u),
        lerp(P.doorZ - 1.4, P.doorZ + 0.6, easeInOut(u)),
        lerp(5.0, 8.5, easeInOut(u)),
        { follow: span(u, 0.55, 1) },
      ),
      // the wipe is a continuous light flood, so it reverses into the stairwell
      world: { daylight: 1, haze: lerp(0, 0.2, u), fade: 0, pattern: 0 },
      character: {
        expression: "curiosity",
        expressionWeight: lerp(0.1, 0.6, u),
        gait: lerp(0.3, 0.45, u),
      },
      audio: {
        beds: [
          { id: "stairwell", gain: lerp(0.8, 0, easeOut(u)) },
          { id: "street", gain: lerp(0.2, 1, easeOut(u)) },
        ],
        score: 0,
      },
    }),
  },

  // 09 ─────────────────────────────────────────────── Friends (camera leads)
  {
    id: "09-friends",
    range: [0.47, 0.535],
    chapter: "CHILDHOOD",
    sample: (u) => ({
      // the camera runs ahead so you see them before he does
      camera: cam(
        lerp(P.doorX - 0.6, P.ballX - 1.4, easeOut(u)),
        1.5,
        lerp(P.doorZ + 0.6, P.ballZ + 0.4, smoothstep(u)),
        lerp(8.5, 8.5, u),
        { follow: lerp(0.4, 0.15, u) },
      ),
      world: { daylight: 1, haze: 0.2, fade: 0, pattern: 0 },
      character: {
        expression: "happiness",
        expressionWeight: lerp(0.2, 0.8, u),
        gait: lerp(0.45, 0.7, u),
      },
      audio: { beds: [{ id: "street", gain: 0.85 }, { id: "kids", gain: lerp(0.2, 0.9, u) }], score: 0 },
    }),
  },

  // 10 ─────────────────────────────────────────────── Street football  [INTERACTIVE]
  {
    id: "10-street-football",
    range: [0.535, 0.615],
    chapter: "CHILDHOOD",
    interactive: true,
    sample: (u) => ({
      camera: cam(P.ballX, 1.5, P.ballZ + 0.6, lerp(8.5, 11, easeInOut(u)), { follow: 0.75 }),
      world: { daylight: 1, haze: 0.2, fade: 0, pattern: 0 },
      character: { expression: "happiness", expressionWeight: 0.7, gait: 0.5 },
      text:
        u > 0.28 && u < 0.86
          ? {
              line: "Before I knew what I wanted to make, I knew what I loved to play.",
              opacity: Math.min(span(u, 0.28, 0.42), 1 - span(u, 0.72, 0.86)),
            }
          : null,
      audio: { beds: [{ id: "street", gain: 0.7 }, { id: "kids", gain: 1 }, { id: "ball", gain: 0.8 }], score: 0 },
    }),
  },

  // 11 ─────────────────────────────────────────────── The 5v5 field
  {
    id: "11-the-field",
    range: [0.615, 0.68],
    chapter: "CHILDHOOD",
    sample: (u) => ({
      camera: cam(
        lerp(P.ballX, P.pitchX, easeInOut(u)),
        lerp(1.5, 2.2, u),
        lerp(P.ballZ + 0.6, P.pitchZ + 6.4, easeInOut(u)),
        lerp(11, 10, u),
        { follow: lerp(0.75, 0.5, u) },
      ),
      world: { daylight: 1, haze: 0.18, fade: 0, pattern: 0 },
      character: { expression: "concentration", expressionWeight: 0.6, gait: 0.55 },
      audio: { beds: [{ id: "kids", gain: 0.8 }, { id: "ball", gain: 0.9 }, { id: "street", gain: 0.35 }], score: 0 },
    }),
  },

  // 12 ─────────────────────────────────────────────── The climb
  {
    id: "12-the-climb",
    range: [0.68, 0.76],
    chapter: "CHILDHOOD",
    sample: (u) => ({
      // rises slightly FASTER than he climbs, so the horizon line drops in frame
      camera: cam(
        lerp(P.pitchX, -6.0, easeInOut(u)),
        lerp(2.2, 5.4, easeOut(u)),
        lerp(P.pitchZ + 6.4, 1.6, easeInOut(u)),
        lerp(10, 11.5, u),
        { follow: lerp(0.5, 0.25, u) },
      ),
      world: { daylight: lerp(1, 0.9, u), haze: lerp(0.18, 0.3, u), fade: 0, pattern: 0 },
      character: { expression: "neutral", expressionWeight: 1, gait: 0.5 },
      audio: {
        beds: [
          { id: "street", gain: lerp(0.35, 0.08, u) },
          { id: "kids", gain: lerp(0.8, 0, easeOut(u)) },
          { id: "wind", gain: lerp(0, 0.5, u) },
          // the sea arrives BEFORE it is visible — a ~2s audio lead
          { id: "sea", gain: span(u, 0.55, 1) * 0.45 },
        ],
        score: 0,
      },
    }),
  },

  // 13 ─────────────────────────────────────────────── The reveal ★
  {
    id: "13-the-reveal",
    range: [0.76, 0.84],
    chapter: "CHILDHOOD",
    sample: (u) => ({
      // rises AND pulls back: the parapet descends through frame and uncovers the horizon
      camera: cam(
        lerp(-6.0, P.viewX, easeInOut(u)),
        lerp(5.4, 11.5, holdEase(u)),
        lerp(1.6, 3.4, smoothstep(u)),
        lerp(11.5, 26, holdEase(u)),
        { follow: lerp(0.25, 0, u) },
      ),
      world: { daylight: lerp(0.9, 0.86, u), haze: lerp(0.3, 0.5, u), fade: 0, pattern: 0 },
      character: {
        expression: "wonder",
        expressionWeight: span(u, 0.25, 0.7),
        gait: 1 - span(u, 0.1, 0.4),
      },
      text: null,
      audio: {
        beds: [
          { id: "street", gain: lerp(0.08, 0, u) },
          { id: "wind", gain: 0.6 },
          { id: "sea", gain: lerp(0.45, 0.75, u) },
          { id: "gulls", gain: span(u, 0.3, 1) * 0.35 },
        ],
        score: 0,
      },
    }),
  },

  // 14 ─────────────────────────────────────────────── Hold ★
  {
    id: "14-hold",
    range: [0.84, 0.88],
    chapter: "CHILDHOOD",
    sample: () => ({
      // absolutely still
      camera: cam(P.viewX, 11.5, 3.4, 26, { follow: 0 }),
      world: { daylight: 0.86, haze: 0.5, fade: 0, pattern: 0 },
      character: { expression: "wonder", expressionWeight: 0.8, gait: 0 },
      text: null,
      audio: { beds: [{ id: "wind", gain: 0.4 }, { id: "sea", gain: 0.5 }, { id: "gulls", gain: 0.2 }], score: 0 },
    }),
  },

  // 15 ─────────────────────────────────────────────── Home
  {
    id: "15-home",
    range: [0.88, 0.94],
    chapter: "CHILDHOOD",
    sample: (u) => ({
      camera: cam(
        lerp(P.viewX, P.doorX, easeInOut(u)),
        lerp(11.5, 1.7, easeInOut(u)),
        lerp(3.4, P.doorZ + 0.8, easeInOut(u)),
        lerp(26, 8, easeInOut(u)),
        { follow: span(u, 0.3, 1) * 0.6 },
      ),
      // evening: the same street, later, and different because he has seen it from above
      world: { daylight: lerp(0.86, 0.42, u), haze: lerp(0.5, 0.26, u), fade: 0, pattern: 0 },
      character: { expression: "neutral", expressionWeight: 0.7, gait: 0.42 },
      audio: {
        beds: [
          { id: "sea", gain: lerp(0.5, 0, easeOut(u)) },
          { id: "wind", gain: lerp(0.4, 0.05, u) },
          { id: "street", gain: lerp(0, 0.55, u) },
        ],
        score: 0,
      },
    }),
  },

  // 16 ─────────────────────────────────────────────── The room again
  {
    id: "16-the-room-again",
    range: [0.94, 0.985],
    chapter: "CHILDHOOD",
    sample: (u) => ({
      camera: cam(
        lerp(P.doorX, INTERIOR.bedroom.x, easeInOut(u)),
        lerp(1.7, INTERIOR.bedroom.y, easeInOut(u)),
        lerp(P.doorZ + 0.8, INTERIOR.bedroom.z, easeInOut(u)),
        lerp(8, 3.2, easeInOut(u)),
      ),
      world: { daylight: lerp(0.42, 0.12, u), haze: lerp(0.26, 0, u), fade: 0, pattern: 0 },
      character: { expression: "curiosity", expressionWeight: 0.6, gait: lerp(0.42, 0, u) },
      audio: {
        beds: [
          { id: "street", gain: lerp(0.55, 0.05, easeOut(u)) },
          { id: "roomtone", gain: lerp(0.1, 0.6, u) },
          { id: "game", gain: lerp(0, 0.4, u) },
        ],
        score: 0,
      },
    }),
  },

  // 17 ─────────────────────────────────────────────── Curiosity ★
  {
    id: "17-curiosity",
    range: [0.985, 1.0],
    sample: (u) => ({
      // slow push until the screen fills the frame — the same rectangle as beat 01
      camera: cam(
        INTERIOR.bedroom.x + 1.1,
        INTERIOR.bedroom.y + 0.15,
        INTERIOR.bedroom.z,
        lerp(3.2, 1.9, easeInOut(u)),
      ),
      world: { daylight: lerp(0.12, 0.02, u), haze: 0, fade: 0, pattern: 0 },
      character: { expression: "wonder", expressionWeight: 0.9, gait: 0 },
      text: {
        line: "Games were the first thing I wanted to make.",
        opacity: span(u, 0.25, 0.55),
      },
      audio: {
        beds: [{ id: "roomtone", gain: lerp(0.6, 0.1, u) }, { id: "game", gain: lerp(0.4, 0.75, u) }],
        score: 0,
      },
    }),
  },
];

export const MOROCCO_TIMELINE: Timeline = {
  beats: MOROCCO_BEATS,
  /** ~3½ minutes at a comfortable scroll pace. */
  lengthVh: 900,
};

/** Where the character stands at a given progress, when the timeline drives him. */
export function characterPathAt(p: number): { x: number; z: number; facing: number } {
  const legs: { at: number; x: number; z: number }[] = [
    { at: 0.4, x: P.doorX, z: P.doorZ - 1.2 },
    { at: 0.47, x: P.doorX - 0.4, z: P.doorZ + 0.4 },
    { at: 0.535, x: P.ballX + 1.6, z: P.ballZ + 0.2 },
    { at: 0.615, x: P.ballX, z: P.ballZ },
    { at: 0.68, x: P.pitchX, z: P.pitchZ + 4.6 },
    { at: 0.76, x: -6.0, z: 1.0 },
    { at: 0.84, x: P.viewX + 1.4, z: 1.2 },
    { at: 0.88, x: P.viewX + 1.4, z: 1.2 },
    { at: 0.94, x: P.doorX, z: P.doorZ - 0.4 },
    { at: 1.0, x: P.doorX, z: P.doorZ - 1.2 },
  ];
  if (p <= legs[0].at) return { x: legs[0].x, z: legs[0].z, facing: Math.PI };
  for (let i = 0; i < legs.length - 1; i++) {
    const a = legs[i];
    const b = legs[i + 1];
    if (p >= a.at && p <= b.at) {
      const t = smoothstep((p - a.at) / (b.at - a.at));
      const x = lerp(a.x, b.x, t);
      const z = lerp(a.z, b.z, t);
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const facing = Math.abs(dx) + Math.abs(dz) < 0.01 ? Math.PI : Math.atan2(dx, dz);
      return { x, z, facing };
    }
  }
  const last = legs[legs.length - 1];
  return { x: last.x, z: last.z, facing: Math.PI };
}
