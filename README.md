# Yasser Ameur — Portfolio

An interactive, game-inspired personal website for [yasserameur.me](https://yasserameur.me).

This is not a typical developer portfolio. Visitors enter a cinematic, atmospheric
representation of a personal world — a night landscape under stars — and explore a
story and an engineering body of work through interactive experiences: a
side-scrolling life story, a project world made of living systems, and quiet
editorial spaces for about, resume, and contact.

## Concept

- **Home world** — a title screen that behaves like the opening of a small indie
  game: night sky, stars, parallax, a character seen from behind, stargazing.
  The main menu lives inside the scene, not on top of it.
- **Story world** — a continuous left-to-right journey through a life. The
  character visibly grows from child to young adult across cinematic milestones:
  childhood, Marrakech, discovering programming, high school, the flight to
  Switzerland, EPFL, and the Swiss mountains.
- **Project world** — projects presented as connected systems rather than a grid.
  Each flagship project gets its own visual metaphor (a distributed node graph, a
  delivery pipeline, an agent constellation, an event stream, an orchestration
  graph) plus a detail view for the technically curious.

## Design philosophy

- Cinematic, atmospheric, nostalgic, sophisticated, game-like.
- Restrained palette: deep night tones, warm starlight, a single amber accent.
  The environment carries the richness; the UI stays quiet.
- Motion has hierarchy: the world breathes slowly, interactions respond quickly,
  and scene transitions are deliberate.
- Progressive disclosure: hover reveals, environmental clues, and detail views —
  but navigation is never hidden.
- Accessibility and performance are not optional layers: reduced motion, keyboard
  navigation, mobile support, and graceful fallbacks are first-class.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript)
- **Tailwind CSS v4** with a custom design-token system
- **Motion** (Framer Motion) for interface transitions
- **Canvas** for the procedural world layers (stars, parallax, particles)
- **SVG** for the character, props, and system diagrams

## Architecture

```
app/               routes, root layout, global metadata
  page.tsx         home world
  story/           story world
  projects/        project world + detail routes
  about/           about
  resume/          resume

components/
  home/            title scene, menu
  story/           story engine + milestone scenes
  projects/        project world + per-project visualizers
  navigation/      HUD, escape-hatch home control
  ui/              generic UI primitives (Button, …)
  world/           shared world/rendering primitives
  effects/         particles, transitions, starfield

content/
  projects/        structured project data

lib/
  utils.ts         cn() helper
  animation/       shared easing / motion primitives

styles/            token reference, non-Tailwind CSS
docs/ROADMAP.md    phased development plan
```

## Content model

Projects and story milestones live in structured data, not deep inside React
components. Each project declares a slug, name, tagline, description,
technologies, GitHub URL, featured status, and a `worldType` that selects its
visualizer. Adding a project means adding data plus (optionally) a world
renderer — the shell stays untouched.

## Asset strategy

All artwork is original: procedural canvas, custom SVG silhouettes, and CSS.
No copyrighted game assets, no random downloaded imagery. Placeholder scenes are
generated programmatically.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
npm run start
```

## Deployment

Production target: **yasserameur.me**. The app is a standard static-capable
Next.js build — any Next.js host (Vercel, Netlify, a container on a VPS) works.
SEO metadata, canonical URL, sitemap, robots, and structured data are configured
in the app.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for the phased plan and current status.

---

© Yasser Ameur
