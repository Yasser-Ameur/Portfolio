"use client";

/**
 * The world.
 *
 * One requestAnimationFrame heartbeat owns every per-frame update: input,
 * physics, gait, camera, parallax, and the character's transforms. Nothing in
 * here writes React state while travelling — the entire experience runs at zero
 * renders per second until a caption or a chapter actually changes.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Character,
  createRig,
  quantiseStage,
  type Outfit,
} from "@/character/character";
import { applyPose, createHairState, updateHair } from "@/character/apply";
import { Blink, EXPRESSIONS, blendExpression, type Expression } from "@/character/face";
import { gait, proportions } from "@/character/rig";
import { createMotherRig, Mother, applyMother } from "@/character/mother";
import {
  createCamera,
  handheldOffset,
  releaseCamera,
  applyDirective,
  updateCamera,
} from "@/engine/camera";
import { attachInput, decayInput, getIntent } from "@/engine/input";
import { GROUND_Y, clamp, damp, inverseLerp, lerp, measure, type Viewport } from "@/engine/space";
import { getState, setState, useWorld } from "@/engine/store";
import type {
  Beat,
  BeatCtx,
  Caption,
  Chapter,
  ChapterId,
  ExpressionName,
  Plane,
} from "@/engine/types";
import { PARALLAX } from "@/engine/types";
import { CHAPTERS, chapterAt, chapterById } from "./chapters";
import { OUTFITS, WORLD_END, WORLD_START, progressAt, stageAt } from "./journey";
import { blendPalettes, paletteVars, type Palette } from "./palette";
import { Particles, type ParticleField } from "./particles";
import { Grade } from "./grade";
import { Hud } from "./hud";

const PLANES: Plane[] = ["far", "mid", "near", "ground", "fore"];

const WALK_SPEED = 118;
const RUN_SPEED = 300;

/** How far a chapter's art may spill past its own span, in world units. */
const BLEED = 40;

const selectStarted = (s: ReturnType<typeof getState>) => s.started;
const selectReduced = (s: ReturnType<typeof getState>) => s.reducedMotion;

/**
 * Reduced motion is a real path, not a disabled experience: instead of walking,
 * the visitor steps between the moments that matter and the world dissolves
 * between them. Stations are every chapter opening and every scripted beat, so
 * nothing in the story is skipped.
 */
const STATIONS: number[] = Array.from(
  new Set(
    CHAPTERS.flatMap((c) => [c.span[0] + 90, ...(c.beats ?? []).map((b) => b.at + 30)]),
  ),
).sort((a, b) => a - b);

function nextStation(x: number, dir: 1 | -1): number {
  if (dir > 0) {
    for (const s of STATIONS) if (s > x + 8) return s;
    return WORLD_END - 60;
  }
  for (let i = STATIONS.length - 1; i >= 0; i--) {
    if (STATIONS[i] < x - 8) return STATIONS[i];
  }
  return STATIONS[0];
}

export function World() {
  const frameRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const planeRefs = useRef<Partial<Record<Plane, HTMLDivElement | null>>>({});
  const actorRef = useRef<HTMLDivElement>(null);
  const motherRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);

  const rig = useMemo(createRig, []);
  const motherRig = useMemo(createMotherRig, []);
  const hair = useMemo(createHairState, []);
  const blink = useMemo(() => new Blink(), []);
  const cam = useMemo(createCamera, []);
  const field = useRef<ParticleField | null>(null);

  const started = useWorld(selectStarted);
  const reduced = useWorld(selectReduced);

  // Continuous state — refs only. React never sees these move.
  const sim = useRef({
    x: WORLD_START + 120,
    v: 0,
    phase: 0,
    time: 0,
    facing: 1 as 1 | -1,
    stage: 0.04,
    locked: false,
    lockX: 0,
    expr: { ...EXPRESSIONS.neutral } as Expression,
    exprTarget: { ...EXPRESSIONS.neutral } as Expression,
    exprBlend: 1,
    motherX: null as number | null,
    /** When set, she walks beside him at this offset instead of standing still. */
    motherFollow: null as number | null,
    motherLook: 0,
    motherSway: 0,
    paletteKey: "",
    lastHeadY: 0,
    lastStep: 0,
    lastAdvance: 0,
    lastBack: 0,
    dissolve: 0,
  });

  const [vp, setVp] = useState<Viewport>(() => measure(1600, 900));
  const [stageStep, setStageStep] = useState(() => quantiseStage(0.04));
  const [chapterId, setChapterId] = useState<ChapterId>("threshold");
  const firedBeats = useRef(new Set<string>());
  const beatRunning = useRef<string | null>(null);
  const advanceSeen = useRef(0);

  const chapter = useMemo(() => chapterById(chapterId), [chapterId]);
  const outfit: Outfit = OUTFITS[chapterId];

  // -- viewport ------------------------------------------------------------
  useEffect(() => {
    const onResize = () =>
      setVp(measure(window.innerWidth, window.innerHeight));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // -- reduced motion ------------------------------------------------------
  useEffect(() => {
    // `?motion=full` / `?motion=reduced` override the OS setting — some people
    // run reduced motion system-wide for reasons that have nothing to do with
    // this, and should still be able to choose.
    const override = new URLSearchParams(window.location.search).get("motion");
    if (override === "full" || override === "reduced") {
      setState({ reducedMotion: override === "reduced" });
      return;
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setState({ reducedMotion: mq.matches });
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // -- input ---------------------------------------------------------------
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    return attachInput(el);
  }, []);

  const setCaption = useCallback((c: Caption | null) => setState({ caption: c }), []);

  // -- the beat runner -----------------------------------------------------
  const runBeat = useCallback(
    (beat: Beat) => {
      if (beatRunning.current) return;
      beatRunning.current = beat.id;
      const startAdvance = getIntent().advance;
      let cancelled = false;

      const ctx: BeatCtx = {
        wait: (ms) =>
          new Promise<void>((resolve) => {
            const t0 = performance.now();
            const step = () => {
              if (cancelled) return resolve();
              if (getIntent().advance > startAdvance + 1) {
                cancelled = true;
                return resolve();
              }
              if (performance.now() - t0 >= ms) return resolve();
              requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }),
        waitForInput: (ms = 6000) =>
          new Promise<void>((resolve) => {
            const t0 = performance.now();
            const base = getIntent().advance;
            const step = () => {
              if (cancelled) return resolve();
              if (getIntent().advance > base) return resolve();
              if (performance.now() - t0 >= ms) return resolve();
              requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }),
        camera: {
          apply: (d) => applyDirective(cam.targets, d),
          release: () => releaseCamera(cam.targets),
        },
        character: {
          express: (name: ExpressionName, weight = 1) => {
            sim.current.exprTarget = blendExpression(
              EXPRESSIONS.neutral,
              EXPRESSIONS[name],
              weight,
            );
            sim.current.exprBlend = 0;
          },
          stop: () => {
            sim.current.locked = true;
            sim.current.lockX = sim.current.x;
          },
          resume: () => {
            sim.current.locked = false;
          },
          face: (dir) => {
            sim.current.facing = dir;
          },
        },
        caption: setCaption,
        cancelled: () => cancelled,
      };

      Promise.resolve(beat.run(ctx))
        .catch(() => undefined)
        .finally(() => {
          beatRunning.current = null;
          sim.current.locked = false;
          releaseCamera(cam.targets);
          setState({ phase: "travelling" });
        });
    },
    [cam.targets, setCaption],
  );

  // -- the heartbeat -------------------------------------------------------
  useEffect(() => {
    if (!started) return;
    let raf = 0;
    let last = performance.now();
    let running = true;

    const onVisibility = () => {
      running = !document.hidden;
      last = performance.now();
      if (running) raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVisibility);

    function tick(now: number) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;
      s.time += dt;

      const intent = getIntent();
      decayInput(dt);

      // ---- movement ------------------------------------------------------
      const prevX = s.x;
      let dx = 0;

      if (reduced) {
        // Step between stations; the world dissolves rather than travels.
        s.v = 0;
        if (intent.advance !== s.lastAdvance) {
          const backwards = intent.back !== s.lastBack;
          s.lastAdvance = intent.advance;
          s.lastBack = intent.back;
          if (!s.locked) {
            s.facing = backwards ? -1 : 1;
            s.x = clamp(nextStation(s.x, backwards ? -1 : 1), WORLD_START, WORLD_END);
            // A cut, not a slide.
            cam.state.x = s.x - (vp.visibleUnits / cam.state.zoom) * cam.state.lead;
            s.dissolve = 1;
          }
        }
        if (s.dissolve > 0) s.dissolve = Math.max(0, s.dissolve - dt * 2.6);
      } else {
        const momentum = clamp(inverseLerp(WORLD_START, WORLD_END, s.x), 0, 1);
        const maxSpeed = lerp(WALK_SPEED * 1.05, RUN_SPEED, momentum * 0.55);
        const axis = s.locked ? 0 : intent.axis;
        const target = axis * maxSpeed;

        s.v = damp(s.v, target, target === 0 ? 5.5 : 2.6, dt);
        if (Math.abs(s.v) < 1.2) s.v = 0;

        s.x = clamp(s.x + s.v * dt, WORLD_START, WORLD_END);
        dx = s.x - prevX;

        if (s.v > 6) s.facing = 1;
        else if (s.v < -6) s.facing = -1;
      }

      // ---- gait ----------------------------------------------------------
      s.stage = stageAt(s.x);
      const p = proportions(s.stage);
      const speedNorm = clamp(Math.abs(s.v) / RUN_SPEED, 0, 1);
      const stride = p.legLen * lerp(1.0, 1.8, speedNorm);
      s.phase += (Math.abs(dx) / Math.max(1, stride)) * Math.PI * 2;
      if (s.phase > Math.PI * 4) s.phase -= Math.PI * 4;

      const pose = gait(s.phase, speedNorm, s.time);

      // ---- expression ----------------------------------------------------
      if (s.exprBlend < 1) {
        s.exprBlend = Math.min(1, s.exprBlend + dt * 2.6);
        s.expr = blendExpression(s.expr, s.exprTarget, s.exprBlend * 0.35);
      }
      const lid = blink.update(dt);

      // ---- hair ----------------------------------------------------------
      const headY = pose.bob;
      updateHair(
        hair,
        (dx / Math.max(dt, 0.0001)) * 0.06,
        (headY - s.lastHeadY) / Math.max(dt, 0.0001),
        dt,
        reduced ? 0.2 : 1,
      );
      s.lastHeadY = headY;

      applyPose(rig, pose, s.stage, hair, s.expr, lid);

      // ---- camera --------------------------------------------------------
      updateCamera(cam.state, cam.targets, {
        followX: s.x,
        motherX: s.motherFollow !== null ? s.x + s.motherFollow : s.motherX,
        visibleUnits: vp.visibleUnits,
        dt,
        time: s.time,
        minX: WORLD_START,
        maxX: WORLD_END,
        handheld: !reduced,
      });

      const hh = handheldOffset(s.time, reduced ? 0 : 1);
      const camX = cam.state.x + hh.x;
      const camY = cam.state.y + hh.y;

      // ---- write the frame -----------------------------------------------
      if (zoomRef.current) {
        zoomRef.current.style.transform = `scale(${cam.state.zoom.toFixed(4)})`;
        // The dissolve between stations in reduced motion.
        zoomRef.current.style.opacity =
          s.dissolve > 0 ? (1 - s.dissolve * 0.85).toFixed(3) : "1";
      }
      for (const plane of PLANES) {
        const el = planeRefs.current[plane];
        if (!el) continue;
        const px = -camX * PARALLAX[plane];
        const py = -camY * (plane === "ground" || plane === "fore" ? 1 : 0.4);
        el.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;
      }

      if (actorRef.current) {
        actorRef.current.style.transform = `translate3d(${(s.x - 200).toFixed(2)}px, ${(GROUND_Y - 380).toFixed(2)}px, 0) scaleX(${s.facing})`;
      }
      if (shadowRef.current) {
        const lift = clamp(-pose.bob / 6, 0, 1);
        shadowRef.current.setAttribute("rx", String(p.hipW * (0.95 - lift * 0.18)));
        shadowRef.current.setAttribute("opacity", String(0.3 - lift * 0.09));
      }

      // She either stands where a chapter put her, or walks beside him.
      const motherX =
        s.motherFollow !== null ? s.x + s.motherFollow : s.motherX;
      if (motherX !== null && motherRef.current) {
        motherRef.current.style.opacity = "1";
        motherRef.current.style.transform = `translate3d(${(motherX - 200).toFixed(2)}px, ${(GROUND_Y - 380).toFixed(2)}px, 0)`;
        applyMother(motherRig, {
          look: s.motherLook,
          sway: s.motherFollow !== null ? clamp(Math.abs(s.v) / WALK_SPEED, 0, 1) : s.motherSway,
          t: s.time,
        });
      } else if (motherRef.current) {
        motherRef.current.style.opacity = "0";
      }

      // ---- chapter + palette ----------------------------------------------
      const active = chapterAt(s.x);
      if (active.id !== chapterId) {
        setChapterId(active.id);
        setState({ chapterId: active.id });
        if (getState().soundEnabled) {
          void import("@/engine/audio").then((m) => m.tuneTo(active.id));
        }
      }

      // Footsteps fire on gait-phase crossings, filtered by surface.
      if (speedNorm > 0.04 && getState().soundEnabled) {
        const step = Math.floor(s.phase / Math.PI);
        if (step !== s.lastStep) {
          s.lastStep = step;
          void import("@/engine/audio").then((m) =>
            m.footstep(active.surface, 0.4 + speedNorm * 0.6),
          );
        }
      }

      const blended = blendedPalette(s.x);
      const key = blended.sky[0] + blended.key + blended.haze;
      if (key !== s.paletteKey && frameRef.current) {
        s.paletteKey = key;
        const vars = paletteVars(blended);
        for (const k in vars) frameRef.current.style.setProperty(k, vars[k]);
      }

      // ---- discrete updates (rare) -----------------------------------------
      const q = quantiseStage(s.stage);
      if (q !== stageStep) setStageStep(q);

      const prog = progressAt(s.x);
      const st = getState();
      if (Math.abs(prog - st.progress) > 0.004) setState({ progress: prog });

      // ---- beats -----------------------------------------------------------
      if (!beatRunning.current && active.beats) {
        for (const beat of active.beats) {
          if (firedBeats.current.has(beat.id)) continue;
          const crossedForward = prevX < beat.at && s.x >= beat.at;
          if (crossedForward) {
            firedBeats.current.add(beat.id);
            setState({ phase: "beat" });
            runBeat(beat);
            break;
          }
        }
      }

      // ---- particles -------------------------------------------------------
      field.current?.update(dt, camX, cam.state.zoom);

      advanceSeen.current = intent.advance;
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // The loop reads everything through refs; only these identities matter.
  }, [started, vp, reduced, chapterId, stageStep, rig, motherRig, hair, blink, cam, runBeat]);

  // -- expose mother placement to chapters ---------------------------------
  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail as {
        x: number | "follow" | null;
        look?: number;
        sway?: number;
        offset?: number;
      };
      if (d.x === "follow") {
        sim.current.motherFollow = d.offset ?? -78;
        sim.current.motherX = null;
      } else {
        sim.current.motherFollow = null;
        sim.current.motherX = d.x;
      }
      if (d.look !== undefined) sim.current.motherLook = d.look;
      if (d.sway !== undefined) sim.current.motherSway = d.sway;
    };
    window.addEventListener("world:mother", handler);
    return () => window.removeEventListener("world:mother", handler);
  }, []);

  const live = useMemo(() => liveChapters(chapterId), [chapterId]);
  const palette = chapter.palette;

  return (
    <div
      ref={frameRef}
      className="world-frame"
      tabIndex={0}
      role="application"
      aria-label="An interactive walk through Yasser Ameur's life. Hold the right arrow key to move forward, left to go back, up to enter a memory, Escape to leave one."
      style={paletteVars(palette) as React.CSSProperties}
    >
      <div className="world-sky" />

      <div className="world-zoom" ref={zoomRef}>
        <div
          className="world-scale"
          ref={scaleRef}
          style={{
            transform: `translate(0px, ${vp.originY}px) scale(${vp.scale})`,
          }}
        >
          {PLANES.map((plane) => (
            <div
              key={plane}
              className={`world-plane world-plane--${plane}`}
              ref={(el) => void (planeRefs.current[plane] = el)}
            >
              {live.map((c) => {
                const render = c.layers[plane];
                if (!render) return null;
                const w = c.span[1] - c.span[0];
                const clip = `clip-${c.id}-${plane}`;
                return (
                  <svg
                    key={c.id}
                    className="chapter-layer"
                    style={{ left: c.span[0], width: w }}
                    viewBox={`0 0 ${w} 900`}
                    width={w}
                    height={900}
                    aria-hidden="true"
                  >
                    {/* A chapter may overhang vertically (branches, foreground
                        banks) but never laterally — otherwise its architecture
                        invades the chapter next door. */}
                    <defs>
                      <clipPath id={clip}>
                        <rect x={-BLEED} y={-600} width={w + BLEED * 2} height={2100} />
                      </clipPath>
                    </defs>
                    <g clipPath={`url(#${clip})`}>
                      {render({ palette: c.palette, seed: c.span[0] })}
                    </g>
                  </svg>
                );
              })}

              {plane === "ground" ? (
                <>
                  <div className="actor" ref={motherRef} style={{ opacity: 0 }}>
                    <svg
                      viewBox="-200 -380 400 400"
                      width={400}
                      height={400}
                      style={{ overflow: "visible" }}
                      aria-hidden="true"
                    >
                      <Mother
                        rig={motherRig}
                        robe={palette.id === "stage" ? "#5c3a4a" : "#b6633f"}
                        robeShade={palette.id === "stage" ? "#472c39" : "#8f4b2e"}
                        scarf={palette.id === "stage" ? "#d8a24e" : "#e0a06a"}
                        rim={palette.key}
                        rimStrength={0.3}
                      />
                    </svg>
                  </div>

                  <div className="actor" ref={actorRef}>
                    <svg
                      viewBox="-200 -380 400 400"
                      width={400}
                      height={400}
                      style={{ overflow: "visible" }}
                      aria-hidden="true"
                    >
                      {/* His contact shadow rides with him. It used to live in a
                          world-wide SVG, which forced the browser to composite a
                          13,400-unit surface every frame. */}
                      <ellipse ref={shadowRef} cx={0} cy={3} rx={22} ry={5} fill="#000000" opacity="0.3" />
                      <Character
                        stageStep={stageStep}
                        outfit={outfit}
                        rig={rig}
                        rim={palette.key}
                        rimStrength={0.34 + Math.abs(palette.temp) * 0.22}
                      />
                    </svg>
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <Particles fieldRef={field} viewport={vp} palette={palette} chapterId={chapterId} />
      <Grade />
      <Hud />
    </div>
  );
}

// ---------------------------------------------------------------------------

/** Chapters whose span is near the camera. Never more than three are live. */
function liveChapters(current: ChapterId): Chapter[] {
  const i = CHAPTERS.findIndex((c) => c.id === current);
  if (i < 0) return [CHAPTERS[0]];
  return CHAPTERS.slice(Math.max(0, i - 1), Math.min(CHAPTERS.length, i + 2));
}

/**
 * Environments crossfade over a shared corridor, so the sky and light are
 * always partway between two chapters rather than switching at a boundary.
 */
const CORRIDOR = 420;

function blendedPalette(x: number): Palette {
  const current = chapterAt(x);
  const idx = CHAPTERS.findIndex((c) => c.id === current.id);
  const distanceToEnd = current.span[1] - x;
  if (distanceToEnd < CORRIDOR && idx < CHAPTERS.length - 1) {
    const next = CHAPTERS[idx + 1];
    const t = 1 - distanceToEnd / CORRIDOR;
    return blendPalettes(current.palette, next.palette, t * 0.5);
  }
  const distanceFromStart = x - current.span[0];
  if (distanceFromStart < CORRIDOR && idx > 0) {
    const prev = CHAPTERS[idx - 1];
    const t = 1 - distanceFromStart / CORRIDOR;
    return blendPalettes(current.palette, prev.palette, t * 0.5);
  }
  return current.palette;
}
