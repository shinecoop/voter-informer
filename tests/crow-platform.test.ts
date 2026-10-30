import { readFile } from "node:fs/promises";
import { afterEach, describe, expect, it, vi } from "vitest";
import { datasetSchema } from "../src/domain/schema";
import { PLATFORM_ISSUES } from "../src/domain/platform";
import { createFileRepository } from "../src/repositories/file";
import { getCandidatePlatform } from "../src/repositories/platform";
import { getCandidatePlatformPreview } from "../src/repositories/platform-preview";

const file = new URL("../data/research.json", import.meta.url);

describe("Crow collected research publication boundary", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("shows drafts in development without changing their approval metadata", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const repository = createFileRepository(file);
    const preview = await getCandidatePlatformPreview(repository, "jason-crow-2026");
    expect(preview?.issues.filter((issue) => issue.record !== null)).toHaveLength(10);
    for (const issue of preview!.issues) {
      expect(issue.record?.publication).toBe("draft");
      expect(issue.record?.approval).toBeNull();
    }
    expect(preview!.sources.map((source) => source.id)).toContain("crow-campaign-values-20261025");
    expect(await repository.list("platformIssues")).toEqual([]);
    expect(await getCandidatePlatformPreview(repository, "unknown-candidacy")).toBeNull();
  });

  it.each(["production", "test"])("disables preview before any research read in %s", async (environment) => {
    vi.stubEnv("NODE_ENV", environment);
    const repository = createFileRepository(file);
    const get = vi.spyOn(repository, "get");
    expect(await getCandidatePlatformPreview(repository, "jason-crow-2026")).toBeNull();
    expect(get).not.toHaveBeenCalled();
  });
  it("retains ten evidence-backed issue drafts without inventing human approval", async () => {
    const data = datasetSchema.parse(JSON.parse(await readFile(file, "utf8")));
    const drafts = data.platformIssues.filter((record) => record.candidacyId === "jason-crow-2026");
    expect(drafts.map((record) => record.issueId).sort()).toEqual(PLATFORM_ISSUES.map((issue) => issue.id).sort());
    for (const draft of drafts) {
      expect(draft.publication).toBe("draft");
      expect(draft.review).toEqual({ state: "draft", reviewer: null, reviewedAt: null });
      expect(draft.approval).toBeNull();
      expect(draft.proposals.length).toBeGreaterThan(0);
      for (const proposal of draft.proposals) {
        expect(proposal.evidence.length).toBeGreaterThan(0);
        for (const evidence of proposal.evidence) {
          expect(data.sources.find((source) => source.id === evidence.sourceId)).toBeDefined();
        }
      }
    }
  });

  it("never returns collected Crow drafts or draft-only citations on his public page", async () => {
    const repository = createFileRepository(file);
    const platform = await getCandidatePlatform(repository, "jason-crow-2026");
    expect(platform).not.toBeNull();
    expect(platform!.issues).toHaveLength(10);
    expect(platform!.issues.every((issue) => issue.record === null)).toBe(true);
    expect(platform!.sources.map((source) => source.id)).not.toContain("crow-campaign-values-20261025");
    expect(platform!.sources.map((source) => source.id)).not.toContain("crow-house-issues-20261025");
    expect(await repository.list("platformIssues")).toEqual([]);
  });
});
