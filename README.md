# yasserameur.me

An interactive autobiography. Not a portfolio site with a hero section — a
continuous world you walk through, from a yard in Morocco to engineering at
EPFL, and onward.

The design is documented before it is built:

| Document | What it covers |
|----------|----------------|
| [docs/01-NARRATIVE.md](docs/01-NARRATIVE.md) | Chapters, environments, transitions, memory dives, recurring motifs, text policy |
| [docs/02-VISUAL.md](docs/02-VISUAL.md) | Art direction, palettes, atmospheric depth, the character rig, camera, lighting, typography, sound |
| [docs/03-TECHNICAL.md](docs/03-TECHNICAL.md) | Rendering, coordinate system, the frame loop, state, chapter virtualisation, performance, accessibility |

## The shape of it

Two layers, and that is the whole interaction model:

- **The Path** — one continuous horizontal world, 28,400 design units wide. He
  walks it. The camera follows. Roughly three minutes end to end, and a casual
  visitor understands the story without reading much of anything.
- **The Dives** — openings in the scenery you can step into. Different
  environment, different light, and — where relevant — the real engineering.
  Nothing in a Dive is required; everything in one rewards curiosity.

## Running it

```bash
npm run dev
```

`?motion=full` or `?motion=reduced` overrides the OS reduced-motion setting.
[`/journey`](app/journey/page.tsx) is the whole story as text — a real page, and
the accessibility contract for the experience.

## How it is built

Next.js 16 · React 19 · TypeScript · Tailwind v4 · static export.

Everything visual is authored in code. There are no sprite sheets, no image
assets, and no audio files — the world is SVG geometry recoloured per chapter,
one canvas for particles, and procedural WebAudio. That is not a constraint
worked around; it is what makes continuous character growth, per-chapter
relighting, and the Pattern Layer possible at all.

One `requestAnimationFrame` loop owns every per-frame update and writes to refs
and CSS custom properties, so travelling costs **zero React renders**.

```
app/          routes, fonts, global styles
engine/       clock, camera, input, store, director, audio, space
world/        palettes, depth, props, chapters, HUD
character/    the rig, expressions, the two figures
content/      repo-verified project facts
docs/         the three design documents
```

## Status

The vertical slice runs: `threshold → yard → room → school → stage → goodbye →
crossing → arrival`. The chapters after Lausanne — the Loop, the Rewiring, the
projects, the Alps, the present — are designed in
[docs/01-NARRATIVE.md](docs/01-NARRATIVE.md) and not yet built.

Every technical claim about the projects comes from
[`content/projects/index.ts`](content/projects/index.ts), which is grounded in
the actual repositories. No invented benchmarks.
