import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, expect, it } from "vitest";
import { researchFixture } from "./fixtures/research";
import { createFileRepository } from "../src/repositories/file";
import type { StatewideOffice } from "../src/domain/elections";
import { getSenateCandidateList, getStatewideCandidateList } from "../src/repositories/candidates";
import { getNavigationCoverage } from "../src/repositories/navigation";

const directories: string[] = [];
afterEach(async () => { await Promise.all(directories.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))); });

async function senateRepository(withCandidates = true, office: StatewideOffice = "senate") {
  const data = researchFixture();
  data.geographies[0]!.id = "co";
  data.geographies[0]!.name = "Colorado";
  data.races[0]!.id = "co-2026-senate-general";
  data.races[0]!.geographyId = "co";
  data.candidacies[0]!.raceId = "co-2026-senate-general";
  data.questions[0]!.raceIds = ["co-2026-senate-general"];
  data.candidates[0]!.birthDate = "1952-02-07";
  data.candidates[0]!.birthDateSourceId = "source";
  data.candidates.push({ id: "another", givenName: "Adam", familyName: "Test", biography: null, sourceIds: ["source"] });
  data.candidacies.push({ ...data.candidacies[0]!, id: "write-in", candidateId: "another", ballotQualified: false, status: "certified-write-in" });
  if (!withCandidates) {
    data.candidacies = [];
    data.positions = [];
  }
  data.races[0]!.office = office;
  data.races[0]!.id = `co-2026-${office}-general`;
  data.candidacies.forEach((candidacy) => { candidacy.raceId = data.races[0]!.id; });
  data.questions[0]!.raceIds = [data.races[0]!.id];
  if (office === "governor" && withCandidates) data.candidacies[0]!.runningMateCandidateId = "another";
  const dir = await mkdtemp(join(tmpdir(), "senate-test-"));
  directories.push(dir);
  const file = join(dir, "research.json");
  await writeFile(file, JSON.stringify(data));
  return createFileRepository(pathToFileURL(file));
}

it("lists statewide candidates in first-name order with write-ins and election-date ages", async () => {
  const repository = await senateRepository();
  const result = await getSenateCandidateList(repository, "2026");
  expect(result?.candidates.map((candidate) => candidate.givenName)).toEqual(["Adam", "Synthetic"]);
  expect(result?.candidates[0]).toMatchObject({ status: "certified-write-in", age: null });
  expect(result?.candidates[1]?.age).toBe(74);
  expect(result?.sources.map((source) => source.id)).toContain("source");
  expect(await getSenateCandidateList(repository, "2024")).toBeNull();
});

it("exposes a statewide destination without districts and omits empty rosters from navigation", async () => {
  const coverage = await getNavigationCoverage(await senateRepository());
  expect(coverage[0]?.races).toEqual([{ id: "senate", label: "U.S. Senate", districts: [], destination: { id: "co-2026-senate-general", label: "Candidates", href: "/2026/colorado/us-senate/candidates" } }]);
  expect(await getNavigationCoverage(await senateRepository(false))).toEqual([]);
});


it.each(["governor", "secretary-of-state", "treasurer"] as const)("loads %s as a statewide race and exposes its destination", async (office) => {
  const repository = await senateRepository(true, office);
  const result = await getStatewideCandidateList(repository, "2026", office);
  expect(result?.candidates).toHaveLength(2);
  expect(await getStatewideCandidateList(repository, "2024", office)).toBeNull();
  expect(await getStatewideCandidateList(repository, "2026", "senate")).toBeNull();
  expect((await getNavigationCoverage(repository))[0]?.races[0]?.destination?.href).toBe(`/2026/colorado/${office}/candidates`);
  if (office === "governor") expect(result?.candidates.find((candidate) => candidate.candidacyId === "candidacy")?.runningMate?.givenName).toBe("Adam");
});
