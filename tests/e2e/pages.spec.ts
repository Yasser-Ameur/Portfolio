const { test, expect } = require("@playwright/test");

test.describe.configure({ mode: "serial" });

test("about, resume, and contact pages render", async ({ page }) => {
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto("/about");
  await expect(
    page.getByRole("heading", { name: /Understanding systems from the inside/i })
  ).toBeVisible();
  await expect(page.getByText(/EPFL/i)).toBeVisible();

  await page.goto("/resume");
  await expect(
    page.getByRole("heading", { name: /The story, condensed/i })
  ).toBeVisible();
  await expect(page.getByText(/École Polytechnique/i)).toBeVisible();
  await expect(page.getByText(/Valedictorian/i)).toBeVisible();

  await page.goto("/contact");
  await expect(
    page.getByRole("heading", { name: /Interested in building something difficult/i })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /yasserameur\.dev@gmail\.com/i })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /linkedin\.com\/in\/yasser-ameur/i })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /github\.com\/Yasser-Ameur/i })
  ).toBeVisible();

  expect(errors).toEqual([]);
});

test("editorial pages return home and are keyboard reachable", async ({ page }) => {
  await page.goto("/about");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1400);
  await expect(page).toHaveURL(/\/$/);

  // focus order reaches the home link via Tab
  await page.goto("/contact");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.textContent);
  expect(focused).toMatch(/home/i);
});
