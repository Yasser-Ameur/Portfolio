/**
 * The character rig: proportions, growth, and gait.
 *
 * One skeleton covers the whole life. `stage` is a continuous 0 → 1 across ~17
 * years, so he is always *between* two ages and never snaps — you notice he got
 * taller over a chapter, you never catch it happening.
 *
 * Walk and run are the same function with different amplitudes, interpolated by
 * speed. There is no gait state machine, so there is no pop between gaits and
 * no blend seams to hide.
 */

import { lerp } from "@/engine/space";

export type Proportions = {
  height: number;
  headR: number;
  legLen: number;
  torsoLen: number;
  neckLen: number;
  shoulderW: number;
  hipW: number;
  /** Side-view body depth — chest to back. */
  chestD: number;
  waistD: number;
  armW: number;
  legW: number;
  posture: number;
};

/** stage 0 ≈ age 6 · stage 1 ≈ age 23 */
export function proportions(stage: number): Proportions {
  const s = Math.max(0, Math.min(1, stage));
  const height = lerp(118, 178, s);
  // Children are large-headed and short-legged; adults invert both.
  const headR = (height * lerp(0.185, 0.13, s)) / 2;
  const legLen = height * lerp(0.43, 0.5, s);
  const neckLen = height * lerp(0.02, 0.034, s);
  const torsoLen = height - legLen - neckLen - headR * 2;
  return {
    height,
    headR,
    legLen,
    torsoLen,
    neckLen,
    shoulderW: height * lerp(0.21, 0.245, s),
    hipW: height * lerp(0.155, 0.175, s),
    // Real body depth, not a derived fraction — thin silhouettes read as sticks.
    chestD: height * lerp(0.135, 0.152, s),
    waistD: height * lerp(0.118, 0.124, s),
    armW: height * lerp(0.062, 0.058, s),
    legW: height * lerp(0.088, 0.081, s),
    posture: lerp(2, -1, s),
  };
}

/** Where a stage sits on the world axis — filled in per chapter (see world/journey.ts). */
export type Pose = {
  /** Radians, advances with distance travelled. */
  phase: number;
  /** 0 = still, 1 = full run. */
  speed: number;
  lean: number;
  bob: number;
  thighFar: number;
  thighNear: number;
  kneeFar: number;
  kneeNear: number;
  armFar: number;
  armNear: number;
  elbowFar: number;
  elbowNear: number;
  /** Breathing / settle, applied to the chest. */
  breath: number;
  headTilt: number;
  headTurn: number;
};

const DEG = 180 / Math.PI;

/** Amplitudes interpolate walk → run; idle is simply speed 0. */
export function gait(phase: number, speed: number, t: number): Pose {
  const s = Math.max(0, Math.min(1, speed));

  const aHip = lerp(6, 42, s);
  const aKnee = lerp(4, 30, s);
  const aArm = lerp(4, 34, s);
  const bobAmp = lerp(0.4, 5.2, s);

  const sinP = Math.sin(phase);
  const sinQ = Math.sin(phase + Math.PI);

  // Knee flexion peaks shortly after toe-off, while the leg swings through.
  const liftFar = Math.max(0, -Math.sin(phase + 0.6));
  const liftNear = Math.max(0, -Math.sin(phase + Math.PI + 0.6));

  // Hips rise twice per cycle — once per step.
  const bob = -bobAmp * (0.5 - 0.5 * Math.cos(2 * phase));

  // Idle breathing survives at speed 0 and fades out as he moves.
  const rest = 1 - s;
  const breath = Math.sin(t * 1.6) * 0.9 * rest;

  return {
    phase,
    speed: s,
    lean: lerp(0, 11, s * s),
    bob,
    thighFar: aHip * sinP,
    thighNear: aHip * sinQ,
    kneeFar: 2 + aKnee * liftFar * 1.6,
    kneeNear: 2 + aKnee * liftNear * 1.6,
    armFar: -aArm * sinP,
    armNear: -aArm * sinQ,
    elbowFar: lerp(8, 46, s) + aArm * 0.35 * Math.max(0, sinP),
    elbowNear: lerp(8, 46, s) + aArm * 0.35 * Math.max(0, sinQ),
    breath,
    headTilt: Math.sin(t * 0.7) * 1.4 * rest,
    headTurn: 0,
  };
}

/** Distance covered per radian of gait phase — keeps feet from skating. */
export function strideLength(p: Proportions, speed: number) {
  return p.legLen * lerp(0.42, 0.86, speed);
}

export const toDeg = (rad: number) => rad * DEG;

/**
 * Skin darkens slightly with age, per the brief: paler as a child, warmer and
 * more tanned as he grew.
 */
export function skinTone(stage: number) {
  const s = Math.max(0, Math.min(1, stage));
  return {
    base: mixHex("#f2d3bb", "#e3b088", s),
    shade: mixHex("#d9ae92", "#c08a63", s),
  };
}

function mixHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp((pa >> 16) & 255, (pb >> 16) & 255, t));
  const g = Math.round(lerp((pa >> 8) & 255, (pb >> 8) & 255, t));
  const bl = Math.round(lerp(pa & 255, pb & 255, t));
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`;
}

/**
 * Glasses arrive around 7th–8th grade and come off in his last year at EPFL.
 * Both transitions are gradual and neither is ever remarked on.
 */
export function glassesOpacity(stage: number) {
  const inAt = 0.4;
  const inTo = 0.46;
  const outAt = 0.84;
  const outTo = 0.9;
  if (stage < inAt) return 0;
  if (stage < inTo) return (stage - inAt) / (inTo - inAt);
  if (stage < outAt) return 1;
  if (stage < outTo) return 1 - (stage - outAt) / (outTo - outAt);
  return 0;
}
