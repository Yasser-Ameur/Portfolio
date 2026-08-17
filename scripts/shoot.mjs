import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = process.argv[2] ?? "shots";
mkdirSync(OUT, { recursive: true });

// world x → filename. Walk there by driving the engine's own input.
const STOPS = [
  ["01-threshold", -480],
  ["02-yard", 900],
  ["03-yard-window", 2060],
  ["04-room-street", 2900],
  ["05-room-desk", 3930],
  ["06-school", 5600],
  ["07-stage", 8180],
  ["08-goodbye-together", 9400],
  ["09-goodbye-stop", 9960],
  ["10-crossing", 11200],
  ["11-arrival", 12200],
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 2,
  reducedMotion: "no-preference",
});

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto("http://localhost:3000/?motion=full", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /walk through it/i }).click();
await page.waitForTimeout(1400);

for (const [name, target] of STOPS) {
  // Hold the forward key until the engine reports the character has arrived.
  const arrived = await page.evaluate(async (tx) => {
    const f = document.querySelector(".world-frame");
    f.focus();
    const key = (type, code) =>
      f.dispatchEvent(new KeyboardEvent(type, { code, key: code, bubbles: true }));

    // The actor's transform is the only public read-out of world position.
    const readX = () => {
      const a = document.querySelectorAll(".world-plane--ground .actor");
      const el = a[a.length - 1];
      const m = /translate3d\((-?[\d.]+)px/.exec(el?.style.transform ?? "");
      return m ? parseFloat(m[1]) + 200 : 0;
    };

    const dir = readX() < tx ? "ArrowRight" : "ArrowLeft";
    const t0 = performance.now();
    let stalled = 0;
    let lastX = readX();
    while (performance.now() - t0 < 40000) {
      const x = readX();
      if (dir === "ArrowRight" ? x >= tx : x <= tx) break;
      // Re-press periodically: a scripted beat may consume the hold as a skip.
      if (Math.abs(x - lastX) < 0.5) {
        stalled++;
        if (stalled % 30 === 0) {
          key("keyup", dir);
          key("keydown", dir);
        }
      } else {
        stalled = 0;
      }
      lastX = x;
      await new Promise((r) => requestAnimationFrame(r));
    }
    key("keyup", dir);
    key("keyup", "ArrowRight");
    key("keyup", "ArrowLeft");
    return Math.round(readX());
  }, target);

  // Let beats play and the camera settle.
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`shot ${name}  target=${target} actual=${arrived}`);
}

console.log(errors.length ? "CONSOLE ERRORS:\n" + errors.join("\n") : "no console errors");
await browser.close();
