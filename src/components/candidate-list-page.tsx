import Image from "next/image";
import Link from "next/link";
import { RaceBrowser } from "./race-browser";
import { PlatformNavigation } from "./platform-navigation";
import { getNavigationCoverage } from "../repositories/navigation";
import { getRepository } from "../repositories";
import type { getSenateCandidateList } from "../repositories/candidates";

type CandidateList = NonNullable<Awaited<ReturnType<typeof getSenateCandidateList>>>;

export async function CandidateListPage({ result, officeLabel, listLabel, rosterCheckedAt, platformBasePath }: {
  result: CandidateList;
  officeLabel: string;
  listLabel: string;
  rosterCheckedAt: string;
  platformBasePath?: string;
}) {
  const { year } = result;
  return (
    <main className="candidate-page">
      <RaceBrowser coverage={await getNavigationCoverage(getRepository())} />
      <PlatformNavigation />
      <div className="candidate-content" id="race-page-content" tabIndex={-1}>

        <header className="candidate-header">
          <h1>Candidates</h1>
          <p>{officeLabel} · General election · November 3, {year}</p>
        </header>
        <ul className="candidate-list" aria-label={listLabel}>
          {result.candidates.map((candidate) => (
            <li key={candidate.candidacyId} id={candidate.candidacyId} className="candidate-row">
              {candidate.portrait ? (
                <Image className="candidate-avatar" src={candidate.portrait.src} width={64} height={64} unoptimized alt={`Portrait of ${candidate.givenName} ${candidate.familyName}`} />
              ) : (
                <span className="candidate-avatar candidate-avatar-missing" role="img" aria-label={`Photo unavailable for ${candidate.givenName} ${candidate.familyName}`}>
                  <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="24" r="11" /><path d="M11 62v-9a21 21 0 0 1 42 0v9Z" /></svg>
                </span>
              )}
              <div className="candidate-identity">
                              <h2>{platformBasePath ? <Link className="candidate-name" href={`${platformBasePath}/${candidate.candidacyId}`}>{candidate.familyName}, {candidate.givenName}</Link> : <span>{candidate.familyName}, {candidate.givenName}</span>}</h2>
                              {candidate.runningMate && <p>Lieutenant governor: {candidate.runningMate.givenName} {candidate.runningMate.familyName}</p>}
                              {platformBasePath && <Link className="candidate-platform-link" href={`${platformBasePath}/${candidate.candidacyId}`}>View platform</Link>}
                              {candidate.campaignWebsite && (
                                <a className="candidate-website" href={candidate.campaignWebsite.url}>
                                  {new URL(candidate.campaignWebsite.url).hostname.replace(/^www\./, "")}
                                </a>
                              )}
                            </div>
              <div className="candidate-meta">
                <span>{candidate.age === null ? "Age unavailable" : `Age ${candidate.age}`}</span>
                <span>{candidate.party}</span>
                {candidate.status === "certified-write-in" && <span className="candidate-status">Certified write-in</span>}
                {candidate.status === "withdrawn" && <span className="candidate-status">Withdrawn</span>}
              </div>
            </li>
          ))}
        </ul>
        {result.candidates.length === 0 && <p>No candidate records have been collected for this race yet.</p>}
        <footer className="candidate-notes">
          <p>Roster checked {rosterCheckedAt}. Ages on November 3, {year}. Unverified ages and photos are marked unavailable.</p>
          <p>Certified write-ins are included and labeled; their names are not printed on the ballot.</p>
          <details>
            <summary>Sources &amp; photo credits</summary>
            <ul>{result.sources.map((source) => <li key={source.id}><a href={source.url}>{source.title}</a><span> · Retrieved {source.retrievedAt}</span></li>)}</ul>
            <ul>{result.candidates.map((candidate) => candidate.portrait && (
              <li key={candidate.id}>{candidate.givenName} {candidate.familyName}: {candidate.portrait.credit}. Original file unchanged; circular display crop.
                {candidate.portrait.licenseUrl && <> <a href={candidate.portrait.licenseUrl}>Image license</a>.</>}
              </li>
            ))}</ul>
          </details>
        </footer>
      </div>
    </main>
  );
}
