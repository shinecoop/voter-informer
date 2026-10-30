import { expect, test } from "@playwright/test";

const races = [
  { slug: "governor", label: "Governor", count: 7, links: 5, names: ["Mulder, Eric", "Underwood, Erik", "Lopez, Greg", "Peckman, Jeff", "Weiser, Phil", "Hamilton, Stephen T.", "Marx, Victor"] },
  { slug: "secretary-of-state", label: "Secretary of State", count: 5, links: 4, names: ["Campbell, Amanda", "Gonzalez, Amanda", "Landry, Celeste", "Wiley, James", "Vadney, Sean"] },
  { slug: "treasurer", label: "Treasurer", count: 4, links: 2, names: ["Bridges, Jeff", "Barr, Jodie", "Grantham, Kevin", "Langner Sturgis, Marilee"] },
];

for (const race of races) {
  for (const width of [1440, 390]) {
    test(`${race.label} roster and statewide navigation at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      await page.getByRole("button", { name: "Browse races", exact: true }).click();
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("button", { name: "Colorado", exact: true }).click();
      await dialog.getByRole("link", { name: race.label, exact: true }).click();
      await expect(page).toHaveURL(`/2026/colorado/${race.slug}/candidates`);
      await expect(page.getByRole("navigation", { name: "Breadcrumb", exact: true })).toHaveText(`StatesColorado${race.label}Candidates`);
      const list = page.getByRole("list", { name: `Colorado ${race.label} candidates`, exact: true });
      await expect(list.locator(".candidate-row")).toHaveCount(race.count);
      await expect(list.getByRole("heading", { level: 2 })).toHaveText(race.names);
      await expect(list.getByRole("link")).toHaveCount(race.links);
      await expect(list.getByRole("heading").getByRole("link")).toHaveCount(0);
      await expect(list.getByText("Certified write-in", { exact: true })).toHaveCount(0);
      if (race.slug === "governor") {
        await expect(list.getByText(/^Lieutenant governor:/)).toHaveCount(7);
        await expect(list.locator("#phil-weiser-2026")).toContainText("Lieutenant governor: Lesley Dahlkemper");
        await expect(list.locator("#victor-marx-2026")).toContainText("Lieutenant governor: George Washington Markert");
      }
      await page.getByRole("button", { name: "Browse races", exact: true }).click();
      await expect(dialog.getByRole("link", { name: "Candidates", exact: true })).toBeFocused();
      await expect(dialog.getByRole("heading", { name: "View candidates", exact: true })).toBeVisible();
      await page.keyboard.press("Escape");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `test-results/${race.slug}-${width}.png` });
    });
  }
  test(`${race.label} direct URL works and has no candidate platform routes`, async ({ page }) => {
    const base = `/2026/colorado/${race.slug}/candidates`;
    expect((await page.goto(base))?.status()).toBe(200);
    for (const path of [`/2024/colorado/${race.slug}/candidates`, `${base}/unknown-candidate`]) expect((await page.goto(path))?.status()).toBe(404);
  });
}
