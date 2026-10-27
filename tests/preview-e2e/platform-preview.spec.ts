import { expect, test } from "@playwright/test";

test("local preview displays all ten Crow drafts without approving or publishing them", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/platforms/jason-crow-2026");
  await expect(page.getByRole("heading", { name: "Platform review pending", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Preview draft platform", exact: true }).click();
  await expect(page).toHaveURL("/preview/platforms/jason-crow-2026");
  await expect(page.getByRole("heading", { name: "Draft preview — not approved", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Jason Crow");
  await expect(page.locator(".platform-proposal")).toHaveCount(10);
  await expect(page.getByText("Draft: position found — awaiting human review", { exact: true })).toHaveCount(10);
  await expect(page.getByText("Reviewed: position found", { exact: true })).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  const health = page.getByRole("region", { name: "Health care", exact: true });
  await expect(health.locator(".platform-statement")).toContainText("public health insurance option");
  await expect(page.locator("details")).toHaveCount(0);
  await expect(health.locator(".platform-claim")).toHaveAttribute("href", /^https?:/);
  await expect(health.locator(".platform-claim")).toHaveText("public health insurance option");
  await expect(page.getByRole("heading", { name: "References", exact: true })).toHaveCount(0);
  await expect(page.locator(".platform-citations")).toHaveCount(0);
  await page.getByRole("link", { name: "Health care", exact: true }).click();
  await expect(health.locator(".platform-statement")).toBeInViewport();
  await expect(health.getByText("Researched: 2026-10-25 · Reviewed: Pending · Approved: Not approved", { exact: true })).toBeVisible();
  expect(await page.getByRole("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: "test-results/crow-draft-preview.png", fullPage: true });
  await page.getByRole("link", { name: "View public page", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Platform review pending", exact: true })).toBeVisible();
  await expect(page.locator(".platform-proposal")).toHaveCount(0);
});

test("unknown preview candidacies return 404", async ({ page }) => {
  expect((await page.goto("/preview/platforms/unknown-candidacy"))?.status()).toBe(404);
});

test("Jason Crow preview has readable grayscale spacing at desktop, tablet and phone widths", async ({ page }) => {
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/preview/platforms/jason-crow-2026");
    const main = page.getByRole("main");
    await expect(main).toHaveClass(/platform-preview-minimal/);
    await expect(main).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(page.locator(".platform-portrait")).toHaveCSS("filter", "none");
    expect(await main.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({ path: `test-results/jason-preview-${width}.png` });
    await page.getByRole("link", { name: "Health care", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Health care", exact: true })).toBeInViewport();
    await page.screenshot({ path: `test-results/jason-health-${width}.png` });
    for (const statement of await page.locator(".platform-statement").all()) {
      const fullText = await statement.innerText();
      for (const link of await statement.getByRole("link").all()) {
        await expect(link).toHaveAttribute("href", /^https?:/);
        expect((await link.innerText()).length).toBeLessThan(fullText.length);
      }
      expect(await statement.getByRole("link").count()).toBeGreaterThan(0);
    }
  }
});
