"use client";

/**
 * Procedural sound. Zero audio assets.
 *
 * Ambience is filtered noise whose parameters are functions of world position,
 * so the soundscape *travels* instead of crossfading between clips. The score
 * is a slow pad whose mode and cutoff come from the chapter. Off by default —
 * browsers require a gesture anyway, and this should never ambush anyone.
 */

import { setState, getState } from "./store";
import type { ChapterId } from "./types";

type Voice = { osc: OscillatorNode; gain: GainNode };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambienceGain: GainNode | null = null;
let ambienceFilter: BiquadFilterNode | null = null;
let padFilter: BiquadFilterNode | null = null;
let padGain: GainNode | null = null;
let voices: Voice[] = [];

/** Scale degrees per chapter mood — see docs/02-VISUAL.md §9. */
const MODES: Record<string, number[]> = {
  lydian: [0, 2, 4, 6, 7, 9, 11],
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

const CHAPTER_SOUND: Record<ChapterId, { root: number; mode: string; cutoff: number; air: number }> = {
  threshold: { root: 110, mode: "aeolian", cutoff: 500, air: 0.02 },
  yard: { root: 146.83, mode: "lydian", cutoff: 1400, air: 0.1 },
  room: { root: 130.81, mode: "ionian", cutoff: 900, air: 0.04 },
  school: { root: 130.81, mode: "dorian", cutoff: 1100, air: 0.07 },
  stage: { root: 116.54, mode: "ionian", cutoff: 1250, air: 0.09 },
  goodbye: { root: 110, mode: "aeolian", cutoff: 760, air: 0.12 },
  crossing: { root: 98, mode: "mixolydian", cutoff: 1800, air: 0.3 },
  arrival: { root: 123.47, mode: "dorian", cutoff: 1600, air: 0.2 },
};

function noiseBuffer(context: AudioContext) {
  const len = context.sampleRate * 3;
  const buf = context.createBuffer(1, len, context.sampleRate);
  const data = buf.getChannelData(0);
  // Brown noise — softer and more like air than white.
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buf;
}

function start() {
  if (ctx) return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();

  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // --- ambience -----------------------------------------------------------
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.loop = true;
  ambienceFilter = ctx.createBiquadFilter();
  ambienceFilter.type = "bandpass";
  ambienceFilter.frequency.value = 500;
  ambienceFilter.Q.value = 0.6;
  ambienceGain = ctx.createGain();
  ambienceGain.gain.value = 0.1;
  src.connect(ambienceFilter).connect(ambienceGain).connect(master);
  src.start();

  // --- pad ----------------------------------------------------------------
  padFilter = ctx.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 900;
  padFilter.Q.value = 0.8;
  padGain = ctx.createGain();
  padGain.gain.value = 0.055;
  padFilter.connect(padGain).connect(master);

  voices = [0, 1, 2, 3].map((i) => {
    const osc = ctx!.createOscillator();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.value = 146.83;
    osc.detune.value = (i - 1.5) * 6;
    const gain = ctx!.createGain();
    gain.gain.value = i === 0 ? 0.5 : 0.22;
    osc.connect(gain).connect(padFilter!);
    osc.start();
    return { osc, gain };
  });

  master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.6);
}

function stop() {
  if (!ctx || !master) return;
  const c = ctx;
  master.gain.cancelScheduledValues(c.currentTime);
  master.gain.linearRampToValueAtTime(0, c.currentTime + 0.5);
  window.setTimeout(() => {
    void c.close();
    ctx = null;
    master = null;
    voices = [];
  }, 700);
}

export function toggleSound() {
  const on = !getState().soundEnabled;
  setState({ soundEnabled: on });
  if (on) start();
  else stop();
}

/** Called from the clock when the chapter changes. Everything glides. */
export function tuneTo(chapterId: ChapterId) {
  if (!ctx || !padFilter || !ambienceFilter) return;
  const spec = CHAPTER_SOUND[chapterId];
  if (!spec) return;
  const t = ctx.currentTime;
  const glide = 2.4;

  padFilter.frequency.cancelScheduledValues(t);
  padFilter.frequency.linearRampToValueAtTime(spec.cutoff, t + glide);

  ambienceFilter.frequency.cancelScheduledValues(t);
  ambienceFilter.frequency.linearRampToValueAtTime(300 + spec.air * 3000, t + glide);
  if (ambienceGain) {
    ambienceGain.gain.cancelScheduledValues(t);
    ambienceGain.gain.linearRampToValueAtTime(spec.air, t + glide);
  }

  const degrees = MODES[spec.mode] ?? MODES.ionian;
  const chord = [0, 2, 4, 6];
  voices.forEach((v, i) => {
    const semis = degrees[chord[i % chord.length] % degrees.length];
    const octave = i === 0 ? 0 : 12;
    const freq = spec.root * Math.pow(2, (semis + octave) / 12);
    v.osc.frequency.cancelScheduledValues(t);
    v.osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq), t + glide);
  });
}

/** A footstep — filtered noise burst, timbre by surface. */
export function footstep(surface: string, intensity = 1) {
  if (!ctx || !master) return;
  const c = ctx;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c);
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value =
    surface === "tile" ? 2400 : surface === "corridor" ? 1800 : surface === "carpet" ? 500 : 1100;
  filter.Q.value = surface === "carpet" ? 0.7 : 1.6;
  const gain = c.createGain();
  const peak = (surface === "carpet" ? 0.02 : 0.05) * intensity;
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(peak, c.currentTime + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.12);
  src.connect(filter).connect(gain).connect(master);
  src.start();
  src.stop(c.currentTime + 0.16);
}
