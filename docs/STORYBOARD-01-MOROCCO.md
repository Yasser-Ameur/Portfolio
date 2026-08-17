# STORYBOARD 01 — MOROCCO

The first sequence. ~3½ minutes of scroll. The place where the bar moves from
*working* to *exceptional*.

Authored against `docs/CASABLANCA_REFERENCE.md`, sampled by
`engine/timeline.ts`. Every value below is a **pure function of scroll
progress** — nothing here is triggered.

---

## 0. The shape

```
home  →  world  →  friends  →  play  →  the world is bigger than I thought
      →  home again  →  the computer
```

**The sequence returns home.** Going out and coming back closes the loop, and it
means the last thing you see is not the spectacle but the computer — the seed of
everything after. Ending on the reveal would be a better screenshot and a worse
story.

### Rhythm

Deliberately breathing, never continuously animated:

```
expansion → stillness → movement → play → movement → EXPANSION → STILLNESS → return → stillness
   01-03      04-05      06-08     09-11    12          13          14        15      16-17
```

### Text budget: 22 words, total

Three lines and one chapter label for three and a half minutes.

---

## 1. Before the scroll — the threshold

Not part of the timeline. A gate, held still.

| Stage | Treatment |
|---|---|
| **Loader** | A single figure `00` → `100` in mono, bottom-left. Nothing else. No bar, no logo animation, no spinner. |
| **Title** | The first frame of the world, already composed and already breathing (haze drifting, one shutter swinging). Over it: `Yasser Ameur` in Instrument Serif, and beneath it, very small, `an interactive autobiography`. |
| **Start** | `SCROLL TO BEGIN` — mono, letterspaced, low contrast, bottom-centre. It fades on first scroll and never returns. |
| **Persistent chrome** | A sound toggle, top-right. **That is the only UI in the entire experience.** |

The first frame must make you want to scroll without telling you to. It shows a
warm-lit window three floors up, a dark street below, and nothing else
explained.

---

## 2. The storyboard

Scroll ranges are absolute progress in `[0,1]`. `INT` marks beats where control
is handed to the visitor.

| # | Beat | Scroll | Camera | Character | Environment | Text | Sound |
|---|---|---|---|---|---|---|---|
| 01 | **First light** | .000–.050 | Locked. Frustum 5.0 — tight. | Absent | Near-black. One warm rectangle, high in frame. | — | Room tone only. Almost silence. |
| 02 | **The building** | .050–.110 | Pull back, descend slightly. Frustum 5→11. | Absent | The rectangle resolves: a window, **third floor**, of an apartment block. Neighbours fade up around it. | — | Distant traffic enters, very low. |
| 03 | **Casablanca** | .110–.175 | Continue back and down to street level. Frustum 11→16, then settle to 9. | Absent | The street assembles: asphalt, parked cars, wires, shopfronts. Late-afternoon light arrives across the façades. | `Casablanca` (mono, tiny, fades by .16) · chapter label appears | Street bed in full: traffic, distant voices, a ball somewhere. |
| 04 | **The room** | .175–.250 | Push *through* the window. Frustum 9→3.4. | Boy, seated, front-ish. `happiness` 0.5. | Interior: rug, sofa, CRT glow, framed photographs, balcony door. | — | Street ducks under. Room tone, TV, a kettle. |
| 05 | **The glance** ★ | .250–.285 | **Held. Zero movement.** | He plays, absorbed. | Mother in the armchair behind him, doing something ordinary. She stops. Looks at him. Small smile. Returns to it. | — | TV only. The street is gone. |
| 06 | **Out** | .285–.330 | Follow, rising slightly. Frustum 3.4→5. | Stands, turns, walks to the door. `neutral`. | The room from a new angle; the hallway beyond. | — | Controller down. Door. |
| 07 | **The stairwell** | .330–.400 | **Descends with him**, three landings, vertical parallax. | Walking down. Turning at each half-landing. | Green wainscot, terrazzo, a window throwing light across each landing. | — | Footsteps echo. Reverb tightens then opens. |
| 08 | **The street** | .400–.470 | Pull back to low 3/4 as the door opens. Frustum 5→8.5. | Steps out. Pauses. `curiosity` 0.6. | The entrance door swings; light floods in and **wipes the frame** from dark stairwell to bright street. | — | Sudden full street bed. The loudest moment so far. |
| 09 | **Friends** | .470–.535 | **Leads him** — moves ahead down the street, so you see them before he does. | Walk → slight run. `happiness`. | Kids already playing, mid-street. One kicks; the ball rolls to him. He traps it. | — | Voices, ball impacts, a passing car. |
| 10 | **Street football** `INT` | .535–.615 | Pulls back and **holds**. Frustum 8.5→11. | Released to the visitor. | Two rocks. Then two more. Parked cars either side. **The street becomes the pitch.** | *"Before I knew what I wanted to make, I knew what I loved to play."* (.56–.60) | Ball, shouts, traffic behind. |
| 11 | **The field** | .615–.680 | Passes **behind the chain-link** — a foreground layer with real edges. | Walking, then playing. `concentration`. | The 5v5 pitch: fenced, worn, small goals, buildings crowding it. An escalation from improvised to dedicated. | — | Ball on fence. More voices. Enclosed reverb. |
| 12 | **The climb** | .680–.760 | Rises **slightly faster than he does**, so the horizon line drops in frame. | Walking west, alone now. | The street lifts. Buildings step down. The far row begins to end. | — | Street thins. Wind enters. |
| 13 | **The reveal** ★ | .760–.840 | Pull back **and up**. Frustum 11→26. He becomes small. | Stops. `wonder`. | Parapet drops below the eyeline → rooftops → the Atlantic → and off-centre, distant, the Hassan II Mosque. | **None.** | Street gone. Wind, gulls, and the sea — which becomes audible *just before* it becomes visible. |
| 14 | **Hold** ★ | .840–.880 | **Absolutely still.** | Still. Looking. | Nothing moves but haze and one bird. | — | Near silence. |
| 15 | **Home** | .880–.940 | Follow back east, lower, quieter. Frustum 26→8. | Walking back. `calm`. | The same street, later. Longer shadows. Lit windows beginning. | — | Street returns, softer. Evening. |
| 16 | **The room again** | .940–.985 | Push in past the doorway. Frustum 8→3.2. | Sits. `curiosity`. | His bedroom: desk, computer, a game running, books, a football on the shelf, a basketball on the floor. | — | Room tone. Fan hum. A game loop, quiet. |
| 17 | **Curiosity** ★ | .985–1.000 | Slow push to the screen. Frustum 3.2→1.9. | `wonder`, held. | The screen fills the frame. **The rectangle of light returns — the same shape the sequence opened on.** | *"Games were the first thing I wanted to make."* | The room drops away. Only the game. |

★ = signature moment, polished far beyond ordinary traversal.

---

## 3. The three signature moments, in detail

### 05 · The glance

The whole point of the childhood chapter, and it lasts four seconds of scroll.

- **Shot** — locked, waist-height, the boy in the near third, mother behind and
  slightly out of focus.
- **Camera** — does not move at all. This is the only completely static beat in
  the first half.
- **Character** — he never looks at her. He is absorbed in the game.
- **Mother** — doing something ordinary. Stops. Looks at him. A small smile.
  Returns to it. **She does not speak, wave, or approach.**
- **Light** — the CRT is the key light on him; a warm lamp is the key on her.
  Two separate pools in one room.
- **Sound** — the street ducks out entirely. TV only.
- **Text** — none.
- **Transition** — he stands, and the camera finally moves.

The restraint *is* the content. A wave would destroy it.

### 13 · The reveal

- **Shot** — the widest frame in the sequence by a factor of three.
- **Camera** — rises and pulls back simultaneously, so the parapet descends
  through frame and uncovers the horizon. Elevation is the cause; the widening
  view is the effect. **The camera does the work the terrain cannot.**
- **Character** — stops walking of his own accord, a beat before the camera
  finishes. He is small, and it reads as awe rather than insignificance.
- **Environment** — rooftops first, then water, then the mosque last and
  off-centre. Never centred. Never a postcard.
- **Sound** — the sea is audible **before** it is visible. That two-second lead
  is what makes the reveal feel discovered rather than delivered.
- **Text** — none. Any word here would be an explanation of something the frame
  already says.

### 17 · Curiosity

- The screen fills the frame and becomes **the same rectangle of light the
  sequence opened on** — beat 01 was this shape, before you knew what it was.
- That rhyme closes the sequence and opens the whole story: the thing he was
  watching becomes the thing he wants to make.
- The final line lands here, and it is the last thing before the next chapter.

---

## 4. Camera doctrine for this sequence

Every move has a job. Moves that don't are cut.

| Beat | Move | Why |
|---|---|---|
| 02–03 | continuous pull-back | one window becomes a neighbourhood — the world assembling |
| 04 | push through glass | the world remembering, not a cut |
| 05 | **none** | stillness is the beat |
| 07 | descend with him | makes *third floor* a fact you felt |
| 09 | **lead him** | you arrive before he does, so you anticipate |
| 11 | pass behind the fence | foreground layer proves the place has edges |
| 12 | rise faster than he climbs | drops the horizon — sets up the reveal |
| 13 | rise + pull back | the reveal itself |
| 14 | **none** | the payoff of everything before it |
| 17 | slow push | closes the rhyme |

The camera never moves because it can.

---

## 5. Audio timeline

Authored with the visuals, not bolted on.

```
01  ▁ room tone
02  ▁▂ + distant traffic
03  ▃▄ full street: traffic, voices, a ball somewhere
04  ▂ street ducks · room tone, TV, kettle
05  ▁ TV only                        ← street entirely gone
06  ▂ controller, door
07  ▂ footsteps, stairwell reverb tightening then opening
08  ▅ FULL street, sudden            ← loudest point in the sequence
09  ▄ voices, ball impacts, passing car
10  ▄ ball, shouts, traffic behind
11  ▄ ball on fence, enclosed reverb
12  ▂ street thins, wind enters
13  ▂ wind, gulls, sea               ← sea arrives BEFORE the visual
14  ▁ near silence
15  ▂ street returns, softer, evening
16  ▂ room tone, fan hum, quiet game loop
17  ▁ room drops away, only the game
```

Sync points: footsteps to gait phase; ball impacts to kicks; the car in beat 09
passes exactly as the camera completes its lead; room tone crossfades on the
window push in beat 04.

Silence is used three times and each one is doing work.

---

## 6. Typography

- **Chapter label** — `C H I L D H O O D`, set vertically down the left edge,
  letterspaced, ~9% opacity, appearing at .11 and dissolving at .94. Composition,
  not navigation.
- **`Casablanca`** — mono, 11px, letterspaced, appears .12, gone by .16.
- **Two narration lines** — Instrument Serif, generous, low contrast, never over
  his face, fading in over ~700ms and out over ~500ms.
- **No** progress bar, year, chapter menu, nav, or counter. Anywhere.

---

## 7. Bidirectional contract

Every beat above is a pure sample. Specifically:

- The **mother's glance** is a function of local `u`, so scrubbing back through
  .27 → .25 un-smiles her, smoothly.
- The **door wipe** at .40 is a light-flood driven by `u`, not an event — reverse
  through it and the street darkens back into the stairwell.
- The **reveal** reconstructs at any scroll position: parapet height, camera
  rise and haze are all sampled, so stopping halfway is a valid frame.
- **Interactive beat 10** stores the visitor's offset separately from timeline
  position, so leaving and re-entering is continuous.

Stopping anywhere must leave a frame you would be happy to screenshot. That is
the test.

---

## 8. What this sequence must not do

No navbar. No cards. No skill lists. No résumé overlay. No timeline UI. No
chapter buttons. No years. No progress bar. No dialogue. No postcard framing of
the mosque. No particles that aren't dust or haze. No effect used because it was
available.

And nothing that explains, in words, something the frame already says.
