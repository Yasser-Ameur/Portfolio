// Ambience beds, synthesised. No files — filtered noise and a few tones,
// crossfaded from the same timeline that drives the picture.
export function createAudio() {
  let ac = null, master = null, beds = null, started = false;

  function noiseBuffer(ctx, secs) {
    const b = ctx.createBuffer(1, ctx.sampleRate * secs, ctx.sampleRate);
    const d = b.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.2;
    }
    return b;
  }

  function bed(ctx, buf, type, freq, q, gain) {
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    const g = ctx.createGain(); g.gain.value = 0;
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
    return { g, peak: gain };
  }

  function init() {
    if (ac) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    const buf = noiseBuffer(ac, 4);
    beds = {
      roomtone: bed(ac, buf, 'lowpass', 220, 0.7, 0.30),
      traffic: bed(ac, buf, 'lowpass', 460, 0.9, 0.55),
      street: bed(ac, buf, 'bandpass', 900, 0.6, 0.34),
      tv: bed(ac, buf, 'bandpass', 2600, 1.2, 0.13),
      stair: bed(ac, buf, 'bandpass', 520, 3.0, 0.22),
      wind: bed(ac, buf, 'highpass', 900, 0.5, 0.30),
      sea: bed(ac, buf, 'bandpass', 380, 0.5, 0.44),
      // chapter two
      fan: bed(ac, buf, 'lowpass', 150, 0.8, 0.26),
      keys: bed(ac, buf, 'bandpass', 3200, 2.4, 0.10),
      hall: bed(ac, buf, 'bandpass', 700, 1.4, 0.24),
      jet: bed(ac, buf, 'lowpass', 320, 0.6, 0.62),
      cold: bed(ac, buf, 'highpass', 1400, 0.4, 0.26),
      alpine: bed(ac, buf, 'bandpass', 1100, 0.7, 0.34)
    };
    // slow swell on the sea so it reads as waves, not hiss
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.09;
    const lg = ac.createGain(); lg.gain.value = 0.5;
    lfo.connect(lg); lg.connect(beds.sea.g.gain); lfo.start();
    // room hum under the interiors
    const hum = ac.createOscillator(); hum.type = 'sine'; hum.frequency.value = 62;
    const hg = ac.createGain(); hg.gain.value = 0; hum.connect(hg); hg.connect(master); hum.start();
    beds.hum = { g: hg, peak: 0.05 };
  }

  function enable(on) {
    init();
    if (!ac) return false;
    if (on && ac.state === 'suspended') ac.resume();
    started = on;
    master.gain.setTargetAtTime(on ? 0.5 : 0, ac.currentTime, 0.25);
    return true;
  }

  const cl = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const seg = (t, a, b, c, d) => cl(Math.min((t - a) / (b - a || 1), (d - t) / (d - c || 1)));

  // chapter one occupies [0, CH1) of the master timeline, chapter two the rest
  const CH1 = 0.42;

  function update(tm) {
    if (!ac || !started || !beds) return;
    const now = ac.currentTime, tc = 0.35;
    const set = (k, v) => beds[k] && beds[k].g.gain.setTargetAtTime(cl(v) * beds[k].peak, now, tc);
    const inCh1 = cl((CH1 + 0.012 - tm) / 0.024);
    const inCh2 = 1 - inCh1;
    const t = cl(tm / CH1);                       // chapter-one local time
    const u = cl((tm - CH1) / (1 - CH1));         // chapter-two local time

    // ---- chapter one ----
    const interior = seg(t, 0.17, 0.20, 0.33, 0.36) + seg(t, 0.93, 0.95, 1.01, 1.02);
    const outdoors = cl(1 - interior - seg(t, 0.33, 0.35, 0.39, 0.41));
    set('roomtone', inCh1 * cl(interior + (t < 0.11 ? 1 - t / 0.11 : 0)) + inCh2 * seg(u, -0.1, 0.02, 0.20, 0.26));
    set('hum', inCh1 * cl(interior) + inCh2 * cl(seg(u, -0.1, 0.02, 0.22, 0.28) + seg(u, 0.72, 0.76, 0.79, 0.82)));
    set('traffic', inCh1 * cl(Math.min(1, (t - 0.05) / 0.09)) * outdoors * (1 - seg(t, 0.74, 0.79, 0.87, 0.90)));
    set('street', inCh1 * outdoors * cl(Math.min(1, (t - 0.40) / 0.04)) * (1 - seg(t, 0.72, 0.78, 0.87, 0.90)));
    set('tv', inCh1 * interior * 0.9);
    set('stair', inCh1 * seg(t, 0.33, 0.35, 0.39, 0.41));
    set('sea', inCh1 * seg(t, 0.735, 0.78, 0.885, 0.905));

    // ---- chapter two ----
    // the fan of the machine, under everything he makes
    set('fan', inCh2 * cl(seg(u, -0.1, 0.02, 0.22, 0.28) + seg(u, 0.72, 0.76, 0.80, 0.84) * 0.8));
    set('keys', inCh2 * cl(seg(u, 0.06, 0.11, 0.20, 0.25) + seg(u, 0.73, 0.77, 0.79, 0.82) * 0.7));
    // corridors and the hall: room reverb
    set('hall', inCh2 * cl(seg(u, 0.31, 0.35, 0.51, 0.55)));
    // the crossing
    set('jet', inCh2 * seg(u, 0.59, 0.62, 0.64, 0.67));
    // Lausanne is thin and cold; the mountains are wide
    set('cold', inCh2 * cl(seg(u, 0.64, 0.68, 0.79, 0.83) + seg(u, 0.85, 0.89, 0.99, 1.02) * 0.5));
    set('alpine', inCh2 * seg(u, 0.85, 0.90, 1.00, 1.02));
    // wind bridges the rooftop of chapter one and the ridge of chapter two
    set('wind', inCh1 * seg(t, 0.68, 0.73, 0.90, 0.94) + inCh2 * seg(u, 0.86, 0.91, 1.00, 1.02) * 0.7);
  }

  return { enable, update, get on() { return started; } };
}
