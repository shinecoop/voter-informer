import { expect, test } from "@playwright/test";

const expectedCounts = [8, 3, 4, 4, 5, 5, 6, 3];

test("all eight candidate routes show the official roster and first-name ordering", async ({ page }) => {
  for (let district = 1; district <= 8; district++) {
    await page.goto(`/2026/colorado/district${district}/candidates`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Candidates");
    const list = page.getByRole("list", { name: `Colorado district ${district} candidates`, exact: true });
    await expect(list.locator(".candidate-row")).toHaveCount(expectedCounts[district - 1]!);
    const names = await list.getByRole("heading", { level: 2 }).allTextContents();
    const firstNames = names.map((name) => name.split(", ")[1]!);
    expect(firstNames).toEqual([...firstNames].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })));
    await expect(list.locator(".candidate-row").first()).toHaveCSS("border-top-color", "rgb(219, 219, 219)");
    await expect(list.locator(".candidate-row").first()).toHaveCSS("background-color", "rgb(255, 255, 255)");
    for (const image of await list.getByRole("img").all()) {
      if (await image.evaluate((element) => element.tagName === "IMG")) {
        await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
        await expect(image).toHaveCSS("border-radius", "50%");
        await expect(image).toHaveCSS("border-top-width", "0px");
      }
    }
    if (district === 2) {
      await expect(list.getByRole("heading", { level: 2 })).toHaveText(["Kent, Gaylon", "Neguse, Joe", "Dennison, Kelley Anne"]);
      await expect(list.getByText("Age 42", { exact: true })).toBeVisible();
            const joe = list.locator(".candidate-row").filter({ has: page.getByRole("heading", { name: "Neguse, Joe", exact: true }) });
            const website = joe.getByRole("link", { name: "joeforcolorado.com", exact: true });
            await expect(website).toHaveAttribute("href", "https://joeforcolorado.com/");
            await website.focus();
            await expect(website).toBeFocused();
            const gaylon = list.locator(".candidate-row").filter({ has: page.getByRole("heading", { name: "Kent, Gaylon", exact: true }) });
            await expect(gaylon.getByRole("link")).toHaveCount(0);
      await expect(list.getByText("Age unavailable", { exact: true })).toHaveCount(2);
      await page.screenshot({ path: "test-results/candidates-desktop.png" });
    }
    if (district === 1) await expect(list.getByText("Certified write-in", { exact: true })).toHaveCount(3);
  }
});

test("district click and keyboard activation navigate to the matching candidate page", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Colorado", exact: true }).click();
  const districts = page.getByRole("group", { name: "Colorado congressional districts", exact: true });
  await expect(districts).toBeVisible();
  await districts.getByRole("button", { name: "Colorado congressional district 4", exact: true }).click();
  await expect(page).toHaveURL(/\/2026\/colorado\/district4\/candidates$/);
  await expect(page.getByRole("heading", { name: "Boebert, Lauren", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Back to map" }).click();
  await page.getByRole("button", { name: "Colorado", exact: true }).focus();
  await page.keyboard.press("Enter");
  const second = districts.getByRole("button", { name: "Colorado congressional district 2", exact: true });
  await second.focus();
  await page.keyboard.press("Space");
  await expect(page).toHaveURL(/\/2026\/colorado\/district2\/candidates$/);
});

test("long lists scroll within the candidate page and invalid routes return 404", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/2026/colorado/district1/candidates");
  const main = page.getByRole("main");
  await main.hover();
  await page.mouse.wheel(0, 1400);
  await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/candidates-mobile.png" });
  for (const path of ["/2024/colorado/district1/candidates", "/2026/colorado/district9/candidates", "/2026/colorado/district01/candidates"]) {
    expect((await page.goto(path))?.status()).toBe(404);
  }
});
