"use client";

/**
 * The grade.
 *
 * This is the difference between "a rendered scene" and "a frame from a film",
 * and it costs three passes. Raw WebGL output always looks flat and digital;
 * what sells cinematic work is bloom on the practicals, a vignette pulling the
 * eye in, grain putting everything behind one piece of glass, and a colour lift
 * that stops the blacks being black.
 *
 * Everything here is uniform-driven so the timeline can grade each beat
 * differently — the room is warm and close, the reveal is cool and open.
 */

import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uVignette: { value: 0.7 },
    uGrain: { value: 0.055 },
    /** Warm/cool tint pushed into the highlights. */
    uWarm: { value: new THREE.Color("#ffd9a8") },
    uCool: { value: new THREE.Color("#7fa6c8") },
    uTemp: { value: 0.5 },
    /** Lifts the blacks so nothing is pure black — the single most filmic move. */
    uLift: { value: 0.035 },
    uContrast: { value: 1.08 },
    uSaturation: { value: 1.06 },
    uAberration: { value: 0.0016 },
    uFade: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime, uVignette, uGrain, uTemp, uLift, uContrast, uSaturation, uAberration, uFade;
    uniform vec3 uWarm, uCool;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      vec2 c = uv - 0.5;
      float r2 = dot(c, c);

      // Chromatic aberration, strongest at the corners. Subtle — it should be
      // felt as lens character, never seen as a colour fringe.
      float ab = uAberration * r2;
      vec3 col;
      col.r = texture2D(tDiffuse, uv + c * ab).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - c * ab).b;

      // Colour temperature, pushed into the highlights only, so shadows stay neutral.
      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
      vec3 tint = mix(uCool, uWarm, uTemp);
      col = mix(col, col * tint, smoothstep(0.35, 1.0, lum) * 0.42);

      // Lift / contrast / saturation.
      col = col * (1.0 - uLift) + uLift;
      col = (col - 0.5) * uContrast + 0.5;
      float g = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(g), col, uSaturation);

      // Vignette — elliptical, soft, never a black ring.
      // Soft and shallow — a lens falloff, not a black frame.
      float vig = smoothstep(1.15, 0.05, r2 * uVignette);
      col *= mix(0.82, 1.0, vig);

      // Grain, animated, denser in the shadows where real film grain lives.
      float n = hash(uv * vec2(1920.0, 1080.0) + fract(uTime) * 91.7) - 0.5;
      col += n * uGrain * (1.35 - lum);

      col *= (1.0 - uFade);
      gl_FragColor = vec4(max(col, 0.0), 1.0);
    }
  `,
};

export type Grade = {
  composer: EffectComposer;
  setSize: (w: number, h: number) => void;
  /** Per-beat grading, driven by the timeline. */
  set: (o: { temp?: number; vignette?: number; grain?: number; bloom?: number; fade?: number }) => void;
  render: (dt: number) => void;
  dispose: () => void;
};

export function createGrade(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  opts: { low?: boolean } = {},
): Grade {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  // Bloom on the practicals: the CRT, the lamp, lit windows, the sea glitter.
  // This is what makes light sources feel like light rather than bright paint.
  let bloom: UnrealBloomPass | null = null;
  if (!opts.low) {
    bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.72, 0.82);
    composer.addPass(bloom);
  }

  const grade = new ShaderPass(GradeShader);
  grade.renderToScreen = true;
  composer.addPass(grade);

  let time = 0;

  return {
    composer,
    setSize(w, h) {
      composer.setSize(w, h);
      bloom?.setSize(w, h);
    },
    set(o) {
      const u = grade.uniforms;
      if (o.temp !== undefined) u.uTemp.value = o.temp;
      if (o.vignette !== undefined) u.uVignette.value = o.vignette;
      if (o.grain !== undefined) u.uGrain.value = o.grain;
      if (o.fade !== undefined) u.uFade.value = o.fade;
      if (o.bloom !== undefined && bloom) bloom.strength = o.bloom;
    },
    render(dt) {
      time += dt;
      grade.uniforms.uTime.value = time;
      composer.render();
    },
    dispose() {
      composer.dispose();
    },
  };
}
