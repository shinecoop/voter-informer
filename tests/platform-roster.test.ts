import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { datasetSchema } from "../src/domain/schema";
import { createFileRepository } from "../src/repositories/file";
import { getCandidatePlatformForUserTesting } from "../src/repositories/platform-preview";
const file = new URL("../data/research.json", import.meta.url);

describe("roster evidence and common reader", () => {
  it("covers every candidacy with a research scope and ten bounded issue findings", async () => {
    const data = datasetSchema.parse(JSON.parse(await readFile(file, "utf8")));
    const repository = createFileRepository(file);
    expect(data.platformResearch).toHaveLength(data.candidacies.length);
    for (const candidacy of data.candidacies) {
      const platform = await getCandidatePlatformForUserTesting(repository, candidacy.id);
      expect(platform?.research?.scope).toBeTruthy();
      expect(platform?.research?.limitations).toBeTruthy();
      expect(platform?.issues).toHaveLength(10);
      expect(platform?.research?.issueChecks).toHaveLength(10);
      for (const issue of platform!.issues) {
        const check = platform!.research!.issueChecks!.find(check => check.issueId === issue.id);
        expect(check?.finding).toBe(issue.record?.status === "position-found" ? "position-found" : "no-supported-summary");
        expect(check?.notes).toBeTruthy();
      }
      for (const { record } of platform!.issues) {
        if (!record) continue;
        expect(record.publication).toBe("draft");
        expect(record.approval).toBeNull();
        for (const proposal of record.proposals) {
          for (const quote of proposal.summary.matchAll(/“([^”]+)”/g)) {
            expect(proposal.evidence.some(e => e.excerpt.replace(/\s+/g, " ").includes(quote[1]!.replace(/[,.]$/, "")))).toBe(true);
          }
          for (const evidence of proposal.evidence) {
            expect(record.sourceIds).toContain(evidence.sourceId);
            expect(platform!.sources.some(source => source.id === evidence.sourceId)).toBe(true);
          }
        }
      }
    }
  });
  it("keeps conflicting Sallis source descriptions visible and qualified", async () => {
    const platform = await getCandidatePlatformForUserTesting(createFileRepository(file), "dan-kilo-sallis-2026");
    expect(platform?.research?.limitations).toContain("Both descriptions");
    expect(platform?.issues.find(issue => issue.id === "foreign-policy")?.record?.proposals).toHaveLength(2);
  });
  it("accounts for every portrait with a resolving source and a checked local image or an explicit limitation", async () => {
    const data = datasetSchema.parse(JSON.parse(await readFile(file, "utf8")));
    const audits = JSON.parse(await readFile(new URL("../data/portrait-research.json", import.meta.url), "utf8")) as Array<{
      candidateId: string; status: "added" | "retained" | "unavailable" | "withheld";
      sourceIds: string[]; notes: string; localSha256?: string;
    }>;
    expect(audits.map(audit => audit.candidateId).sort()).toEqual(data.candidates.map(candidate => candidate.id).sort());
    for (const candidate of data.candidates) {
      const audit = audits.find(audit => audit.candidateId === candidate.id)!;
      expect(audit.notes).toBeTruthy();
      expect(audit.sourceIds.length).toBeGreaterThan(0);
      for (const id of audit.sourceIds) expect(data.sources.some(source => source.id === id)).toBe(true);
      if (!candidate.portrait) {
        expect(["unavailable", "withheld"]).toContain(audit.status);
        continue;
      }
      expect(audit.status).not.toBe("unavailable");
      expect(audit.status).not.toBe("withheld");
      expect(audit.sourceIds).toContain(candidate.portrait.sourceId);
      const bytes = await readFile(new URL(`../public${candidate.portrait.src}`, import.meta.url));
      expect([...bytes.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(audit.localSha256);
    }
  });
  it("does not assign another member's official site or the unresolved Robinson page to Gabe Evans or Cory Robertson", async () => {
    const data = datasetSchema.parse(JSON.parse(await readFile(file, "utf8")));
    for (const record of data.platformIssues.filter(record => record.candidacyId === "gabe-evans-2026")) {
      for (const evidence of record.proposals.flatMap(proposal => proposal.evidence)) {
        const source = data.sources.find(source => source.id === evidence.sourceId)!;
        if (source.type === "official") expect(new URL(source.url).hostname).toBe("gabeevans.house.gov");
      }
    }
    for (const record of data.platformIssues.filter(record => record.candidacyId === "cory-robertson-2026")) {
      for (const evidence of record.proposals.flatMap(proposal => proposal.evidence)) {
        const source = data.sources.find(source => source.id === evidence.sourceId)!;
        expect(new URL(source.url).hostname).not.toBe("lpcocolorado.my.canva.site");
      }
    }
  });
});
