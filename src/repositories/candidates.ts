import type { Entity } from "../domain/schema";
import { COLORADO_ELECTION_YEAR, ageOnDate, type StatewideOffice } from "../domain/elections";
import type { ResearchRepository } from "./types";
import { RepositoryError } from "./types";

export async function getDistrictCandidateList(repository: ResearchRepository, year: string, district: string) {
  if (year !== String(COLORADO_ELECTION_YEAR) || !/^district[1-8]$/.test(district)) return null;
  const districtNumber = Number(district.slice("district".length));
  const race = await repository.get("races", `co-${year}-district-${districtNumber}-general`);
  if (!race) return null;
  const result = await getRaceCandidateList(repository, year, race);
  return { ...result, districtNumber };
}

export async function getSenateCandidateList(repository: ResearchRepository, year: string) {
  return getStatewideCandidateList(repository, year, "senate");
}

export async function getStatewideCandidateList(repository: ResearchRepository, year: string, office: StatewideOffice) {
  if (year !== String(COLORADO_ELECTION_YEAR)) return null;
  const race = await repository.get("races", `co-${year}-${office}-general`);
  if (!race || race.office !== office || race.geographyId !== "co") return null;
  const election = await repository.get("elections", race.electionId);
  if (!election || election.cycle !== Number(year) || election.stage !== "general") return null;
  return getRaceCandidateList(repository, year, race);
}

async function getRaceCandidateList(repository: ResearchRepository, year: string, race: Entity<"races">) {
  const [election, candidacies, sources] = await Promise.all([
    repository.get("elections", race.electionId), repository.list("candidacies"), repository.list("sources"),
  ]);
  if (!election?.date) throw new RepositoryError("Election date is unavailable");
  const electionDate = election.date;
  const candidates = await Promise.all(candidacies.filter((entry) => entry.raceId === race.id).map(async (entry) => {
    const person = await repository.get("candidates", entry.candidateId);
    if (!person) throw new RepositoryError("Candidate identity is unavailable");
    const runningMate = entry.runningMateCandidateId ? await repository.get("candidates", entry.runningMateCandidateId) : null;
    if (entry.runningMateCandidateId && !runningMate) throw new RepositoryError("Running mate identity is unavailable");
    return {
      ...person,
      runningMate,
      candidacyId: entry.id,
      party: entry.party,
            campaignWebsite: entry.campaignWebsite,
      status: entry.status,
      age: ageOnDate(person.birthDate, electionDate),
    };
  }));
  candidates.sort((a, b) => a.givenName.localeCompare(b.givenName, "en", { sensitivity: "base" })
    || a.familyName.localeCompare(b.familyName, "en", { sensitivity: "base" }) || a.id.localeCompare(b.id, "en"));
  const sourceIds = new Set([
    ...race.sourceIds, ...election.sourceIds,
    ...candidates.flatMap((person) => person.runningMate?.sourceIds ?? []),
        ...candidates.flatMap((person) => person.campaignWebsite ? [person.campaignWebsite.sourceId] : []),
    ...candidates.flatMap((person) => [...person.sourceIds, ...(person.birthDateSourceId ? [person.birthDateSourceId] : []), ...(person.portrait ? [person.portrait.sourceId] : [])]),
  ]);
  return { year, electionDate: election.date, candidates, sources: sources.filter((source) => sourceIds.has(source.id)) };
}
