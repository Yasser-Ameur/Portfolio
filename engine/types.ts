import type { ReactNode } from "react";
import type { Palette } from "@/world/palette";

export type ChapterId =
  | "threshold"
  | "yard"
  | "room"
  | "school"
  | "stage"
  | "goodbye"
  | "crossing"
  | "arrival";

export type DiveId = "room-interior" | "the-screen" | "photograph";

export type Phase =
  | "idle"
  | "travelling"
  | "beat"
  | "diving"
  | "inside"
  | "surfacing";

export type Caption = {
  /** Small mono line — a year, a place. Rendered as world signage where possible. */
  label?: string;
  /** The rare editorial line. Serif, quiet. */
  line?: string;
  /** How long it holds before fading, ms. */
  hold?: number;
};

/** The seven depth planes. `ground` is the only interactive one. */
export type Plane = "sky" | "far" | "mid" | "near" | "ground" | "fore";

export const PARALLAX: Record<Plane, number> = {
  sky: 0,
  far: 0.1,
  mid: 0.25,
  near: 0.45,
  ground: 1,
  fore: 1.2,
};

export const PLANE_DEPTH: Record<Plane, number> = {
  sky: 1,
  far: 0.9,
  mid: 0.62,
  near: 0.35,
  ground: 0,
  fore: -0.12,
};

export type CameraDirective = {
  zoom?: number;
  /** Vertical pan target, world units. Negative looks up. */
  y?: number;
  /** Where the character sits horizontally, 0..1 across the frame. */
  lead?: number;
  /** Follow something other than the protagonist. */
  hold?: "mother" | null;
  /** Seconds the move takes. */
  duration?: number;
};

export type BeatCtx = {
  wait: (ms: number) => Promise<void>;
  /** Resolves on any advance input, or after `ms`. */
  waitForInput: (ms?: number) => Promise<void>;
  camera: {
    apply: (d: CameraDirective) => void;
    release: () => void;
  };
  character: {
    express: (name: ExpressionName, weight?: number) => void;
    stop: () => void;
    resume: () => void;
    face: (dir: 1 | -1) => void;
  };
  caption: (c: Caption | null) => void;
  /** True once the beat has been skipped — long beats should bail out early. */
  cancelled: () => boolean;
};

export type Beat = {
  /** World x that triggers it. */
  at: number;
  id: string;
  run: (ctx: BeatCtx) => Promise<void> | void;
};

export type ExpressionName =
  | "neutral"
  | "curious"
  | "joy"
  | "focus"
  | "confusion"
  | "frustration"
  | "excitement"
  | "calm"
  | "pride"
  | "wonder";

export type WorldProp = {
  id: string;
  /** World position of the interactive point. */
  x: number;
  y: number;
  /** Radius (world units) within which it responds to his presence. */
  radius?: number;
  /** Opening into a memory. */
  dive?: DiveId;
  label?: string;
};

export type LayerCtx = {
  palette: Palette;
  /** Chapter-local time, seconds — for ambient motion authored into scenes. */
  seed: number;
};

export type Chapter = {
  id: ChapterId;
  /** Inclusive start, exclusive end, in world units. */
  span: [number, number];
  palette: Palette;
  /** Surface material, drives footstep timbre. */
  surface: "tile" | "dirt" | "carpet" | "corridor" | "asphalt" | "snow" | "none";
  layers: Partial<Record<Plane, (ctx: LayerCtx) => ReactNode>>;
  props?: WorldProp[];
  beats?: Beat[];
  /** Signage rendered into the world on entry. */
  sign?: { x: number; y: number; label: string };
};
