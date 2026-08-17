import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
const files = process.argv.slice(3);
const OUT = process.argv[2];
const imgs = files.map(f => ({ n: f, p: PNG.sync.read(readFileSync(f)) }));
const H = Math.max(...imgs.map(i => i.p.height)) + 16;
const W = imgs.reduce((a, i) => a + i.p.width + 16, 0);
const out = new PNG({ width: W, height: H });
// magenta ground so any leftover background or eaten pixels are obvious
for (let i = 0; i < W * H; i++) {
  out.data[i*4] = 255; out.data[i*4+1] = 0; out.data[i*4+2] = 190; out.data[i*4+3] = 255;
}
let x = 8;
for (const { p } of imgs) {
  const y = H - 8 - p.height;
  for (let sy = 0; sy < p.height; sy++) for (let sx = 0; sx < p.width; sx++) {
    const s = (sy*p.width+sx)*4, a = p.data[s+3]/255;
    if (a <= 0.002) continue;
    const d = ((y+sy)*W + (x+sx))*4;
    for (let c = 0; c < 3; c++) out.data[d+c] = Math.round(p.data[s+c]*a + out.data[d+c]*(1-a));
  }
  x += p.width + 16;
}
writeFileSync(OUT, PNG.sync.write(out));
console.log("wrote", OUT, W+"x"+H);
