# The Story World — Design Document

The interactive story world for **Yasser Ameur's** portfolio at `/story`.

This is not an "About Me" section. It is a continuous, cinematic, side-scrolling
adventure in which the visitor *follows a person through time* — from a Moroccan
childhood to engineering at EPFL, and beyond. The story is told through
**movement + environment + character + timing + scale + lighting + interaction**.
Text is a reinforcement, never the medium.

> The journey is still going.

---

## 1. Design principles

1. **One continuous world, one shot.** There is a single horizontal world far
   wider than the viewport. The camera follows the protagonist as he physically
   runs between every chapter. No per-scene page swaps, no "click → instant
   background replacement".
2. **The character is the story.** One coherent sprite that visibly grows and
   animates in every state (run, walk, stop, look, sit, type, board, celebrate).
   He must be *seen* running between periods of his life.
3. **The world transforms physically.** Environments, lighting, architecture,
   vegetation and sky morph gradually along the journey. Transitions are travel,
   not teleports.
4. **Atmosphere over decoration.** Sophisticated, restrained, nostalgic,
   quietly ambitious — a small cinematic indie-game feel, not a cartoon.
5. **Automatic traversal first, control always.** The experience plays itself,
   but the visitor is never stuck: click / tap / keys advance, and navigation is
   always reachable.
6. **Respect the visitor.** Reduced-motion and mobile modes preserve the
   narrative with simpler motion.

---

## 2. Technical approach

**Decision: DOM/SVG rendering with CSS transforms, driven by a single
requestAnimationFrame loop.** No game engine.

Rationale:

- The codebase already speaks this visual language (SVG scene art, `motion`,
  GPU-friendly transforms, `--px/--py` parallax). A canvas/PixiJS/Phaser rewrite
  would re-author every backdrop as draw calls for no visual gain.
- The requirements — wide world, layered parallax, camera tracking, sprite
  animation, crossfades, cinematic grading — are all achievable with a small
  number of composited DOM/SVG layers (≈10–20 nodes per chapter, not thousands).
- Typography, accessibility, and route transitions stay first-class DOM.

Performance contract: one rAF heartbeat owns all per-frame updates (camera,
parallax, sky opacities, character limbs, lighting). All hot writes go to refs /
CSS variables — **zero React re-renders per frame**. Discrete state (phase,
caption) only changes on transitions. Target: 60 fps on a modern laptop,
graceful degradation on weak devices and mobile.

---

## 3. World layout (design units)

Coordinate system: abstract units. Base design viewport is **1600 × 900 units**.
A real-time scale factor `S = viewportWidth / 1600` converts units → px, so the
world is responsive by construction. The ground line sits at **y = 720**.

`WORLD_WIDTH = 18,400 units` (≈ 11.5 viewports wide).

| x (units) | Region / chapter        | Milestone (x)                  | Character stage |
|-----------|-------------------------|--------------------------------|-----------------|
| 0–2400    | intro → childhood home  | childhood (1900)               | 0 → 0.4         |
| 2400–4600 | road → Morocco / medina | marrakech (4000)               | 0.4 → 1.0       |
| 4600–6600 | dusk corridor → room    | programming (6200)             | 1.0 → 1.8       |
| 6600–9000 | high school             | highschool (7600), graduation (8500) | 1.8 → 2.8 |
| 9000–10300| airport                 | airport (9800)                 | 2.8 → 3.2       |
| 10300–11200| FLIGHT interlude       | — (cinematic overlay)          | 3.6             |
| 11200–13000| Switzerland arrival     | switzerland (11800)            | 3.6 → 4.4       |
| 13000–15400| EPFL campus             | epfl (13500) + campus beats    | 4.4 → 5.4       |
| 15400–17600| alpine journey          | alps (16000) — final pose      | 5.4 → 6.0       |
| 17600–18400| bridge → projects gate  | — (run off / fade)             | 6.0             |

**Character growth is continuous.** Stage (0–6) is interpolated piecewise-
linearly between the keyframes above. The sprite's proportions (height, head,
shoulders, waist, torso, legs), clothing accents and posture interpolate along
the world, so growth is visible but never staccato.

---

## 4. Render layers (back → front)

```
viewport (overflow hidden)
├─ SkyStack            fixed to viewport; chapter sky gradients crossfade by character x
├─ CameraWrap          translate3d(-cameraX·S, cameraY·S, 0) scale(zoom)
│   ├─ HorizonWrap     translate3d(-cameraX·0.25·S, …)  → wide horizon silhouettes (parallax)
│   ├─ WorldWrap       translate3d(-cameraX·S, …)       → the reality layer (parallax 1.0)
│   │   ├─ WorldPath           single continuous running track + ground (one wide SVG)
│   │   ├─ ChapterSets         per-chapter wide backdrop SVGs, absolutely positioned
│   │   ├─ ChapterProps        interactive props (football, palms, desk, board, plane…)
│   │   ├─ LightingOverlay     world-wide cinematic grade gradient (position-fixed in world)
│   │   └─ Character           sprite at world x (worldWrap translates with the world)
│   └─ ForegroundWrap  translate3d(-cameraX·1.15·S, …)  → passing posts/trees (speed cue)
├─ Vignette / letterbox        fixed cinematic framing
├─ Caption / HUD               fixed UI (DOM)
└─ FlightInterlude             fixed full-viewport layer during the flight phase
```

Parallax factors: horizon 0.25, world 1.0, foreground 1.15. Distant palms,
mountains and city skylines live in the horizon strip; near architecture, desks
and props live in the world strip. This single horizon/world split already
produces strong depth without heavy layer counts.

---

## 5. Sky + lighting story

The **SkyStack** renders one full-viewport gradient per chapter. Each gradient's
opacity is 1 inside its region and fades across the transition corridors
(computed from character x each frame). The progression is the emotional spine:

| Region          | Sky                                                    | Mood         |
|-----------------|--------------------------------------------------------|--------------|
| childhood       | pale blue → warm amber                                 | nostalgic afternoon |
| morocco         | gold → terracotta → red                                | golden warmth |
| programming     | deep blue evening (interior room)                      | intimate night |
| high school     | academic daylight → warm                                | focused      |
| graduation      | warm amber glow                                        | quietly proud |
| airport         | dusk blue → amber horizon                              | expectant    |
| flight          | high-altitude blue, sun glare, clouds                  | liberating   |
| switzerland     | cool morning blue → white                              | arrival      |
| EPFL            | daylight → evening → night → morning (across 13000–15400) | ambitious |
| alps            | golden alpine glow                                     | peaceful     |

The **LightingOverlay** is a single world-wide linear gradient (along x) whose
stops encode the same journey — warm→gold→indigo→cool→day→night→gold — applied
as a low-opacity color wash over the whole strip with `mix-blend-mode`. Because
it lives in world space and translates at parallax 1.0, the light at the
character's position changes *physically* as he walks. The EPFL night→morning
arc is encoded as gradient stops inside the campus range.

---

## 6. Camera system

- **Follow:** cameraX = charX − 0.36 · viewportWidth (the character rides at
  36% from the left, leaving space ahead). Smoothed with critically-damped
  lerp: `cameraX += (target − cameraX) · (1 − exp(−dt·k))`, k≈3.5 while running.
- **Arrival:** character slows, camera offset eases to 0.42, zoom eases to
  1.14 (push-in) and the character turns to look. After the caption dwell the
  camera returns and travel resumes.
- **Chapter pushes:** programming zooms to 1.28 (the screen); graduation pulls
  to 1.10 with a soft lateral drift; the Alps open from 1.12 → 0.98 and **pan
  cameraY up ~90 units** so the peaks dominate and the character shrinks in
  frame (scale communicates "a huge world is still ahead").
- **Flight:** the horizontal camera is parked; the FlightInterlude layer takes
  over with its own vertical motion.

---

## 7. Character / sprite system

A single behind-view silhouette figure (dark body, ember rim light) rendered as
one SVG with parameterized proportions.

**Growth parameters (STAGES 0–6):** scale, head radius, shoulder width, waist,
torso length, leg length. Interpolated continuously along the world.

**Poses (`CharacterPose`):**
`idle · walk · run · look · sit · type · board · proud` plus a seated variant.

**Limb animation is JS-driven and speed-synced.** The rAF loop accumulates a
phase and writes CSS vars to the character root each frame:
`--leg-l`, `--leg-r`, `--arm-l`, `--arm-r`, `--bob`, `--lean`. Limb groups
rotate around hip/shoulder origins (`transform-origin`). Frequency scales with
velocity, so the run speeds up / slows down / glides into idle with no snapping
and no phase jumps. Amplitude narrows for walk, widens for run; the body bobs
and leans forward with speed.

`idle` = breathing bob + occasional head tilt. `look` = head/upper body turned
toward the landmark. `sit`/`type` = seated profile geometry with an animated
typing arm. `proud` = final pose: upright, arms spread, head raised — the
mountain celebration (original, football-*inspired*, not a likeness).

**Clothing accents** shift subtly per era (cap in childhood, hoodie at
programming/high school, coat at the airport, EPFL jacket on campus) without
breaking silhouette cohesion.

---

## 8. Traversal mechanics

- Speeds: run 230 u/s, walk 60 u/s, approach decelerates to 0 over the last
  ~220 u before a milestone.
- The run cycle is legible: legs scissor, arms swing, body bobs and leans.
- Stopping eases through walk → idle; the limb phase var smoothly ramps.

---

## 9. Milestone mechanism

Every major life event runs the same choreography:

```
running → approach (slow) → arrive (stop) → look at landmark
→ camera push-in → scripted moment (optional) → caption → dwell → continue
```

- Caption dwells ~6 s, or until click/tap/Space/Enter.
- Chapter "moments" are scripted timelines in the director (awaited sequences):
  - **Childhood:** the boy kicks a football (clickable), it rolls, he chases,
    he notices the TV glow in the window, and runs on. Caption: "It started
    simply. Football. Games. Curiosity."
  - **Marrakech:** he walks the medina, stops at an arch, looks around (head
    turn), palms sway. Caption: "Morocco was never just a place on the map. It
    was part of who I was becoming."
  - **Programming:** he enters the room, sits, the monitor wakes, he types; the
    screen animates **code → visual form** (lines assemble a shape), he pauses,
    reacts, continues. Caption: "Then I discovered programming. The computer
    stopped being something I used. It became something I could create with."
  - **High school:** corridor → classroom beat (sit, notes) → study evening →
    resume. Caption: "Hard work accumulated quietly."
  - **Graduation:** he reaches the stage among classmates; camera pulls gently;
    warm light + soft applause sparkle; he looks around. Caption: "Years of
    work became something tangible. I graduated at the top of my class."
  - **Airport:** he stops, looks up at the plane, walks the ramp, boards. The
    plane taxis, turns, and lifts off into the **flight interlude**.
  - **Switzerland:** the plane descends; Alps and lake reveal; he walks off the
    plane into cool morning light. Caption: "One suitcase. A new sky ahead."
  - **EPFL:** a campus day, several beats — walk → lecture (sit) → laptop at a
    table (type) → friend moment → night study → walk again. The world's
    lighting runs morning→night→morning. Captions: "At EPFL, curiosity became
    engineering. I started caring not only about what software could do… …but
    how it worked underneath."
  - **Alps:** he hikes to the viewpoint ledge, stops, camera pulls back and
    pans up, he spreads his arms. Caption: "The journey is still going. There
    is still a lot to build." Then `EXPLORE MY PROJECTS →` and `← HOME`.

---

## 10. Environment & objects by chapter

**Childhood (0–2400)** — warm afternoon yard. House with a glowing TV window,
fence, tree, football (interactive), bicycle, toys, distant suburban
silhouettes on the horizon.

**Morocco (2400–4600)** — golden medina. Palm silhouettes on the horizon,
ochre/terracotta walls with geometric detail, arches, market awnings, distant
Atlas hills.

**Programming (4600–6600)** — dusk street gives way through a doorway to a
night room: desk, monitor, keyboard, notebooks, math papers, bookshelf, warm
desk lamp, window with the blue evening outside.

**High school (6600–9000)** — schoolyard and corridors, lockers, classroom
windows, benches, students (subtle looping silhouettes), books; a stage with
classmates and a banner at graduation.

**Airport (9000–10300)** — dusk tarmac, terminal with signage, animated
departure board, luggage cart, runway lights, parked aircraft + boarding ramp.

**Flight (10300–11200)** — full-viewport overlay: high-altitude sky, sun glare,
drifting cloud layers, the plane ascending, clouds parting to reveal Alps.

**Switzerland (11200–13000)** — cool morning. Airstrip, meadow, chalet,
conifers, lake glint, Alps growing in the horizon.

**EPFL (13000–15400)** — stylized campus (no copyrighted photography):
concrete/glass volumes, walkways, lawns, lecture building, café tables,
students, bicycles, lake + Alps on the horizon. The interior beats use desk /
lecture hall vignettes.

**Alps (15400–17600)** — golden alpine ridge: layered peaks, snowlines, valley
lake, conifers, drifting mist, a viewpoint ledge at 16000.

**Bridge (17600–18400)** — the path narrows to a gate; the character runs on
and the world fades to the projects gate.

---

## 11. Transitions between chapters (physical, not digital)

- **Childhood → Morocco:** the road continues; fences give way to ochre walls,
  the first palms rise on the horizon, the light warms (overlay gradient).
- **Morocco → Programming:** gold drains into deep blue dusk (sky crossfade +
  overlay), street lamps pass, a doorway opens into the room.
- **Programming → High school:** the room's wall recedes into daylight; the
  path exits to a schoolyard as the sky brightens.
- **High school → Airport:** corridors turn into a transit road; signage
  appears; dusk falls.
- **Airport → Flight:** direct character interaction with the aircraft.
- **Flight → Switzerland:** clouds part; Alps rise; morning light.
- **EPFL → Alps:** campus walkway becomes a countryside path; buildings shrink;
  peaks take over.
- Every transition is a stretch of world the protagonist *runs through*.

---

## 12. UI / HUD

- Top-left: `← HOME` (global HUD) + `esc` hint. Always reachable.
- Bottom-right: `SCROLL / → TO CONTINUE` hint, shown only while useful.
- Bottom-center: milestone captions — small mono location label, editorial
  caption lines, note lines. Fade/slide, never modals.
- Progress dots (bottom, mobile-friendly hit areas) + Prev/Next controls.
- Final screen: `EXPLORE MY PROJECTS →` (links to `/projects`) and `← HOME`.

---

## 13. Interaction model

- **Desktop:** the story auto-plays; click/Space/Enter advances past a caption
  or a moment beat; Arrow keys and Home/End jump chapters; scroll does nothing
  (the world is camera-driven).
- **Mobile:** tap advances; swipe is ignored in favor of the cinematic
  autoplay (no getting stuck); dots are large enough for touch.
- The story never dead-ends: every pause has a continue path.

---

## 14. Mobile + weak devices

- World scale is viewport-derived by construction; captions and HUD re-flow.
- `simple` mode (small viewport / low-end heuristic): particle count cut,
  ambience gated, sky crossfade kept, character + milestones + story order
  preserved.
- No element exceeds GPU-safe bounds; DPR-independent (no canvas).

---

## 15. Reduced motion

`prefers-reduced-motion: reduce`:

- The auto-run is replaced with **chapter-to-chapter fades**; the character
  stands idle and milestones are reached by crossfade.
- Parallax, limb cycles, camera push-ins and pans are disabled; captions still
  sequence automatically on a timer.
- All narrative text, milestones and the final message are preserved.

---

## 16. Accessibility

- Story world mounts with a labelled region; caption updates are announced via
  `aria-live`.
- Keyboard: arrows / Home / End navigate, Space/Enter advance, ESC returns
  home (global).
- Progress dots are real buttons with `aria-current`.
- A hidden transcript of the journey is available for screen readers.
- Focus-visible rings follow the global design system.

---

## 17. Performance

- One rAF loop; all hot writes to refs; **no per-frame React state**.
- Layer budget: ~11 chapter backdrops + 1 path + 1 horizon + 1 grade overlay +
  sprite. Ambient particles gated by `simple`/reduced-motion.
- `visibilitychange` pauses the loop; `resize` recalculates scale S.
- Animations are CSS transforms (GPU); SVG static geometry is never re-rendered.

---

## 18. Implementation order (with commits)

1. World renderer + camera + sprite system
2. Childhood scene
3. Continuous traversal system
4. Morocco scene
5. Programming scene
6. High school scene
7. Graduation milestone
8. Airport + plane transition
9. Switzerland / EPFL scene
10. Alpine journey
11. Final mountain cinematic
12. Story UI / navigation
13. Mobile adaptation
14. Performance
15. Accessibility / reduced motion
16. Polish

---

## 19. Quality gate

- Does the character feel alive and is his running legible between chapters?
- Is his growth obvious without labels?
- Can each location be identified without reading text?
- Do transitions feel physical rather than digital?
- Is Morocco culturally meaningful, programming a discovery, graduation earned,
  the flight cinematic, EPFL a real chapter, the Alps emotionally satisfying,
  the final pose subtle?
- Can the visitor always return home?
- Does it work with reduced motion and on mobile?
- `npm run lint` and `npm run build` clean; e2e pass; no console/hydration
  errors; no horizontal page overflow.
