const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const SHOTS = path.join(process.cwd(), "artifacts");

test.describe.configure({ mode: "serial" });

test("home world renders and navigates", async ({ page }) => {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));

  await page.goto("/");
  await page.waitForTimeout(2600);

  await expect(
    page.getByRole("heading", { name: /Yasser Ameur/i })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /My Story/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Projects/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /About/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Contact/i })).toBeVisible();

  fs.mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, "home.png") });

  await page.getByRole("link", { name: /My Story/i }).hover();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, "home-hover.png") });

  await page.getByRole("link", { name: /My Story/i }).click();
  await page.waitForTimeout(2200);
  await expect(page).toHaveURL(/\/story/);
  await page.screenshot({ path: path.join(SHOTS, "story.png") });

  await page.keyboard.press("Escape");
  await page.waitForTimeout(2200);
  await expect(page).toHaveURL(/\/$/);
  await page.screenshot({ path: path.join(SHOTS, "home-return.png") });

  await page.getByRole("link", { name: /Projects/i }).click();
  await page.waitForTimeout(2200);
  await expect(page).toHaveURL(/\/projects/);
  await page.screenshot({ path: path.join(SHOTS, "projects.png") });

  await page.getByRole("link", { name: /Return home/i }).click();
  await page.waitForTimeout(2200);
  await expect(page).toHaveURL(/\/$/);

  expect(errors).toEqual([]);
});

test("story world travels between milestones", async ({ page }) => {
  await page.goto("/story");
  await page.waitForTimeout(2200);

  await expect(page.getByText(/It started with curiosity/i)).toBeVisible();

  await page.locator("[data-football]").click({ force: true });
  await page.waitForTimeout(400);

  await page.getByRole("button", { name: /Next milestone/i }).click();
  await page.waitForTimeout(4000);
  await expect(page.getByText(/Morocco shaped where I came from/i)).toBeVisible();

  await page.getByRole("button", { name: /Previous milestone/i }).click();
  await page.waitForTimeout(4000);
  await expect(page.getByText(/It started with curiosity/i)).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(4000);
  await expect(page.getByText(/Morocco shaped where I came from/i)).toBeVisible();

  await page.screenshot({ path: path.join(SHOTS, "story-marrakech.png") });
});

test("mobile composition", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/");
  await page.waitForTimeout(2600);
  await expect(
    page.getByRole("heading", { name: /Yasser Ameur/i })
  ).toBeVisible();
  await page.screenshot({ path: path.join(SHOTS, "home-mobile.png") });

  await page.getByRole("link", { name: /Projects/i }).click();
  await page.waitForTimeout(2200);
  await expect(page).toHaveURL(/\/projects/);
  await page.screenshot({ path: path.join(SHOTS, "projects-mobile.png") });

  expect(errors).toEqual([]);
  await ctx.close();
});

test("reduced motion still renders", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.waitForTimeout(1200);
  await expect(
    page.getByRole("heading", { name: /Yasser Ameur/i })
  ).toBeVisible();
  await page.screenshot({ path: path.join(SHOTS, "home-reduced.png") });
  await ctx.close();
});
