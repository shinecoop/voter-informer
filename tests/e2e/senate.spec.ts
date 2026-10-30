import { expect, test } from "@playwright/test";

const senatePath = "/2026/colorado/us-senate/candidates";

for (const width of [1440, 768, 390]) {
  test(`browse Colorado Senate candidates without a district at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    await page.getByRole("button", { name: "Browse races", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Colorado", exact: true }).click();
    await dialog.getByRole("link", { name: "U.S. Senate", exact: true }).click();
    await expect(page).toHaveURL(senatePath);
    await expect(page.getByRole("navigation", { name: "Breadcrumb", exact: true })).toHaveText("StatesColoradoU.S. SenateCandidates");
    const list = page.getByRole("list", { name: "Colorado U.S. Senate candidates", exact: true });
    await expect(list.locator(".candidate-row")).toHaveCount(9);
    await expect(list.getByRole("heading", { level: 2 })).toHaveText(["Withrow, Adam", "Huber, Blake", "Chew, Bob", "Baum, Christopher", "Willoughby, Donald", "Hickenlooper, John", "Baisley, Mark", "Apelbaum, Ryan", "Powers, Will"]);
    await expect(list.getByText("Certified write-in", { exact: true })).toHaveCount(3);
    await expect(list.getByRole("link", { name: "View platform", exact: true })).toHaveCount(0);
    await expect(list.getByRole("heading").getByRole("link")).toHaveCount(0);
    await expect(list.locator("#john-hickenlooper-2026")).toContainText("Age 74");
    await expect(list.locator("#mark-baisley-2026")).toContainText("Age 71");
    await expect(list.getByRole("link", { name: "hickenlooper.com", exact: true })).toHaveAttribute("href", "https://hickenlooper.com/");
    await expect(list.getByRole("img", { name: "Portrait of John Hickenlooper", exact: true })).toHaveJSProperty("naturalWidth", 500);
    await expect(list.getByText("Age unavailable", { exact: true })).toHaveCount(7);
    await page.getByRole("button", { name: "Browse races", exact: true }).click();
    await expect(dialog.getByRole("heading", { name: "View candidates", exact: true })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Candidates", exact: true })).toBeFocused();
    await expect(dialog.getByRole("link", { name: "Candidates", exact: true })).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
    await page.getByRole("navigation", { name: "Breadcrumb", exact: true }).getByRole("button", { name: "Colorado", exact: true }).click();
    await dialog.getByRole("button", { name: "U.S. House", exact: true }).click();
    await dialog.getByRole("link", { name: "District 1", exact: true }).click();
    await expect(page).toHaveURL("/2026/colorado/us-house/district-1/candidates");
    await page.goto(senatePath);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/senate-${width}.png` });
  });
}

test("Senate lists load directly and unsupported years and candidate pages return 404", async ({ page }) => {
  expect((await page.goto(senatePath))?.status()).toBe(200);
  for (const path of ["/2024/colorado/us-senate/candidates", `${senatePath}/john-hickenlooper-2026`, "/platforms/john-hickenlooper-2026", "/preview/platforms/john-hickenlooper-2026"]) {
    expect((await page.goto(path))?.status()).toBe(404);
  }
});
