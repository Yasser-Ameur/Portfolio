"use client";

/**
 * Input → intent.
 *
 * Four input surfaces collapse into two values the clock reads each frame:
 * an axis (−1 back … +1 forward) and a monotonically increasing `advance`
 * counter that beats poll to know they were skipped.
 *
 * Deliberately minimal. There is no tutorial overlay because there is almost
 * nothing to learn: hold a direction, press up at an opening, escape to leave.
 */

export type Intent = {
  axis: number;
  /** Increments on any "continue / skip" press. */
  advance: number;
  /** Increments when that press was a backward one. */
  back: number;
  /** Increments on enter-a-dive. */
  enter: number;
  /** Increments on escape. */
  exit: number;
};

const intent: Intent = { axis: 0, advance: 0, back: 0, enter: 0, exit: 0 };

const held = new Set<string>();
let pointerAxis = 0;
let wheelAxis = 0;
let wheelDecay = 0;

const FORWARD = new Set(["ArrowRight", "KeyD", "Space"]);
const BACKWARD = new Set(["ArrowLeft", "KeyA"]);
const ENTER = new Set(["ArrowUp", "KeyE", "Enter"]);

export function getIntent(): Intent {
  return intent;
}

function recompute() {
  let axis = 0;
  for (const code of held) {
    if (FORWARD.has(code)) axis += 1;
    if (BACKWARD.has(code)) axis -= 1;
  }
  axis += pointerAxis;
  axis += wheelAxis;
  intent.axis = Math.max(-1, Math.min(1, axis));
}

/** Called by the clock so wheel impulses fade rather than latch. */
export function decayInput(dt: number) {
  if (wheelDecay > 0) {
    wheelDecay = Math.max(0, wheelDecay - dt);
    if (wheelDecay === 0) {
      wheelAxis = 0;
      recompute();
    }
  }
}

export function attachInput(target: HTMLElement): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === "Escape") {
      intent.exit += 1;
      return;
    }
    if (e.repeat) return;

    if (ENTER.has(e.code)) {
      intent.enter += 1;
      intent.advance += 1;
      e.preventDefault();
      return;
    }
    if (FORWARD.has(e.code) || BACKWARD.has(e.code)) {
      held.add(e.code);
      // Any deliberate press is also a "continue" — it skips a running beat and
      // steps forward in reduced motion. `e.repeat` is filtered above, so
      // holding a key counts once.
      intent.advance += 1;
      if (BACKWARD.has(e.code)) intent.back += 1;
      if (e.code === "Space") e.preventDefault();
      recompute();
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (held.delete(e.code)) recompute();
  };

  const releaseAll = () => {
    held.clear();
    pointerAxis = 0;
    recompute();
  };

  const onPointerDown = (e: PointerEvent) => {
    // Let real controls (buttons, links) do their own thing.
    if ((e.target as HTMLElement)?.closest("button,a,[data-ui]")) return;
    target.setPointerCapture?.(e.pointerId);
    const rect = target.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    pointerAxis = rel < 0.28 ? -1 : 1;
    intent.advance += 1;
    if (pointerAxis < 0) intent.back += 1;
    recompute();
  };

  const onPointerUp = () => {
    pointerAxis = 0;
    recompute();
  };

  const onWheel = (e: WheelEvent) => {
    const d = e.deltaY;
    if (Math.abs(d) < 1) return;
    wheelAxis = d > 0 ? 1 : -1;
    wheelDecay = 0.14;
    recompute();
  };

  target.addEventListener("keydown", onKeyDown);
  target.addEventListener("keyup", onKeyUp);
  target.addEventListener("pointerdown", onPointerDown);
  target.addEventListener("pointerup", onPointerUp);
  target.addEventListener("pointercancel", onPointerUp);
  target.addEventListener("wheel", onWheel, { passive: true });
  window.addEventListener("blur", releaseAll);

  return () => {
    target.removeEventListener("keydown", onKeyDown);
    target.removeEventListener("keyup", onKeyUp);
    target.removeEventListener("pointerdown", onPointerDown);
    target.removeEventListener("pointerup", onPointerUp);
    target.removeEventListener("pointercancel", onPointerUp);
    target.removeEventListener("wheel", onWheel);
    window.removeEventListener("blur", releaseAll);
    releaseAll();
  };
}
