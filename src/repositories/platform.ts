import { PLATFORM_ISSUES, type PlatformIssueId } from "../domain/platform";
import type { Entity } from "../domain/schema";
import { RepositoryError, type ResearchRepository } from "./types";

export interface CandidatePlatform {
  candidacy: Entity<"candidacies">;
  candidate: Entity<"candidates">;
  race: Entity<"races">;
  election: Entity<"elections">;
  geography: Entity<"geographies">;
  issues: { id: PlatformIssueId; label: string; record: Entity<"platformIssues"> | null }[];
  sources: Entity<"sources">[];
}

/** Every taxonomy issue is returned, in taxonomy order. Unresearched issues have a null record. */
export async function getCandidatePlatform(repository: ResearchRepository, candidacyId: string): Promise<CandidatePlatform | null> {
  const candidacy = await repository.get("candidacies", candidacyId);
  if (!candidacy) return null;
  const race = await repository.get("races", candidacy.raceId);
  if (!race) throw new RepositoryError("Candidacy race is unavailable");
  if (race.office !== "house") return null;
  const [candidate, election, geography, records, sources] = await Promise.all([
    repository.get("candidates", candidacy.candidateId),
    repository.get("elections", race.electionId),
    repository.get("geographies", race.geographyId),
    repository.list("platformIssues"),
    repository.list("sources"),
  ]);
  if (!candidate || !election || !geography) throw new RepositoryError("Candidate platform context is unavailable");
  const latest = new Map<PlatformIssueId, Entity<"platformIssues">>();
  for (const record of records) {
    if (record.candidacyId !== candidacyId || record.publication !== "published" || !record.approval || record.review.state !== "reviewed") continue;
    const previous = latest.get(record.issueId);
    if (!previous || record.version > previous.version) latest.set(record.issueId, record);
  }
  const issues = PLATFORM_ISSUES.map((issue) => ({ ...issue, record: latest.get(issue.id) ?? null }));
  const sourceIds = new Set([
    ...candidacy.sourceIds, ...candidate.sourceIds, ...race.sourceIds, ...election.sourceIds,
    ...geography.boundarySourceIds,
    ...(candidacy.campaignWebsite ? [candidacy.campaignWebsite.sourceId] : []),
    ...(candidate.birthDateSourceId ? [candidate.birthDateSourceId] : []),
    ...(candidate.portrait ? [candidate.portrait.sourceId] : []),
    ...issues.flatMap((issue) => issue.record?.sourceIds ?? []),
  ]);
  return { candidacy, candidate, race, election, geography, issues, sources: sources.filter((source) => sourceIds.has(source.id)) };
}
