import { expect, test } from "@playwright/test";

test("renders an honest, styled foundation with keyboard access", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/Voter Informer/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("More context.Your own conclusions.");
  await expect(page.getByRole("heading", { name: "Research coverage is not yet available" })).toBeVisible();
  await expect(page.getByText("No verified coverage records have been published.")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(246, 244, 238)");
  await page.screenshot({ path: "test-results/foundation-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
