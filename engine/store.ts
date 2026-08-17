"use client";

/**
 * Discrete world state.
 *
 * The strict rule of this engine: continuous values (position, camera, gait,
 * expression) never live here — they are refs mutated by the clock. Only things
 * that change at transitions live in the store, so a caption change re-renders
 * a caption and nothing else. While travelling, React does no work at all.
 */

import { useCallback, useSyncExternalStore } from "react";
import type { Caption, ChapterId, DiveId, Phase } from "./types";

export type WorldState = {
  chapterId: ChapterId;
  phase: Phase;
  caption: Caption | null;
  diveId: DiveId | null;
  /** Latches true at the rewiring and never goes back. */
  patternLayer: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  /** Whether the visitor has started — the threshold gate. */
  started: boolean;
  /** 0..1 across the whole life, for the progress rule. */
  progress: number;
  /** Set while he is close enough to something to interact with it. */
  nearProp: string | null;
};

const initial: WorldState = {
  chapterId: "threshold",
  phase: "idle",
  caption: null,
  diveId: null,
  patternLayer: false,
  soundEnabled: false,
  reducedMotion: false,
  started: false,
  progress: 0,
  nearProp: null,
};

let state: WorldState = initial;
const listeners = new Set<() => void>();

export function getState(): WorldState {
  return state;
}

export function setState(patch: Partial<WorldState>) {
  let changed = false;
  for (const k of Object.keys(patch) as (keyof WorldState)[]) {
    if (state[k] !== patch[k]) {
      changed = true;
      break;
    }
  }
  if (!changed) return;
  state = { ...state, ...patch };
  for (const l of listeners) l();
}

export function resetState() {
  state = initial;
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Subscribe to one slice. Re-renders only when that slice changes identity.
 * Pass a module-level selector (or a memoised one) so the snapshot stays stable.
 */
export function useWorld<T>(selector: (s: WorldState) => T): T {
  const get = useCallback(() => selector(state), [selector]);
  return useSyncExternalStore(subscribe, get, get);
}
