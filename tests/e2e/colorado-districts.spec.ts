import { expect, test } from "@playwright/test";

test("reveals Colorado districts after zoom and highlights them without changing the camera", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const map = page.getByRole("group", { name: "United States map", exact: true });
  const districts = page.getByRole("group", { name: "Colorado congressional districts", exact: true });
  await expect(districts).toHaveCount(0);
  await map.getByRole("button", { name: "Colorado", exact: true }).click();
  await expect(districts).toHaveCount(0);
  await expect(districts).toBeVisible();
  await expect(districts.getByRole("button")).toHaveCount(8);
  for (let number = 1; number <= 8; number++) {
    await expect(districts.getByRole("button", { name: `Colorado congressional district ${number}`, exact: true })).toBeVisible();
  }
  const fourth = districts.getByRole("button", { name: "Colorado congressional district 4", exact: true });
  await expect(fourth).toHaveCSS("fill", "rgb(219, 219, 219)");
  await expect(fourth).toHaveCSS("stroke", "rgb(255, 255, 255)");
  const camera = await map.getAttribute("viewBox");
  await fourth.hover();
  const highlight = districts.locator(".map-highlight");
  await expect(highlight).toHaveAttribute("d", (await fourth.getAttribute("d"))!);
  await expect(highlight).toHaveCSS("transform", "matrix(1.05, 0, 0, 1.05, 0, 0)");
  const original = (await fourth.boundingBox())!;
  const enlarged = (await highlight.boundingBox())!;
  expect(enlarged.width / original.width).toBeCloseTo(1.05, 2);
  await page.screenshot({ path: "test-results/colorado-districts.png" });
  await page.mouse.move(0, 0);
  await expect(highlight).toHaveCount(0);

  const second = districts.getByRole("button", { name: "Colorado congressional district 2", exact: true });
  await second.focus();
  await expect(highlight).toHaveCSS("transform", "matrix(1.05, 0, 0, 1.05, 0, 0)");
  expect(await map.getAttribute("viewBox")).toBe(camera);
  await expect(page.getByRole("button", { name: "Browse races" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(districts).toHaveCount(0);
  await expect(map.locator('[data-state-id="08"]')).toBeFocused();
  await map.getByRole("button", { name: "California", exact: true }).click();
  await expect(districts).toHaveCount(0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await map.getByRole("button", { name: "Colorado", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(districts).toBeVisible();
  await expect(districts.getByRole("button", { name: "Colorado congressional district 1", exact: true })).toBeFocused();
  expect(errors).toEqual([]);
});
