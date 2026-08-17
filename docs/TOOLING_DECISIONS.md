# Tooling Decision Record

Written before implementation, after auditing what this environment actually
provides. Revisit only when a decision is contradicted by measurement.

---

## 1. Capability audit

Everything below was **verified**, not assumed.

| Capability | Available | Evidence |
|---|---|---|
| Browser automation | **Yes** — Playwright 1.62.1 | `npx playwright --version`; chromium + headless shell installed under `ms-playwright/` |
| Screenshot / visual inspection | **Yes** | Driving the real page and reading PNGs back has already caught six defects |
| Video capture | Yes — ffmpeg ships with Playwright | `ms-playwright/ffmpeg-1011` |
| In-app browser MCP (`Claude_Browser`) | Partial | Works, but the pane stops compositing when not displayed — screenshots time out. **Playwright is the primary loop**; this is the fallback |
| Real Chrome MCP (`claude-in-chrome`) | Yes | Not needed — no logged-in sessions required |
| TypeScript tooling | **Yes** — 5.x, `tsc --noEmit` clean | Used as the gate before every screenshot run |
| Three.js | **Yes** — 0.185.1 on npm | `npm view three version` |
| PixiJS | **Yes** — 8.19.0, `@pixi/tilemap` 5.0.2 | `npm view` |
| `postprocessing` (Three) | Yes — 6.39.4 | `npm view` |
| `simplex-noise` | Yes — 4.0.3 | `npm view` |
| `pixelmatch` (image diff) | Yes — 7.2.0 | `npm view` |
| node `canvas` | Yes — 3.2.3 | Available if textures need baking outside the browser |
| Subagents | Yes | `Explore`, `Plan`, `general-purpose`, `claude` |
| Repository tooling | Yes | git, `gh` |
| **Image generation** | **NO** | No image-generation tool exists in this environment |
| **Image editing** | **NO** | Same |

### The constraint that drives everything

**There is no image-generation capability here, and the user has ruled out the
previously generated reference sheets.** Every pixel must therefore be produced
by code.

This is not a reason to fall back to flat vector. It is a reason to generate
*textures* procedurally — canvas-painted, palette-driven, noise-textured — and
feed them to a real-time renderer. Code-authored does not have to mean flat.

---

## 2. Renderer decision

### Selected: **Three.js, orthographic camera, textured quads at real depths**

### Why not SVG/DOM (the previous architecture)

It was measured, not guessed:

```
jsMsPerFrame:      0.80   ← the engine itself was never the problem
browserMsPerFrame: 87.48  ← compositing 1,408 SVG nodes across 5 promoted layers
fps:               11
```

Two real defects were found and fixed (a world-wide 13,400-unit SVG forcing a
12-megapixel composited layer; `mix-blend-mode` on two full-screen overlays
forcing a whole-stack flatten every frame). That moved it to 15 fps. Still far
short.

**Honest caveat:** this was headless Chromium on a *software* rasteriser. Real
GPU numbers would be better, and I did not get to measure them. But the shape of
the problem — per-frame cost living entirely in browser rasterisation of a large
retained vector tree — is exactly what a retained-mode DOM renderer is bad at
and what a GPU scene graph is built for. The directive to move off SVG is
independently correct.

### Three.js over PixiJS

PixiJS 8 is the faster pure-2D batcher and its tilemap support is better. It
loses on the things this specific story needs:

| Requirement (from the brief) | Three.js | PixiJS |
|---|---|---|
| "camera depth, portals, dimensional transitions" | native — real z, real camera | manual fakery |
| "3D memory environments" inside a 2D world | same renderer, just move the camera | needs a second stack |
| Depth sorting across parallax planes | free (z-position + depth buffer) | manual z-index bookkeeping |
| Postprocessing chain (grade, bloom, DoF) | `postprocessing` / `EffectComposer` | filters, weaker DoF |
| Ortho→perspective push for a memory dive | one camera property | not possible |
| The Pattern Layer as a second pass | render pass over the same scene | overlay hack |

The deciding factor is the Dives. The narrative requires the visual language to
*change* when you step into a memory — and the ending requires the world to
become abstract and dimensional. One renderer that can do flat 2.5D **and** real
3D, without a second stack, is worth the small batching penalty.

Orthographic camera by default, so the world reads as layered 2.5D. Perspective
is available when a scene earns it.

### Architecture

- **Environments**: per-chapter, per-depth-plane textures painted procedurally to
  canvas at load, uploaded once, drawn as quads at real z. Repaint on palette
  change only, never per frame.
- **Character**: a 2D skeletal rig of small textured quads parented in the scene
  graph. Keeps continuous growth and procedural gait (which worked well and is
  being carried over) while gaining real depth sorting and lighting.
- **Particles**: instanced points / `Points` with a custom shader.
- **Grade**: `EffectComposer` — vignette, grain, subtle bloom on emissives.

### Rejected

| Rejected | Why |
|---|---|
| SVG/DOM as the world | Measured 11–15 fps; wrong tool for a scrolling scene graph |
| PixiJS | No real camera depth; the Dives and the ending need 3D |
| `@react-three/fiber` | Adds a React reconciler to the hot path. The engine already proved zero-React-per-frame is the right discipline; imperative Three is a better fit |
| WebGPU-only | Availability still uneven; Three's WebGL fallback is the safe default |
| Any new MCP server | Playwright already closes the implement → render → inspect → fix loop. Nothing else materially improves this project |
| node `canvas` for baking | Painting in the browser keeps one code path and no build step. Reconsider only if load-time texture painting proves slow |

---

## 3. Browser / visual QA loop

Playwright, headless, driving the real page:

```
tsc --noEmit  →  build/dev  →  navigate  →  drive the engine's own input
              →  screenshot at scripted world positions
              →  read the PNGs back  →  fix the largest visual problem  →  repeat
```

Scripted stops live in `scripts/shoot.mjs`. The frame-cost probe
(`jsMsPerFrame` vs `browserMsPerFrame`) lives in `scripts/frame-cost.mjs` and is
run at every milestone — the 87 ms finding is exactly why it exists.

`pixelmatch` is available for regression diffs and will be added once the art has
stopped changing every iteration; before then it would only produce noise.

---

## 4. Skills created for this project

Project-local, under `.claude/skills/`. Deliberately four, not ten.

| Skill | Purpose |
|---|---|
| `art-direction` | Prevents generic AI-looking output. Enforces palette discipline, composition, silhouette, environmental density. Requires visual critique before accepting work |
| `world-2-5d` | Orthographic cameras, depth sorting, parallax, sprite rigs, atlases, draw-call budgets, Three.js scene architecture |
| `interactive-storytelling` | Turns life events into environment → object → interaction → memory, never into paragraphs |
| `visual-qa` | A hostile reviewer. Its job is to find what looks bad, not to approve |

No others. `skill-creator` exists but these are small and hand-writing them is
faster than generating them.

---

## 5. Subagents

Available and useful for one thing specifically: **`visual-qa` must not be run by
the same reasoning that produced the artwork.** Self-approval is the failure mode
the directive is guarding against.

Plan: run visual critique as a separate agent invocation with only the
screenshots and the art-direction rules in scope — no knowledge of how hard
anything was to build. Other roles (art director, rendering engineer,
performance engineer) stay in the main thread; splitting them adds ceremony and
cold-start cost without improving output.

---

## 6. Documented limitations

1. **No image generation.** All texture is procedural. Accepted, and turned into
   an advantage: chapters recolour from a palette and nothing is downloaded.
2. **No GPU in the measurement environment.** Headless Chromium rasterises in
   software, so absolute fps here is pessimistic. Frame *composition* (js vs
   browser ms) is still meaningful and is what gets tracked.
3. **In-app browser pane is unreliable** for screenshots when not displayed.
   Playwright is the loop; the pane is only for live inspection when the user has
   it open.
