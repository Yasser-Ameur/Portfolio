# ART DIRECTION

The canonical visual identity. If a scene contradicts this document, the scene
is wrong.

Method and enforcement live in `.claude/skills/art-direction/`. This document is
the *decisions*.

---

## 1. Identity in one line

> A quiet, sunlit memory of a place, rendered with the restraint of a good indie
> game and the light of a film still.

Kinship: the poster-like clarity of *Firewatch*, the emotional colour of *Gris*,
the staging of *Old Man's Journey*. Not their assets, not their characters — the
discipline.

## 2. Rendering style

**Painterly-flat.** Shapes stay confident and readable, but every surface is
*painted*, not filled:

- gradients on every surface, never a single flat colour
- soft light pools and haze via canvas blur
- grain and material noise at low amplitude
- soft real shadows, not hard geometric ones
- brush-stamped foliage and cloud rather than clean geometry

This is the specific reason the project moved from SVG to canvas textures on a
GPU scene graph: flat vector could not produce texture, and texture is what
separates *authored* from *generated*.

## 3. Perspective

Orthographic, side-on, ground line at y = 700 of a 1600 × 900 design space.

The world is a **stage seen from the side**, not a diorama seen at an angle.
Depth comes from layered planes and atmosphere, never from receding floor
grids.

Perspective is unlocked for exactly two things: entering a memory, and the
final chapters where the world becomes abstract.

## 4. Palette philosophy

One palette per chapter. One saturated accent per chapter. Everything else is a
value of that palette. Distance is computed by mixing toward the sky/haze colour
in OKLab.

Full system: `COLOR_BIBLE.md`.

## 5. Texture

Every surface carries at least a gradient and a value break. Additionally:

| Surface | Treatment |
|---|---|
| Plaster / render | mottled patches, damp at the base, chipped edges |
| Ground | worn tracks, scattered aggregate, a lit lip at the horizon |
| Water | horizontal specular breaks, a sun track |
| Foliage | many low-alpha stamps, never one shape |
| Glass | vertical gradient, one bright reflection edge |
| Fabric | folds as soft-edged darker strokes |

## 6. Lighting

- **One key per chapter**, named and directional. All shadows obey it.
- **Rim light on characters**, coloured by the chapter's temperature. It is what
  ties a figure to a place.
- **Contact shadow under everything** that touches the ground.
- **Emissives bloom** — TV, monitor, streetlamps, stage lights. This is what
  makes the rectangle-of-light motif actually glow.
- **Volumetric shafts only where motivated** — a doorway, a window, sun through
  conifers. Never a lens flare.

## 7. Environmental composition

Minimum five depth planes. A foreground plane is mandatory. Details are
specific to this person's life or they are cut — old consoles, notebooks,
football, basketball hoop, EPFL details, train tickets, hiking gear.

Density with purpose: clutter and emptiness are both failures.

## 8. UI philosophy

Almost none. No nav bar over the world, no modals, no tooltips, no "click to
continue" button, no tutorial overlay.

What exists: a caption that fades, a 1-unit progress hairline, a sound toggle.
Type is placed *in the world* — on a wall, a sign, a screen, a photograph —
wherever it can be.

Two typefaces: **Instrument Serif** for the four or five caption lines,
**JetBrains Mono** for everything diegetic. Nothing animates letter by letter.

## 9. Explicitly forbidden

Generic portfolio layouts · SaaS aesthetics · glassmorphism · unmotivated
gradients · giant SVG mascots · empty scenes with a character in a void ·
generic stock 3D · animation for its own sake · inconsistent asset styles ·
lens flares · neon-on-dark hacker aesthetic · centred hero with three cards ·
skill grids · endless cards · dashboard aesthetics · motivational quotes ·
anything that reads as AI-generated artwork.

## 10. Acceptance

No significant visual work is accepted until it has been critiqued from a
screenshot of the real running page by the `visual-qa` skill, run separately
from whatever produced it.
