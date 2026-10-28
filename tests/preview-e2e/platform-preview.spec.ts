import { readFileSync } from "node:fs";
import { datasetSchema } from "../../src/domain/schema";
import { expect, test } from "@playwright/test";

const research = datasetSchema.parse(JSON.parse(readFileSync(new URL("../../data/research.json", import.meta.url), "utf8")));

test("local preview displays all ten Crow drafts without approving or publishing them", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/platforms/jason-crow-2026");
  await expect(page.getByRole("heading", { name: "Platform review pending", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Preview draft platform", exact: true }).click();
  await expect(page).toHaveURL("/preview/platforms/jason-crow-2026");
  await expect(page.getByRole("heading", { name: "Draft preview — not approved", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Jason Crow");
  await expect(page.locator(".platform-proposal")).toHaveCount(10);
  await expect(page.getByText("All 10 issues: Draft: position found — awaiting human review", { exact: true })).toBeVisible();
  await expect(page.getByText("Reviewed: position found", { exact: true })).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  const health = page.getByRole("region", { name: "Health care", exact: true });
  await expect(health.locator(".platform-statement")).toContainText("I will fight for a public option");
  await expect(page.locator("details")).toHaveCount(0);
  await expect(health.locator(".platform-claim")).toHaveAttribute("href", /^https?:/);
  await expect(health.locator(".platform-claim")).toHaveText("I will fight for a public option");
  await expect(page.getByRole("heading", { name: "References", exact: true })).toHaveCount(0);
  await expect(page.locator(".platform-citations")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Platform issues" })).toHaveCount(0);
  await health.scrollIntoViewIfNeeded();
  await expect(health.locator(".platform-statement")).toBeInViewport();
  await expect(page.getByText("Researched: 2026-10-25 · Reviewed: Pending · Approved: Not approved", { exact: true })).toHaveCount(1);
  expect(await page.getByRole("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.screenshot({ path: "test-results/crow-draft-preview.png", fullPage: true });
  await page.getByRole("link", { name: "View public page", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Platform review pending", exact: true })).toBeVisible();
  await expect(page.locator(".platform-proposal")).toHaveCount(0);
});

test("unknown preview candidacies return 404", async ({ page }) => {
  expect((await page.goto("/preview/platforms/unknown-candidacy"))?.status()).toBe(404);
});

test("Jason Crow preview has compact, readable spacing at desktop, tablet and phone widths", async ({ page }) => {
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/preview/platforms/jason-crow-2026");
    const main = page.getByRole("main");
    await expect(main).toHaveClass(/platform-preview-minimal/);
    await expect(main).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(page.locator(".platform-portrait")).toHaveCSS("filter", "none");
    expect(await main.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    const dimensions = await main.evaluate((element) => ({
      height: element.scrollHeight,
      firstIssue: element.querySelector(".platform-issue")!.getBoundingClientRect().top,
    }));
    expect(dimensions.firstIssue).toBeLessThan(width === 390 ? 550 : 450);
    expect(dimensions.height).toBeLessThan(width === 390 ? 3000 : 2200);
    await expect(page.getByRole("navigation", { name: "Platform issues" })).toHaveCount(0);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to policy positions" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Economy", exact: true })).toBeInViewport();
    await page.screenshot({ path: `test-results/jason-preview-${width}.png` });
    await page.getByRole("region", { name: "Health care", exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("heading", { name: "Health care", exact: true })).toBeInViewport();
    await page.screenshot({ path: `test-results/jason-health-${width}.png` });
    for (const statement of await page.locator(".platform-statement").all()) {
      const fullText = await statement.innerText();
      for (const link of await statement.getByRole("link").all()) {
        await expect(link).toHaveAttribute("href", /^https?:/);
        await expect(link).toHaveAttribute("href", /#:~:text=/);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", "noopener noreferrer");
        await expect(link).toHaveCSS("font-weight", "400");
        const quote = await link.innerText();
        const href = await link.getAttribute("href");
        expect(href).not.toContain("&text=");
        expect(decodeURIComponent(href!.split(":~:text=")[1]!)).toContain(",-");
        const issueId = await statement.evaluate(element => element.closest("section")!.id);
        const record = research.platformIssues.find(record => record.candidacyId === "jason-crow-2026" && record.issueId === issueId)!;
        expect(record.proposals.some(proposal => proposal.evidence.some(evidence => evidence.excerpt.replace(/\s+/g, " ").includes(quote)))).toBe(true);
        expect(quote.length).toBeLessThan(fullText.length);
      }
      expect(await statement.getByRole("link").count()).toBeGreaterThan(0);
    }
  }
});


test("research context follows the issues and source links open a separate tab", async ({ page, context }) => {
  await page.goto("/preview/platforms/jason-crow-2026");
  const notes = page.getByRole("region", { name: "Research notes" });
  await expect(notes).toContainText("Source dates are unknown");
  await expect(notes).toContainText("All 10 issues");
  await expect(notes).toContainText("Researched: 2026-10-25");
  expect(await notes.evaluate(element => Boolean(element.previousElementSibling?.classList.contains("platform-issues")))).toBe(true);
  await expect(page.locator(".candidate-header")).not.toContainText("Researched:");
  // Fulfil the source locally: verify browser behavior without depending on a third-party site.
  const source = page.getByRole("region", { name: "Health care", exact: true }).locator(".platform-claim");
  const sourceUrl = await source.getAttribute("href");
  const excerpt = research.platformIssues.find(record => record.candidacyId === "jason-crow-2026" && record.issueId === "health-care")!.proposals[0]!.evidence[0]!.excerpt;
  expect(decodeURIComponent(sourceUrl!.split(":~:text=")[1]!)).toBe("Health Care,-Housing Affordability");
  expect(excerpt).toContain(await source.innerText());
  expect(sourceUrl).not.toContain("&text=");
  await context.route(sourceUrl!.split("#")[0]!, route => route.fulfill({ contentType: "text/html", body: `<title>Source</title><div style="height:2500px">Source document</div><h2 id="evidence">Health Care</h2><h2>Housing Affordability</h2><p>${excerpt}</p><div style="height:1000px"></div>` }));
  const popupPromise = page.waitForEvent("popup");
  await source.click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  // Chromium consumes text directives rather than exposing them to page scripts.
  await expect(popup).toHaveURL(sourceUrl!.split("#")[0]!);
  await expect.poll(() => popup.evaluate(() => window.scrollY)).toBeGreaterThan(2000);
  await expect(popup.locator("#evidence")).toBeInViewport();
  await expect(page).toHaveURL("/preview/platforms/jason-crow-2026");
  expect(await popup.evaluate(() => window.opener === null)).toBe(true);
  await popup.close();
});
