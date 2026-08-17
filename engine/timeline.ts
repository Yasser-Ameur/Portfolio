"use client";

/**
 * The cinematic timeline.
 *
 * The single most important rule in this file:
 *
 *   > sample(progress) is a PURE FUNCTION. No side effects, ever.
 *
 * Everything the visitor sees at scroll position `p` is *derived* from `p` —
 * camera, character, world, light, text, audio. Nothing is triggered, latched
 * or accumulated. That is what makes scrubbing backward free rather than a
 * second implementation: reversing is just sampling a smaller number.
 *
 * The failure mode this exists to prevent is `if (scroll > 0.4) doThing()`
 * scattered through the app. One call, one state, deterministic in both
 * directions.
 *
 * Structure borrowed (in craft, not content) from cinematic scroll sites: an
 * opening threshold, then a continuous sequence of named beats, each carrying
 * coordinated tracks.
 */

import type { EraId, ExpressionId } from "@/character/eras";

// --- easing ----------------------------------------------------------------

export type Ease = (t: number) => number;

export const linear: Ease = (t) => t;
export const smoothstep: Ease = (t) => t * t * (3 - 2 * t);
export const easeOut: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const easeIn: Ease = (t) => t * t * t;
export const easeInOut: Ease = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
/** Hangs near the start, then resolves — good for reveals that should feel earned. */
export const hold: Ease = (t) => Math.pow(t, 2.6);

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Normalised position of `p` inside `[a, b]`, eased. */
export function span(p: number, a: number, b: number, ease: Ease = linear): number {
  if (b <= a) return p >= b ? 1 : 0;
  return ease(clamp01((p - a) / (b - a)));
}

// --- keyframes -------------------------------------------------------------

export type Key<T> = { at: number; value: T; ease?: Ease };

/** Sample a numeric keyframe track. Constant outside its range. */
export function track(keys: Key<number>[], p: number): number {
  if (keys.length === 0) return 0;
  if (p <= keys[0].at) return keys[0].value;
  const last = keys[keys.length - 1];
  if (p >= last.at) return last.value;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (p >= a.at && p <= b.at) {
      const t = (b.ease ?? smoothstep)((p - a.at) / (b.at - a.at));
      return lerp(a.value, b.value, t);
    }
  }
  return last.value;
}

/** Sample a track of discrete values — no interpolation, last one wins. */
export function step<T>(keys: Key<T>[], p: number): T {
  let v = keys[0]?.value;
  for (const k of keys) if (p >= k.at) v = k.value;
  return v;
}

// --- the sampled world state ----------------------------------------------

export type CameraPose = {
  /** Where the camera looks, in world metres. */
  targetX: number;
  targetY: number;
  targetZ: number;
  /** Metres of world visible vertically. Smaller = closer. */
  frustum: number;
  pitchDeg: number;
  yawDeg: number;
  /** 0 = locked to the authored pose, 1 = fully following the character. */
  follow: number;
};

export type CharacterPose = {
  x: number;
  z: number;
  /** Facing in radians. */
  facing: number;
  /** 0 idle … 1 running. Drives stance selection and animation rate. */
  gait: number;
  era: EraId;
  /** 0 → 1 across an age transition; `era` is the source, `eraNext` the target. */
  eraBlend: number;
  eraNext: EraId | null;
  expression: ExpressionId;
  expressionWeight: number;
  /** Head turn, radians, relative to facing. For looking at things. */
  lookAt: number;
};

export type WorldPose = {
  /** Time of day 0..1, drives the whole palette. */
  daylight: number;
  /** 0 clear … 1 full haze. */
  haze: number;
  /** Master fade, for the opening and for chapter breaks. */
  fade: number;
  /** 0 = no pattern layer, 1 = fully revealed. Latches on in the rewiring. */
  pattern: number;
};

export type TextCue = {
  line: string;
  /** 0 hidden, 1 fully present. */
  opacity: number;
  /** Vertical chapter label, set down the side of the frame. */
  chapter?: string;
};

export type AudioPose = {
  /** Named ambience bed, crossfaded by weight. */
  beds: { id: string; gain: number }[];
  score: number;
};

export type Sampled = {
  progress: number;
  beat: string;
  camera: CameraPose;
  character: CharacterPose;
  world: WorldPose;
  text: TextCue | null;
  audio: AudioPose;
  /** True where the visitor may take direct control. */
  interactive: boolean;
};

// --- beats -----------------------------------------------------------------

/** What a beat may return. Sub-objects are partial; the merge fills the rest. */
export type BeatSample = {
  camera?: Partial<CameraPose>;
  character?: Partial<CharacterPose>;
  world?: Partial<WorldPose>;
  text?: TextCue | null;
  audio?: AudioPose;
};

export type Beat = {
  id: string;
  /** Scroll range this beat owns, in [0,1]. Beats must tile the timeline. */
  range: [number, number];
  /** Vertical chapter label shown while this beat is active. */
  chapter?: string;
  /** Hand the character to the visitor for this beat. */
  interactive?: boolean;
  /**
   * Sample this beat. `u` is local progress 0..1 inside the beat's range.
   * MUST be pure — no mutation, no triggering.
   */
  sample: (u: number, p: number) => BeatSample;
};

export type Timeline = {
  beats: Beat[];
  /** Total scroll distance in viewport heights. Governs pacing. */
  lengthVh: number;
};

const DEFAULT: Sampled = {
  progress: 0,
  beat: "",
  camera: { targetX: 0, targetY: 1, targetZ: 0, frustum: 7.2, pitchDeg: 24, yawDeg: 24, follow: 1 },
  character: {
    x: 0,
    z: 0,
    facing: 0,
    gait: 0,
    era: "childhood",
    eraBlend: 0,
    eraNext: null,
    expression: "neutral",
    expressionWeight: 1,
    lookAt: 0,
  },
  world: { daylight: 0.5, haze: 0, fade: 0, pattern: 0 },
  text: null,
  audio: { beds: [], score: 0 },
  interactive: false,
};

/**
 * Sample the whole timeline at `p`.
 *
 * Blends across beat boundaries so nothing pops — at the seam between two
 * beats both are sampled and crossfaded over `SEAM`, which is why a beat can
 * end mid-movement without the camera jumping.
 */
const SEAM = 0.012;

export function sample(tl: Timeline, p: number): Sampled {
  const prog = clamp01(p);
  const active = tl.beats.filter((b) => prog >= b.range[0] - SEAM && prog <= b.range[1] + SEAM);
  if (active.length === 0) return { ...DEFAULT, progress: prog };

  let out: Sampled = { ...DEFAULT, progress: prog };
  let total = 0;

  for (const b of active) {
    const [a, z] = b.range;
    const u = clamp01(z > a ? (prog - a) / (z - a) : 0);
    // Weight falls off outside the beat's own range, producing the crossfade.
    const w =
      prog < a ? clamp01(1 - (a - prog) / SEAM) : prog > z ? clamp01(1 - (prog - z) / SEAM) : 1;
    if (w <= 0) continue;

    const s = b.sample(u, prog);
    out = mergeWeighted(out, s, w, total === 0);
    if (w >= 0.999) {
      out.beat = b.id;
      out.interactive = b.interactive ?? false;
      if (b.chapter && out.text) out.text.chapter = b.chapter;
      else if (b.chapter) out.text = { line: "", opacity: 0, chapter: b.chapter };
    }
    total += w;
  }
  out.progress = prog;
  return out;
}

/** Numeric fields blend; discrete fields take the highest-weight contributor. */
function mergeWeighted(base: Sampled, s: BeatSample, w: number, first: boolean): Sampled {
  const out: Sampled = first ? { ...base } : base;

  if (s.camera) {
    const c = out.camera;
    const n = s.camera;
    out.camera = {
      targetX: first ? (n.targetX ?? c.targetX) : lerp(c.targetX, n.targetX ?? c.targetX, w),
      targetY: first ? (n.targetY ?? c.targetY) : lerp(c.targetY, n.targetY ?? c.targetY, w),
      targetZ: first ? (n.targetZ ?? c.targetZ) : lerp(c.targetZ, n.targetZ ?? c.targetZ, w),
      frustum: first ? (n.frustum ?? c.frustum) : lerp(c.frustum, n.frustum ?? c.frustum, w),
      pitchDeg: first ? (n.pitchDeg ?? c.pitchDeg) : lerp(c.pitchDeg, n.pitchDeg ?? c.pitchDeg, w),
      yawDeg: first ? (n.yawDeg ?? c.yawDeg) : lerp(c.yawDeg, n.yawDeg ?? c.yawDeg, w),
      follow: first ? (n.follow ?? c.follow) : lerp(c.follow, n.follow ?? c.follow, w),
    };
  }
  if (s.character) {
    const c = out.character;
    const n = s.character;
    out.character = {
      ...c,
      ...n,
      x: first ? (n.x ?? c.x) : lerp(c.x, n.x ?? c.x, w),
      z: first ? (n.z ?? c.z) : lerp(c.z, n.z ?? c.z, w),
      facing: first ? (n.facing ?? c.facing) : lerpAngle(c.facing, n.facing ?? c.facing, w),
      gait: first ? (n.gait ?? c.gait) : lerp(c.gait, n.gait ?? c.gait, w),
      lookAt: first ? (n.lookAt ?? c.lookAt) : lerp(c.lookAt, n.lookAt ?? c.lookAt, w),
    };
  }
  if (s.world) {
    const c = out.world;
    const n = s.world;
    out.world = {
      daylight: first ? (n.daylight ?? c.daylight) : lerp(c.daylight, n.daylight ?? c.daylight, w),
      haze: first ? (n.haze ?? c.haze) : lerp(c.haze, n.haze ?? c.haze, w),
      fade: first ? (n.fade ?? c.fade) : lerp(c.fade, n.fade ?? c.fade, w),
      pattern: first ? (n.pattern ?? c.pattern) : lerp(c.pattern, n.pattern ?? c.pattern, w),
    };
  }
  if (s.text !== undefined && w > 0.5) out.text = s.text;
  if (s.audio && w > 0.5) out.audio = s.audio;
  return out;
}

function lerpAngle(a: number, b: number, t: number) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

// --- scroll driver ---------------------------------------------------------

/**
 * Native scroll, smoothed.
 *
 * Deliberately not scroll-hijacking: the page really is `lengthVh` tall, the
 * browser really scrolls it, and keyboard / trackpad / touch / scrollbar all
 * behave normally. We only smooth the value we *render* from, so scrubbing
 * feels like film rather than like a jump cut per wheel notch.
 */
export function createScrollDriver(lengthVh: number) {
  let raw = 0;
  let smoothed = 0;

  const read = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    raw = max > 0 ? clamp01(window.scrollY / max) : 0;
  };

  const onScroll = () => read();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  read();
  smoothed = raw;

  return {
    lengthVh,
    /** Call once per frame. Returns the smoothed progress. */
    update(dt: number, instant = false) {
      if (instant) smoothed = raw;
      else smoothed += (raw - smoothed) * (1 - Math.exp(-9 * dt));
      return smoothed;
    },
    get raw() {
      return raw;
    },
    /** Velocity in progress-per-second, signed. Useful for motion blur / lean. */
    velocity(dt: number) {
      return dt > 0 ? (raw - smoothed) / dt : 0;
    },
    dispose() {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    },
  };
}
