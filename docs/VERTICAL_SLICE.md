# Vertical Slice — the quality gate

One scene. Nothing expands until this looks genuinely good.

```
Morocco childhood  →  the yard  →  the doorway  →  his room  →  the computer
                                                              →  first programming memory
```

World span **0 → 3,400 units**. Roughly 45 seconds of walking.

---

## 1. What it must contain

Per the directive, all ten of these are in scope. This is the checklist the
slice is graded against.

| # | Requirement | How it lands here |
|---|---|---|
| 1 | Character movement | hold a direction; damped accel; procedural gait |
| 2 | Correct depth sorting | real z per plane + depth buffer; he passes *behind* the gatepost and *in front of* the wall |
| 3 | Environment collision | the wall, the gate posts and the doorway are solid; he cannot walk through the house facade |
| 4 | Animated character | walk/run/idle from one cycle, hair lag, blinks, expression |
| 5 | Environmental animation | palm fronds sway, laundry moves, TV flicker, dust drifts, streetlamp warms up |
| 6 | Interactive object | **the football** — kick it, it rolls, he chases it |
| 7 | Memory transition | the **doorway**: camera travels into it, world becomes the room |
| 8 | Camera movement | follow, push-in on the window, pull back on entry to the room |
| 9 | Polished lighting | low sun right, long left-leaning shadows, warm rim, TV glow, lamp pool |
| 10 | Polished composition | five planes, mandatory foreground, one accent |

## 2. Beats

| x | Beat | Camera | Expression |
|---|---|---|---|
| 240 | enters the yard | follow | curious 0.5 |
| 1,160 | the football — kickable | push 1.08 | joy 0.75 |
| 2,020 | notices the television through the window | push 1.22, lead 0.42 | wonder 0.9 |
| 2,120 | **she appears in the doorway** | hold 2.6 s | — |
| 2,330 | the doorway — enterable | — | — |
| — | *inside:* the room | pull back, then push to the screen | focus → wonder |

## 3. The memory transition

The doorway is a **place**, not a button. Warm light spills out of it onto the
ground. As he approaches, the spill brightens.

Entering:
1. camera dollies toward the doorway's world position while the ortho frustum
   narrows — an approach, not a zoom
2. the exterior planes fade and separate outward
3. the room's planes rise from black in the doorway's light colour
4. the camera settles into the room at 1.14

Leaving reverses it with the same origin, so he is back exactly where he stood.

## 4. Collision

Simple: chapters declare solid spans on the ground plane.

```ts
solids: [
  { x0: 520,  x1: 880,  }, // yard wall, left run
  { x0: 1000, x1: 1880, }, // yard wall, right run
  { x0: 1880, x1: 3400, }, // the house facade — except the doorway
]
```

He walks in front of the wall, so these are only barriers where the geometry is
genuinely at his depth (the house). The gate gap and the doorway are openings.

Collision is a 1D interval test against `charX ± halfWidth`. Nothing more is
warranted for a side-on world.

## 5. Environmental animation inventory

| Element | Motion |
|---|---|
| palm fronds | sway, phase-offset per frond, ~0.25 Hz |
| laundry | slow drift, larger amplitude at the line's centre |
| bougainvillea | very low amplitude, offset from palms |
| television | flicker — irregular brightness on the window glow |
| dust | drift + parallax against camera |
| streetlamp (dusk) | warms up over ~1.2 s as he approaches |
| the football | rolls with real angular velocity, decelerates |

## 6. Composition targets

- Foreground: overhanging branch top-left, near scrub bank bottom
- Focal point: the window with the television — the only cool colour in a warm
  chapter, and the first appearance of the rectangle-of-light motif
- Accent: bougainvillea magenta, nothing else saturated
- Sun: low, right, off-frame; every shadow long and leaning left

## 7. Acceptance

The slice is done when, from screenshots of the real page:

- `visual-qa` returns **accept** — run separately from whatever built it
- `frame-cost.mjs` reports < 8 ms/frame with `jsMsPerFrame` under 2 ms
- draw calls ≤ 120
- zero React renders while travelling
- `tsc --noEmit` and lint clean, no console errors
- it survives mobile width without becoming a different composition

Only then does chapter 03 get built.
