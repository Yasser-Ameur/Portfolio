"use client";

/**
 * The camera is the narrator.
 *
 * It follows him by default, damped so it always feels like it is catching up
 * rather than bolted on. Chapter beats borrow it for four moves: push in, pull
 * out, pan up, and — once — leave him entirely and look at someone else.
 */

import { damp } from "./space";
import type { CameraDirective } from "./types";

export type CameraState = {
  x: number;
  y: number;
  zoom: number;
  /** Where he sits horizontally, 0..1 across the frame. */
  lead: number;
  /** World position of whatever `holdOn` targeted. */
  holdX: number | null;
  shake: number;
};

export type CameraTargets = {
  y: number;
  zoom: number;
  lead: number;
  hold: "mother" | null;
  /** Damping rate for the current move — lower is slower and more deliberate. */
  k: number;
};

const DEFAULTS: CameraTargets = { y: 0, zoom: 1, lead: 0.36, hold: null, k: 3.5 };

export function createCamera(): { state: CameraState; targets: CameraTargets } {
  return {
    state: { x: 0, y: 0, zoom: 1, lead: 0.36, holdX: null, shake: 0 },
    targets: { ...DEFAULTS },
  };
}

export function applyDirective(targets: CameraTargets, d: CameraDirective) {
  if (d.zoom !== undefined) targets.zoom = d.zoom;
  if (d.y !== undefined) targets.y = d.y;
  if (d.lead !== undefined) targets.lead = d.lead;
  if (d.hold !== undefined) targets.hold = d.hold;
  if (d.duration !== undefined) targets.k = 1 / Math.max(0.08, d.duration);
}

export function releaseCamera(targets: CameraTargets) {
  Object.assign(targets, DEFAULTS);
}

/** Cheap 1D value noise — the almost-subliminal handheld drift. */
function noise(t: number, seed: number) {
  const s = Math.sin(t * 1.13 + seed * 12.9898) * 43758.5453;
  const a = Math.sin(t * 0.37 + seed * 4.1414) * 2.3;
  return (s - Math.floor(s) - 0.5) * 0.4 + Math.sin(a) * 0.6;
}

export function updateCamera(
  cam: CameraState,
  targets: CameraTargets,
  opts: {
    followX: number;
    motherX: number | null;
    visibleUnits: number;
    dt: number;
    time: number;
    minX: number;
    maxX: number;
    handheld: boolean;
  },
) {
  const { dt } = opts;

  cam.zoom = damp(cam.zoom, targets.zoom, targets.k, dt);
  cam.y = damp(cam.y, targets.y, targets.k, dt);
  cam.lead = damp(cam.lead, targets.lead, targets.k, dt);

  // Zooming in shows less world, so the lead offset has to shrink with it.
  const framedUnits = opts.visibleUnits / cam.zoom;

  const subject =
    targets.hold === "mother" && opts.motherX !== null ? opts.motherX : opts.followX;

  // When holding on someone else, centre them instead of leading them.
  const lead = targets.hold ? 0.5 : cam.lead;
  let targetX = subject - framedUnits * lead;

  const maxX = opts.maxX - framedUnits;
  if (maxX > opts.minX) {
    targetX = Math.max(opts.minX, Math.min(maxX, targetX));
  }

  cam.x = damp(cam.x, targetX, targets.k, dt);

  if (opts.handheld) {
    cam.shake = 1;
  } else {
    cam.shake = 0;
  }
}

export function handheldOffset(time: number, amount: number) {
  if (amount <= 0) return { x: 0, y: 0 };
  return {
    x: noise(time * 0.42, 1) * 1.6 * amount,
    y: noise(time * 0.31, 7) * 1.1 * amount,
  };
}
