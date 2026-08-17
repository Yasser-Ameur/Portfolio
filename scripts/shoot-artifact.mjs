/** Render the downloaded Claude artifact build so we can see what it looks like. */
import pw from "playwright";
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const { chromium } = pw;
mkdirSync("dcshots", { recursive: true });

const file = join(process.cwd(), "2.5D Portfolio Autobiography", "Casablanca.dc.html");
const url = pathToFileURL(file).href;

const b = await chromium.launch({
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--allow-file-access-from-files",
  ],
});
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));

await p.goto(url, { waitUntil: "load", timeout: 60000 });
await p.waitForTimeout(6000);

const info = await p.evaluate(() => ({
  h: document.documentElement.scrollHeight,
  canvases: document.querySelectorAll("canvas").length,
  text: document.body.innerText.slice(0, 300),
}));
console.log("scrollHeight", info.h, "canvases", info.canvases);
console.log("TEXT:", JSON.stringify(info.text));

for (const f of [0, 0.12, 0.3, 0.5, 0.72, 0.9]) {
  await p.evaluate((v) => {
    const m = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, m * v);
  }, f);
  await p.waitForTimeout(2200);
  await p.screenshot({ path: `dcshots/dc-${Math.round(f * 100)}.png`, timeout: 60000 });
  console.log("shot", f);
}

console.log(errs.length ? "ERRORS: " + errs.slice(0, 4).join(" | ") : "no errors");
await b.close();
