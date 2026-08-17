"use client";

/**
 * The character controller.
 *
 * Concerns are kept apart on purpose: movement never knows which era is
 * rendered, and appearance never knows how fast he is going. An age change is a
 * property swap, not a branch in the movement code.
 *
 * The sprite is a camera-facing quad carrying the supplied artwork. It is
 * **unlit** — the sheets already contain authored lighting, and putting scene
 * lights over them would repaint work that was done by hand. It sits in the
 * world properly: real position, real depth, real ground contact, and a
 * separate blob shadow on the terrain beneath it.
 */

import * as THREE from "three";
import { CAMERA_YAW } from "@/render/stage";
import { blobShadowTexture } from "@/render/textures";
import {
  ERAS,
  anchorFor,
  orientationSprite,
  scaleFor,
  stanceSprite,
  type EraId,
  type ExpressionId,
  type Orientation,
  type Stance,
} from "./eras";
import type { SpriteMeta } from "./manifest.generated";

const WALK_SPEED = 1.75; // m/s — a child's walk
const RUN_SPEED = 4.2;
const ACCEL = 11;
const DRAG = 14;
const RADIUS = 0.28;

export type CharacterState = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  /** Facing angle in radians, world space. */
  direction: number;
  speed: number;
  stance: Stance;
  orientation: Orientation;
  flipped: boolean;
  era: EraId;
  expression: ExpressionId;
};

export type Character = {
  group: THREE.Group;
  state: CharacterState;
  update: (dt: number, input: { x: number; z: number; run: boolean }, t: number) => void;
  /** Drive the pose from the timeline instead of from input. */
  applyTimeline: (gait: number, facing: number, t: number) => void;
  setEra: (era: EraId) => void;
  setExpression: (e: ExpressionId) => void;
  dispose: () => void;
};

type Ctx = {
  heightAt: (x: number, z: number) => number;
  resolve: (x: number, z: number, r: number) => { x: number; z: number };
};

export function createCharacter(era: EraId, ctx: Ctx): Character {
  const loader = new THREE.TextureLoader();
  const cache = new Map<string, THREE.Texture>();

  function tex(meta: SpriteMeta) {
    let t = cache.get(meta.src);
    if (!t) {
      t = loader.load(meta.src);
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = 8;
      cache.set(meta.src, t);
    }
    return t;
  }

  const group = new THREE.Group();

  // The sprite quad. Geometry is rebuilt on era/pose change, never per frame.
  const mat = new THREE.MeshBasicMaterial({
    transparent: true,
    // alphaTest lets the sprite write depth, which is what makes him occlude
    // and be occluded correctly instead of always drawing on top.
    alphaTest: 0.42,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  quad.castShadow = false;
  group.add(quad);

  // Blob shadow. A billboard's real shadow would be a flat sheet on the ground,
  // which reads as a bug; a soft ellipse reads as a person.
  const shadowMat = new THREE.MeshBasicMaterial({
    map: blobShadowTexture(),
    transparent: true,
    depthWrite: false,
    opacity: 0.9,
  });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.renderOrder = 1;
  group.add(shadow);

  const state: CharacterState = {
    position: new THREE.Vector3(4.5, 0, 0.6),
    velocity: new THREE.Vector3(),
    direction: 0,
    speed: 0,
    stance: "idle",
    orientation: "front",
    flipped: false,
    era,
    expression: "neutral",
  };

  let currentKey = "";

  /** Point the quad at whichever of the four canonical views is closest. */
  function pickOrientation(dir: number): { o: Orientation; flip: boolean } {
    // Angles are relative to the camera's yaw, so "toward the viewer" is front
    // regardless of where the camera happens to be looking.
    let a = dir - CAMERA_YAW;
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    const deg = THREE.MathUtils.radToDeg(a);

    // The supplied side view faces one way; mirroring covers the other. The
    // artwork is close enough to symmetric for this — the crossbody bag is the
    // only asymmetric element and it reads fine mirrored at this scale.
    if (deg > -30 && deg <= 30) return { o: "back", flip: false };
    if (deg > 30 && deg <= 105) return { o: "side", flip: true };
    if (deg > 105 || deg <= -150) return { o: "front", flip: false };
    return { o: "side", flip: false };
  }

  function applySprite() {
    const moving = state.speed > 0.12;
    // While moving, the stance sprites carry the pose; standing still uses the
    // orientation views, which are the only ones drawn facing all four ways.
    const meta: SpriteMeta = moving
      ? stanceSprite(state.era, state.stance)
      : orientationSprite(state.era, state.orientation);

    const key = `${state.era}|${meta.src}|${state.flipped}`;
    if (key === currentKey) return;
    currentKey = key;

    mat.map = tex(meta);
    mat.needsUpdate = true;

    const heightM = scaleFor(state.era, meta) / 100;
    const widthM = (heightM * meta.w) / meta.h;
    const anchor = anchorFor(meta);

    quad.geometry.dispose();
    quad.geometry = new THREE.PlaneGeometry(widthM, heightM);
    // Shift the quad so the sprite's own ground row sits at y = 0. This is the
    // invariant the whole age system depends on: feet stay on the floor.
    quad.geometry.translate(0, heightM * anchor.y, 0);
    quad.scale.x = state.flipped ? -1 : 1;

    const s = widthM * 1.15;
    shadow.scale.set(s, s * 0.52, 1);
  }

  function setEra(next: EraId) {
    state.era = next;
    currentKey = "";
    applySprite();
  }

  applySprite();

  return {
    group,
    state,

    update(dt, input, t) {
      // --- movement ---
      const wish = new THREE.Vector3(input.x, 0, input.z);
      const mag = wish.length();
      if (mag > 1) wish.divideScalar(mag);

      const top = input.run ? RUN_SPEED : WALK_SPEED;
      // Children walk; the run is available but the top speed is era-scaled so
      // a 7-year-old does not sprint like an adult.
      const eraScale = ERAS[state.era].heightCm / 180;
      const target = wish.multiplyScalar(top * (0.72 + eraScale * 0.28));

      state.velocity.x = THREE.MathUtils.damp(state.velocity.x, target.x, mag > 0 ? ACCEL : DRAG, dt);
      state.velocity.z = THREE.MathUtils.damp(state.velocity.z, target.z, mag > 0 ? ACCEL : DRAG, dt);
      if (state.velocity.lengthSq() < 0.0004) state.velocity.set(0, 0, 0);

      let nx = state.position.x + state.velocity.x * dt;
      let nz = state.position.z + state.velocity.z * dt;
      ({ x: nx, z: nz } = ctx.resolve(nx, nz, RADIUS));

      state.position.x = nx;
      state.position.z = nz;
      state.position.y = ctx.heightAt(nx, nz);
      state.speed = Math.hypot(state.velocity.x, state.velocity.z);

      // --- facing ---
      if (state.speed > 0.12) {
        const wanted = Math.atan2(state.velocity.x, state.velocity.z);
        // Turn deliberately rather than snapping, so direction changes read.
        let d = wanted - state.direction;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        state.direction += d * Math.min(1, dt * 12);
      }

      // --- stance ---
      const runT = (state.speed - WALK_SPEED * 0.8) / (RUN_SPEED - WALK_SPEED * 0.8);
      state.stance = state.speed < 0.12 ? "idle" : runT > 0.45 ? "run" : "walk";

      const { o, flip } = pickOrientation(state.direction);
      state.orientation = o;
      state.flipped = flip;
      applySprite();

      // --- placement ---
      group.position.copy(state.position);
      quad.rotation.set(0, CAMERA_YAW, 0);

      // Breathing while still; a light bob and lean while moving. Subtle — the
      // artwork is a single pose, so anything large would show it up.
      const norm = Math.min(1, state.speed / RUN_SPEED);
      const bob = state.speed < 0.12
        ? Math.sin(t * 1.7) * 0.006
        : Math.abs(Math.sin(t * (6 + norm * 7))) * (0.012 + norm * 0.035);
      quad.position.y = bob;
      quad.rotation.z = Math.sin(t * (5 + norm * 6)) * norm * 0.018;

      shadow.position.y = 0.015;
      shadowMat.opacity = 0.9 - bob * 6;
    },

    applyTimeline(gait, facing, t) {
      state.speed = gait * RUN_SPEED;
      state.direction = facing;
      state.stance = gait < 0.12 ? "idle" : gait > 0.55 ? "run" : "walk";
      const { o, flip } = pickOrientation(facing);
      state.orientation = o;
      state.flipped = flip;
      applySprite();
      group.position.copy(state.position);
      quad.rotation.set(0, CAMERA_YAW, 0);
      const bob =
        gait < 0.12
          ? Math.sin(t * 1.7) * 0.006
          : Math.abs(Math.sin(t * (6 + gait * 7))) * (0.012 + gait * 0.035);
      quad.position.y = bob;
      quad.rotation.z = Math.sin(t * (5 + gait * 6)) * gait * 0.018;
      shadow.position.y = 0.015;
      shadowMat.opacity = 0.9 - bob * 6;
    },

    setEra,
    setExpression(e) {
      state.expression = e;
    },

    dispose() {
      quad.geometry.dispose();
      mat.dispose();
      shadow.geometry.dispose();
      shadowMat.dispose();
      cache.forEach((t) => t.dispose());
    },
  };
}
