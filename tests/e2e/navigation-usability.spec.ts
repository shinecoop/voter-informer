import { expect, test } from "@playwright/test";

const candidateUrl = "/2026/colorado/us-house/district-8/candidates";

for (const configuration of [
  { width: 1280, height: 320, touch: false, enlargedText: false },
  { width: 844, height: 390, touch: true, enlargedText: false },
  { width: 320, height: 568, touch: true, enlargedText: true },
  { width: 320, height: 320, touch: true, enlargedText: true },
]) {
  test(`navigation stays usable at ${configuration.width}×${configuration.height}${configuration.enlargedText ? " with enlarged text" : ""}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: configuration.width, height: configuration.height }, hasTouch: configuration.touch });
    try {
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:3100${candidateUrl}`);
      if (configuration.enlargedText) await page.addStyleTag({ content: ".race-navigation :is(button, a, p, span) { font-size: 24px !important; } .race-navigation h2 { font-size: 40px !important; }" });
      await page.getByRole("button", { name: "Browse races" }).click();
      const panel = page.getByRole("dialog");
      const current = panel.getByRole("link", { name: "District 8", exact: true });
      await expect(current).toBeFocused();
      await expect(current).toBeInViewport();
      const close = panel.getByRole("button", { name: "Close", exact: true });
      await expect(close).toBeInViewport();
      await expect(panel.getByRole("button", { name: "Back", exact: true })).toBeInViewport();
      if (configuration.touch) expect(await panel.boundingBox()).toEqual({ x: 0, y: 0, width: configuration.width, height: configuration.height });
      expect(await panel.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await current.press("Home");
      await expect(panel.getByRole("link", { name: "District 1", exact: true })).toBeFocused();
      await expect(panel.getByRole("link", { name: "District 1", exact: true })).toBeInViewport();
      await expect(close).toBeInViewport();
      await page.screenshot({ path: `test-results/navigation-short-${configuration.width}x${configuration.height}.png` });
      await panel.getByRole("navigation", { name: "Browse path" }).getByRole("button", { name: "Colorado", exact: true }).click();
      const heading = panel.getByRole("heading", { name: "Choose a race", exact: true });
      await expect(heading).toBeFocused();
      await expect(heading).toBeInViewport();
      await close.click();
      await expect(page.getByRole("button", { name: "Browse races" })).toBeFocused();
    } finally {
      await context.close();
    }
  });
}

test("skip link, keyboard browsing, reduced motion, and monochrome targets", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip navigation" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("group", { name: "United States map", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Browse races" }).click();
  const panel = page.getByRole("dialog");
  await panel.locator(".race-choices").getByRole("button", { name: "Colorado", exact: true }).click();
  await panel.locator(".race-choices").getByRole("button", { name: "U.S. House", exact: true }).click();
  await expect(panel.locator(".race-choices")).toHaveCSS("animation-name", "none");
  const first = panel.getByRole("link", { name: "District 1", exact: true });
  await first.focus();
  await first.press("ArrowDown");
  await expect(panel.getByRole("link", { name: "District 2", exact: true })).toBeFocused();
  await page.keyboard.press("End");
  await expect(panel.getByRole("link", { name: "District 8", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(panel.getByRole("link", { name: "District 7", exact: true })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();

  const metrics = await panel.evaluate((element) => {
    const controls = Array.from(element.querySelectorAll<HTMLElement>("button, a[href]"));
    return controls.map((control) => {
      const box = control.getBoundingClientRect();
      const style = getComputedStyle(control);
      return { label: control.textContent, width: box.width, height: box.height, color: style.color, background: style.backgroundColor };
    });
  });
  for (const metric of metrics) {
    expect(metric.height, metric.label ?? "control").toBeGreaterThanOrEqual(44);
    expect(metric.width, metric.label ?? "control").toBeGreaterThanOrEqual(44);
    for (const value of [metric.color, metric.background]) {
      const channels = value.match(/[\d.]+/g)!.map(Number);
      expect(channels[0]).toBe(channels[1]);
      expect(channels[1]).toBe(channels[2]);
    }
  }
  await first.press("Enter");
  await expect(page).toHaveURL("/2026/colorado/us-house/district-1/candidates");
  await page.getByRole("link", { name: "Skip navigation" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#race-page-content")).toBeFocused();
});

test("district switching remains reachable after scrolling a candidate list", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/2026/colorado/us-house/district-1/candidates");
  await page.getByRole("main").hover();
  await page.mouse.wheel(0, 1400);
  await expect.poll(() => page.getByRole("main").evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  const browse = page.getByRole("button", { name: "Browse races" });
  await expect(browse).toBeInViewport();
  await browse.click();
  await expect(page.getByRole("dialog").getByRole("link", { name: "District 1", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(browse).toBeFocused();
});

test("sticky-header offset tracks enlarged text and keeps focused links visible", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/2026/colorado/us-house/district-1/candidates");
  await page.addStyleTag({ content: ".race-navigation :is(button, a, p, span) { font-size: 24px !important; }" });
  const main = page.getByRole("main");
  const header = page.locator(".race-navigation");
  await expect.poll(async () => {
    const height = (await header.boundingBox())!.height;
    const offset = await main.evaluate((element) => parseFloat(getComputedStyle(element).scrollPaddingTop));
    return Math.abs(offset - height - 24);
  }).toBeLessThan(1);
  await main.evaluate((element) => { element.scrollTop = element.scrollHeight; });
  const link = page.getByRole("link", { name: "View platform", exact: true }).first();
  await link.focus();
  const headerBox = (await header.boundingBox())!;
  const linkBox = (await link.boundingBox())!;
  expect(linkBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
  await expect(link).toBeInViewport();
});

test("modified destination clicks keep the browser open", async ({ page, context }) => {
  await page.goto(candidateUrl);
  await page.getByRole("button", { name: "Browse races" }).click();
  const panel = page.getByRole("dialog");
  const [destination] = await Promise.all([
    context.waitForEvent("page"),
    panel.getByRole("link", { name: "District 2", exact: true }).click({ modifiers: ["ControlOrMeta"] }),
  ]);
  try {
    await expect(destination).toHaveURL("/2026/colorado/us-house/district-2/candidates");
    await expect(panel).toBeVisible();
    await expect(page).toHaveURL(candidateUrl);
  } finally {
    await destination.close();
  }
});
