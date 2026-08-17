# WORLD BIBLE

Geography, chapter environments, motifs, transitions and memory objects.

Narrative structure and emotional arc: `01-NARRATIVE.md`.

---

## 1. Structure

One continuous horizontal world, **28,400 design units** wide. Ground line at
y = 700 of a 1600 × 900 design space. The camera follows him. There are no page
loads and no scene menu.

Two layers, and that is the whole interaction model:

- **The Path** — the spine. ~3 minutes end to end. A casual visitor understands
  the story in one uninterrupted walk, reading almost nothing.
- **The Dives** — openings *in the scenery*, not UI affordances. Light spills
  out of them, so you understand them as places. 20+ minutes for anyone curious.

## 2. Geography

| # | id | Chapter | Span | Surface | Dive |
|---|---|---|---|---|---|
| 00 | `threshold` | Before | −600 … 0 | dirt | — |
| 01 | `yard` | The Yard — Morocco | 0 … 2,600 | dirt | **The Room** |
| 02 | `room` | The Machine — first code | 2,600 … 5,000 | carpet | **The Screen** |
| 03 | `school` | The Climb | 5,000 … 7,200 | corridor | The Notebook |
| 04 | `stage` | Graduation | 7,200 … 9,000 | corridor | The Photograph |
| 05 | `goodbye` | Leaving Morocco | 9,000 … 10,800 | asphalt | — (never) |
| 06 | `crossing` | The Crossing | 10,800 … 12,000 | none | — |
| 07 | `arrival` | Lausanne — EPFL | 12,000 … 14,400 | tile | The Campus |
| 08 | `loop` | The Loop | 14,400 … 16,000 | carpet | — (you're in it) |
| 09 | `rewiring` | The Rewiring | 16,000 … 17,600 | — | — |
| 10 | `depths` | Beneath the Abstraction | 17,600 … 20,000 | — | The Machine Room |
| 11 | `systems` | The Things I Built | 20,000 … 22,400 | — | **Project worlds** |
| 12 | `trail` | The Opening | 22,400 … 25,000 | gravel | The Trail |
| 13 | `summit` | Now | 25,000 … 26,800 | rock | — |
| 14 | `beyond` | Unexplored | 26,800 … 28,400 | — | — |

## 3. Environments — what is actually in them

**yard** — Late afternoon, sun low and right, so every shadow is long and leans
left. Low ochre boundary wall with bougainvillea over it and a gate gap.
Football, kicked-off sandals, a bent basketball hoop, a bicycle. The house on the
right with an open doorway and an arched window with a television on inside.
Neighbourhood rooftops with shuttered windows, satellite dishes, laundry lines, a
water tower. Date palms. Distant city and a strip of sea. Overhanging branch
framing the top corner.

**room** — Dusk street, streetlamps igniting in sequence as he passes. Then the
interior: desk, an old monitor, keyboard, a mug that has been there a while,
graph paper with a level sketched on it, a bookshelf with more notebooks than
finished things, a bed made carelessly, a window onto the blue evening he is no
longer looking at. **The hallway door is ajar and its light stays on.**

**school** — One corridor bay module repeated nine times, with the light across
the window changing every bay: six years as architecture. Lockers, noticeboards,
a courtyard, benches with books left on them.

**stage** — Coffered ceiling, tall windows down the far wall, pilasters, warm
ceiling fixtures throwing pools on the floor. Aisle runner, seated rows, a
raised stage with proscenium, pleated curtain, banner, lectern, flags, flower
arrangements. A photograph on a table by the entrance.

**goodbye** — Evening road out of the neighbourhood. Last houses, one window
still warm. Streetlamps. A point where the road closes and only a footpath
continues. A sign to the airport. Dust at the roadside.

**crossing** — No ground. Four cloud layers at different speeds, sun glare, very
wide sky.

**arrival** — Cold morning. The left half deliberately open: parapet, bench
facing the lake, conifers, lake with specular breaks, Alps behind everything.
The campus on the right: concrete frame, glass infill, whiteboard behind glass,
bicycle rack, students moving at their own speeds. One warm window.

Chapters 08–14 are specified in `01-NARRATIVE.md` and built after the slice.

## 4. Recurring motifs

Six. Each must **change meaning** across the story or it is repetition.

1. **The rectangle of light** — TV → monitor → laptop → lecture screen → train
   window → the view from a ridge. Watched, then made in, then looked through.
   Exactly one per chapter.
2. **Light temperature** — the emotional state, never written. `COLOR_BIBLE.md`.
3. **The path** — width, surface, direction. Narrow → corridor → *the same 400
   units repeating* → open trail → many trails.
4. **Patterns** — invisible until chapter 09, then permanently on, including
   retroactively in every earlier chapter if the visitor walks back.
5. **Her** — five appearances, then never again.
6. **Scale** — his height in frame, inverted against the world's.

## 5. The Pattern Layer

A second render pass, off until `rewiring`, permanently on afterwards.

Authored geometry carries an optional descriptor — `lattice`, `graph`, `tree`,
`array`, `wave`, `plot`, `grid` — and when the pass is on it draws hairline
structure **derived from the shape already there**: vertices at its points,
connective lines along its symmetry, faint annotation at its measures.

Rules: hairline weight, accent colour at 0.25–0.4 alpha, never filled; fades in
with a spatial sweep over ~500 ms; **never adds an object that was not already
in the scene**; denser near him, thinner with distance.

The zellige on a Moroccan wall was always a symmetry group. The football was
always a graph. He just started seeing it.

## 6. Transitions

Every boundary is travelled. One fade in the entire experience.

| From → To | How |
|---|---|
| yard → room | daylight drains; streetlamps ignite at his approach |
| room → school | bedroom wall recedes into corridor wall; window light becomes morning |
| school → stage | corridor widens; ceiling lifts; depth planes multiply |
| stage → goodbye | hall light leaks into an evening street; the crowd thins to two |
| goodbye → crossing | **the only fade** — the ground drops away |
| crossing → arrival | cloud parts downward; the ground returns cold |
| arrival → loop | campus recedes to one room; parallax slows, then stops |
| loop → rewiring | the visitor breaks it; one held frame; then structure |
| rewiring → depths | the ground becomes transparent |
| depths → systems | the strata below resolve into architectures you can enter |
| systems → trail | buildings shrink; the ceiling comes off |
| trail → summit | ascent; the camera rises with him |
| summit → beyond | the path divides |

## 7. Memory objects

The object that carries each chapter:

| Chapter | Object |
|---|---|
| yard | the football, and the window with the television on |
| room | the monitor, and the hallway light behind him |
| school | one window, repeated |
| stage | the photograph by the exit |
| goodbye | the suitcase, and the point where the road closes |
| arrival | one warm window |
| loop | a task list that never gets shorter |
| trail | worn boots |
| summit | a fork with too many paths |

If a chapter has no object, it is not designed yet.
