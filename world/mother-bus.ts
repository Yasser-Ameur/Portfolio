"use client";

/**
 * Chapters place her; the clock draws her.
 *
 * A one-line event bus rather than shared state, because she appears exactly
 * five times in the whole experience and none of those moments should cost a
 * React render.
 *
 * `"follow"` walks her beside him at a fixed offset — used once, on the road
 * out of the neighbourhood, right up until she stops.
 */

export type MotherPlacement = number | "follow" | null;

export function placeMother(
  x: MotherPlacement,
  opts: { look?: number; sway?: number; offset?: number } = {},
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("world:mother", { detail: { x, ...opts } }),
  );
}

export const dismissMother = () => placeMother(null);
