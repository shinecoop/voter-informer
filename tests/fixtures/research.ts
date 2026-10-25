import type { Dataset } from "../../src/domain/schema";

/** Synthetic records only. Never imported by application code. */
export function researchFixture(): Dataset {
  return {
    sources: [{ id: "source", url: "https://example.org/synthetic", title: "Synthetic evidence", type: "official", publisher: "Test publisher", publishedAt: null, eventDate: null, retrievedAt: "2026-10-01", locator: "Synthetic test record" }],
    geographies: [{ id: "state", name: "Synthetic state", type: "state", stateId: null, boundaryVintage: "2026", boundarySourceIds: ["source"], geometryRef: "synthetic-state", overlappingCountyIds: [] }],
    elections: [{ id: "election", cycle: 2026, stage: "general", date: "2026-11-03", status: "scheduled", sourceIds: ["source"] }],
    races: [{ id: "race", office: "senate", electionId: "election", geographyId: "state", sourceIds: ["source"] }],
    candidates: [{ id: "person", givenName: "Synthetic", familyName: "Candidate", biography: null, sourceIds: ["source"] }],
    candidacies: [{ id: "candidacy", candidateId: "person", raceId: "race", party: "Test affiliation", ballotQualified: true, status: "qualified", statusDate: "2026-10-01", sourceIds: ["source"] }],
    questions: [{ id: "question", version: 1, wording: "Should synthetic policy A be adopted?", topic: "Test policy", raceIds: ["race"] }],
    positions: [{ id: "position", candidacyId: "candidacy", questionId: "question", questionVersion: 1, kind: "platform-summary", statement: "Synthetic summary", label: "supports", evidenceDate: "2026-10-01", researchedAt: "2026-10-02", researchScope: "Synthetic document only", sourceIds: ["source"], publication: "published", review: { state: "reviewed", reviewer: "test-editor", reviewedAt: "2026-10-02" } }],
    records: [], localSelections: [], freshness: [], coverage: [], historicalResults: [],
  };
}
