/**
 * The temporal character model.
 *
 * Five canonical eras, each backed by the supplied artwork. Nothing here is
 * scene-specific: any region can trigger any transition through the same
 * registry, so an age change is never hard-coded into a chapter.
 *
 * The supplied sheets are visual canon. This module adds the *world* facts the
 * sheets cannot carry — how tall he actually is, what the clothing means, and
 * where in the story each era belongs.
 */

import { SPRITE_MANIFEST, type SpriteEraId, type SpriteMeta } from "./manifest.generated";

export type EraId = SpriteEraId;
export type Orientation = "front" | "threeQuarter" | "side" | "back";
export type Stance = "idle" | "walk" | "run";
export type ExpressionId =
  | "neutral"
  | "curiosity"
  | "concentration"
  | "happiness"
  | "determination"
  | "wonder";

export type CharacterEra = {
  id: EraId;
  label: string;
  ageRange: string;
  /**
   * Standing height in world centimetres.
   *
   * Deliberately NOT derived from sprite pixel heights. The sheets are stylised
   * and not drawn to a consistent real-world scale — the high-school figure is
   * drawn far shorter relative to the adult than a 16-year-old actually is.
   * Deriving from pixels would make him shrink between eras. These are the real
   * heights; the renderer scales each sprite to hit them.
   */
  heightCm: number;
  outfit: string;
  glasses: boolean;
  facialHair: string;
  /** Which region of the world this era belongs to. */
  region: string;
  /** Roughly when, for the transcript and for ordering. */
  year: string;
};

export const ERAS: Record<EraId, CharacterEra> = {
  childhood: {
    id: "childhood",
    label: "ERA_01_CHILDHOOD",
    ageRange: "7-9",
    heightCm: 128,
    outfit: "Moroccan football jersey — red shirt, green shorts, boots",
    glasses: false,
    facialHair: "none",
    region: "lowerWorld",
    year: "2010",
  },
  earlyTeen: {
    id: "earlyTeen",
    label: "ERA_02_EARLY_TEEN",
    ageRange: "11-13",
    heightCm: 150,
    outfit: "dark navy hoodie, jeans, trainers",
    // The first glasses. They arrive here and are never remarked on.
    glasses: true,
    facialHair: "none",
    region: "risingRegion",
    year: "2014",
  },
  highSchool: {
    id: "highSchool",
    label: "ERA_03_HIGH_SCHOOL",
    ageRange: "15-18",
    heightCm: 172,
    outfit: "polo shirt, jeans, white trainers",
    glasses: true,
    facialHair: "none",
    region: "risingRegion",
    year: "2016-2022",
  },
  graduation: {
    id: "graduation",
    label: "ERA_04_GRADUATION",
    ageRange: "17-18",
    heightCm: 176,
    outfit: "ceremonial robe with blue collar over a white shirt",
    // Gone by the ceremony.
    glasses: false,
    facialHair: "light moustache, small soul patch",
    region: "transitionalRidge",
    year: "2022",
  },
  epflCurrent: {
    id: "epflCurrent",
    label: "ERA_05_EPFL_CURRENT",
    ageRange: "20-23",
    heightCm: 180,
    outfit: "white quarter-zip, dark trousers, crossbody bag",
    glasses: false,
    facialHair: "light stubble",
    region: "newContinent",
    year: "2022-now",
  },
};

/** Story order. The only order an age transition may move along. */
export const ERA_ORDER: EraId[] = [
  "childhood",
  "earlyTeen",
  "highSchool",
  "graduation",
  "epflCurrent",
];

export const eraIndex = (id: EraId) => ERA_ORDER.indexOf(id);

export function nextEra(id: EraId): EraId | null {
  const i = eraIndex(id);
  return i >= 0 && i < ERA_ORDER.length - 1 ? ERA_ORDER[i + 1] : null;
}

// ---------------------------------------------------------------------------
// Asset lookup
// ---------------------------------------------------------------------------

export const spritesFor = (id: EraId) => SPRITE_MANIFEST[id];

export const orientationSprite = (id: EraId, o: Orientation): SpriteMeta =>
  SPRITE_MANIFEST[id].orientation[o];

export const stanceSprite = (id: EraId, s: Stance): SpriteMeta =>
  SPRITE_MANIFEST[id].stance[s];

export const expressionSprite = (id: EraId, e: ExpressionId): SpriteMeta =>
  SPRITE_MANIFEST[id].expression[e];

/**
 * World centimetres per source pixel for a given sprite.
 *
 * Measured against the *standing* front view, never the sprite being drawn —
 * a running pose is shorter than a standing one, and scaling each pose to the
 * same height would make him shrink every time he broke into a run.
 */
export function scaleFor(id: EraId, sprite: SpriteMeta): number {
  const standing = SPRITE_MANIFEST[id].orientation.front;
  const cmPerPixel = ERAS[id].heightCm / standing.baseline;
  return cmPerPixel * sprite.h;
}

/**
 * Every sprite's anchor. x is the horizontal centre, y is the ground-contact
 * row — so scaling happens around the feet and he never floats or sinks, which
 * is the whole requirement of the age-transition system.
 */
export const anchorFor = (sprite: SpriteMeta) => ({
  x: 0.5,
  y: sprite.baseline / sprite.h,
});

/** Every texture the runtime needs for one era. */
export function texturesFor(id: EraId): string[] {
  const e = SPRITE_MANIFEST[id];
  return [
    ...Object.values(e.orientation),
    ...Object.values(e.stance),
    ...Object.values(e.expression),
  ].map((s) => s.src);
}
