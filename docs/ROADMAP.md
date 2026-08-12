# Development Roadmap

Interactive, game-inspired portfolio for **Yasser Ameur** — a cinematic personal world built on Next.js, TypeScript, React, and Tailwind CSS.

The core product principle: the visitor enters an atmospheric, game-like representation of the creator's world, and explores a real engineering story through interactive experiences — not a generic portfolio template.

Progress is tracked in phases. Each phase is committed with a meaningful conventional commit.

---

## Phase 0 — Repository + Tooling ✅

- [x] Create GitHub repository `Yasser-Ameur/Portfolio` (public, `origin` remote)
- [x] Initialize git repo on branch `main`
- [x] Scaffold Next.js 16 + TypeScript + Tailwind CSS v4 + ESLint (App Router, no `src/`)
- [x] Install core dependencies: `motion`, `clsx`, `tailwind-merge`
- [x] Establish folder structure
- [x] Create `docs/ROADMAP.md`

## Phase 1 — Design System ✅

- [x] Define design tokens: color palette, spacing, radii, shadows, typography, easing, z-index
- [x] Install editorial display + body typefaces (next/font)
- [x] Global base styles: selection, focus rings, scrollbar, reduced-motion defaults
- [x] Core UI primitives (`cn` helper, base `Button`)
- [x] SEO metadata foundation

## Phase 2 — Home World ✅

- [x] Cinematic night-sky scene (procedural canvas: stars, parallax, moon, clouds)
- [x] Stargazing character (SVG silhouette, subtle idle motion)
- [x] Shooting stars and ambient particle layer
- [x] Title treatment
- [x] In-scene main menu (`MY STORY`, `PROJECTS`, `ABOUT`, `CONTACT`)
- [x] Menu hover lighting/interaction
- [x] Cinematic transition primitive
- [x] Vertical slice: home → one story environment → MiniGoogle world → home

## Phase 3 — Story World ✅

- [x] Side-scrolling story engine (canvas/scroll composition)
- [x] Character growth system (child → teenager → young adult)
- [x] Milestone 01 — Childhood (football, games, bedroom)
- [x] Milestone 02 — Morocco / Marrakech (travel transition, terracotta architecture)
- [x] Milestone 03 — Programming (desk, terminal, first code)
- [x] Milestone 04 — High school (valedictorian, quiet effort)
- [x] Milestone 05 — The airplane / Switzerland (cinematic transition)
- [x] Milestone 06 — EPFL (campus, engineering becomes serious)
- [x] Milestone 07 — Swiss mountains (closing scene, celebration)
- [x] Story → Projects bridge

## Phase 4 — Project World ✅

- [x] Project world shell + navigation (arrows, keyboard, swipe, momentum)
- [x] Project 01 — MiniGoogle (distributed search engine: node graph, architecture inspector)
- [x] Project 02 — NotiFly (notification delivery pipeline)
- [x] Project 03 — NEXUS (agent constellation / orchestration graph)
- [x] Project 04 — Pulse (event stream visualization)
- [x] Project 05 — FlowOS (central orchestration graph connecting the ecosystem)
- [x] Supporting projects: Deenii, API Management, ATLAS (StockFlow/ReCHor do not exist in the accounts — replaced with verified repos)
- [x] Project detail views (architecture, decisions, tech, results, GitHub)
- [x] Structured project content model (`content/projects`)
- [x] All technical claims verified against source repositories before publishing

## Phase 5 — Supporting Pages ✅

- [x] About experience
- [x] Resume page
- [x] Contact (email, LinkedIn, GitHub)

## Phase 6 — Responsive / Mobile

- [ ] Mobile story + projects preservation
- [ ] Touch gestures and simplified controls
- [ ] Low-end device graceful degradation
- [ ] Safe-area / viewport handling

## Phase 7 — Performance

- [ ] Route-level code splitting, lazy loading
- [ ] Image optimization and responsive variants
- [ ] Efficient canvas rendering (GPU-friendly, capped DPR)
- [ ] Bundle audit

## Phase 8 — Accessibility

- [ ] Keyboard navigation across worlds
- [ ] Visible focus states, skip navigation
- [ ] Screen-reader labels and live regions
- [ ] Reduced-motion parity (accessible fallback structure)

## Phase 9 — SEO ✅

- [x] Metadata, Open Graph, Twitter/X cards
- [x] Favicon set, canonical URL
- [x] Sitemap, robots, structured data
- [x] Deployment config for `yasserameur.me`

## Phase 10 — Final Polish

- [ ] Animation timing audit
- [ ] Typography / spacing / hierarchy pass
- [ ] Mobile + desktop QA
- [ ] Console-error sweep, broken-route sweep
- [ ] Final production build + route verification

---

## Verification checklist (run before each release)

- `npm run lint` clean
- `npm run build` clean
- Production server: `/`, `/story`, `/projects`, `/projects/minigoogle`, `/projects/notifly`, `/projects/nexus`, `/projects/pulse`, `/projects/flowos`, `/about`, `/resume`
- Desktop, tablet, mobile, keyboard, reduced-motion passes
- Home navigation reachable from every experience
- All GitHub links resolve
