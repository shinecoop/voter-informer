import { expect, test } from "@playwright/test";

for (const viewport of [{ width: 1440, height: 800 }, { width: 768, height: 800 }, { width: 390, height: 500 }]) {
  test(`browse races and breadcrumbs at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const browse = page.getByRole("button", { name: "Browse races" });
    const panel = page.getByRole("dialog");
    const choices = panel.locator(".race-choices");
    const trail = panel.getByRole("navigation", { name: "Browse path" });
    const buttonBox = (await browse.boundingBox())!;
    const mapBox = (await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Map", exact: true }).boundingBox())!;
    expect((buttonBox.x + mapBox.x + mapBox.width) / 2).toBeCloseTo(viewport.width / 2, 0);
    await browse.click();
    await expect(panel.getByRole("heading", { name: "Choose a state", exact: true })).toBeFocused();
    await expect(choices.getByRole("listitem")).toHaveCount(1);
    await expect(trail).toHaveCount(0);
    await expect(panel.locator(".race-trail-reveal")).toHaveCount(0);
    const initialHeading = (await panel.getByRole("heading").boundingBox())!;
    const controls = (await panel.locator(".race-panel-controls").boundingBox())!;
    expect(initialHeading.y - controls.y - controls.height).toBeLessThanOrEqual(16);
    await choices.getByRole("button", { name: "Colorado" }).click();
    await expect(choices.getByRole("listitem")).toHaveCount(1);
    await expect(trail.getByRole("button")).toHaveText(["States", "Colorado"]);
    await panel.getByRole("button", { name: "U.S. House" }).click();
    await expect(panel.getByRole("link")).toHaveCount(8);
    await expect(trail.getByRole("button")).toHaveText(["States", "Colorado", "U.S. House"]);
    const currentStep = trail.getByRole("button", { name: "U.S. House", exact: true });
    await expect(currentStep).toHaveAttribute("aria-current", "step");
    await currentStep.click();
    await expect(currentStep).toBeFocused();
    await trail.getByRole("button", { name: "Colorado", exact: true }).click();
    await expect(panel.getByRole("heading", { name: "Choose a race", exact: true })).toBeFocused();
    await expect(trail.getByRole("button")).toHaveText(["States", "Colorado"]);
    await choices.getByRole("button", { name: "U.S. House" }).click();
    if (viewport.width > 600) {
      const box = (await panel.boundingBox())!;
      expect(box.x + box.width / 2).toBeCloseTo(viewport.width / 2, 0);
    }
    await choices.evaluate(async (element) => {
      await Promise.all(element.getAnimations().map((animation) => animation.finished));
    });
    await page.screenshot({ path: `test-results/race-browser-${viewport.width}.png` });
    await panel.getByRole("button", { name: "Back" }).click();
    await expect(panel.getByRole("button", { name: "U.S. House" })).toBeVisible();
    await panel.getByRole("button", { name: "Back" }).click();
    await expect(panel.getByRole("button", { name: "Colorado" })).toBeVisible();
    await expect(trail).toHaveCount(0);
    await expect(panel.locator(".race-trail-reveal")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(panel).not.toBeVisible();
    await expect(browse).toBeFocused();
    await page.keyboard.press("Enter");
    await panel.getByRole("button", { name: "Colorado" }).click();
    await panel.getByRole("button", { name: "U.S. House" }).click();
    await panel.getByRole("link", { name: "District 8", exact: true }).click();
    await expect(page).toHaveURL("/2026/colorado/district8/candidates");
    await expect(panel).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Candidates", exact: true })).toBeVisible();
    const pageTrail = page.getByRole("navigation", { name: "Breadcrumb", exact: true });
    await expect(pageTrail).toHaveText("StatesColoradoU.S. HouseDistrict 8Candidates");
    await browse.click();
    const currentDistrict = panel.getByRole("link", { name: "District 8", exact: true });
    await expect(currentDistrict).toHaveAttribute("aria-current", "page");
    await expect(currentDistrict).toBeFocused();
    await expect(currentDistrict).toBeInViewport();
    await panel.getByRole("button", { name: "Close", exact: true }).click();
    await expect(browse).toBeFocused();
    const breadcrumbs = page.getByRole("navigation", { name: "Breadcrumb", exact: true });
    for (const [label, heading] of [["States", "Choose a state"], ["Colorado", "Choose a race"], ["U.S. House", "Choose a district"], ["District 8", "View candidates"]]) {
      const crumb = breadcrumbs.getByRole("button", { name: label, exact: true });
      await crumb.click();
      await expect(panel.getByRole("heading", { name: heading, exact: true })).toBeFocused();
      if (label === "District 8") await expect(panel.getByRole("link", { name: "Candidates", exact: true })).toHaveAttribute("href", "/2026/colorado/district8/candidates");
      await page.keyboard.press("Escape");
      await expect(crumb).toBeFocused();
    }
    await browse.click();
    if (viewport.width === 390) {
      expect(await panel.boundingBox()).toEqual({ x: 0, y: 0, ...viewport });
      await panel.getByRole("link", { name: "District 8", exact: true }).scrollIntoViewIfNeeded();
      expect(await panel.locator(".race-panel-body").evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
      await expect(panel.getByRole("button", { name: "Close", exact: true })).toBeInViewport();
      await expect(panel.getByRole("button", { name: "Back", exact: true })).toBeInViewport();
      for (const key of ["Tab", "Shift+Tab"]) {
        for (let index = 0; index < 15; index++) {
          await page.keyboard.press(key);
          expect(await panel.evaluate((element) => element.contains(document.activeElement))).toBe(true);
        }
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await panel.getByRole("link", { name: "District 2", exact: true }).click();
    await expect(page).toHaveURL("/2026/colorado/district2/candidates");
    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Map", exact: true }).click();
    await expect(page.getByRole("group", { name: "United States map", exact: true })).toBeVisible();
  });
}
