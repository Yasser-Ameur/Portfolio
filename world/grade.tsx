"use client";

/**
 * The filmic grade.
 *
 * Grain and vignette over everything. This one layer is what stops confident
 * flat vector from reading as a diagram — it puts the whole frame behind the
 * same piece of glass, which is most of why the world looks photographed
 * rather than drawn.
 */

export function Grade() {
  return (
    <>
      <div className="world-vignette" aria-hidden="true" />
      <div className="world-grain" aria-hidden="true" />
    </>
  );
}
