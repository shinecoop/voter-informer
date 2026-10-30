import { expect, test } from "@playwright/test";

test("shows the map with navigation and smoothly frames a selected state without scrolling", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const map = page.getByRole("group", { name: "United States map" });
  await expect(map.getByRole("button")).toHaveCount(51);
  await expect(page.getByRole("button", { name: "Browse races" })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  const colorado = map.locator('[data-state-id="08"]');
  await expect(colorado).toHaveCSS("fill", "rgb(219, 219, 219)");
  await expect(colorado).toHaveCSS("stroke", "rgb(255, 255, 255)");

  const size = async () => {
    const box = await colorado.boundingBox();
    const viewport = page.viewportSize()!;
    return Math.max(box!.width / viewport.width, box!.height / viewport.height);
  };
  await expect.poll(size).toBeLessThan(0.2);
  await page.screenshot({ path: "test-results/landing-desktop.png" });
  await colorado.click();
  await expect(colorado).toHaveAttribute("aria-pressed", "true");
  const frames = await map.evaluate(async (svg: SVGSVGElement) => {
    const widths: number[] = [];
    for (let i = 0; i < 4; i++) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      widths.push(svg.viewBox.baseVal.width);
    }
    return widths;
  });
  expect(new Set(frames).size).toBeGreaterThan(1);
  // Allow the one-pixel non-scaling border around the framed geometry.
  const framingError = async () => Math.abs(await size() - 0.75);
  await expect.poll(framingError).toBeLessThan(0.003);
  const box = (await colorado.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(box.x + box.width / 2).toBeCloseTo(viewport.width / 2, 0);
  expect(box.y + box.height / 2).toBeCloseTo(viewport.height / 2, 0);
  await page.screenshot({ path: "test-results/landing-zoom.png" });

  await page.keyboard.press("Escape");
  await expect(colorado).toHaveAttribute("aria-pressed", "false");
  await expect.poll(size).toBeLessThan(0.2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await colorado.focus();
  await page.keyboard.press("Enter");
  await expect.poll(framingError).toBeLessThan(0.003);

  for (const dimensions of [{ width: 1280, height: 800 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(dimensions);
    await expect.poll(framingError).toBeLessThan(0.003);
    await page.mouse.wheel(600, 600);
    expect(await page.evaluate(() => [scrollX, scrollY])).toEqual([0, 0]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  }
  await map.click({ position: { x: 2, y: 2 } });
  await expect(colorado).toHaveAttribute("aria-pressed", "false");
  expect(errors).toEqual([]);
});
