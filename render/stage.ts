"use client";

/**
 * The stage: renderer, camera, light, air.
 *
 * Orthographic and elevated, so you see the ground he walks on. World units are
 * **metres** — the character is 1.28 m tall as a child — which keeps every
 * later decision (walk speed, step height, door width) checkable against
 * reality instead of against a made-up scale.
 */

import * as THREE from "three";

/**
 * Camera elevation.
 *
 * Was 38°, which rendered the world as an architectural plan and made a 2.6 m
 * rise completely invisible — climbing and walking away from camera produced
 * the same screen motion. At 24° vertical displacement maps to vertical screen
 * movement, which is the only way elevation reads at all.
 */
const PITCH = THREE.MathUtils.degToRad(24);
/** Slight yaw so walls show two faces and the world stops looking like a diagram. */
const YAW = THREE.MathUtils.degToRad(24);

/**
 * Metres of world visible vertically. Small — Casablanca has to feel intimate,
 * and the protagonist has to be present rather than a detail in a diagram.
 */
export const FRUSTUM_HEIGHT = 7.2;

export type Stage = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  sun: THREE.DirectionalLight;
  /** Where the camera is looking. Move this to move the camera. */
  target: THREE.Vector3;
  resize: (w: number, h: number) => void;
  setZoom: (z: number) => void;
  /** Metres of world visible vertically. Driven by the timeline. */
  setFrustum: (m: number) => void;
  /** daylight 0..1, haze 0..1, fade-to-black 0..1. */
  setDaylight: (daylight: number, haze: number, fade: number) => void;
  /** Re-derive camera + shadow frustum from `target`. Called once per frame. */
  update: () => void;
  dispose: () => void;
};

export function createStage(canvas: HTMLCanvasElement, palette: {
  sky: string;
  haze: string;
  sun: string;
  ambient: string;
  ground: string;
}): Stage {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  // Software rasterisers (headless capture) cannot afford a shadow pass at all.
  const lowPerf =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("perf") === "low";
  renderer.shadowMap.enabled = !lowPerf;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(palette.sky);
  // Atmospheric depth. In an orthographic scene this is most of what makes
  // distance read as distance rather than as "smaller".
  scene.fog = new THREE.Fog(palette.haze, 86, 205);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
  const target = new THREE.Vector3(0, 0, 0);

  // The late-afternoon sun: low, warm, and behind-right, so shadows are long
  // and lean across the path he is walking.
  const sun = new THREE.DirectionalLight(new THREE.Color(palette.sun), 2.5);
  sun.castShadow = !lowPerf;
  sun.shadow.mapSize.set(lowPerf ? 512 : 2048, lowPerf ? 512 : 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  const S = 22;
  sun.shadow.camera.left = -S;
  sun.shadow.camera.right = S;
  sun.shadow.camera.top = S;
  sun.shadow.camera.bottom = -S;
  sun.shadow.bias = -0.0012;
  sun.shadow.normalBias = 0.035;
  scene.add(sun);
  scene.add(sun.target);

  // Sky above, warm bounce off the dust below. Cheap, and it stops shadowed
  // faces going dead grey.
  const hemi = new THREE.HemisphereLight(
    new THREE.Color(palette.ambient),
    new THREE.Color(palette.ground),
    1.25,
  );
  scene.add(hemi);

  let zoom = 1;
  let frustum = FRUSTUM_HEIGHT;
  let vw = 1;
  let vh = 1;

  const skyDay = new THREE.Color(palette.sky);
  const skyNight = new THREE.Color("#0a0d14");
  const hazeDay = new THREE.Color(palette.haze);
  const tmp = new THREE.Color();

  const dir = new THREE.Vector3(
    Math.sin(YAW) * Math.cos(PITCH),
    Math.sin(PITCH),
    Math.cos(YAW) * Math.cos(PITCH),
  ).normalize();

  function applyCamera() {
    const aspect = vw / vh;
    const h = frustum / zoom;
    const w = h * aspect;
    camera.left = -w / 2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();

    camera.position.copy(target).addScaledVector(dir, 90);
    camera.lookAt(target);

    // Keep the shadow frustum with the camera or shadows vanish as he walks.
    sun.position.copy(target).add(new THREE.Vector3(9, 14, 7));
    sun.target.position.copy(target);
    sun.target.updateMatrixWorld();
  }

  function resize(w: number, h: number) {
    vw = Math.max(1, w);
    vh = Math.max(1, h);
    renderer.setSize(vw, vh, false);
    applyCamera();
  }

  resize(window.innerWidth, window.innerHeight);

  return {
    renderer,
    scene,
    camera,
    sun,
    target,
    resize,
    setZoom: (z) => {
      zoom = z;
      applyCamera();
    },
    setFrustum: (m) => {
      if (Math.abs(m - frustum) < 0.001) return;
      frustum = m;
      applyCamera();
    },
    setDaylight: (daylight, haze, fade) => {
      // Night → day → fade-to-black, all sampled from the timeline so the
      // opening darkness reverses exactly the way it arrived.
      tmp.copy(skyNight).lerp(skyDay, daylight);
      tmp.multiplyScalar(1 - fade);
      scene.background = tmp.clone();
      if (scene.fog) {
        (scene.fog as THREE.Fog).color.copy(hazeDay).lerp(tmp, 0.35);
        (scene.fog as THREE.Fog).near = THREE.MathUtils.lerp(120, 70, haze);
        (scene.fog as THREE.Fog).far = THREE.MathUtils.lerp(260, 150, haze);
      }
      renderer.toneMappingExposure = THREE.MathUtils.lerp(0.05, 1.02, daylight) * (1 - fade);
    },
    dispose: () => {
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
    },
    update: applyCamera,
  };
}

/**
 * Camera-facing quad. Sprites are billboarded around Y only — tilting them to
 * face a pitched camera would make them lean, and a leaning character reads as
 * a cardboard cut-out immediately.
 */
export function billboardYaw(mesh: THREE.Object3D) {
  mesh.rotation.set(0, YAW, 0);
}

export const CAMERA_YAW = YAW;
export const CAMERA_PITCH = PITCH;
