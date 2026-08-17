# CHARACTER BIBLE

Two characters are ever drawn in full detail. Everyone else in the world is a
silhouette. That restriction is deliberate and load-bearing.

---

## 1. Yasser

### Appearance

- **Curly black hair.** Rendered as a cluster of overlapping blobs — a mass
  behind the skull for silhouette, a mass over the cranium that actually reads
  as hair, and three loose curls that lag further behind the head.
- **Light skin**, paler as a child, warmer and more tanned as he grows.
- **Glasses** from roughly 7th–8th grade until his last year at EPFL. They fade
  in over ~120 world units in a school corridor and fade out late at EPFL.
  Neither is ever remarked on.
- Stylised, not photoreal. A protagonist from a beautiful indie game.

### Proportions

`stage` runs continuously 0 → 1 across ~17 years. He is always *between* two
ages; growth is felt across a chapter, never caught happening.

| Parameter | stage 0 (≈6) | stage 1 (≈23) |
|---|---|---|
| height | 118 u | 178 u |
| head / height | 0.185 | 0.130 |
| leg / height | 0.43 | 0.50 |
| shoulder width | 0.21 × h | 0.245 × h |
| chest depth (side view) | 0.135 × h | 0.152 × h |
| waist depth | 0.118 × h | 0.124 × h |
| arm width | 0.062 × h | 0.058 × h |
| leg width | 0.088 × h | 0.081 × h |
| posture lean | +2° | −1° |

Children are large-headed and short-legged; adults invert both.

**Body depth is authored directly, not derived as a fraction of shoulder width.**
Deriving it produced a stick figure — a real regression, caught in review.

### Wardrobe by chapter

| Chapter | Outfit |
|---|---|
| `yard` | football shirt, shorts, worn trainers |
| `room` | hoodie, cargo trousers |
| `school` | white shirt, navy trousers, backpack |
| `stage` | gown and gold stole |
| `goodbye` | dark jacket, one suitcase carried in the trailing hand |
| `arrival` | coat — the first time he is dressed for cold |
| later | shell jacket and pack |

The suitcase swings with the arm because it is parented to the forearm. That is
correct and worth keeping.

### Expressions

Five floats, spring-blended between named presets:
`browAngle · browRaise · eyeOpen · mouthCurve · mouthOpen`

Presets: `neutral · curious · joy · focus · confusion · frustration ·
excitement · calm · pride · wonder`

At normal framing his face is ~16 px tall, so expression is **felt**, not read.
It becomes legible exactly when it matters, because every emotional beat is also
a camera push-in. **Expression and camera are one system** — never script an
expression without deciding what the camera is doing.

Used at: discovering programming (`wonder`), graduation (`pride`), the goodbye
(`calm` — deliberately not sad), arriving in Switzerland (`wonder`), the Loop
(`frustration`, briefly), breakthroughs, hiking, now.

Blinks fire on a randomised 2.2–5.6 s interval, layered over whatever expression
is active.

---

## 2. His mother

Drawn in the same language as him — same skull construction, same rim light — so
the two read as belonging to one world.

- Djellaba silhouette with an actual waist, sleeve, and hem. **Not a slab.**
  A flat A-line shape read as a coloured monolith in review.
- Headscarf built the simple way round: one shape covering the whole head, face
  as an oval sitting forward on top. The scarf then frames the face without any
  clever cutouts.
- Adult proportions, ~164 u, lower motion amplitudes, slower breathing.

### Performance

**She never gestures and is never animated toward the camera.** Her entire
performance is posture, stillness, and where she is looking.

- childhood — in the doorway, watching, in the warmest light in the scene
- first code — in the hallway behind him, light still on
- graduation — standing at the end of a row; her head tracks him; she is not
  clapping
- departure — walks beside him, then stops, and does nothing else at all
- afterwards — one warm window, once

Five appearances in a three-minute experience. That scarcity is why she lands.
**A wave would ruin it.** Do not add one.

---

## 3. Everyone else

Silhouettes. Legs slightly apart so they read as walking, shoulders and waist,
head. No faces. Different speeds from his, especially at EPFL — the first time
the world contains people who are not there for him.

Seated audiences are backs of heads and shoulders in receding rows, never
detailed.
