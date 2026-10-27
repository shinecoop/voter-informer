import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlatformNavigation } from "../../../../../components/platform-navigation";
import { COLORADO_ELECTION_YEAR } from "../../../../../domain/elections";
import { getDistrictCandidateList, getRepository } from "../../../../../repositories";

export const dynamicParams = false;
export const metadata = { title: "Congressional Candidates | Voter Informer" };

export function generateStaticParams() {
  return Array.from({ length: 8 }, (_, index) => ({ year: String(COLORADO_ELECTION_YEAR), district: `district${index + 1}` }));
}

export default async function Candidates({ params }: { params: Promise<{ year: string; district: string }> }) {
  const { year, district } = await params;
  const result = await getDistrictCandidateList(getRepository(), year, district);
  if (!result) notFound();
  return (
    <main className="candidate-page">
      <PlatformNavigation />
      <div className="candidate-content">
        <Link href="/" className="candidate-back">← Back to map</Link>
        <header className="candidate-header">
          <p>{year} / Colorado / District {result.districtNumber}</p>
          <h1>Candidates</h1>
          <p>U.S. House · General election · November 3, {year}</p>
        </header>
        <ul className="candidate-list" aria-label={`Colorado district ${result.districtNumber} candidates`}>
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
                              <h2><Link className="candidate-name" href={`/platforms/${candidate.candidacyId}`}>{candidate.familyName}, {candidate.givenName}</Link></h2>
                              <Link className="candidate-platform-link" href={`/platforms/${candidate.candidacyId}`}>View platform</Link>
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
          <p>Roster checked October 24, 2026. Ages on November 3, {year}. Unverified ages and photos are marked unavailable.</p>
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
