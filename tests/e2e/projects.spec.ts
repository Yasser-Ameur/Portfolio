const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const SHOTS = path.join(process.cwd(), "artifacts");

test.describe.configure({ mode: "serial" });

const WAIT_TRAVEL = 1800;

test("project world navigates between systems", async ({ page }) => {
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/projects");
  await page.waitForTimeout(2200);

  await expect(page.getByRole("heading", { name: /MiniGoogle/i })).toBeVisible();
  await expect(page.getByText(/System 01 \/ 08/i)).toBeVisible();

  // next arrow → NotiFly
  await page.getByRole("button", { name: /Next project/i }).click();
  await page.waitForTimeout(WAIT_TRAVEL);
  await expect(page.getByRole("heading", { name: /NotiFly/i })).toBeVisible();

  // keyboard → NEXUS
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(WAIT_TRAVEL);
  await expect(page.getByRole("heading", { name: /NEXUS/i })).toBeVisible();

  // progress dots count = 8
  await expect(page.getByRole("button", { name: /Go to Pulse/i })).toBeVisible();

  // Home/End keyboard
  await page.keyboard.press("End");
  await page.waitForTimeout(WAIT_TRAVEL);
  await expect(page.getByRole("heading", { name: /ATLAS/i })).toBeVisible();
  await page.keyboard.press("Home");
  await page.waitForTimeout(WAIT_TRAVEL);
  await expect(page.getByRole("heading", { name: /MiniGoogle/i })).toBeVisible();

  expect(errors).toEqual([]);
});

test("project detail pages are reachable and honest", async ({ page }) => {
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/projects");
  await page.waitForTimeout(1800);

  await page.getByRole("link", { name: /Details/i }).first().click();
  await page.waitForTimeout(1200);
  await expect(page).toHaveURL(/\/projects\/minigoogle/);
  await expect(page.getByRole("heading", { name: /MiniGoogle/i })).toBeVisible();
  await expect(page.getByText(/Why I built it/i)).toBeVisible();
  await expect(page.getByText(/02 · Architecture/i)).toBeVisible();
  await expect(page.getByText(/03 · Key engineering decisions/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /View on GitHub/i })).toHaveAttribute(
    "href",
    /github\.com/
  );

  await page.getByRole("link", { name: /Back to the system map/i }).click();
  await page.waitForTimeout(1200);
  await expect(page).toHaveURL(/\/projects$/);

  // every project route resolves
  for (const slug of [
    "notifly",
    "nexus",
    "pulse",
    "flowos",
    "deenii",
    "api-management",
    "atlas",
  ]) {
    await page.goto(`/projects/${slug}`);
    await page.waitForTimeout(600);
    await expect(page.locator("h1")).not.toBeEmpty();
  }

  // unknown route → not found
  await page.goto("/projects/does-not-exist");
  await expect(page.getByText(/404|not found/i).first()).toBeVisible();

  expect(
    errors.filter((e) => !e.includes("404"))
  ).toEqual([]);
});

test("project world home navigation", async ({ page }) => {
  await page.goto("/projects");
  await page.waitForTimeout(1800);
  await page.getByRole("link", { name: /Return home/i }).click();
  await page.waitForTimeout(1400);
  await expect(page).toHaveURL(/\/$/);
});

test("project world mobile", async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/projects");
  await page.waitForTimeout(2200);
  await expect(page.getByRole("heading", { name: /MiniGoogle/i })).toBeVisible();

  fs.mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, "projects-mobile-2.png") });

  // tap next
  await page.getByRole("button", { name: /Next project/i }).tap();
  await page.waitForTimeout(WAIT_TRAVEL);
  await expect(page.getByRole("heading", { name: /NotiFly/i })).toBeVisible();

  // detail on mobile
  await page.getByRole("link", { name: /Details/i }).first().tap();
  await page.waitForTimeout(1200);
  await expect(page).toHaveURL(/\/projects\/notifly/);

  expect(errors).toEqual([]);
  await ctx.close();
});
