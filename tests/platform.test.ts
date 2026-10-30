import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { PLATFORM_ISSUES } from "../src/domain/platform";
import { datasetSchema, type Dataset, type Entity } from "../src/domain/schema";
import { getCandidatePlatform } from "../src/repositories";
import { createFileRepository } from "../src/repositories/file";
import { platformIssueFixture, platformResearchFixture, researchFixture } from "./fixtures/research";

const directories: string[] = [];
afterEach(async () => { await Promise.all(directories.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))); });
async function repository(data: Dataset) {
  const dir = await mkdtemp(join(tmpdir(), "voter-platform-test-"));
  directories.push(dir);
  const file = join(dir, "research.json");
  await writeFile(file, JSON.stringify(data));
  return createFileRepository(pathToFileURL(file));
}
function draft(version: number): Entity<"platformIssues"> {
  return { ...platformIssueFixture(), id: `platform-economy-v${version}`, version, publication: "draft", approval: null, review: { state: "draft", reviewer: null, reviewedAt: null } };
}

describe("platform contracts", () => {
  it("defaults an absent collection for existing datasets", () => {
    const { platformIssues, ...legacy } = researchFixture();
    expect(platformIssues).toEqual([]);
    expect(datasetSchema.parse(legacy).platformIssues).toEqual([]);
  });
  it("accepts approved published revisions and unapproved drafts", () => {
    const data = platformResearchFixture();
    data.platformIssues.push(draft(2));
    expect(datasetSchema.safeParse(data).success).toBe(true);
  });
  it.each([
    ["publication without explicit approval", (r: Entity<"platformIssues">) => { r.approval = null; }],
    ["publication without editorial review", (r: Entity<"platformIssues">) => { r.review = { state: "draft", reviewer: null, reviewedAt: null }; }],
    ["blank human approver", (r: Entity<"platformIssues">) => { r.approval!.humanReviewer = "  "; }],
    ["invalid approval date", (r: Entity<"platformIssues">) => { r.approval!.approvedAt = "2026-02-30"; }],
    ["approved draft", (r: Entity<"platformIssues">) => { r.publication = "draft"; }],
    ["missing proposals for a found position", (r: Entity<"platformIssues">) => { r.proposals = []; }],
    ["proposals for a no-position finding", (r: Entity<"platformIssues">) => { r.status = "no-position-found"; }],
    ["empty evidence", (r: Entity<"platformIssues">) => { r.proposals[0]!.evidence = []; }],
    ["blank excerpt", (r: Entity<"platformIssues">) => { r.proposals[0]!.evidence[0]!.excerpt = "  "; }],
    ["blank locator", (r: Entity<"platformIssues">) => { r.proposals[0]!.evidence[0]!.locator = "  "; }],
    ["blank summary", (r: Entity<"platformIssues">) => { r.proposals[0]!.summary = "  "; }],
    ["dangling evidence source", (r: Entity<"platformIssues">) => { r.proposals[0]!.evidence[0]!.sourceId = "missing"; }],
    ["dangling revision source", (r: Entity<"platformIssues">) => { r.sourceIds.push("missing"); }],
    ["dangling candidacy", (r: Entity<"platformIssues">) => { r.candidacyId = "missing"; }],
    ["zero version", (r: Entity<"platformIssues">) => { r.version = 0; }],
    ["fractional version", (r: Entity<"platformIssues">) => { r.version = 1.5; }],
    ["duplicate proposal ID", (r: Entity<"platformIssues">) => { r.proposals.push(structuredClone(r.proposals[0]!)); }],
  ] as const)("rejects %s", (_name, mutate) => {
    const data = platformResearchFixture();
    mutate(data.platformIssues[0]!);
    expect(datasetSchema.safeParse(data).success).toBe(false);
  });
  it("rejects evidence from an existing source outside revision sourceIds", () => {
    const data = platformResearchFixture();
    data.sources.push({ ...data.sources[0]!, id: "other-source" });
    data.platformIssues[0]!.proposals[0]!.evidence[0]!.sourceId = "other-source";
    expect(datasetSchema.safeParse(data).success).toBe(false);
  });
  it("rejects unsupported issue IDs", () => {
    const data = platformResearchFixture();
    expect(datasetSchema.safeParse({ ...data, platformIssues: [{ ...data.platformIssues[0], issueId: "other" }] }).success).toBe(false);
  });
  it("requires globally unique revision IDs and unique candidacy/issue/version tuples", () => {
    const data = platformResearchFixture();
    data.platformIssues.push({ ...platformIssueFixture(), version: 2 });
    expect(datasetSchema.safeParse(data).success).toBe(false);
    data.platformIssues[1] = { ...platformIssueFixture(), id: "different-id" };
    expect(datasetSchema.safeParse(data).success).toBe(false);
    data.platformIssues[1]!.issueId = "housing";
    expect(datasetSchema.safeParse(data).success).toBe(true);
  });
  it("requires sources and research scope for no-position findings", () => {
    const data = platformResearchFixture();
    const record = data.platformIssues[0]!;
    record.status = "no-position-found";
    record.proposals = [];
    expect(datasetSchema.safeParse(data).success).toBe(true);
    record.researchScope = " ";
    expect(datasetSchema.safeParse(data).success).toBe(false);
    record.researchScope = "Reviewed the synthetic campaign page";
    record.sourceIds = [];
    expect(datasetSchema.safeParse(data).success).toBe(false);
  });
  it("rejects platform records for Senate candidacies", () => {
    const data = researchFixture();
    data.platformIssues = [platformIssueFixture()];
    expect(datasetSchema.safeParse(data).success).toBe(false);
  });
});

describe("getCandidatePlatform", () => {
  it("joins context, returns all taxonomy issues, and excludes unrelated sources", async () => {
    const data = platformResearchFixture();
    data.sources.push({ ...data.sources[0]!, id: "platform-source" }, { ...data.sources[0]!, id: "unrelated" });
    data.platformIssues[0]!.sourceIds.push("platform-source");
    const platform = await getCandidatePlatform(await repository(data), "candidacy");
    expect(platform).toMatchObject({ candidacy: { id: "candidacy" }, candidate: { id: "person" }, race: { id: "race" }, election: { id: "election" }, geography: { id: "district" } });
    expect(platform!.issues.map(({ id, label }) => ({ id, label }))).toEqual(PLATFORM_ISSUES);
    expect(platform!.issues[0]!.record?.id).toBe("platform-economy-v1");
    expect(platform!.issues.slice(1).every((issue) => issue.record === null)).toBe(true);
    expect(platform!.sources.map((source) => source.id)).toEqual(["source", "platform-source"]);
  });
  it("filters drafts at the public boundary and retains the previous approved revision", async () => {
    const data = platformResearchFixture();
    data.sources.push({ ...data.sources[0]!, id: "draft-source" });
    const pending = draft(2);
    pending.sourceIds.push("draft-source");
    data.platformIssues.push(pending);
    const repo = await repository(data);
    expect((await repo.list("platformIssues")).map((record) => record.version)).toEqual([1]);
    expect(await repo.get("platformIssues", pending.id, 2)).toBeNull();
    const platform = await getCandidatePlatform(repo, "candidacy");
    expect(platform!.issues[0]!.record?.version).toBe(1);
    expect(platform!.sources.map((source) => source.id)).toEqual(["source"]);
  });
  it("selects by numeric version, not storage order or research date", async () => {
    const data = platformResearchFixture();
    const latest = { ...platformIssueFixture(), id: "economy-v10", version: 10, researchedAt: "2026-10-01" };
    data.platformIssues.unshift(latest);
    data.platformIssues.push({ ...platformIssueFixture(), id: "economy-v2", version: 2 });
    expect(datasetSchema.safeParse(data).success).toBe(true);
    const platform = await getCandidatePlatform(await repository(data), "candidacy");
    expect(platform!.issues[0]!.record?.id).toBe(latest.id);
  });
  it("keeps issues and candidacies independent", async () => {
    const data = platformResearchFixture();
    data.candidacies.push({ ...data.candidacies[0]!, id: "other-candidacy" });
    data.platformIssues.push(
      { ...platformIssueFixture(), id: "housing-v1", issueId: "housing", status: "no-position-found", proposals: [] },
      { ...platformIssueFixture(), id: "other-economy", candidacyId: "other-candidacy", version: 20 },
    );
    const platform = await getCandidatePlatform(await repository(data), "candidacy");
    expect(platform!.issues[0]!.record?.version).toBe(1);
    expect(platform!.issues[1]!.record?.status).toBe("no-position-found");
  });
  it("returns null records for draft-only or unresearched issues", async () => {
    const data = platformResearchFixture();
    data.platformIssues = [draft(1)];
    const platform = await getCandidatePlatform(await repository(data), "candidacy");
    expect(platform!.issues).toHaveLength(10);
    expect(platform!.issues.every((issue) => issue.record === null)).toBe(true);
    data.platformIssues = [];
    expect((await getCandidatePlatform(await repository(data), "candidacy"))!.issues.every((issue) => issue.record === null)).toBe(true);
  });
  it("returns null for absent and non-House candidacies", async () => {
    const repo = await repository(researchFixture());
    expect(await getCandidatePlatform(repo, "missing")).toBeNull();
    expect(await getCandidatePlatform(repo, "candidacy")).toBeNull();
  });
  it("fails closed when an unapproved revision is marked published", async () => {
    const data = platformResearchFixture();
    data.platformIssues[0]!.approval = null;
    await expect(getCandidatePlatform(await repository(data), "candidacy")).rejects.toThrow("Research data could not be loaded or validated");
  });
});
