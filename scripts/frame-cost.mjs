import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 900 },
  reducedMotion: "no-preference",
});
await page.goto("http://localhost:3000/?motion=full", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /walk through it/i }).click();
await page.waitForTimeout(1500);

// How much of each frame is our JavaScript, and how much is the browser?
const result = await page.evaluate(
  () =>
    new Promise((res) => {
      const orig = window.requestAnimationFrame.bind(window);
      let jsTime = 0;
      let frames = 0;
      window.requestAnimationFrame = (cb) =>
        orig((t) => {
          const a = performance.now();
          try {
            cb(t);
          } finally {
            jsTime += performance.now() - a;
            frames++;
          }
        });

      const f = document.querySelector(".world-frame");
      f.focus();
      f.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", key: "ArrowRight", bubbles: true }));

      const t0 = performance.now();
      setTimeout(() => {
        const wall = performance.now() - t0;
        f.dispatchEvent(new KeyboardEvent("keyup", { code: "ArrowRight", key: "ArrowRight", bubbles: true }));
        window.requestAnimationFrame = orig;
        res({
          wallMs: Math.round(wall),
          frames,
          fps: Math.round((frames / wall) * 1000),
          jsMsPerFrame: +(jsTime / Math.max(1, frames)).toFixed(2),
          browserMsPerFrame: +((wall - jsTime) / Math.max(1, frames)).toFixed(2),
        });
      }, 3000);
    }),
);

console.log(JSON.stringify(result, null, 1));
await browser.close();
