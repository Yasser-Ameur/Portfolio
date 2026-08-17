/**
 * The world's coordinate system.
 *
 * Everything is authored in abstract design units — 1600 × 900, ground line at
 * y = 700 — and a single runtime scale converts units to pixels. Nothing in the
 * world ever thinks in pixels, which is why there is no separate mobile layout:
 * the composition is identical everywhere, only the scale differs.
 */

export const DESIGN_WIDTH = 1600;
export const DESIGN_HEIGHT = 900;
export const GROUND_Y = 700;

/** World units guaranteed to be in frame, so composition survives narrow screens. */
const MIN_VISIBLE_WIDE = 1100;
const MIN_VISIBLE_NARROW = 820;
const NARROW_BREAKPOINT = 768;

export type Viewport = {
  /** Pixel size of the frame. */
  width: number;
  height: number;
  /** Units → pixels. */
  scale: number;
  /** World units currently in frame. */
  visibleUnits: number;
  /** Vertical offset (px) that places GROUND_Y at a pleasing height. */
  originY: number;
  narrow: boolean;
};

export function measure(width: number, height: number): Viewport {
  const narrow = width < NARROW_BREAKPOINT;
  const minVisible = narrow ? MIN_VISIBLE_NARROW : MIN_VISIBLE_WIDE;
  const scale = Math.min(width / minVisible, height / DESIGN_HEIGHT);

  // Anchor the ground line at ~78% of the frame so there is sky to compose
  // against and a little foreground beneath his feet.
  const originY = height * 0.78 - GROUND_Y * scale;

  return {
    width,
    height,
    scale,
    visibleUnits: width / scale,
    narrow,
    originY,
  };
}

/** The world x at the left edge of the frame for a given camera position. */
export const leftEdge = (camX: number) => camX;

/** Project a world point to screen pixels. */
export function project(
  worldX: number,
  worldY: number,
  camX: number,
  camY: number,
  vp: Viewport,
  parallax = 1,
): { x: number; y: number } {
  return {
    x: (worldX - camX * parallax) * vp.scale,
    y: worldY * vp.scale + vp.originY - camY * vp.scale,
  };
}

export const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const inverseLerp = (a: number, b: number, v: number) =>
  a === b ? 0 : clamp((v - a) / (b - a), 0, 1);

/** Smooth 0→1 ramp with zero derivative at both ends. */
export const smoothstep = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

/**
 * Frame-rate independent exponential damping.
 * `k` is roughly "how many e-folds per second" — higher is snappier.
 */
export const damp = (current: number, target: number, k: number, dt: number) =>
  target + (current - target) * Math.exp(-k * dt);
