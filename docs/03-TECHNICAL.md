# Technical Architecture

Stack: **Next.js 16.3 (App Router) · React 19 · TypeScript · Tailwind v4 ·
Three.js 0.185**. Deploy: static export to GitHub Pages at `yasserameur.me`.
No server runtime, no database, no external asset host.

Renderer selection and the capability audit behind it:
[`TOOLING_DECISIONS.md`](TOOLING_DECISIONS.md).
Scene-graph patterns and budgets: `.claude/skills/world-2-5d/`.

---

## 1. Rendering

**Three.js, orthographic camera, textured quads at real z.** One WebGL canvas
for the world; DOM only for captions, the progress hairline and the sound
toggle.

| Concern | How |
|---|---|
| Environments | per-chapter, per-plane textures painted procedurally to canvas at load, uploaded once, drawn as quads at real z |
| Character | 2D skeletal rig of textured quads parented in the scene graph |
| Depth | real z-positions and the depth buffer — no manual render ordering |
| Parallax | each plane group offset by `−camX · (1 − factor)` per frame |
| Particles | `Points` with a custom shader |
| Grade | `EffectComposer`: vignette → grain → bloom on emissives |
| Audio | procedural WebAudio, zero assets |

**No image assets and no image-generation capability exist here** (see the
audit), so every texture is painted in code. That is what makes per-chapter
recolouring and the Pattern Layer possible, and it means there is nothing to
download.

### Why not SVG/DOM

It was built, measured and replaced:

```
jsMsPerFrame      0.80   ← the engine was never the problem
browserMsPerFrame 87.48  ← compositing a large retained vector tree
fps               11
```

Two genuine defects were found and fixed along the way (a world-wide
13,400-unit SVG forcing a 12-megapixel composited layer, and `mix-blend-mode` on
two full-screen overlays forcing a whole-stack flatten every frame), taking it
to 15 fps. Still far short. Caveat: measured under headless Chromium's software
rasteriser, so absolute fps is pessimistic — but the cost living entirely in
browser rasterisation is exactly the failure mode a GPU scene graph exists to
avoid.

## 2. Coordinate system

Design space **1600 × 900 units**, ground line **y = 700**.

```
MIN_VISIBLE = viewportWidth < 768 ? 820 : 1100
scale       = min(viewportWidth / MIN_VISIBLE, viewportHeight / 900)
```

Guarantees a minimum amount of world is composed into frame on every device
while keeping the character a sane fraction of viewport height. There is no
separate mobile layout.

Design space counts y downward; Three counts y upward. Flipped once at the scene
root so all authoring maths stays in design space.

## 3. The clock

One `requestAnimationFrame` heartbeat owns every per-frame update: input,
physics, gait, camera, parallax, palette, particles, audio parameters.

**No React state is written during a frame.** Continuous values live in refs;
discrete values (chapter, caption, dive target) live in a small store read
through `useSyncExternalStore`, so a caption change re-renders a caption and
nothing else. Measured at 0.8 ms/frame of JS in the previous implementation and
carried over unchanged — that discipline was correct and is not being revisited.

## 4. State

**Continuous** (refs, invisible to React): `charX, charV, facing, gaitPhase,
stage, expression[5], camX, camY, zoom, paletteMix, particleField`.

**Discrete** (store): `chapterId, phase, caption, diveId, patternLayer,
soundEnabled, reducedMotion, started, progress, nearProp`.

## 5. Chapters

```ts
type Chapter = {
  id: ChapterId
  span: [number, number]
  palette: Palette
  surface: SurfaceKind
  layers: Partial<Record<Plane, LayerPainter>>   // canvas painters, not JSX
  props?: WorldProp[]
  beats?: Beat[]
}
```

Only chapters intersecting `[camX − vw, camX + 2·vw]` are live — 2–3 at a time.
Textures are painted on mount and disposed on unmount; leaked textures are the
main memory risk. Chapter modules load via `dynamic()` and are prefetched as he
enters the last 800 units of the previous chapter, so nobody waits.

## 6. Beats

A beat is a scripted moment at a world position, with camera, expression,
caption, sound and `wait`/`waitForInput` in scope. Any input **skips to the end**
rather than being ignored — nobody is trapped and nobody waits through anything
twice.

## 7. Budgets

| Metric | Budget |
|---|---|
| Frame time | < 8 ms desktop, < 12 ms mobile |
| React renders while travelling | 0 |
| Draw calls | ≤ 120 |
| Live chapters | ≤ 3 |
| Resident textures | ≤ 24 |
| Particles | 400 desktop / 120 mobile |
| Pixel ratio | capped at 2 |
| Assets to download | 0 (fonts excepted) |

Verified by `scripts/frame-cost.mjs`, which reports `jsMsPerFrame` and
`browserMsPerFrame` **separately** — that split is what located the real problem
last time.

## 8. Accessibility

Reduced motion is a real path: station-to-station dissolves, static gait, no
parallax or handheld, camera cuts. Every beat, caption and memory preserved.
`?motion=full` / `?motion=reduced` override the OS setting.

Full keyboard traversal. Captions announced via `aria-live`. **`/journey` is the
entire story as prose** — a real page, and the accessibility contract for the
whole experience.

## 9. Structure

```
app/              routes, fonts, global styles, /journey transcript
engine/           clock, camera, input, store, director, audio, space
render/           three setup, scene graph, layers, textures, composer
world/            palettes, chapters (canvas painters), props, HUD
character/        rig, expressions, the two figures
content/          repo-verified project facts
scripts/          shoot.mjs, frame-cost.mjs
docs/             narrative + the bibles + this
.claude/skills/   art-direction, world-2-5d, interactive-storytelling, visual-qa
```

## 10. Verification

Before accepting any chapter:

- `npx tsc --noEmit` and `npm run lint` clean
- `scripts/frame-cost.mjs` within budget
- `scripts/shoot.mjs` captures, reviewed by the `visual-qa` skill **run
  separately from whatever produced the work**
- zero React renders while travelling
- no console errors, no hydration mismatch
- keyboard-only traversal
- reduced-motion pass reaches every beat
- `/journey` contains every narrative beat in text
