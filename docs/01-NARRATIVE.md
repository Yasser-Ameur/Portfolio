# A — Narrative Architecture

The life of **Yasser Ameur**, mapped onto a world you walk through.

---

## 0. The one-sentence shape

> A boy in Morocco wants to make games, learns that making things means
> understanding them, leaves everything familiar, loses his way for a while,
> rebuilds how he thinks, and walks out into a landscape that keeps getting
> larger.

Everything below serves that sentence. Nothing that doesn't, gets built.

---

## 1. Two-layer structure

The experience has exactly two layers. This is the whole interaction model.

### The Path (the spine)

One continuous, horizontal world. The character physically walks it, left to
right, from before he could program to now. There are no page loads, no scene
menus, no "chapter select" as the primary interface. The camera follows him.
The world is `28,400` design units wide — about 18 screens.

Traversing the Path start-to-finish without stopping takes **≈3 minutes**. That
is the casual visit: a normal person understands the story in one uninterrupted
walk, reading almost nothing.

### The Dives (the depth)

At certain points the world contains an **opening** — a lit doorway, a screen
you can step into, a trailhead, a gap between two rocks. It is part of the
scenery, not a UI affordance. Entering it does not open a modal: the camera
travels *into* it, the world's rendering language changes, and you are somewhere
else that belongs to that memory.

Inside a Dive: different environment, different light, different sound, one or
two things to touch, and — where relevant — the real engineering. You leave the
way you came and rejoin the Path exactly where you left it.

A curious engineer who opens every Dive spends **20+ minutes**. Nothing in a
Dive is required to understand the story. Everything in a Dive rewards having
been curious. That asymmetry is the point.

---

## 2. Chapters

World coordinates are design units (see doc C). Ground line `y = 700`.

| #  | id          | Chapter                     | World span      | Beat                                | Dive |
|----|-------------|-----------------------------|-----------------|-------------------------------------|------|
| 00 | `threshold` | Before                      | −600 … 0        | invitation                          | —    |
| 01 | `yard`      | The Yard — Morocco          | 0 … 2,600       | curiosity, play                     | **The Room** |
| 02 | `room`      | The Machine — first code    | 2,600 … 5,000   | discovery                           | **The Screen** |
| 03 | `school`    | The Climb — school years    | 5,000 … 7,200   | quiet accumulation                  | The Notebook |
| 04 | `stage`     | The Stage — graduation      | 7,200 … 9,000   | pride, and her                      | The Photograph |
| 05 | `goodbye`   | Leaving Morocco             | 9,000 … 10,800  | departure                           | — (never) |
| 06 | `crossing`  | The Crossing                | 10,800 … 12,000 | suspension                          | — |
| 07 | `arrival`   | Lausanne — EPFL             | 12,000 … 14,400 | scale, unfamiliarity                | The Campus |
| 08 | `loop`      | The Loop                    | 14,400 … 16,000 | stagnation                          | — (you're in it) |
| 09 | `rewiring`  | The Rewiring                | 16,000 … 17,600 | seeing differently                  | — (it changes everything) |
| 10 | `depths`    | Beneath the Abstraction     | 17,600 … 20,000 | understanding                       | The Machine Room |
| 11 | `systems`   | The Things I Built          | 20,000 … 22,400 | building                            | **Project worlds** |
| 12 | `trail`     | The Opening                 | 22,400 … 25,000 | exploration, people                 | The Trail |
| 13 | `summit`    | Now                         | 25,000 … 26,800 | grounded, unfinished                | — |
| 14 | `beyond`    | Unexplored                  | 26,800 … 28,400 | open                                | — |

**Vertical slice (built first):** `threshold`, `yard`, `room`, `stage`,
`goodbye`, and the opening of `crossing`/`arrival`. Chapter `school` is
compressed into a transition within the slice so graduation is earned rather
than arriving from nowhere.

---

## 3. The chapters in detail

### 01 · The Yard — Morocco

Late afternoon, warm ochre light, the hour before you get called inside. A
low-walled yard off a residential street. Bougainvillea over a wall. A football.
A basketball hoop on a pole, slightly bent. Sandals by a step. The house on the
right with a doorway that is genuinely open.

He is small. The world is not big yet — the far layer is close, the sky is a
narrow band. Familiarity is rendered as *proximity*.

**Beat (x≈1,200):** the football is interactive. Kick it and it rolls ahead;
he chases it. Nobody is instructed to do this. If you never touch it, he passes
it and glances at it.

**Beat (x≈2,100):** through the house window, a television is on. The light from
it is the only cool-coloured thing in the chapter. He stops. He looks. That
glow is the first appearance of **the rectangle of light** — the motif that
carries the entire story.

**Dive — The Room.** Through the doorway. Interior, warm, small. A CRT, a
controller, a carpet with a geometric pattern, homework on a low table. You can
turn the console on and play something extremely small for ten seconds. **His
mother is here**, in the next room, not looking at you — moving, doing
something ordinary. The light she is under is the same warm colour as the rest
of the chapter. She is not introduced. She is simply where the warmth comes from.

**Text:** `Morocco` · `2010`

---

### 02 · The Machine — first code

Dusk drains the gold out. The street cools to blue. Streetlamps come on one at
a time as he passes them — the first time the world reacts to his movement.

The path leads through the same doorway, but now it is night and the house is
quiet. His room. A desk. A computer that is clearly not new.

**Beat (x≈3,900):** he sits. The monitor wakes. On the screen, code — and then
the code *becomes a thing that moves*. A shape he made. He leans back. That is
the discovery: the machine stopped being something he used.

The wanting-to-make-games origin lives here, in objects, not sentences: a
sketch of a level on graph paper, a Unity project folder, a Roblox window
behind the editor, a notebook of ideas with more ideas than finished things.

**The mother, unstated:** the hallway light behind him is on. It stays on the
whole time he is working. It is the last thing to go out. Nobody mentions it.

**Dive — The Screen.** You step into the monitor. Inside is a small, real,
playable fragment — the actual first thing worth making: a shape you control.
The walls of this Dive are made of the editor. Going deeper reveals the
progression web → Unity → Roblox → and on, as environments rather than a list.

**Text:** `The first thing I wanted to make was a game.`

---

### 03 · The Climb — school years

Compressed in the slice. Morning. A school wall, a corridor, a courtyard.
Repetition rendered as *rhythm*, not stagnation: the same window repeating with
the light changing across it — years passing in fifteen seconds of walking.

He gets taller here. **Glasses appear** (7th–8th grade) — not announced, they
are simply on his face after a corridor. Books accumulate in his arms and on the
world's ledges.

**Text:** none. This chapter earns its meaning by being short and unglamorous.

---

### 04 · The Stage — graduation

The chapter opens up: higher ceiling, warmer key light, more depth planes than
anything before it. A hall. Rows of chairs. A stage. Flags. Other students as
soft silhouettes.

**Beat (x≈8,100):** he walks up. He receives the thing. The moment is real and
he is proud of it.

**And then the camera leaves him.** At the peak of his own scene, the camera
pushes *past* the stage into the audience and finds **his mother**. She is the
only figure rendered in full detail in the entire hall. She is not clapping.
She is just looking at him. Hold for four seconds. Then back.

This is the emotional centre of the first half, and it contains no text and no
music swell. The camera choosing her over him *is* the statement.

**Dive — The Photograph.** A photograph on a table by the exit. Entering it
goes to the still moment: the two of them, the hall behind. Nothing happens
inside. You can stay as long as you like.

**Text:** `Valedictorian.` — small, mono, low contrast, off to one side. Stated
plainly and once, because it is a fact and not a boast.

---

### 05 · Leaving Morocco

The strongest scene in the experience. It must contain no dialogue, no music
cue, and no slow motion.

Evening. A road out of the neighbourhood toward the airport. He is carrying one
suitcase. **She is walking beside him.** They walk together for a long time —
almost 900 units, an unusually long stretch with nothing happening. Just two
figures walking, and the neighbourhood ending.

**Beat (x≈9,900):** the path reaches a point where it narrows. **She stops.**
He keeps walking.

The camera does not cut and does not fade. It keeps following him, which means
she slides backward out of frame **on her own** — the way people actually
disappear when you leave. If the visitor holds the *back* key, the camera pans
back and she is still standing there, smaller. She stays as long as you look.
The moment you go forward, she is gone.

There is no goodbye animation. He does not turn around.

**No Dive here.** You cannot re-enter this. That is deliberate.

**Text:** `2022` · and nothing else.

**Afterwards, once:** much later, at night in Switzerland, exactly one window in
one building is lit in the warm ochre of the Morocco palette — a colour that
does not otherwise exist in that half of the world. It is never explained, never
labelled, and never repeated.

---

### 06 · The Crossing

Suspension. Altitude. The world's only vertical movement — the ground drops
away, and for ninety seconds there is no ground at all, just cloud layers moving
at different speeds and a very wide sky.

The character is small, seated, framed by a window. This is the only chapter
where he isn't walking.

---

### 07 · Lausanne — EPFL

Cold morning light. The palette inverts: greys, cool blues, white, the green of
conifers, the specific blue of a lake. **Everything is bigger.** The far layer
retreats — the sky band that was narrow in Morocco is now half the frame.
Mountains sit behind everything.

Concrete and glass geometry. Students as silhouettes moving at different speeds
than he does — the first time the world contains people who are not there for
him. Bicycles. A lecture hall seen through glass. Notation begins appearing in
the environment: a curve on a whiteboard behind a window, a diagram taped to a
wall. Present, but quiet — the environment is not a hacker aesthetic, it is a
beautiful cold campus that happens to have mathematics in it.

**Dive — The Campus.** Lecture hall, laptop on a café table, the specific
exhaustion and specific excitement of the first year.

**Text:** `EPFL` · `Lausanne`

---

### 08 · The Loop

The world stops giving.

He walks. The parallax **stops** — background layers hold still while he moves,
so he is visibly not getting anywhere. The same 400-unit segment of dorm room
re-enters from the right. The day/night gradient cycles faster and faster:
afternoon, night, afternoon, night. Tasks on the desk do not decrease. A game
client is open in the corner of the screen, and the score in it goes up.

He is animated the whole time — the walk cycle is fine. That's what makes it
uncomfortable. Effort without displacement.

**Escape:** pressing forward does nothing after the second loop. The world only
releases when the visitor **stops**, or turns back, or closes the window in the
scene. If they do nothing for ~12 seconds a faint prompt appears, and after
three loops it releases on its own — nobody gets stuck.

Making the visitor *break* the loop rather than watch it break is the whole
design. It costs them something small, which is the point.

**Not a shame sequence.** No dark palette shift, no rain, no sad piano. The room
is the same neutral colour it was. It's just that nothing is changing.

**Text:** none. Text would explain it, and explaining it would ruin it.

---

### 09 · The Rewiring — *the hinge*

He steps out of the loop and the world looks the same. Then a second render
pass switches on.

**The Pattern Layer.** Geometry that was *already in the world* gains structure:
the zellige tiling on a Moroccan wall resolves into its generating symmetry; the
hexagon-and-pentagon net on the football becomes a graph; the tree branches
resolve into a binary tree; the crowd at graduation becomes an ordered array;
lake ripples become a waveform; the mountain ridge becomes a plot.

Nothing new is added to the world. The same shapes get vertices, connective
lines, faint annotation. It is a lens, not a decoration.

**And it stays on.** From here to the end of the journey, the Pattern Layer is
part of how the world renders.

**The mechanic that carries the meaning:** the visitor can **walk back**. Every
earlier chapter now renders with the Pattern Layer on. The childhood yard is
full of structure that was in the geometry the entire time and was not visible
before. The patterns were always there — he just started seeing them.

That is section 8 of the brief, expressed as a game mechanic and not a sentence.
It is also the reason this whole thing is worth building.

**Text:** none, ever, about patterns.

---

### 10 · Beneath the Abstraction

Second year. The world gains a *cross-section*. The path stays where it is, but
now you can see beneath it: below the ground line, strata — a memory layout, a
call stack, a register file, gates. He walks on the surface; the machinery is
under his feet and is drawn with the same care as the sky.

The shift the brief asks for — "I want to build things" → "I want to understand
how things work" — is: **the world becomes transparent.**

Functional programming as the visual counterweight: on the surface, structures
that transform rather than mutate — a shape passes through and comes out
changed, the original still intact behind it.

**Dive — The Machine Room.**

---

### 11 · The Things I Built

Each project is a **world you enter**, not a card. The Path passes a set of
openings; each leads to a real environment expressing that system's actual
architecture, with real depth available for people who want it.

- **MiniGoogle** → an enormous archive. Shelves to the horizon. A query enters
  and you *follow it*: routing, shards, retrieval, ranking. Go deeper: Raft
  leader election, replicated state, consistent hashing, the posting lists.
- **NotiFly** → a delivery pipeline as a physical sorting facility.
- **NEXUS** → autonomous agents as entities that move, communicate, investigate.
- **Pulse / FlowOS** → the event stream and the orchestration layer.

Every technical claim comes from `content/projects/index.ts`, which is grounded
in the real repositories. **Nothing is invented — no fabricated benchmarks, no
made-up metrics.** Planned work stays labelled as planned.

This is also the layer a recruiter reads. It must be legible in 30 seconds and
deep for 20 minutes.

---

### 12 · The Opening

The largest visual transformation in the entire experience.

The ceiling comes off. Where every previous chapter had a horizon within a few
hundred units, here the far layer is **kilometres away**. Peaks, snowline,
valley, a lake with real specular light, conifers, a trail switchbacking up.
Weather becomes real: mist moves through the valley, light changes with
altitude.

He is *small* here for the first time — and it reads as freedom rather than
insignificance, because he's moving fast and the camera is loose.

**Other figures appear beside him.** Not silhouettes in the background —
walking with him, at his pace. Sometimes they're there, sometimes he's alone,
and both are fine. Social growth is rendered as *company on the trail*, not as a
statistic.

Train windows. A backpack. Boots that are actually worn. A camera.

**Dive — The Trail.**

---

### 13 · Now

A ridge. He stops because there is a view, not because the level ends.

The camera pulls back and up — further than it has pulled at any point — until
he is a small figure on a large ridge. Everything he walked through is,
implicitly, behind him.

**Text:** the only reflective line in the whole experience, and it is small:
`This is how far I've come.`

Then the camera keeps going, and the second half of the line is not on the
screen — it's in the fact that the path continues.

---

### 14 · Unexplored

From the ridge, the trail **forks into many trails**. They run off toward
mountains, a city, a forest, and one that simply goes up into a sky that is
becoming abstract — geometry, systems, unlit constellations.

A few are faintly annotated: `graphics`, `systems`, `robotics`, `ai`. Most are
not annotated at all, which matters more than the ones that are.

**He does not take one.** The character stands at the fork. The journey does not
resolve. There is no "thanks for visiting", no final CTA overlay, no confetti.

Navigation to the practical things (projects, contact, résumé) exists as part of
the world at this point — signposts on the paths — not as a chrome bar.

---

## 4. Recurring motifs

Six things recur. They are the connective tissue; each one changes meaning
across the journey.

**1 · The rectangle of light.**
TV through a window → monitor → laptop → lecture screen → train window → the
view from the ridge. It begins as something he *watches*, becomes something he
*makes things in*, and ends as something he *looks through*. Every chapter
contains exactly one.

**2 · Light temperature.**
The emotional state is never written; it is the colour temperature. Moroccan
gold (2700K feel) → interior lamp → cold campus daylight (7000K) → the grey
neutrality of the Loop → clear alpine light. Warmth = home, cold = unfamiliar,
neutral = stalled.

**3 · The path itself.**
Its width and surface carry the arc. Dirt and tile, narrow → corridor →
*the same 400 units, repeating* → open trail → **many trails**. In the Loop it
has no end. At the summit it has too many.

**4 · Patterns.**
Invisible until chapter 09, then permanently visible — and retroactively
visible in every earlier chapter. See §09.

**5 · Her.**
Warmth and proximity. Near (childhood interior) → present but not looked at
(school) → looked *at* by the camera (graduation) → beside him, then behind him
(departure) → one lit window, once (Switzerland). Then never again. She is used
five times in a three-minute experience, which is why she lands.

**6 · Scale.**
His height in frame, inverted against the world's. He is largest in the smallest
room and smallest on the largest ridge. Growth is not him getting bigger — it's
the world getting bigger faster than he does.

---

## 5. Transitions

Every chapter boundary is *travelled*, never cut. No fades to black except one.

| From → To            | How                                                                 |
|----------------------|---------------------------------------------------------------------|
| yard → room          | Daylight drains as he walks; streetlamps ignite in sequence at his approach |
| room → school        | The bedroom wall recedes into a corridor wall; the window's light becomes morning |
| school → stage       | The corridor widens; ceiling lifts; depth planes multiply             |
| stage → goodbye      | Warm hall light leaks out into an evening street; the crowd thins to two |
| goodbye → crossing   | **The only fade.** Ground drops away — earned, because it's the one real break |
| crossing → arrival   | Cloud layers part downward; the ground returns cold                   |
| arrival → loop       | The campus recedes to one room; parallax slows and then stops         |
| loop → rewiring      | The visitor breaks it; the release is a single held frame, then structure |
| rewiring → depths    | The ground becomes transparent                                        |
| depths → systems     | The strata below resolve into architectures you can enter             |
| systems → trail      | Buildings shrink; the far plane retreats; the ceiling comes off        |
| trail → summit       | Ascent. The camera rises with him                                     |
| summit → beyond      | The path divides                                                      |

---

## 6. Text policy

Total word count on the Path, start to finish: **under 120 words.**

Rules:
1. Text is **diegetic wherever possible** — a year on a wall, a station sign, a
   whiteboard, a terminal, a caption on a photograph.
2. A line appears at most once per chapter, and several chapters have none.
3. No sentence explains an emotion the visuals already carry. If a line can be
   deleted and the scene still lands, it gets deleted.
4. No quotes. No aphorisms. No "passionate engineer". No "journey" as a noun.
5. Facts are stated flatly and once. `Valedictorian.` — not
   "achieved the distinction of…".
6. Deep technical text lives **only inside Dives**, where it can be long,
   precise, and as detailed as it needs to be.

---

## 7. Emotional arc against world position

```
curiosity ─── play ─── learning ─── achievement ─── departure
   0        1200      3900         8100            9900
                                                     │
   ┌─────────────────────────────────────────────────┘
   │
independence ─── distraction ─── self-awareness ─── rewiring
  13200            15200            16400            16800
   │
   ├── discipline ─── technical depth ─── friendship ─── exploration
   │     17600           18800              23000         23700
   │
   └── self-discovery ─── momentum ─── potential ─── unfinished
          24200            25100        25900        26800+
```

His gait tracks this: **calm walk** through Morocco, **slower** in the corridor
years, **stalled** in the Loop, and from the Rewiring onward he moves faster
than the camera expects, until in `trail` he is running and the camera has to
catch up. He never stops moving again after chapter 09. That is momentum,
rendered.

---

## 8. What this is not

- Not a timeline with animations.
- Not a résumé with a character sprite walking across it.
- Not an interactive infographic.
- Not a game. There is no score, no fail state, no inventory. The only
  "mechanic" is walking, looking, and choosing whether to go deeper.
- Not an inspirational website. There is exactly one reflective sentence in the
  entire experience, it is nine words long, and it is not in a large typeface.
