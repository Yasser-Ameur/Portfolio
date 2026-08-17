import pw from "playwright";
import { mkdirSync } from "node:fs";
const { chromium } = pw;

const OUT = process.argv[2] ?? "shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
  ],
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
});

const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto("http://localhost:3000/?perf=low", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);

/** Hold keys for a while, then shoot. */
async function move(keys, ms, name) {
  for (const k of keys) await page.keyboard.down(k);
  await page.waitForTimeout(ms);
  await page.screenshot({ path: `${OUT}/${name}.png`, timeout: 90000, animations: "allow" });
  for (const k of keys) await page.keyboard.up(k);
  await page.waitForTimeout(350);
  console.log("shot", name);
}

await page.screenshot({ path: `${OUT}/00-start.png`, timeout: 90000, animations: "allow" });
console.log("shot 00-start");

// west along the street toward the sea
await move(["KeyA"], 1500, "01-street");
await move(["KeyA", "ShiftLeft"], 2000, "02-running-west");
await move(["KeyA", "ShiftLeft"], 2400, "03-the-reveal");
await move(["KeyD"], 1400, "04-looking-back-east");
await move(["KeyS"], 1200, "05-toward-the-pitch");
await move(["KeyS"], 1500, "06-at-the-pitch");

const stats = await page.locator('[data-testid="stats"]').innerText().catch(() => "n/a");
console.log("\nPERF:\n" + stats);
console.log(errors.length ? "\nERRORS:\n" + errors.join("\n") : "\nno console errors");
await browser.close();
