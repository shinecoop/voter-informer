import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";
import { platformIssueFixture, platformResearchFixture, researchFixture } from "../fixtures/research";

const crowPath = "/platforms/jason-crow-2026";
const listPath = "/2026/colorado/district6/candidates";

// Render the actual server page against an isolated snapshot, never production data.
// Native disclosures and evidence links are then exercised in Chromium.
async function isolatedPlatform() {
  const directory = await mkdtemp(join(tmpdir(), "platform-browser-"));
  try {
    const data = platformResearchFixture();
    data.platformIssues.push(
      { ...platformIssueFixture(), id: "housing-v1", issueId: "housing", status: "no-position-found", proposals: [] },
      { ...platformIssueFixture(), id: "economy-v2", version: 2, publication: "draft", approval: null, review: { state: "draft", reviewer: null, reviewedAt: null }, proposals: [{ id: "draft", summary: "PRIVATE DRAFT SUMMARY", evidence: [{ sourceId: "source", excerpt: "PRIVATE DRAFT EXCERPT", locator: "Private" }] }] },
    );
    // Also exercise the page's non-House guard with valid synthetic Senate context.
    const senate = researchFixture();
    data.races.push({ ...senate.races[0]!, id: "senate-race" });
    data.candidacies.push({ ...senate.candidacies[0]!, id: "senate-candidacy", raceId: "senate-race" });
    await mkdir(join(directory, "data"));
    await writeFile(join(directory, "data/research.json"), JSON.stringify(data));
    const script = `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server';
      import { pathToFileURL } from 'node:url';
      const { default: Platform, generateStaticParams } = await import(pathToFileURL(${JSON.stringify(resolve("src/app/platforms/[candidacyId]/page.tsx"))}).href);
      process.chdir(${JSON.stringify(directory)});
      const params = await generateStaticParams();
      if (params.some(p => p.candidacyId === 'senate-candidacy') || !params.some(p => p.candidacyId === 'candidacy')) throw new Error('Incorrect static params');
      for (const candidacyId of ['missing', 'senate-candidacy']) {
        try { await Platform({ params: Promise.resolve({ candidacyId }) }); throw new Error('Expected 404'); }
        catch (error) { if (error.digest !== 'NEXT_HTTP_ERROR_FALLBACK;404') throw error; }
      }
      console.log(renderToStaticMarkup(await Platform({ params: Promise.resolve({ candidacyId: 'candidacy' }) })));
    `;
    const { stdout } = await promisify(execFile)(process.execPath, ["--import", "tsx", "--input-type=module", "-e", script], { cwd: process.cwd(), maxBuffer: 1024 * 1024, timeout: 30_000 });
    const css = (await readFile(resolve("src/app/globals.css"), "utf8")).replace('@import "tailwindcss";', "");
    return `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Synthetic platform fixture</title><style>${css}</style></head><body>${stdout}</body></html>`;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("Crow direct route honestly shows pending review and issue navigation", async ({ page }) => {
  expect((await page.goto(crowPath))?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Jason Crow");
  await expect(page.getByText("U.S. House · Colorado congressional district 6 · Democratic Party", { exact: true })).toBeVisible();
  await expect(page.getByText("General election · 2026-11-03", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Platform review pending", exact: true })).toBeVisible();
  await expect(page.getByText("Not yet reviewed", { exact: true })).toHaveCount(10);
  await expect(page.getByText("No stated position found in sources reviewed", { exact: true })).toHaveCount(0);
  const veterans = page.getByRole("navigation", { name: "Platform issues" }).getByRole("link", { name: "Veterans", exact: true });
  await veterans.focus();
  await expect(veterans).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(`${crowPath}#veterans`);
  await expect(page.locator("#veterans")).toBeInViewport();
    await expect.poll(() => page.getByRole("main").evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect(page.locator("#veterans")).toBeFocused();
});

test("candidate name and View platform navigate, and explicit and browser back restore the nested list", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto(listPath);
  const row = page.locator("#jason-crow-2026");
  await row.scrollIntoViewIfNeeded();
  const main = page.getByRole("main");
  const top = await main.evaluate((element) => element.scrollTop);
  await row.getByRole("link", { name: "Crow, Jason", exact: true }).click();
  await expect(page).toHaveURL(crowPath);
  await page.getByRole("link", { name: "Back to candidates" }).click();
  await expect(page).toHaveURL(`${listPath}#jason-crow-2026`);
  await expect(row).toBeInViewport();
  await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeCloseTo(top, 0);
  await row.getByRole("link", { name: "View platform", exact: true }).click();
  await expect(page).toHaveURL(crowPath);
  await page.goBack();
  await expect(page).toHaveURL(`${listPath}#jason-crow-2026`);
  await expect(row).toBeInViewport();
  await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeCloseTo(top, 0);
});

test("mobile direct hash, issue anchors and return link work without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto(`${listPath}#jason-crow-2026`);
  await expect(page.locator("#jason-crow-2026")).toBeInViewport();
  await page.goto(crowPath);
  await page.getByRole("navigation", { name: "Platform issues" }).getByRole("link", { name: "Foreign policy", exact: true }).click();
  await expect(page).toHaveURL(`${crowPath}#foreign-policy`);
  await expect(page.locator("#foreign-policy")).toBeInViewport();
  expect(await page.getByRole("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("link", { name: "Back to candidates" }).click();
  await expect(page.locator("#jason-crow-2026")).toBeInViewport();
});

test("unknown platform routes return 404", async ({ page }) => {
  for (const path of ["/platforms/unknown-candidacy", "/platforms/jason-crow", "/platforms/jason-crow-2024", "/preview/platforms/jason-crow-2026"]) {
    expect((await page.goto(path))?.status()).toBe(404);
  }
});

test("isolated approved rendering shows evidence, honest no-position findings, and never drafts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.setContent(await isolatedPlatform());
  const economy = page.getByRole("region", { name: "Economy", exact: true });
  await expect(economy.getByText("Reviewed: position found", { exact: true })).toBeVisible();
  await expect(economy.getByRole("heading", { name: "Adopt synthetic policy A", exact: true })).toBeVisible();
  const disclosure = economy.getByText("Exact excerpts & sources", { exact: true });
  await expect(economy.getByText("We propose synthetic policy A.", { exact: true })).not.toBeVisible();
  await disclosure.focus();
  await page.keyboard.press("Enter");
  await expect(economy.getByText("We propose synthetic policy A.", { exact: true })).toBeVisible();
  await expect(economy.getByRole("link", { name: "Synthetic evidence" }).first()).toHaveAttribute("href", "https://example.org/synthetic");
  await expect(economy.getByText("Publisher: Test publisher · Publication date: Unknown · Retrieved: 2026-10-01", { exact: true }).first()).toBeVisible();
  await expect(economy.getByText("Excerpt locator: Policy section, paragraph 1", { exact: true })).toBeVisible();
  await expect(economy.getByText("Source locator: Synthetic test record", { exact: true }).first()).toBeVisible();
  await expect(economy.getByText("Researched: 2026-10-02 · Reviewed: 2026-10-02 · Approved: 2026-10-02", { exact: true })).toBeVisible();
  await expect(economy.getByText("Research scope: Reviewed the synthetic campaign policy page", { exact: true })).toBeVisible();
  const housing = page.getByRole("region", { name: "Housing", exact: true });
  await expect(housing.getByText("No stated position found in sources reviewed", { exact: true })).toBeVisible();
  await housing.getByText("Sources reviewed", { exact: true }).click();
  await expect(housing.getByRole("link", { name: "Synthetic evidence" })).toBeVisible();
  await expect(page.getByText("Not yet reviewed", { exact: true })).toHaveCount(8);
  await expect(page.getByRole("heading", { name: "Platform review pending", exact: true })).toHaveCount(0);
  expect(await page.content()).not.toContain("PRIVATE DRAFT");
  expect(await page.getByRole("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
});
