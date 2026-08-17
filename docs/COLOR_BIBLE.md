# COLOR BIBLE

Colour is the emotional state. It is never written down in text, and it is the
main reason the story lands without narration.

Method — OKLab mixing, atmospheric perspective, the one-accent rule — lives in
`.claude/skills/art-direction/references/palette-method.md`.

---

## 1. The arc

```
Morocco / childhood   warm ochre, low sun, close horizon
first code            lamp warmth inside deep blue night
school                flat, plain, deliberately the least beautiful
graduation            amber, ceremonial, the widest warm light
departure             warmth draining out of the frame
the crossing          high-altitude blue and glare
Lausanne / EPFL       cold, clear, enormous
the Loop              NEUTRAL — temperature 0.0, no character at all
rewiring              clarity returns, structure becomes visible
second year           cool with warm interior pockets
the projects          the accent colour of each system
hiking                expansive natural range, the widest palette in the story
now                   balanced, open, unresolved
```

The Loop is the pivot: it is the only chapter with **no colour identity**. That
absence is the point, and it only works because everything around it is
committed.

## 2. Chapter palettes

| Chapter | sky (zenith → horizon) | key | fill | haze | ground | accent | temp |
|---|---|---|---|---|---|---|---|
| `threshold` | `#080b11` → `#141b27` | `#ffd9a0` | `#0a0e15` | `#111825` | `#0b0f16` | `#ffbf6e` | 0.00 |
| `yard` | `#3f7fb0` → `#f2c98d` | `#ffd9a0` | `#57466a` | `#e6c79c` | `#c9a06a` | `#d94f7a` | −0.85 |
| `room` | `#0c1422` → `#28334d` | `#ffbf6e` | `#151d2e` | `#1b2740` | `#2b2a35` | `#5fd4e8` | −0.30 |
| `school` | `#7fa8c4` → `#e0e7e5` | `#f6f2e6` | `#59636f` | `#c4ced4` | `#9a9280` | `#2f4a7a` | +0.10 |
| `stage` | `#251a1e` → `#6d4730` | `#ffcf8a` | `#37282f` | `#7c5439` | `#4a3428` | `#e0a63c` | −0.60 |
| `goodbye` | `#2c3c5c` → `#cb9c7c` | `#e8b48a` | `#383849` | `#8a8090` | `#57505e` | `#f0b070` | −0.20 |
| `crossing` | `#1d4d8a` → `#dfeaf2` | `#ffffff` | `#7a9ab5` | `#cfe2ee` | `#e8f0f5` | `#ffffff` | +0.50 |
| `arrival` | `#7ba9cd` → `#e9f0f3` | `#eaf2ff` | `#63788f` | `#cddce6` | `#8b9aa5` | `#2f7f9e` | +0.85 |

Chapters after `arrival` are designed in `WORLD_BIBLE.md` and their palettes are
assigned when they are built.

## 3. The one-accent rule

Exactly one saturated colour per chapter:

- `yard` — bougainvillea magenta. The only non-earth colour in Morocco.
- `room` — monitor cyan. The only cool thing in a warm room.
- `stage` — gold. The stole, the banner rules, the flowers.
- `goodbye` — the last warm window.
- `arrival` — lake blue.

Everything else is a value of the palette. This constraint is most of what
separates art-directed from decorated.

## 4. Temperature as narrative

`temp` runs −1 (warm) to +1 (cold) and drives the character's rim light, so the
protagonist is visually bound to wherever he is.

```
warm      home, safety, the past
neutral   stalled
cold      unfamiliar, larger, newer
clear     resolution, altitude
```

Morocco is `−0.85`. Lausanne is `+0.85`. That inversion, felt across the
crossing, is the whole "everything is bigger now" moment — delivered as colour
rather than as a sentence.

## 5. The one deliberate violation

Late in the Swiss half, **one window** is lit in the warm ochre of the Morocco
palette — a colour that does not otherwise exist in that half of the world.

It appears once. It is never labelled, never explained, never repeated.

Anyone who notices it will understand. Anyone who does not loses nothing. Do not
add a second one.

## 6. Rules

1. Nothing hard-codes a colour it wasn't handed by a palette.
2. All mixing in OKLab. sRGB blends go muddy through the middle.
3. `haze` must sit close to the sky's horizon colour, or distance reads as fog.
4. Desaturate the frame: the depth planes must still separate.
5. The character is the highest-contrast element in his own scene.
6. Never introduce a second accent to "add interest". Fix the composition instead.
