/**
 * Capture the Morocco sequence at every beat, forward then backward.
 *
 * Backward is not a nice-to-have here: the whole architecture claims the
 * sequence is a pure function of scroll, and this is what proves it.
 */
import pw from "playwright";
import { mkdirSync } from "node:fs";
const { chromium } = pw;

const OUT = process.argv[2] ?? "shots";
mkdirSync(OUT, { recursive: true });

const BEATS = [
  ["01-first-light", 0.02],
  ["02-the-building", 0.08],
  ["03-casablanca", 0.145],
  ["04-the-room", 0.215],
  ["05-the-glance", 0.268],
  ["06-out", 0.305],
  ["07-stairwell", 0.365],
  ["08-the-street", 0.435],
  ["09-friends", 0.5],
  ["10-street-football", 0.575],
  ["11-the-field", 0.648],
  ["12-the-climb", 0.72],
  ["13-the-reveal", 0.8],
  ["14-hold", 0.86],
  ["15-home", 0.91],
  ["16-the-room-again", 0.962],
  ["17-curiosity", 0.995],
];

/** Stop-anywhere positions from the directive — every frame must be valid. */
const ARBITRARY = [0.073, 0.154, 0.247, 0.276, 0.412, 0.557, 0.603, 0.721, 0.801, 0.866, 0.947, 0.993];

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });

const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto("http://localhost:3000/?perf=low", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.getByRole("button", { name: /scroll to begin/i }).click().catch(() => {});
await page.waitForTimeout(1200);

async function seek(p) {
  await page.evaluate((v) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, max * v);
  }, p);
  // let the smoothing settle
  await page.waitForTimeout(1400);
}

async function shot(name, p) {
  await seek(p);
  await page.screenshot({ path: `${OUT}/${name}.png`, timeout: 60000, animations: "allow" });
  console.log(`shot ${name}  p=${p}`);
}

console.log("--- FORWARD ---");
for (const [name, p] of BEATS) await shot(name, p);

const perf = await page.locator('[data-testid="stats"]').innerText().catch(() => "n/a");

console.log("--- BACKWARD ---");
for (let i = BEATS.length - 1; i >= 0; i -= 4) {
  const [name, p] = BEATS[i];
  await shot(`rev-${name}`, p);
}

console.log("--- STOP-ANYWHERE ---");
for (const p of ARBITRARY) {
  await seek(p);
  const blank = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    return !gl || gl.isContextLost();
  });
  console.log(`  p=${p}  ${blank ? "!! CONTEXT LOST" : "ok"}`);
}

console.log("\nPERF:\n" + perf);
console.log(errors.length ? "\nERRORS:\n" + errors.slice(0, 6).join("\n") : "\nno console errors");
await browser.close();
