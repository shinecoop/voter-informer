import { describe, expect, it } from "vitest";
import { datasetSchema } from "../src/domain/schema";
import { researchFixture } from "./fixtures/research";

describe("research validation", () => {
  it("accepts the synthetic linked dataset", () => {
    expect(datasetSchema.safeParse(researchFixture()).success).toBe(true);
  });
  it.each([
    ["dangling source", (d: ReturnType<typeof researchFixture>) => { d.sources = []; }],
    ["dangling candidacy", (d: ReturnType<typeof researchFixture>) => { d.candidacies = []; }],
    ["duplicate identities", (d: ReturnType<typeof researchFixture>) => { d.candidates.push({ ...d.candidates[0]! }); }],
    ["invalid calendar date", (d: ReturnType<typeof researchFixture>) => { d.elections[0]!.date = "2026-02-30"; }],
    ["House assigned to a state", (d: ReturnType<typeof researchFixture>) => { d.races[0]!.office = "house"; }],
    ["missing question version", (d: ReturnType<typeof researchFixture>) => { d.positions[0]!.questionVersion = 2; }],
    ["question outside race", (d: ReturnType<typeof researchFixture>) => { d.questions[0]!.raceIds = ["other-race"]; }],
    ["unreviewed published summary", (d: ReturnType<typeof researchFixture>) => { d.positions[0]!.review = { state: "draft", reviewer: null, reviewedAt: null }; }],
    ["missing reviewer", (d: ReturnType<typeof researchFixture>) => { d.positions[0]!.review.reviewer = null; }],
    ["malformed source URL", (d: ReturnType<typeof researchFixture>) => { d.sources[0]!.url = "not a URL"; }],
    ["unsafe source URL", (d: ReturnType<typeof researchFixture>) => { d.sources[0]!.url = "javascript:alert(1)"; }],
  ] as const)("rejects %s", (_name, mutate) => {
    const data = researchFixture(); mutate(data);
    expect(datasetSchema.safeParse(data).success).toBe(false);
  });
  it("rejects unsupported policy labels", () => {
    const data = researchFixture();
    const malformed = { ...data, positions: [{ ...data.positions[0], label: "centrist" }] };
    expect(datasetSchema.safeParse(malformed).success).toBe(false);
  });
  it("retains historical question versions", () => {
    const data = researchFixture(); data.questions.push({ ...data.questions[0]!, version: 2 });
    expect(datasetSchema.safeParse(data).success).toBe(true);
  });
});


it.each(["governor", "secretary-of-state", "treasurer"] as const)("requires state geography for %s", (office) => {
  const data = researchFixture();
  data.races[0]!.office = office;
  expect(datasetSchema.safeParse(data).success).toBe(true);
  data.geographies.push({ ...data.geographies[0]!, id: "district", type: "district", stateId: "state" });
  data.races[0]!.geographyId = "district";
  expect(datasetSchema.safeParse(data).success).toBe(false);
});

it("requires a distinct resolving running mate on a governor ticket", () => {
  const data = researchFixture();
  data.candidates.push({ ...data.candidates[0]!, id: "mate" });
  data.candidacies[0]!.runningMateCandidateId = "mate";
  expect(datasetSchema.safeParse(data).success).toBe(false);
  data.races[0]!.office = "governor";
  expect(datasetSchema.safeParse(data).success).toBe(true);
  data.candidacies[0]!.runningMateCandidateId = "person";
  expect(datasetSchema.safeParse(data).success).toBe(false);
  data.candidacies[0]!.runningMateCandidateId = "absent";
  expect(datasetSchema.safeParse(data).success).toBe(false);
});
