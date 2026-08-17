# ANIMATION BIBLE

Motion communicates state or emotion, or it is cut.

---

## 1. Gait — one function, no state machine

Walk and run are the **same** procedural cycle at different amplitudes,
interpolated by normalised speed. There is therefore no blend seam, no pop
between gaits, and nothing to hide.

```
φ        += 2π · distanceMoved / stride
stride    = legLength · lerp(1.0, 1.8, speed)

hip       =  A_hip(speed)  · sin(φ)
knee      =  2 + A_knee(speed) · max(0, −sin(φ + 0.6)) · 1.6
shoulder  = −A_arm(speed)  · sin(φ)
bob       = −A_bob(speed)  · (0.5 − 0.5·cos(2φ))
lean      =  11° · speed²
```

Amplitudes: hip 6°→42°, knee 4°→30°, arm 4°→34°, bob 0.4→5.2 u.

Knee flexion peaks shortly *after* toe-off, while the leg swings through. That
offset is what makes it read as walking rather than scissoring.

Hips rise twice per cycle — once per step.

**Idle is the same function at speed 0**, plus a breathing sine on the chest
(1.6 rad/s) and an occasional head tilt. Deceleration is just speed → 0, so he
settles instead of snapping.

## 2. Secondary motion

Curly hair lags the head on a light spring (stiffness 90, damping 11, capped at
±4.5 u) driven by head velocity. The hair mass moves at 55% of the offset, the
loose curls at 100%.

This single detail does more for "alive" than anything else in the rig. Keep it.

## 3. Speed as narrative

Gait speed tracks the emotional arc and is not a constant:

```
Morocco       calm walk
corridor      slower
the Loop      stalled — effort with no displacement
after rewiring faster than the camera expects
hiking        running; the camera has to catch up
```

He never stops moving again after the rewiring. That is momentum, rendered.

Max speed scales with world position: `lerp(124, 300, progress · 0.55)` u/s.

## 4. Camera motion

| Move | Damping | When |
|---|---|---|
| follow | k ≈ 3.5, lead 0.36 | default |
| push in | 1.2–1.6 s | discovery, pride |
| pull back + pan up | 2.4–3.4 s | scale reveals |
| hold on another subject | 2.2 s | **once** — the graduation shot |
| handheld noise | ±1.5 u, ~0.4 Hz | always on |

Handheld noise is almost subliminal and is the difference between *filmed* and
*mechanical*. Never disable it except under reduced motion.

Zoom range 0.85 (summit) → 1.45 (the monitor). Zoom is a camera frustum change,
never a parent scale.

## 5. Environmental animation

- particles drift and parallax against the camera
- cloud layers move at different speeds (four in the crossing chapter)
- foliage sways at low amplitude, phase-offset per element
- water specular breaks shift slowly
- streetlamps ignite in sequence as he approaches — the first time the world
  reacts to him
- in the Loop, **parallax stops**: he walks, the background does not move

## 6. Transitions

Every chapter boundary is **travelled, never cut**. Exactly one fade exists in
the whole experience — the ground dropping away into the crossing — and it is
earned because it is the one real break.

Memory dives are travel: the camera moves *into* the opening, the world's
rendering language changes, and exiting reverses the move with the same origin
so the visitor returns to the exact frame they left.

## 7. Timing

- captions fade and rise 8 u over 700 ms; nothing animates letter by letter
- caption dwell ~4–6 s, or until any input
- expression blends over ~380 ms
- palette crossfades over a 420 u corridor, not at a boundary
- any beat can be skipped by any input; nobody waits through anything twice

## 8. Reduced motion

A real path, not a disabled experience: traversal becomes station-to-station
dissolves, the gait holds at idle, parallax and handheld are off, camera moves
become cuts. Every beat, caption and memory is preserved.

Stations are every chapter opening and every scripted beat, so nothing in the
story is skipped.

`?motion=full` / `?motion=reduced` override the OS setting — some people run
reduced motion system-wide for reasons unrelated to this, and should still get
to choose.
