// Chapter two — from the machine to now.
// Same rules as chapter one: every value is a pure function of local progress.

export const BEATS2 = [
  { id: 'the-machine',   label: 'The machine',   t0: 0.000, t1: 0.080 },
  { id: 'first-code',    label: 'First code',    t0: 0.080, t1: 0.158, star: true },
  { id: 'making',        label: 'Making',        t0: 0.158, t1: 0.240 },
  { id: 'growing',       label: 'Growing',       t0: 0.240, t1: 0.322, star: true },
  { id: 'school',        label: 'School',        t0: 0.322, t1: 0.404 },
  { id: 'valedictorian', label: 'Valedictorian', t0: 0.404, t1: 0.470 },
  { id: 'her',           label: 'Her',           t0: 0.470, t1: 0.524, star: true },
  { id: 'goodbye',       label: 'Goodbye',       t0: 0.524, t1: 0.598, star: true },
  { id: 'the-crossing',  label: 'The crossing',  t0: 0.598, t1: 0.652 },
  { id: 'lausanne',      label: 'Lausanne',      t0: 0.652, t1: 0.730 },
  { id: 'the-loop',      label: 'The loop',      t0: 0.730, t1: 0.796 },
  { id: 'rewiring',      label: 'Rewiring',      t0: 0.796, t1: 0.864, star: true },
  { id: 'the-trail',     label: 'The trail',     t0: 0.864, t1: 0.940, star: true },
  { id: 'now',           label: 'Now',           t0: 0.940, t1: 1.000 }
];

export function createChapter2(api) {
  const { A, mix, rgba, lerp, cl, ease, smooth, rng, sprite, pool, push, P } = api;

  const seg = (t, a, b, c, d) => cl(Math.min((t - a) / (b - a || 1), (d - t) / (d - c || 1)));

  /* ---------- shared primitives ---------- */

  // an interior shell: wall, skirting, floor
  function shell(ctx, W, H, floorY, wallA, wallB, floorA, floorB) {
    const wg = ctx.createLinearGradient(0, 0, W, floorY);
    wg.addColorStop(0, wallA); wg.addColorStop(0.55, mix(wallA, wallB, 0.5)); wg.addColorStop(1, wallB);
    ctx.fillStyle = wg; ctx.fillRect(-W, -H, W * 3, floorY + H);
    ctx.fillStyle = 'rgba(10,12,20,0.26)';
    ctx.fillRect(-W, floorY - H * 0.028, W * 3, H * 0.028);
    const fg = ctx.createLinearGradient(0, floorY, 0, H * 1.2);
    fg.addColorStop(0, floorA); fg.addColorStop(1, floorB);
    ctx.fillStyle = fg; ctx.fillRect(-W, floorY, W * 3, H);
  }

  // a lit window and the light it throws
  function window2(ctx, W, H, x, y, w, h, inner, beamTo, beamA) {
    ctx.fillStyle = 'rgba(30,28,26,0.9)';
    ctx.fillRect(x - w * 0.06, y - h * 0.05, w * 1.12, h * 1.1);
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, inner[0]); g.addColorStop(1, inner[1]);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(30,28,26,0.85)';
    ctx.fillRect(x + w * 0.47, y, Math.max(1, w * 0.05), h);
    ctx.fillRect(x, y + h * 0.46, w, Math.max(1, h * 0.05));
    if (beamA > 0.01) {
      const b = ctx.createLinearGradient(x, y, x + (beamTo - x) * 0.9, y + h * 3);
      b.addColorStop(0, rgba(inner[0], beamA)); b.addColorStop(1, rgba(inner[0], 0));
      ctx.fillStyle = b;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y);
      ctx.lineTo(beamTo + w * 1.6, y + h * 3.2); ctx.lineTo(beamTo - w * 0.4, y + h * 3.2);
      ctx.closePath(); ctx.fill();
    }
  }

  // a ridge silhouette — the mountains, and the shapes of everything behind him
  function ridge(ctx, W, H, yBase, amp, seed, col, alpha2, detail) {
    const r = rng(seed);
    ctx.save(); ctx.globalAlpha = ctx.globalAlpha * alpha2;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(-W * 0.05, H * 1.1);
    ctx.lineTo(-W * 0.05, yBase);
    let x = -W * 0.05;
    let y = yBase;
    const step = W / (detail || 9);
    while (x < W * 1.06) {
      const nx = x + step * (0.6 + r() * 0.9);
      const ny = yBase - amp * (0.25 + r() * 0.95);
      ctx.lineTo((x + nx) / 2, Math.min(y, ny) - amp * 0.12 * r());
      ctx.lineTo(nx, ny);
      x = nx; y = ny;
    }
    ctx.lineTo(W * 1.1, H * 1.1); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function vignette(ctx, W, H, cx, cy, inner, a, col) {
    const v = ctx.createRadialGradient(W * cx, H * cy, H * inner, W * cx, H * cy, H * 0.95);
    v.addColorStop(0, rgba(col || '#05070E', 0)); v.addColorStop(1, rgba(col || '#05070E', a));
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  /* ---------- 18–20 · the machine, the code, the making ---------- */
  function machine(ctx, W, H, t, alpha, age) {
    const push2 = smooth(ease(0.000, 0.240, t));
    const codeIn = ease(0.086, 0.146, t);
    const engineIn = ease(0.170, 0.226, t);
    const flick = 0.9 + 0.1 * Math.sin(t * 1400);
    ctx.save(); ctx.globalAlpha = alpha;
    push(W * 0.53, H * 0.44, lerp(1.0, 2.05, push2));

    const floorY = H * 0.795;
    shell(ctx, W, H, floorY, '#2B3040', '#1A1E2A', '#2A2A30', '#12141A');

    // the window onto a night street
    window2(ctx, W, H, W * 0.055, H * 0.20, W * 0.155, H * 0.235,
      ['#1E2C40', '#16202E'], W * 0.10, 0.10);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = `rgba(255,196,120,${0.5 - i * 0.06})`;
      ctx.fillRect(W * (0.072 + (i % 3) * 0.045), H * (0.225 + Math.floor(i / 3) * 0.075), W * 0.016, H * 0.026);
    }

    // shelf: a football and a basketball, still there
    ctx.fillStyle = '#3A3324';
    ctx.fillRect(W * 0.245, H * 0.325, W * 0.20, Math.max(2, H * 0.011));
    ctx.fillStyle = '#D8D2C4'; ctx.beginPath(); ctx.arc(W * 0.275, H * 0.305, H * 0.020, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#2A2A30'; ctx.beginPath(); ctx.arc(W * 0.269, H * 0.300, H * 0.006, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#B4602C'; ctx.beginPath(); ctx.arc(W * 0.325, H * 0.303, H * 0.023, 0, 6.3); ctx.fill();
    ctx.strokeStyle = 'rgba(30,20,12,0.6)'; ctx.lineWidth = Math.max(1, H * 0.0022);
    ctx.beginPath(); ctx.arc(W * 0.325, H * 0.303, H * 0.023, 0, 6.3); ctx.moveTo(W * 0.302, H * 0.303);
    ctx.lineTo(W * 0.348, H * 0.303); ctx.stroke();
    ctx.fillStyle = '#4A4436';
    ctx.fillRect(W * 0.372, H * 0.286, W * 0.014, H * 0.039);
    ctx.fillRect(W * 0.389, H * 0.290, W * 0.011, H * 0.035);
    ctx.fillRect(W * 0.404, H * 0.284, W * 0.016, H * 0.041);

    // desk
    const dy = H * 0.575;
    ctx.fillStyle = '#4A3B2A'; ctx.fillRect(W * 0.325, dy, W * 0.42, H * 0.022);
    ctx.fillStyle = '#33291D'; ctx.fillRect(W * 0.335, dy + H * 0.022, W * 0.016, H * 0.20);
    ctx.fillStyle = '#33291D'; ctx.fillRect(W * 0.723, dy + H * 0.022, W * 0.016, H * 0.20);
    // tower under it
    ctx.fillStyle = '#22242A'; ctx.fillRect(W * 0.672, dy + H * 0.028, W * 0.052, H * 0.175);
    ctx.fillStyle = 'rgba(120,200,255,0.75)';
    ctx.fillRect(W * 0.680, dy + H * 0.042, W * 0.008, Math.max(2, H * 0.006));

    // monitor
    const mx = W * 0.415, my = H * 0.345, mw = W * 0.245, mh = H * 0.198;
    ctx.fillStyle = '#1A1C22';
    ctx.fillRect(mx - W * 0.012, my - H * 0.012, mw + W * 0.024, mh + H * 0.024);
    ctx.fillStyle = '#2A2C34';
    ctx.fillRect(mx + mw * 0.44, my + mh + H * 0.012, mw * 0.12, H * 0.030);
    ctx.fillRect(mx + mw * 0.28, my + mh + H * 0.040, mw * 0.44, H * 0.010);

    // the screen: code, then an engine
    ctx.globalAlpha = alpha * flick;
    ctx.fillStyle = '#0C1420'; ctx.fillRect(mx, my, mw, mh);
    const r = rng(4711);
    const rows = 13;
    for (let i = 0; i < rows; i++) {
      const rowT = cl((codeIn - i / rows * 0.55) * 3);
      if (rowT <= 0) continue;
      const y = my + mh * (0.075 + i * 0.068);
      let x = mx + mw * 0.06 + (r() > 0.7 ? mw * 0.06 : 0);
      const segs = 1 + Math.floor(r() * 3);
      for (let sIdx = 0; sIdx < segs; sIdx++) {
        const wSeg = mw * (0.06 + r() * 0.17) * rowT;
        ctx.fillStyle = ['#7FD1A8', '#E2C07A', '#8FB8E8', '#C89AD8', '#8AA0B4'][Math.floor(r() * 5)];
        ctx.globalAlpha = alpha * flick * 0.85;
        ctx.fillRect(x, y, wSeg, Math.max(1.5, mh * 0.030));
        x += wSeg + mw * 0.022;
      }
    }
    ctx.globalAlpha = alpha * flick;
    // engine viewport takes the screen over
    if (engineIn > 0.01) {
      ctx.save();
      ctx.globalAlpha = alpha * flick * engineIn;
      ctx.fillStyle = '#141C26'; ctx.fillRect(mx, my, mw, mh);
      ctx.strokeStyle = 'rgba(120,160,200,0.30)'; ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        ctx.beginPath(); ctx.moveTo(mx + mw * i / 8, my); ctx.lineTo(mx + mw * i / 8, my + mh); ctx.stroke();
      }
      for (let i = 1; i < 5; i++) {
        ctx.beginPath(); ctx.moveTo(mx, my + mh * i / 5); ctx.lineTo(mx + mw, my + mh * i / 5); ctx.stroke();
      }
      // a horizon and a little world he is building
      ctx.fillStyle = 'rgba(90,140,110,0.55)';
      ctx.fillRect(mx, my + mh * 0.62, mw, mh * 0.38);
      const grow = ease(0.196, 0.238, t);
      ctx.fillStyle = '#C8B486';
      ctx.fillRect(mx + mw * 0.24, my + mh * (0.62 - 0.22 * grow), mw * 0.10, mh * 0.22 * grow);
      ctx.fillRect(mx + mw * 0.42, my + mh * (0.62 - 0.31 * grow), mw * 0.09, mh * 0.31 * grow);
      ctx.fillStyle = '#D8544A';
      ctx.fillRect(mx + mw * 0.66, my + mh * 0.545, mw * 0.028, mh * 0.075);
      ctx.restore();
    }
    ctx.globalAlpha = alpha;
    pool(mx + mw * 0.5, my + mh * 0.5, W * 0.40, '#7FB8E8', 0.26 * flick, alpha);

    // desk lamp, the last warm thing
    ctx.fillStyle = '#5A4636';
    ctx.fillRect(W * 0.700, dy - H * 0.075, Math.max(2, W * 0.007), H * 0.075);
    ctx.beginPath(); ctx.moveTo(W * 0.676, dy - H * 0.075); ctx.lineTo(W * 0.728, dy - H * 0.075);
    ctx.lineTo(W * 0.718, dy - H * 0.104); ctx.lineTo(W * 0.686, dy - H * 0.104); ctx.closePath(); ctx.fill();
    pool(W * 0.702, dy - H * 0.068, W * 0.15, '#FFC375', 0.30, alpha);

    // him, at the desk
    const img = (age === 'child' ? A.back : (A.teenBack || A.back)) || A.side;
    if (img) {
      const hp = H * 0.30, bx = W * 0.535, seatY = H * 0.745;
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, W, seatY); ctx.clip();
      sprite(img, bx, seatY + hp * 0.36, hp, false, 0, 0, 0);
      ctx.restore();
      ctx.fillStyle = '#23252C';
      ctx.fillRect(bx - hp * 0.24, seatY - hp * 0.06, hp * 0.48, hp * 0.10);
      ctx.fillRect(bx - hp * 0.05, seatY + hp * 0.04, hp * 0.10, hp * 0.16);
      ctx.fillStyle = '#2C2F38';
      ctx.beginPath(); ctx.ellipse(bx, seatY + hp * 0.21, hp * 0.26, hp * 0.05, 0, 0, 6.3); ctx.fill();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = alpha * 0.34 * flick;
      const rl = ctx.createRadialGradient(bx, H * 0.56, 0, bx, H * 0.56, hp * 0.7);
      rl.addColorStop(0, 'rgba(150,200,244,0.6)'); rl.addColorStop(1, 'rgba(150,200,244,0)');
      ctx.fillStyle = rl; ctx.fillRect(bx - hp, H * 0.36, hp * 2, H * 0.42);
      ctx.restore();
    }

    ctx.restore();
    ctx.save(); ctx.globalAlpha = alpha;
    vignette(ctx, W, H, 0.52, 0.46, 0.20, 0.74);
    ctx.restore();
  }

  /* ---------- 21 · growing ---------- */
  function growing(ctx, W, H, t, alpha) {
    const k = ease(0.240, 0.322, t);
    ctx.save(); ctx.globalAlpha = alpha;
    // years passing as bands of light
    ctx.fillStyle = '#0E1118'; ctx.fillRect(0, 0, W, H);
    const phase = k * 7;
    for (let i = -2; i < 12; i++) {
      const x = W * (((i + phase) % 12) / 9 - 0.15);
      const bw = W * 0.055;
      const g = ctx.createLinearGradient(x, 0, x + bw, 0);
      const a = 0.16 + 0.12 * Math.sin(i * 1.7);
      g.addColorStop(0, 'rgba(255,214,160,0)');
      g.addColorStop(0.5, `rgba(255,214,160,${a * (1 - k * 0.5)})`);
      g.addColorStop(1, 'rgba(255,214,160,0)');
      ctx.fillStyle = g; ctx.fillRect(x, 0, bw, H);
    }
    const cool = ctx.createLinearGradient(0, 0, W, H);
    cool.addColorStop(0, `rgba(40,60,96,${0.30 * k})`);
    cool.addColorStop(1, `rgba(20,28,44,${0.44 * k})`);
    ctx.fillStyle = cool; ctx.fillRect(0, 0, W, H);
    // the ground he keeps walking on
    const gy = H * 0.86;
    ctx.fillStyle = '#171A22'; ctx.fillRect(0, gy, W, H - gy);
    ctx.fillStyle = 'rgba(255,222,176,0.10)'; ctx.fillRect(0, gy, W, Math.max(1, H * 0.004));

    // early teen → high school, without a cut
    const stages = [
      { img: A.teenWalk || A.teenSide, h: 0.375 },
      { img: A.hsWalk || A.hsSide, h: 0.44 }
    ].filter(sIt => sIt.img);
    if (stages.length) {
      const f = k * (stages.length - 1);
      const i0 = Math.min(stages.length - 1, Math.floor(f));
      const i1 = Math.min(stages.length - 1, i0 + 1);
      const m = f - i0;
      const hp = H * lerp(stages[i0].h, stages[i1].h, m);
      const bx = W * 0.44, bob = Math.sin(k * 120) * hp * 0.014;
      ctx.fillStyle = 'rgba(10,12,18,0.5)';
      ctx.beginPath(); ctx.ellipse(bx, gy, hp * 0.26, hp * 0.032, 0, 0, 6.3); ctx.fill();
      ctx.save(); ctx.globalAlpha = alpha * (1 - m);
      sprite(stages[i0].img, bx, gy + bob, hp, false, 0.5, 0, 1);
      ctx.restore();
      if (m > 0.001) {
        ctx.save(); ctx.globalAlpha = alpha * m;
        sprite(stages[i1].img, bx, gy + bob, hp, false, 0.5, 0, 1);
        ctx.restore();
      }
    }
    vignette(ctx, W, H, 0.46, 0.5, 0.18, 0.80);
    ctx.restore();
  }

  /* ---------- 22 · school ---------- */
  function school(ctx, W, H, t, alpha) {
    const k = smooth(ease(0.322, 0.404, t));
    ctx.save(); ctx.globalAlpha = alpha;
    push(W * 0.5, H * 0.5, lerp(1.0, 1.10, k));
    const floorY = H * 0.735;
    shell(ctx, W, H, floorY, '#B6BCB4', '#7E867E', '#8E8C82', '#3E3E38');
    // dado
    ctx.fillStyle = '#5E7A6E'; ctx.fillRect(-W, floorY - H * 0.20, W * 3, H * 0.20);
    ctx.fillStyle = 'rgba(255,255,240,0.16)'; ctx.fillRect(-W, floorY - H * 0.20, W * 3, Math.max(1, H * 0.004));
    // a run of tall windows throwing light down the corridor
    const scroll = k * W * 0.55;
    for (let i = -1; i < 5; i++) {
      const x = W * (0.06 + i * 0.30) - scroll;
      if (x > W * 1.1 || x < -W * 0.3) continue;
      window2(ctx, W, H, x, H * 0.155, W * 0.135, H * 0.34, ['#F2F6FA', '#CFE0EC'], x + W * 0.22, 0.20);
    }
    // doors on the near side
    for (let i = -1; i < 4; i++) {
      const x = W * (0.20 + i * 0.34) - scroll * 1.25;
      if (x > W * 1.1 || x < -W * 0.3) continue;
      ctx.fillStyle = '#4A5A50'; ctx.fillRect(x, floorY - H * 0.30, W * 0.10, H * 0.30);
      ctx.fillStyle = 'rgba(20,26,22,0.4)'; ctx.fillRect(x, floorY - H * 0.30, W * 0.014, H * 0.30);
      ctx.fillStyle = '#C8CCC4'; ctx.fillRect(x + W * 0.082, floorY - H * 0.165, W * 0.010, Math.max(2, H * 0.008));
    }
    // floor sheen
    const sh = ctx.createLinearGradient(0, floorY, 0, H);
    sh.addColorStop(0, 'rgba(240,246,250,0.16)'); sh.addColorStop(1, 'rgba(240,246,250,0)');
    ctx.fillStyle = sh; ctx.fillRect(0, floorY, W, H - floorY);

    const img = A.hsWalk || A.hsSide || A.walk;
    if (img) {
      const hp = H * 0.44, bx = W * lerp(0.34, 0.56, k), by = floorY + H * 0.10;
      const bob = Math.sin(k * 90) * hp * 0.012;
      ctx.fillStyle = 'rgba(20,24,22,0.28)';
      ctx.beginPath(); ctx.ellipse(bx, by, hp * 0.24, hp * 0.03, 0, 0, 6.3); ctx.fill();
      sprite(img, bx, by + bob, hp, false, 0.30, 0, 1);
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = alpha; vignette(ctx, W, H, 0.5, 0.5, 0.26, 0.52); ctx.restore();
  }

  /* ---------- 23/24 · the stage, and her ---------- */
  function stage(ctx, W, H, t, alpha) {
    const k = ease(0.404, 0.470, t);
    const her = ease(0.464, 0.500, t);
    ctx.save(); ctx.globalAlpha = alpha;
    // the camera leaves him and finds her
    push(W * lerp(0.5, 0.235, her), H * lerp(0.5, 0.66, her), lerp(1.0, 1.55, her));

    ctx.fillStyle = '#0B0D14'; ctx.fillRect(0, 0, W, H);
    const stageY = H * 0.70;
    // back wall of the hall, a drape
    const bg = ctx.createLinearGradient(0, 0, 0, stageY);
    bg.addColorStop(0, '#171B26'); bg.addColorStop(1, '#242A38');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, stageY);
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = `rgba(10,12,18,${0.10 + 0.10 * Math.sin(i * 2.1)})`;
      ctx.fillRect(W * (i / 16), 0, W * 0.03, stageY);
    }
    // stage floor
    ctx.fillStyle = '#3A2F26'; ctx.fillRect(0, stageY, W, H * 0.10);
    ctx.fillStyle = 'rgba(255,222,168,0.14)'; ctx.fillRect(0, stageY, W, Math.max(1, H * 0.004));
    // the audience, in the dark
    ctx.fillStyle = '#080A10'; ctx.fillRect(0, stageY + H * 0.10, W, H);
    const r = rng(515);
    for (let row = 0; row < 4; row++) {
      const ry2 = stageY + H * (0.155 + row * 0.075);
      for (let i = 0; i < 16; i++) {
        const hx = W * (0.02 + i * 0.063 + (row % 2) * 0.03);
        ctx.fillStyle = `rgba(16,18,26,${0.9 - row * 0.08})`;
        ctx.beginPath(); ctx.arc(hx, ry2, H * (0.020 + row * 0.004), 0, 6.3); ctx.fill();
        ctx.fillRect(hx - H * 0.024, ry2, H * 0.048, H * 0.06);
        r();
      }
    }
    // the spotlight on him
    const sx = W * 0.52;
    const beam = ctx.createLinearGradient(sx, 0, sx, stageY);
    beam.addColorStop(0, 'rgba(255,238,204,0.16)'); beam.addColorStop(1, 'rgba(255,238,204,0.02)');
    ctx.fillStyle = beam;
    ctx.beginPath(); ctx.moveTo(sx - W * 0.05, -H * 0.05); ctx.lineTo(sx + W * 0.05, -H * 0.05);
    ctx.lineTo(sx + W * 0.20, stageY); ctx.lineTo(sx - W * 0.20, stageY); ctx.closePath(); ctx.fill();
    pool(sx, stageY, W * 0.24, '#FFE6B4', 0.30, alpha);

    const img = A.gradFront || A.hsFront || A.front;
    if (img) {
      const hp = H * lerp(0.30, 0.34, k);
      ctx.fillStyle = 'rgba(10,8,6,0.42)';
      ctx.beginPath(); ctx.ellipse(sx, stageY, hp * 0.24, hp * 0.032, 0, 0, 6.3); ctx.fill();
      sprite(img, sx, stageY, hp, false, 0.2, 0, 1);
    }

    // her, three rows back, lit only by the stage
    if (her > 0.01) {
      const hx = W * 0.235, hy = stageY + H * 0.235;
      ctx.save(); ctx.globalAlpha = alpha * her;
      ctx.fillStyle = '#7A4E58';
      ctx.fillRect(hx - H * 0.036, hy - H * 0.010, H * 0.072, H * 0.085);
      ctx.fillStyle = '#8E6244';
      ctx.beginPath(); ctx.arc(hx, hy - H * 0.030, H * 0.028, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#1E1512';
      ctx.beginPath(); ctx.arc(hx, hy - H * 0.038, H * 0.030, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
      ctx.beginPath(); ctx.arc(hx - H * 0.024, hy - H * 0.038, H * 0.014, 0, 6.3); ctx.fill();
      // stage light on one side of her face
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = alpha * her * 0.5;
      const fl = ctx.createRadialGradient(hx + H * 0.014, hy - H * 0.030, 0, hx + H * 0.014, hy - H * 0.030, H * 0.055);
      fl.addColorStop(0, 'rgba(255,224,170,0.6)'); fl.addColorStop(1, 'rgba(255,224,170,0)');
      ctx.fillStyle = fl; ctx.fillRect(hx - H * 0.07, hy - H * 0.09, H * 0.14, H * 0.14);
      ctx.restore();
      ctx.restore();
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = alpha; vignette(ctx, W, H, 0.5, 0.5, 0.16, 0.80); ctx.restore();
  }

  /* ---------- 25 · goodbye ---------- */
  function goodbye(ctx, W, H, t, alpha) {
    const k = smooth(ease(0.524, 0.598, t));
    ctx.save(); ctx.globalAlpha = alpha;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0B1220'); g.addColorStop(0.55, '#16202F'); g.addColorStop(1, '#0A0E16');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const gy = H * 0.845;
    // the building he is leaving
    ctx.fillStyle = '#141A26'; ctx.fillRect(-W * 0.02, H * 0.02, W * 0.46, gy - H * 0.02);
    ctx.fillStyle = 'rgba(10,14,20,0.5)';
    ctx.fillRect(W * 0.42, H * 0.02, W * 0.022, gy - H * 0.02);
    const rb = rng(626);
    for (let row = 0; row < 6; row++) {
      for (let c2 = 0; c2 < 4; c2++) {
        const wx = W * (0.015 + c2 * 0.105), wy = H * (0.06 + row * 0.115);
        if (wy > gy - H * 0.34) continue;
        const lit = rb() > 0.68;
        ctx.fillStyle = lit ? 'rgba(255,198,124,0.50)' : 'rgba(34,46,64,0.85)';
        ctx.fillRect(wx, wy, W * 0.062, H * 0.070);
        ctx.fillStyle = 'rgba(10,14,20,0.55)';
        ctx.fillRect(wx, wy, W * 0.062, Math.max(1, H * 0.008));
        ctx.fillRect(wx + W * 0.029, wy, Math.max(1, W * 0.004), H * 0.070);
        if (lit) {
          ctx.fillStyle = 'rgba(255,198,124,0.10)';
          ctx.fillRect(wx - W * 0.008, wy - H * 0.008, W * 0.078, H * 0.086);
        }
      }
    }
    // the open door, and her in it
    const dx = W * 0.155, dw = W * 0.115, dyTop = gy - H * 0.30;
    ctx.fillStyle = '#0A0C12'; ctx.fillRect(dx - W * 0.014, dyTop - H * 0.016, dw + W * 0.028, H * 0.30 + H * 0.016);
    ctx.fillStyle = '#2A2016'; ctx.fillRect(dx - W * 0.008, dyTop - H * 0.010, dw + W * 0.016, H * 0.30 + H * 0.010);
    const dg = ctx.createLinearGradient(0, dyTop, 0, gy);
    dg.addColorStop(0, '#FFD79A'); dg.addColorStop(1, '#C98E48');
    ctx.fillStyle = dg; ctx.fillRect(dx, dyTop, dw, H * 0.30);
    // her silhouette in the doorway — standing, not waving
    const cxh = dx + dw * 0.50, hy = dyTop + H * 0.082;
    ctx.fillStyle = 'rgba(24,17,14,0.92)';
    ctx.beginPath();
    ctx.moveTo(cxh - dw * 0.40, dyTop + H * 0.300);
    ctx.lineTo(cxh - dw * 0.34, hy + H * 0.044);
    ctx.quadraticCurveTo(cxh - dw * 0.30, hy + H * 0.020, cxh - dw * 0.12, hy + H * 0.014);
    ctx.lineTo(cxh + dw * 0.12, hy + H * 0.014);
    ctx.quadraticCurveTo(cxh + dw * 0.30, hy + H * 0.020, cxh + dw * 0.34, hy + H * 0.044);
    ctx.lineTo(cxh + dw * 0.40, dyTop + H * 0.300);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(cxh, hy - H * 0.004, H * 0.023, 0, 6.3); ctx.fill();
    ctx.fillStyle = 'rgba(16,11,9,0.95)';
    ctx.beginPath(); ctx.arc(cxh, hy - H * 0.010, H * 0.026, Math.PI * 0.92, Math.PI * 2.08); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cxh - H * 0.022, hy + H * 0.012, H * 0.014, H * 0.026, 0.2, 0, 6.3); ctx.fill();
    const spill = ctx.createLinearGradient(0, gy, 0, H);
    spill.addColorStop(0, 'rgba(255,214,150,0.28)'); spill.addColorStop(1, 'rgba(255,214,150,0)');
    ctx.fillStyle = spill;
    ctx.beginPath(); ctx.moveTo(dx, gy); ctx.lineTo(dx + dw, gy);
    ctx.lineTo(dx + dw + W * 0.13, H); ctx.lineTo(dx - W * 0.10, H); ctx.closePath(); ctx.fill();

    // street
    ctx.fillStyle = '#10141C'; ctx.fillRect(0, gy, W, H - gy);
    ctx.fillStyle = 'rgba(150,180,220,0.10)'; ctx.fillRect(0, gy, W, Math.max(1, H * 0.004));
    // a waiting car, out of the light
    ctx.fillStyle = '#1A2029';
    ctx.fillRect(W * 0.74, gy - H * 0.075, W * 0.30, H * 0.075);
    ctx.fillRect(W * 0.795, gy - H * 0.125, W * 0.17, H * 0.055);
    ctx.fillStyle = 'rgba(120,160,200,0.18)';
    ctx.fillRect(W * 0.805, gy - H * 0.118, W * 0.15, H * 0.042);
    ctx.fillStyle = '#0A0C10';
    ctx.beginPath(); ctx.ellipse(W * 0.79, gy, W * 0.022, H * 0.014, 0, 0, 6.3); ctx.fill();
    ctx.beginPath(); ctx.ellipse(W * 0.965, gy, W * 0.022, H * 0.014, 0, 0, 6.3); ctx.fill();

    // him, walking away, with a case
    const img = A.hsWalk || A.hsSide || A.walk;
    if (img) {
      const hp = H * 0.40, bx = W * lerp(0.335, 0.655, k), by = gy + H * 0.012;
      const bob = Math.sin(k * 46) * hp * 0.012;
      ctx.fillStyle = 'rgba(6,8,12,0.45)';
      ctx.beginPath(); ctx.ellipse(bx, by, hp * 0.24, hp * 0.028, 0, 0, 6.3); ctx.fill();
      sprite(img, bx, by + bob, hp, false, 0, 0, 1);
      ctx.fillStyle = '#3A2E24';
      ctx.fillRect(bx + hp * 0.16, by - hp * 0.20 + bob, hp * 0.16, hp * 0.20);
      ctx.fillStyle = 'rgba(255,214,150,0.12)';
      ctx.fillRect(bx + hp * 0.16, by - hp * 0.20 + bob, hp * 0.16, Math.max(1, hp * 0.012));
    }
    vignette(ctx, W, H, 0.42, 0.55, 0.18, 0.78);
    ctx.restore();
  }

  /* ---------- 26 · the crossing ---------- */
  function crossing(ctx, W, H, t, alpha) {
    const k = ease(0.598, 0.652, t);
    const cx = W * 0.5, cy = H * 0.47, rx = W * 0.215, ry = H * 0.315;
    ctx.save(); ctx.globalAlpha = alpha;
    // the cabin wall first — then the view, clipped into the window
    ctx.fillStyle = '#090B11'; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.283); ctx.clip();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, mix('#0A1424', '#1B3050', k));
    g.addColorStop(0.46, mix('#182638', '#5E86AC', k));
    g.addColorStop(0.68, mix('#34405A', '#E4B489', k));
    g.addColorStop(0.80, mix('#22283A', '#F0CFA4', k));
    g.addColorStop(1, mix('#101620', '#7E8EA0', k));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // the sun sitting on the cloud deck, ahead of the wing
    const deck = H * lerp(0.76, 0.655, k);
    const sunX = W * 0.70, sunY = deck - H * 0.055;
    const gl = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, W * 0.34);
    gl.addColorStop(0, `rgba(255,242,212,${0.30 + 0.44 * k})`);
    gl.addColorStop(0.34, `rgba(255,214,158,${0.10 + 0.16 * k})`);
    gl.addColorStop(1, 'rgba(255,200,150,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H * 0.9);

    // stratus: flat-bottomed banks, lit along their tops
    const r = rng(99);
    for (let row = 0; row < 3; row++) {
      const ry2 = deck + row * H * 0.045;
      const scale = 1 - row * 0.22;
      for (let i = 0; i < 9; i++) {
        const cx = W * ((i * 0.135 + k * 0.22 + row * 0.06) % 1.28 - 0.14);
        const cw = W * (0.11 + r() * 0.14) * scale;
        const ch2 = H * (0.016 + r() * 0.020) * scale;
        const lit = mix('#5A6478', '#FFE6C0', 0.35 + 0.55 * k) ;
        ctx.fillStyle = rgba(lit, 0.30 + 0.24 * (1 - row * 0.3));
        ctx.beginPath();
        ctx.moveTo(cx - cw, ry2 + ch2);
        ctx.bezierCurveTo(cx - cw * 0.7, ry2 - ch2 * 1.4, cx - cw * 0.1, ry2 - ch2 * 0.5, cx + cw * 0.1, ry2 - ch2 * 0.9);
        ctx.bezierCurveTo(cx + cw * 0.6, ry2 - ch2 * 1.8, cx + cw * 0.9, ry2 - ch2 * 0.2, cx + cw, ry2 + ch2);
        ctx.closePath(); ctx.fill();
      }
    }
    // the deck itself, a soft floor of light
    const dg = ctx.createLinearGradient(0, deck - H * 0.03, 0, deck + H * 0.18);
    dg.addColorStop(0, rgba(mix('#8494A8', '#FFE8C4', k), 0.10));
    dg.addColorStop(0.4, rgba(mix('#7A8698', '#F2D3A8', k), 0.40));
    dg.addColorStop(1, rgba(mix('#4E5668', '#B69A86', k), 0.62));
    ctx.fillStyle = dg; ctx.fillRect(0, deck - H * 0.03, W, H * 0.30);

    // the wing, catching the last of the sun
    ctx.save();
    ctx.globalAlpha = alpha * cl(0.35 + 0.65 * k);
    const wingY = H * 0.635;
    ctx.fillStyle = mix('#5E6874', '#D8CBBC', 0.30 + 0.4 * k);
    ctx.beginPath();
    ctx.moveTo(W * 0.30, wingY + H * 0.075);
    ctx.lineTo(W * 0.92, wingY - H * 0.052);
    ctx.lineTo(W * 1.02, wingY - H * 0.030);
    ctx.lineTo(W * 0.34, wingY + H * 0.105);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba('#FFF0D4', 0.30 * k);
    ctx.beginPath();
    ctx.moveTo(W * 0.30, wingY + H * 0.075);
    ctx.lineTo(W * 0.92, wingY - H * 0.052);
    ctx.lineTo(W * 0.93, wingY - H * 0.044);
    ctx.lineTo(W * 0.31, wingY + H * 0.084);
    ctx.closePath(); ctx.fill();
    // the navigation light, blinking
    const blink = ((t * 220) % 1) > 0.72 ? 1 : 0.06;
    ctx.fillStyle = `rgba(255,190,180,${blink})`;
    ctx.beginPath(); ctx.arc(W * 0.965, wingY - H * 0.038, H * 0.006, 0, 6.3); ctx.fill();
    ctx.restore();

    // the cabin: we are inside, looking out through an oval
    ctx.restore();
    // the recess of the window: two rings and the shade above
    ctx.strokeStyle = 'rgba(150,158,170,0.30)';
    ctx.lineWidth = Math.max(3, W * 0.010);
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.283); ctx.stroke();
    ctx.strokeStyle = 'rgba(206,216,230,0.10)';
    ctx.lineWidth = Math.max(1, W * 0.0016);
    ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.92, ry * 0.94, 0, 0, 6.283); ctx.stroke();
    // his reflection in the glass, faint
    ctx.save();
    ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.94, ry * 0.95, 0, 0, 6.283); ctx.clip();
    const img = A.hsFront || A.nowFront || A.front;
    if (img) {
      ctx.globalAlpha = alpha * 0.10 * (1 - k * 0.4);
      sprite(img, W * 0.40, H * 0.80, H * 0.42, false, 0, 0, 0);
    }
    ctx.restore();
    pool(cx, cy, W * 0.32, '#C8DCEC', 0.05 + 0.10 * k, alpha);
    vignette(ctx, W, H, 0.5, 0.47, 0.14, 0.90);
    ctx.restore();
  }

  /* ---------- 27 · Lausanne ---------- */
  function lausanne(ctx, W, H, t, alpha) {
    const k = smooth(ease(0.652, 0.730, t));
    ctx.save(); ctx.globalAlpha = alpha;
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.72);
    g.addColorStop(0, '#5C7898'); g.addColorStop(0.55, '#A8BECD'); g.addColorStop(1, '#DCE4E6');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const horizon = H * 0.46;
    // the Alps across the lake
    ridge(ctx, W, H, horizon - H * 0.02, H * 0.14, 21, '#8FA2B4', 0.55, 7);
    ridge(ctx, W, H, horizon + H * 0.005, H * 0.09, 34, '#7C90A6', 0.66, 9);
    ctx.fillStyle = 'rgba(240,246,250,0.24)';
    ctx.fillRect(0, horizon - H * 0.032, W, H * 0.038);
    // the lake
    const lg = ctx.createLinearGradient(0, horizon, 0, horizon + H * 0.16);
    lg.addColorStop(0, '#5A7E94'); lg.addColorStop(1, '#3A5A70');
    ctx.fillStyle = lg; ctx.fillRect(0, horizon, W, H * 0.16);
    ctx.fillStyle = 'rgba(255,255,255,0.09)';
    for (let i = 0; i < 8; i++) ctx.fillRect(W * (0.05 + i * 0.12), horizon + H * (0.03 + i * 0.014), W * 0.07, 1);
    // campus: cold rectilinear blocks
    const gy = H * 0.80;
    ctx.fillStyle = '#6E7A82'; ctx.fillRect(0, horizon + H * 0.16, W, gy - horizon - H * 0.16);
    const r = rng(77);
    for (let i = 0; i < 7; i++) {
      const bx = W * (-0.05 + i * 0.17) - k * W * 0.10;
      const bw = W * (0.10 + r() * 0.06), bh = H * (0.10 + r() * 0.16);
      ctx.fillStyle = mix('#A2ACB2', '#6A747A', r());
      ctx.fillRect(bx, gy - bh, bw, bh);
      ctx.fillStyle = 'rgba(26,38,50,0.42)';
      ctx.fillRect(bx, gy - bh, bw * 0.18, bh);
      for (let f = 0; f < Math.floor(bh / (H * 0.032)); f++) {
        ctx.fillStyle = 'rgba(32,50,68,0.72)';
        ctx.fillRect(bx + bw * 0.24, gy - bh + H * 0.014 + f * H * 0.032, bw * 0.60, H * 0.016);
      }
      ctx.fillStyle = 'rgba(250,252,255,0.34)';
      ctx.fillRect(bx, gy - bh, bw, Math.max(1, H * 0.004));
    }
    // ground
    const fg = ctx.createLinearGradient(0, gy, 0, H);
    fg.addColorStop(0, '#8A9296'); fg.addColorStop(1, '#454B4E');
    ctx.fillStyle = fg; ctx.fillRect(0, gy, W, H - gy);
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(0, gy, W, Math.max(1, H * 0.004));

    const img = A.nowWalk || A.nowSide || A.hsWalk;
    if (img) {
      const hp = H * 0.30, bx = W * lerp(0.30, 0.52, k), by = gy + H * 0.075;
      const bob = Math.sin(k * 70) * hp * 0.012;
      ctx.fillStyle = 'rgba(40,48,56,0.26)';
      ctx.beginPath(); ctx.ellipse(bx, by, hp * 0.26, hp * 0.032, 0, 0, 6.3); ctx.fill();
      sprite(img, bx, by + bob, hp, false, 0, 0, 1);
    }
    // a bare tree and a low wall near camera — the cold has edges too
    ctx.fillStyle = 'rgba(48,54,58,0.9)';
    ctx.fillRect(W * 0.84, gy - H * 0.02, W * 0.014, H * 0.30);
    ctx.strokeStyle = 'rgba(48,54,58,0.85)'; ctx.lineWidth = Math.max(1, W * 0.0035);
    for (const a2 of [-0.9, -0.4, 0.4, 1.0]) {
      ctx.beginPath(); ctx.moveTo(W * 0.847, gy - H * 0.14);
      ctx.lineTo(W * 0.847 + Math.sin(a2) * W * 0.07, gy - H * 0.24);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(30,36,40,0.22)';
    ctx.beginPath(); ctx.ellipse(W * 0.847, gy + H * 0.28, W * 0.055, H * 0.012, 0, 0, 6.3); ctx.fill();
    const wl = ctx.createLinearGradient(0, H * 0.955, 0, H);
    wl.addColorStop(0, '#7A8288'); wl.addColorStop(1, '#3E4448');
    ctx.fillStyle = wl; ctx.fillRect(0, H * 0.955, W, H * 0.05);
    ctx.fillStyle = 'rgba(250,252,255,0.22)'; ctx.fillRect(0, H * 0.955, W, Math.max(1, H * 0.004));
    vignette(ctx, W, H, 0.5, 0.5, 0.30, 0.44, '#14202E');
    ctx.restore();
  }

  /* ---------- 28 · the loop ---------- */
  function loop(ctx, W, H, t, alpha) {
    const k = ease(0.730, 0.796, t);
    const cycle = (k * 4) % 1;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.fillStyle = '#12151C'; ctx.fillRect(0, 0, W, H);
    const floorY = H * 0.80;
    shell(ctx, W, H, floorY, '#2E3442', '#1E2330', '#282B34', '#14161C');
    // the same desk, again and again
    for (let i = -1; i < 3; i++) {
      const x = W * (i * 0.62 - cycle * 0.62 + 0.12);
      const a2 = 1 - Math.abs(x / W - 0.42) * 1.1;
      if (a2 <= 0.02) continue;
      ctx.save(); ctx.globalAlpha = alpha * cl(a2);
      ctx.fillStyle = '#4A422F'; ctx.fillRect(x, floorY - H * 0.20, W * 0.34, H * 0.018);
      ctx.fillStyle = 'rgba(255,232,180,0.10)'; ctx.fillRect(x, floorY - H * 0.20, W * 0.34, Math.max(1, H * 0.004));
      ctx.fillStyle = '#20232A'; ctx.fillRect(x + W * 0.09, floorY - H * 0.355, W * 0.17, H * 0.145);
      ctx.fillStyle = '#2A4256'; ctx.fillRect(x + W * 0.10, floorY - H * 0.345, W * 0.15, H * 0.125);
      const gl = 0.22 + 0.07 * Math.sin(k * 300 + i);
      pool(x + W * 0.175, floorY - H * 0.283, W * 0.24, '#7EAAD2', gl, alpha * cl(a2));
      ctx.fillStyle = '#2A2D36';
      ctx.fillRect(x + W * 0.135, floorY - H * 0.19, W * 0.08, H * 0.012);
      ctx.restore();
    }
    // a clock that never moves much
    ctx.strokeStyle = 'rgba(170,182,204,0.40)'; ctx.lineWidth = Math.max(1, H * 0.003);
    ctx.beginPath(); ctx.arc(W * 0.83, H * 0.24, H * 0.052, 0, 6.3); ctx.stroke();
    const ang = k * 26;
    ctx.beginPath(); ctx.moveTo(W * 0.83, H * 0.24);
    ctx.lineTo(W * 0.83 + Math.sin(ang) * H * 0.040, H * 0.24 - Math.cos(ang) * H * 0.040); ctx.stroke();
    // him, not moving
    const img = A.nowBack || A.hsBack || A.back;
    if (img) {
      const hp = H * 0.30, bx = W * 0.42, seatY = floorY - H * 0.02;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, seatY); ctx.clip();
      sprite(img, bx, seatY + hp * 0.34, hp, false, 0, 0, 0);
      ctx.restore();
      ctx.fillStyle = '#282B34';
      ctx.beginPath(); ctx.ellipse(bx, seatY + hp * 0.05, hp * 0.26, hp * 0.06, 0, 0, 6.3); ctx.fill();
    }
    ctx.fillStyle = `rgba(12,14,20,${0.10 + 0.10 * Math.sin(k * 12)})`;
    ctx.fillRect(0, 0, W, H);
    vignette(ctx, W, H, 0.44, 0.5, 0.20, 0.70);
    ctx.restore();
  }

  /* ---------- 29 · rewiring ---------- */
  function rewiring(ctx, W, H, t, alpha) {
    const k = smooth(ease(0.796, 0.864, t));
    ctx.save(); ctx.globalAlpha = alpha;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, mix('#0E1016', '#101A26', k));
    g.addColorStop(1, mix('#0A0C12', '#0E1620', k));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // the structure under everything, resolving into order
    const r = rng(1301);
    const N = 34;
    const pts = [];
    for (let i = 0; i < N; i++) {
      const rx = r(), ry = r();
      const col = i % 7, row = Math.floor(i / 7);
      const ox = W * (0.08 + rx * 0.84), oy = H * (0.10 + ry * 0.80);
      const gx = W * (0.12 + col * 0.128), gy2 = H * (0.20 + row * 0.145);
      pts.push({ x: lerp(ox, gx, k), y: lerp(oy, gy2, k), a: 0.3 + r() * 0.7 });
    }
    ctx.lineWidth = Math.max(1, H * 0.0016);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.hypot(dx, dy);
        if (d > W * 0.17) continue;
        ctx.strokeStyle = `rgba(126,196,232,${(1 - d / (W * 0.17)) * 0.30 * (0.25 + k)})`;
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
      }
    }
    for (const p of pts) {
      ctx.fillStyle = `rgba(180,226,250,${0.32 + 0.5 * k * p.a})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, H * (0.0035 + 0.004 * k), 0, 6.3); ctx.fill();
    }
    // the ground returns under him
    const gy = H * 0.86;
    ctx.fillStyle = `rgba(20,28,38,${0.4 + 0.5 * k})`; ctx.fillRect(0, gy, W, H - gy);
    ctx.fillStyle = `rgba(126,196,232,${0.16 + 0.2 * k})`; ctx.fillRect(0, gy, W, Math.max(1, H * 0.0035));
    const img = A.nowSide || A.hsSide;
    if (img) {
      const hp = H * 0.34, bx = W * lerp(0.40, 0.52, k);
      ctx.fillStyle = 'rgba(8,12,18,0.5)';
      ctx.beginPath(); ctx.ellipse(bx, gy, hp * 0.24, hp * 0.028, 0, 0, 6.3); ctx.fill();
      sprite(img, bx, gy, hp, false, 0.55, 0, 1);
    }
    vignette(ctx, W, H, 0.5, 0.5, 0.16, 0.82);
    ctx.restore();
  }

  /* ---------- 30 · the trail ---------- */
  function trail(ctx, W, H, t, alpha) {
    const k = smooth(ease(0.864, 0.940, t));
    ctx.save(); ctx.globalAlpha = alpha;
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.8);
    g.addColorStop(0, '#3E6E9C'); g.addColorStop(0.42, '#93B8D2'); g.addColorStop(1, '#EFE6D0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    pool(W * 0.74, H * 0.15, W * 0.44, '#FFF4D8', 0.34, alpha);
    const base = H * lerp(0.60, 0.50, k);
    ridge(ctx, W, H, base - H * 0.10, H * 0.20, 11, '#BDD0DC', 0.50, 6);
    ridge(ctx, W, H, base - H * 0.03, H * 0.17, 23, '#95AFC1', 0.66, 7);
    ridge(ctx, W, H, base + H * 0.06, H * 0.14, 47, '#6B8798', 0.82, 8);
    ridge(ctx, W, H, base + H * 0.16, H * 0.11, 61, '#495F68', 1, 9);
    // snow on the far tops
    ctx.save(); ctx.globalAlpha = alpha * 0.42;
    ridge(ctx, W, H, base - H * 0.108, H * 0.196, 11, '#F4F8FA', 0.5, 6);
    ctx.restore();
    // haze in the valley between the ranges
    const hz = ctx.createLinearGradient(0, base + H * 0.02, 0, base + H * 0.20);
    hz.addColorStop(0, 'rgba(238,232,216,0.44)'); hz.addColorStop(1, 'rgba(238,232,216,0)');
    ctx.fillStyle = hz; ctx.fillRect(0, base + H * 0.02, W, H * 0.20);

    // the near slope he is on
    const gy = H * lerp(0.90, 0.84, k);
    const slope = (yOff) => {
      ctx.beginPath();
      ctx.moveTo(-W * 0.05, H * 1.15);
      ctx.lineTo(-W * 0.05, gy + yOff);
      ctx.quadraticCurveTo(W * 0.42, gy - H * 0.045 + yOff, W * 1.05, gy + H * 0.07 + yOff);
      ctx.lineTo(W * 1.05, H * 1.15);
      ctx.closePath();
    };
    ctx.fillStyle = '#586A4A'; slope(H * 0.05); ctx.fill();
    // sunlit grass along the crest
    ctx.fillStyle = 'rgba(226,214,164,0.42)';
    ctx.beginPath();
    ctx.moveTo(-W * 0.05, gy + H * 0.062);
    ctx.quadraticCurveTo(W * 0.42, gy - H * 0.032, W * 1.05, gy + H * 0.082);
    ctx.lineTo(W * 1.05, gy + H * 0.104);
    ctx.quadraticCurveTo(W * 0.42, gy - H * 0.010, -W * 0.05, gy + H * 0.084);
    ctx.closePath(); ctx.fill();
    // the path, worn pale, running away up the slope
    ctx.fillStyle = 'rgba(216,204,176,0.62)';
    ctx.beginPath();
    ctx.moveTo(W * 0.10, H * 1.02);
    ctx.quadraticCurveTo(W * 0.34, gy + H * 0.10, W * 0.52, gy + H * 0.030);
    ctx.lineTo(W * 0.565, gy + H * 0.036);
    ctx.quadraticCurveTo(W * 0.40, gy + H * 0.118, W * 0.22, H * 1.02);
    ctx.closePath(); ctx.fill();

    // pines, thinning as the slope falls away
    const r = rng(313);
    for (let i = 0; i < 11; i++) {
      const px = W * (-0.02 + r() * 1.06);
      if (px > W * 0.16 && px < W * 0.60) continue;      // keep the path clear
      const ph = H * (0.055 + r() * 0.075) * (0.7 + k * 0.4);
      const py = gy + H * (0.062 + r() * 0.060);
      ctx.fillStyle = 'rgba(38,52,34,0.22)';
      ctx.beginPath(); ctx.ellipse(px + ph * 0.10, py, ph * 0.24, ph * 0.045, 0, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#3A2A1E';
      ctx.fillRect(px - ph * 0.026, py - ph * 0.18, ph * 0.052, ph * 0.18);
      const dark = mix('#2C4028', '#40563A', r());
      for (let s2 = 0; s2 < 3; s2++) {
        const tw = ph * (0.30 - s2 * 0.075), ty = py - ph * (0.16 + s2 * 0.26);
        ctx.fillStyle = s2 === 2 ? mix(dark, '#7E9464', 0.30) : dark;
        ctx.beginPath();
        ctx.moveTo(px - tw, ty); ctx.lineTo(px + tw, ty);
        ctx.lineTo(px, ty - ph * 0.34); ctx.closePath(); ctx.fill();
      }
    }

    const img = A.nowWalk || A.nowSide;
    if (img) {
      const hp = H * lerp(0.195, 0.105, k);
      const bx = W * lerp(0.30, 0.44, k), by = gy + H * lerp(0.048, 0.030, k);
      const bob = Math.sin(k * 58) * hp * 0.012;
      ctx.fillStyle = 'rgba(30,40,30,0.30)';
      ctx.beginPath(); ctx.ellipse(bx, by, hp * 0.26, hp * 0.038, 0, 0, 6.3); ctx.fill();
      sprite(img, bx, by + bob, hp, false, 0.7, 0, 1);
    }
    vignette(ctx, W, H, 0.5, 0.5, 0.34, 0.38, '#2A3A44');
    ctx.restore();
  }

  /* ---------- 31 · now ---------- */
  function now(ctx, W, H, t, alpha) {
    const k = smooth(ease(0.940, 1.000, t));
    ctx.save(); ctx.globalAlpha = alpha;
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.9);
    g.addColorStop(0, '#2E4A6E'); g.addColorStop(0.42, '#8AA2B8');
    g.addColorStop(0.74, '#E4C49A'); g.addColorStop(1, '#F2DCB6');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    pool(W * 0.80, H * 0.30, W * 0.46, '#FFEBC4', 0.40, alpha);
    // everything he walked, small and hazed, receding behind him
    const gy = H * 0.815;
    const far = '#E8D8BC';
    function mark(x, w, h, hz, kind, seed) {
      const bx = W * x, bw = W * w, bh = H * h, by = gy - bh;
      const body = mix('#9A8E78', far, hz);
      ctx.fillStyle = body;
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = rgba('#FFF6E0', 0.30 * (1 - hz));
      ctx.fillRect(bx, by, bw, Math.max(1, H * 0.0035));
      ctx.fillStyle = rgba('#5E5238', 0.14 * (1 - hz));
      ctx.fillRect(bx, by, bw * 0.16, bh);
      const r2 = rng(seed);
      if (kind === 'block') {
        for (let f = 0; f < Math.max(2, Math.floor(bh / (H * 0.013))); f++) {
          for (let c2 = 0; c2 < 3; c2++) {
            if (r2() > 0.62) continue;
            ctx.fillStyle = rgba('#4E4636', 0.30 * (1 - hz));
            ctx.fillRect(bx + bw * (0.18 + c2 * 0.26), by + H * 0.006 + f * H * 0.013, bw * 0.16, H * 0.006);
          }
        }
      } else if (kind === 'minaret') {
        ctx.fillStyle = body;
        ctx.fillRect(bx + bw * 0.16, by - H * 0.014, bw * 0.68, H * 0.014);
        ctx.beginPath();
        ctx.moveTo(bx + bw * 0.16, by - H * 0.014);
        ctx.lineTo(bx + bw * 0.84, by - H * 0.014);
        ctx.lineTo(bx + bw * 0.5, by - H * 0.032);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = rgba('#4E4636', 0.22 * (1 - hz));
        ctx.fillRect(bx + bw * 0.34, by + bh * 0.20, bw * 0.30, bh * 0.16);
      } else if (kind === 'goal') {
        ctx.fillStyle = rgba('#5E5238', 0.30 * (1 - hz));
        ctx.fillRect(bx, by, Math.max(1, bw * 0.05), bh);
        ctx.fillRect(bx + bw * 0.95, by, Math.max(1, bw * 0.05), bh);
        ctx.fillRect(bx, by, bw, Math.max(1, H * 0.003));
      } else if (kind === 'campus') {
        for (let f = 0; f < Math.max(2, Math.floor(bh / (H * 0.016))); f++) {
          ctx.fillStyle = rgba('#48566A', 0.34 * (1 - hz));
          ctx.fillRect(bx + bw * 0.14, by + H * 0.006 + f * H * 0.016, bw * 0.72, H * 0.008);
        }
      }
    }
    const marks = [
      { x: 0.045, w: 0.062, h: 0.072, kind: 'block', seed: 3 },
      { x: 0.128, w: 0.048, h: 0.030, kind: 'goal', seed: 7 },
      { x: 0.205, w: 0.070, h: 0.048, kind: 'block', seed: 11 },
      { x: 0.302, w: 0.026, h: 0.086, kind: 'minaret', seed: 19 },
      { x: 0.368, w: 0.055, h: 0.040, kind: 'block', seed: 23 },
      { x: 0.452, w: 0.078, h: 0.052, kind: 'campus', seed: 31 },
      { x: 0.556, w: 0.044, h: 0.066, kind: 'campus', seed: 41 }
    ];
    for (let i = 0; i < marks.length; i++) {
      const m = marks[i];
      ctx.save();
      ctx.globalAlpha = alpha * cl(ease(0.944 + i * 0.006, 0.966 + i * 0.006, t));
      mark(m.x, m.w, m.h, 0.74 - i * 0.085, m.kind, m.seed);
      ctx.restore();
    }
    ridge(ctx, W, H, gy - H * 0.012, H * 0.048, 5, mix('#A89C82', far, 0.35), 0.42, 11);
    // the ridge he is standing on
    ctx.fillStyle = '#6E6248';
    ctx.beginPath(); ctx.moveTo(-W * 0.05, H * 1.1); ctx.lineTo(-W * 0.05, gy + H * 0.055);
    ctx.quadraticCurveTo(W * 0.5, gy + H * 0.015, W * 1.05, gy + H * 0.075);
    ctx.lineTo(W * 1.05, H * 1.1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,236,196,0.34)';
    ctx.beginPath(); ctx.moveTo(-W * 0.05, gy + H * 0.055);
    ctx.quadraticCurveTo(W * 0.5, gy + H * 0.015, W * 1.05, gy + H * 0.075);
    ctx.lineTo(W * 1.05, gy + H * 0.088);
    ctx.quadraticCurveTo(W * 0.5, gy + H * 0.028, -W * 0.05, gy + H * 0.068);
    ctx.closePath(); ctx.fill();
    // him, looking at what is still unbuilt
    const img = A.nowBack || A.nowSide;
    if (img) {
      const hp = H * 0.235, bx = W * 0.375, by = gy + H * 0.062;
      ctx.fillStyle = 'rgba(60,48,30,0.30)';
      ctx.beginPath(); ctx.ellipse(bx, by, hp * 0.26, hp * 0.035, 0, 0, 6.3); ctx.fill();
      sprite(img, bx, by, hp, false, 0.85, 0, 1);
    }
    // the path ahead, unfinished
    ctx.save();
    ctx.globalAlpha = alpha * k;
    const pg = ctx.createLinearGradient(W * 0.6, gy, W * 1.05, gy);
    pg.addColorStop(0, 'rgba(255,244,214,0)'); pg.addColorStop(1, 'rgba(255,244,214,0.42)');
    ctx.fillStyle = pg; ctx.fillRect(W * 0.6, gy - H * 0.02, W * 0.45, H * 0.10);
    ctx.restore();
    vignette(ctx, W, H, 0.5, 0.5, 0.32, 0.42, '#2A2418');
    ctx.restore();
  }

  /* ---------- chapter weights ---------- */
  function weights2(t) {
    const w = {};
    w.machine = 1 - ease(0.230, 0.262, t);
    w.growing = ease(0.230, 0.262, t) * (1 - ease(0.310, 0.338, t));
    w.school = ease(0.310, 0.338, t) * (1 - ease(0.392, 0.416, t));
    w.stage = ease(0.392, 0.416, t) * (1 - ease(0.512, 0.538, t));
    w.goodbye = ease(0.512, 0.538, t) * (1 - ease(0.586, 0.610, t));
    w.crossing = ease(0.586, 0.610, t) * (1 - ease(0.640, 0.664, t));
    w.lausanne = ease(0.640, 0.664, t) * (1 - ease(0.718, 0.742, t));
    w.loop = ease(0.718, 0.742, t) * (1 - ease(0.784, 0.808, t));
    w.rewiring = ease(0.784, 0.808, t) * (1 - ease(0.852, 0.878, t));
    w.trail = ease(0.852, 0.878, t) * (1 - ease(0.928, 0.952, t));
    w.now = ease(0.928, 0.952, t);
    return w;
  }

  const FN = { machine, growing, school, stage, goodbye, crossing, lausanne, loop, rewiring, trail, now };

  function render(t, alpha) {
    const ctx = api.ctx, W = api.W, H = api.H;
    const w = weights2(t);
    for (const key of ['machine', 'growing', 'school', 'stage', 'goodbye', 'crossing', 'lausanne', 'loop', 'rewiring', 'trail', 'now']) {
      if (w[key] > 0.004) FN[key](ctx, W, H, t, alpha * w[key], 'teen');
    }
  }

  function beatAt(t) {
    let bi = 0;
    for (let i = 0; i < BEATS2.length; i++) if (t >= BEATS2[i].t0) bi = i;
    return bi;
  }

  // one line of text per chapter beat that earns it
  function caption(t) {
    if (t > 0.104 && t < 0.150) return 1;
    if (t > 0.548 && t < 0.590) return 2;
    if (t > 0.812 && t < 0.856) return 3;
    if (t > 0.966) return 4;
    return 0;
  }

  const LIGHT2 = [
    { t: 0.000, day: 0.16, evening: 0.10 },
    { t: 0.240, day: 0.16, evening: 0.10 },
    { t: 0.300, day: 0.55, evening: 0.20 },
    { t: 0.350, day: 0.96, evening: 0.02 },
    { t: 0.404, day: 0.96, evening: 0.02 },
    { t: 0.440, day: 0.22, evening: 0.14 },
    { t: 0.560, day: 0.26, evening: 0.30 },
    { t: 0.640, day: 0.74, evening: 0.20 },
    { t: 0.700, day: 0.96, evening: 0.00 },
    { t: 0.760, day: 0.24, evening: 0.10 },
    { t: 0.830, day: 0.34, evening: 0.06 },
    { t: 0.900, day: 1.00, evening: 0.02 },
    { t: 1.000, day: 0.96, evening: 0.34 }
  ];
  function light(t) {
    if (t <= LIGHT2[0].t) return LIGHT2[0];
    const last = LIGHT2[LIGHT2.length - 1];
    if (t >= last.t) return last;
    let i = 0;
    while (i < LIGHT2.length - 1 && LIGHT2[i + 1].t < t) i++;
    const a = LIGHT2[i], b = LIGHT2[i + 1];
    const k = smooth(cl((t - a.t) / (b.t - a.t || 1)));
    return { day: lerp(a.day, b.day, k), evening: lerp(a.evening, b.evening, k) };
  }

  return { render, beatAt, caption, light, BEATS2, machineAt: (t, alpha) => machine(api.ctx, api.W, api.H, t, alpha, 'child') };
}
