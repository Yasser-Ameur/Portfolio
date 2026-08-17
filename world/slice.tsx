"use client";

/**
 * The Morocco sequence.
 *
 * The page is genuinely `lengthVh` tall and the browser genuinely scrolls it —
 * no scroll hijacking. Only the *rendered* progress is smoothed, so trackpad,
 * wheel, touch, keyboard and the scrollbar all behave natively while the
 * animation still scrubs like film.
 *
 * One rAF loop, sampling `sample(timeline, progress)` once per frame. React
 * renders the threshold and the caption and then does nothing.
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createStage } from "@/render/stage";
import { createGrade } from "@/render/grade";
import { createCharacter } from "@/character/controller";
import { paintBedroom, paintStairwell } from "@/render/paint-interiors";
import {
  ROOM_D,
  ROOM_H,
  ROOM_W,
  paintArmchairLamp,
  paintFloorPlan,
  paintMother,
  paintRoomWall,
  paintSeatedChild,
  paintTV,
} from "@/render/paint-room";
import { sample, createScrollDriver, span } from "@/engine/timeline";
import { MOROCCO_TIMELINE, INTERIOR, characterPathAt } from "./sequence-morocco";
import { MOROCCO_PALETTE, buildMorocco, heightAt, resolveCollision } from "./morocco";

type Stats = { fps: number; js: number; gpu: number; calls: number; tris: number; tex: number };

export function Slice() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [caption, setCaption] = useState<{ line: string; opacity: number; chapter?: string } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const stage = createStage(canvas, MOROCCO_PALETTE);
    const lowPerf = new URLSearchParams(window.location.search).get("perf") === "low";
    const grade = createGrade(stage.renderer, stage.scene, stage.camera, { low: lowPerf });
    const world = buildMorocco();
    stage.scene.add(world.group);

    // ---- interiors: painted planes inside the building volume ----
    function plane(tex: THREE.Texture, x: number, y: number, z: number, w: number, h: number) {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false }),
      );
      m.position.set(x, y, z);
      m.renderOrder = 5;
      stage.scene.add(m);
      return m;
    }
    /**
     * THE LIVING ROOM — the supplied painted panel, not a reconstruction.
     *
     * Panel 08 of the environment sheet already *is* this beat: mother in the
     * armchair, boy on the floor with a controller, CRT keying him, warm lamp
     * keying her. Hand-painting an approximation of artwork we already have was
     * the wrong call; this is the artwork.
     *
     * The projection rule still holds — it governs surfaces that must agree with
     * world geometry. This is a locked interior shot with no world in frame, so
     * a single authored perspective painting is exactly right, and is how 2.5D
     * games have always done interiors.
     */
    const roomTex = new THREE.TextureLoader().load("/env/panel-08.png", (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = 8;
    });
    roomTex.colorSpace = THREE.SRGBColorSpace;

    const roomGroup = new THREE.Group();
    const R = INTERIOR.living;
    // 316 x 202 source; hold its aspect so nothing is stretched.
    const ROOM_PLANE_H = 5.2;
    const ROOM_PLANE_W = ROOM_PLANE_H * (316 / 202);
    const roomMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_PLANE_W, ROOM_PLANE_H),
      new THREE.MeshBasicMaterial({ map: roomTex, transparent: true, toneMapped: false, depthWrite: false }),
    );
    roomMesh.position.set(R.x, R.y, R.z);
    roomMesh.renderOrder = 5;
    roomGroup.add(roomMesh);
    roomGroup.visible = false;
    stage.scene.add(roomGroup);
    const living = roomGroup;

    const stairs = plane(paintStairwell(), INTERIOR.stairs.x, INTERIOR.stairs.y, INTERIOR.stairs.z, 5.0, 8.9);
    const bedroom = plane(paintBedroom(), INTERIOR.bedroom.x, INTERIOR.bedroom.y, INTERIOR.bedroom.z, 8.5, 5.0);
    const roomParts = [roomMesh];

    const character = createCharacter("childhood", { heightAt, resolve: resolveCollision });
    stage.scene.add(character.group);

    const scroll = createScrollDriver(MOROCCO_TIMELINE.lengthVh);

    // ---- exploration-mode input, offset kept separate from timeline position
    const keys = new Set<string>();
    const onDown = (e: KeyboardEvent) => keys.add(e.code);
    const onUp = (e: KeyboardEvent) => keys.delete(e.code);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    const explore = { x: 0, z: 0 };

    const onResize = () => {
      stage.resize(window.innerWidth, window.innerHeight);
      grade.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    onResize();
    setLoaded(100);

    let raf = 0;
    let last = performance.now();
    let t = 0;
    let jsAccum = 0;
    let frames = 0;
    let statsAt = performance.now();
    let shownCaption: string | null = null;

    function tick(now: number) {
      const f0 = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      const p = scroll.update(dt, !startedRef.current);
      const s = sample(MOROCCO_TIMELINE, p);

      // ---- character ----
      const path = characterPathAt(p);
      if (s.interactive) {
        const fwd = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0);
        const rgt = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0);
        explore.x += rgt * dt * 2.2;
        explore.z -= fwd * dt * 2.2;
        explore.x = THREE.MathUtils.clamp(explore.x, -4, 4);
        explore.z = THREE.MathUtils.clamp(explore.z, -3, 3);
      } else {
        // decay back to the authored path so leaving the beat is deterministic
        explore.x *= Math.exp(-3 * dt);
        explore.z *= Math.exp(-3 * dt);
      }
      const cx = path.x + explore.x;
      const cz = path.z + explore.z;
      character.state.position.set(cx, heightAt(cx, cz), cz);
      character.state.direction = path.facing;
      character.state.speed = s.character.gait * 3.4;
      character.applyTimeline(s.character.gait, path.facing, t);
      character.setExpression(s.character.expression);

      // Indoors he stands in front of the painted room plane, seated-low and
      // small, so the room reads as the set and he reads as the figure in it.
      // Indoors he is the painted seated pose, so the walking sprite stands down.
      const inLiving = p > 0.175 && p < 0.335;
      const inBed = p > 0.94;
      if (inLiving) {
        character.group.visible = false;
      } else if (inBed) {
        character.group.position.set(INTERIOR.bedroom.x - 1.5, INTERIOR.bedroom.y - 1.62, INTERIOR.bedroom.z + 0.55);
        character.group.visible = true;
      } else if (p > 0.4 && p < 0.94) {
        character.group.visible = true;
      } else {
        character.group.visible = false;
      }

      // ---- interiors visibility, all derived from p ----
      const livingOn = span(p, 0.17, 0.2) * (1 - span(p, 0.3, 0.335));
      const stairsOn = span(p, 0.325, 0.345) * (1 - span(p, 0.395, 0.415));
      const bedOn = span(p, 0.935, 0.955);
      living.visible = livingOn > 0.01;
      for (const m of roomParts) (m.material as THREE.Material).opacity = livingOn;
      (stairs.material as THREE.Material).opacity = stairsOn;
      stairs.visible = stairsOn > 0.01;
      (bedroom.material as THREE.Material).opacity = bedOn;
      bedroom.visible = bedOn > 0.01;

      // the glance: she looks at him between .258 and .276, and un-looks in reverse
      // The glance lives inside the painting — she is already looking at him.
      // The beat is the camera holding on it, which is the whole point.

      // ---- camera ----
      const c = s.camera;
      const followX = THREE.MathUtils.lerp(c.targetX, cx, c.follow);
      const followZ = THREE.MathUtils.lerp(c.targetZ, cz, c.follow);
      stage.target.set(followX, c.targetY, followZ);
      stage.setFrustum(c.frustum);
      stage.update();

      // ---- world ----
      world.update(t);
      stage.setDaylight(s.world.daylight, s.world.haze, s.world.fade);

      // Grade per beat: interiors warm and tight, the reveal cool and open.
      grade.set({
        temp: THREE.MathUtils.clamp(0.25 + s.world.daylight * 0.5, 0, 1),
        // Gentler than before: the room art no longer bakes its own vignette,
        // so this is the only edge falloff and it must leave corners readable.
        vignette: THREE.MathUtils.lerp(0.72, 0.5, THREE.MathUtils.clamp(c.frustum / 26, 0, 1)),
        grain: 0.045,
        bloom: THREE.MathUtils.lerp(0.34, 0.22, s.world.daylight),
        fade: s.world.fade,
      });
      grade.render(dt);

      // ---- discrete UI, only when it actually changes ----
      const key = s.text ? `${s.text.chapter ?? ""}|${s.text.line}|${s.text.opacity.toFixed(2)}` : null;
      if (key !== shownCaption) {
        shownCaption = key;
        setCaption(s.text ? { ...s.text } : null);
      }

      jsAccum += performance.now() - f0;
      frames++;
      if (now - statsAt > 1000) {
        const wall = now - statsAt;
        const info = stage.renderer.info;
        setStats({
          fps: Math.round((frames / wall) * 1000),
          js: +(jsAccum / frames).toFixed(2),
          gpu: +((wall - jsAccum) / frames).toFixed(2),
          calls: info.render.calls,
          tris: info.render.triangles,
          tex: info.memory.textures,
        });
        jsAccum = 0;
        frames = 0;
        statsAt = now;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("resize", onResize);
      scroll.dispose();
      character.dispose();
      grade.dispose();
      stage.dispose();
    };
  }, []);

  const begin = () => {
    startedRef.current = true;
    setStarted(true);
  };

  return (
    <>
      {/* the page is genuinely this tall; the browser genuinely scrolls it */}
      <div style={{ height: `${MOROCCO_TIMELINE.lengthVh}vh` }} aria-hidden="true" />
      <canvas ref={canvasRef} className="world-canvas" />

      <div className="chapter-rail" aria-hidden="true" data-on={!!caption?.chapter && caption.chapter !== "Casablanca"}>
        {"CHILDHOOD".split("").map((ch, i) => (
          <span key={i}>{ch}</span>
        ))}
      </div>

      {caption?.chapter === "Casablanca" ? (
        <p className="place-label" style={{ opacity: caption.opacity }}>
          Casablanca
        </p>
      ) : null}

      {caption?.line ? (
        <p className="narration" style={{ opacity: caption.opacity }}>
          {caption.line}
        </p>
      ) : null}

      {!started ? (
        <div className="threshold-gate" data-leaving={loaded >= 100 && started}>
          <div className="threshold-gate__inner">
            <h1>Yasser Ameur</h1>
            <p className="threshold-gate__sub">an interactive autobiography</p>
            <button type="button" onClick={begin} className="threshold-gate__start">
              Scroll to begin
            </button>
          </div>
          <span className="threshold-gate__count">{String(loaded).padStart(2, "0")}</span>
        </div>
      ) : null}

      {stats ? (
        <pre className="slice-stats" data-testid="stats">
          {stats.fps} fps · js {stats.js}ms · gpu {stats.gpu}ms{"\n"}
          {stats.calls} calls · {stats.tris} tris · {stats.tex} tex
        </pre>
      ) : null}
    </>
  );
}
