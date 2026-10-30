import { candidatePath, statewideCandidatePath, COLORADO_ELECTION_YEAR, COLORADO_STATEWIDE_OFFICES } from "../domain/elections";
import type { ResearchRepository } from "./types";

export type BrowserDestination = { id: string; label: string; href: string };
export type BrowserRace = { id: string; label: string; districts: BrowserDestination[]; destination?: BrowserDestination };
export type BrowserState = { id: string; label: string; races: BrowserRace[] };

/** Candidate rosters are public independently of draft platform research.
 * Only include races supported by the existing public candidates route.
 */
export async function getNavigationCoverage(repository: ResearchRepository): Promise<BrowserState[]> {
  const [races, candidacies, geographies, elections] = await Promise.all([
    repository.list("races"), repository.list("candidacies"),
    repository.list("geographies"), repository.list("elections"),
  ]);
  const districts = races.flatMap((race) => {
    const geography = geographies.find((entry) => entry.id === race.geographyId);
    const election = elections.find((entry) => entry.id === race.electionId);
    const match = geography?.id.match(/^co-district-([1-8])$/);
    if (race.office !== "house" || !match || election?.cycle !== COLORADO_ELECTION_YEAR
      || election.stage !== "general" || !election.date
      || !candidacies.some((entry) => entry.raceId === race.id)) return [];
    const number = Number(match[1]);
    if (race.id !== `co-${COLORADO_ELECTION_YEAR}-district-${number}-general`) return [];
    return [{ id: race.id, label: `District ${number}`, href: candidatePath(number) }];
  }).sort((a, b) => a.label.localeCompare(b.label, "en", { numeric: true }));
  const state = geographies.find((entry) => entry.id === "co" && entry.type === "state");
  const available: BrowserRace[] = [];
  if (districts.length) available.push({ id: "house", label: "U.S. House", districts });
  for (const { office, label } of COLORADO_STATEWIDE_OFFICES) {
    const race = races.find((race) => race.id === `co-${COLORADO_ELECTION_YEAR}-${office}-general`
      && race.office === office && race.geographyId === "co"
      && elections.some((election) => election.id === race.electionId && election.cycle === COLORADO_ELECTION_YEAR
        && election.stage === "general" && election.date)
      && candidacies.some((entry) => entry.raceId === race.id));
    if (race) available.push({ id: office, label, districts: [], destination: { id: race.id, label: "Candidates", href: statewideCandidatePath(office) } });
  }
  return state && available.length ? [{ id: state.id, label: state.name, races: available }] : [];
}
