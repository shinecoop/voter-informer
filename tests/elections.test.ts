import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { ageOnDate, candidatePath } from "../src/domain/elections";
import { getDistrictCandidateList } from "../src/repositories/candidates";
import { createFileRepository } from "../src/repositories/file";
import { datasetSchema } from "../src/domain/schema";
import { researchFixture } from "./fixtures/research";

it.each([
  ["1986-12-19", "2026-11-03", 39],
  ["1986-12-19", "2026-12-19", 40],
  ["1967-01", "2026-11-03", 59],
  ["1967-01", "2026-01-15", null],
  [null, "2026-11-03", null],
  ["2030-01-01", "2026-11-03", null],
])("calculates sourced age for %s on %s", (birthDate, date, age) => {
  expect(ageOnDate(birthDate, date)).toBe(age);
});

it("constructs the requested year/state/district/candidates URL", () => {
  expect(candidatePath(8)).toBe("/2026/colorado/district8/candidates");
});

const directories: string[] = [];
afterEach(async () => { await Promise.all(directories.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))); });

describe("candidate list repository query", () => {
  it("keeps a race's write-ins and orders by first name, then surname", async () => {
    const data = researchFixture();
    data.elections[0]!.id = "co-2026-general";
    data.races[0]!.id = "co-2026-district-2-general";
    data.races[0]!.electionId = "co-2026-general";
    data.questions = []; data.positions = [];
    data.candidates = [
      { id: "zoe", givenName: "Zoe", familyName: "Able", biography: null, sourceIds: ["source"] },
      { id: "amy-z", givenName: "Amy", familyName: "Zebra", biography: null, sourceIds: ["source"] },
      { id: "amy-a", givenName: "Amy", familyName: "Alpha", biography: null, sourceIds: ["source"] },
    ];
    data.candidacies = data.candidates.map((person) => ({
      id: `${person.id}-participation`, candidateId: person.id, raceId: data.races[0]!.id,
      party: "Test party", ballotQualified: person.id !== "amy-z",
      status: person.id === "amy-z" ? "certified-write-in" : "qualified",
      statusDate: "2026-10-01", sourceIds: ["source"],
            ...(person.id === "amy-a" ? { campaignWebsite: { url: "https://www.example.com/issues?year=2026#policy", sourceId: "source" } } : {}),
    }));
    const directory = await mkdtemp(join(tmpdir(), "vi-candidate-test-")); directories.push(directory);
    const path = join(directory, "research.json"); await writeFile(path, JSON.stringify(data));
    const repository = createFileRepository(pathToFileURL(path));
    const result = await getDistrictCandidateList(repository, "2026", "district2");
    expect(result?.candidates.map((person) => person.id)).toEqual(["amy-a", "amy-z", "zoe"]);
    expect(result?.candidates[1]?.status).toBe("certified-write-in");
    expect(result?.candidates[0]?.age).toBeNull();
        expect(result?.candidates[0]?.campaignWebsite?.url).toBe("https://www.example.com/issues?year=2026#policy");
        expect(result?.candidates[1]?.campaignWebsite).toBeUndefined();
    expect(await getDistrictCandidateList(repository, "2024", "district2")).toBeNull();
    expect(await getDistrictCandidateList(repository, "2026", "district9")).toBeNull();
    expect(await getDistrictCandidateList(repository, "2026", "../../district2")).toBeNull();
    expect(await getDistrictCandidateList(repository, "2026", "district1")).toBeNull();
  });
});

it.each(["javascript:alert(1)", "data:text/html,test", "ftp://example.com"])("rejects unsafe campaign URL %s", (url) => {
  const data = researchFixture();
  data.candidacies[0]!.campaignWebsite = { url, sourceId: "source" };
  expect(datasetSchema.safeParse(data).success).toBe(false);
});

it("requires a resolving source for campaign websites", () => {
  const data = researchFixture();
  data.candidacies[0]!.campaignWebsite = { url: "https://www.example.com/issues?year=2026#policy", sourceId: "source" };
  expect(datasetSchema.safeParse(data).success).toBe(true);
  data.candidacies[0]!.campaignWebsite.sourceId = "missing";
  expect(datasetSchema.safeParse(data).success).toBe(false);
});

it("requires provenance for a birth date and a local portrait", () => {
  const data = researchFixture();
  data.candidates[0]!.birthDate = "1980-01-01";
  expect(datasetSchema.safeParse(data).success).toBe(false);
  data.candidates[0]!.birthDateSourceId = "source";
  expect(datasetSchema.safeParse(data).success).toBe(true);
  data.candidates[0]!.portrait = { src: "/portraits/synthetic.jpg", sourceId: "missing", credit: "Test publisher" };
  expect(datasetSchema.safeParse(data).success).toBe(false);
});
