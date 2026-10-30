import Link from "next/link";
import Image from "next/image";
import { PlatformNavigation } from "./platform-navigation";
import type { Entity } from "../domain/schema";
import { type CandidatePlatform, getRepository } from "../repositories";

function Source({ source }: { source: Entity<"sources"> }) {
  return (
    <div className="platform-source">
      <a href={source.url}>{source.title}</a>
      <p>Publisher: {source.publisher} · Publication date: {source.publishedAt ?? "Unknown"} · Retrieved: <time dateTime={source.retrievedAt}>{source.retrievedAt}</time></p>
      <p>Source locator: {source.locator}</p>
    </div>
  );
}

// Editorial emphasis for this preview, matched to unchanged, evidence-backed summaries.
const thesisPhrases: Record<string, string[]> = {
  workforce: ["investing in workforce development, apprenticeship training"],
  "affordable-supply": ["create affordable housing for both sale and rent"],
  "public-option": ["public health insurance option"],
  "education-access": ["affordable student loans", "accessible, reliable community-college and technical-training opportunities"],
  "international-climate": ["renewed cooperation with other countries on climate solutions", "clean-energy transitions"],
  dreamers: ["path to citizenship for Dreamers", "broader immigration reform"],
  "gun-safety": ["pass gun-safety laws while protecting Second Amendment rights"],
  "ethics-transparency": ["curb dark money in politics", "strengthen ethics rules"],
  "va-benefits": ["protecting veterans’ benefits", "improving access to, quality of, and timeliness of VA health care"],
  "global-engagement": ["U.S. leadership in international institutions", "promotion of human rights and democracy abroad"],
};

function ThesisStatement({ proposal, sourceById }: {
  proposal: Entity<"platformIssues">["proposals"][number];
  sourceById: Map<string, Entity<"sources">>;
}) {
  // These curated phrases describe the proposal's single supporting excerpt.
  // Keep unmatched or newly researched multi-source statements plain for editorial review.
  const evidence = proposal.evidence.length === 1 ? proposal.evidence[0] : undefined;
  const source = evidence && sourceById.get(evidence.sourceId);
  if (!source || !evidence) return proposal.summary;
  let offset = 0;
  const parts = [];
  for (const phrase of thesisPhrases[proposal.id] ?? []) {
    const start = proposal.summary.indexOf(phrase, offset);
    if (start < 0) continue;
    const preceding = proposal.summary.slice(offset, start);
    offset = start + phrase.length;
    parts.push(preceding, <a key={phrase} className="platform-claim" href={source.url} title={`${source.title} — ${evidence.locator}`}>{phrase}</a>);
  }
  return <>{parts}{proposal.summary.slice(offset)}</>;
}

export async function PlatformPage({ platform, preview = false }: { platform: CandidatePlatform; preview?: boolean }) {
  const { candidate, candidacy, election, geography, issues, sources } = platform;
  const state = geography.stateId ? await getRepository().get("geographies", geography.stateId) : null;
  const districtNumber = geography.id.match(/district-?(\d+)$/)?.[1];
  const listUrl = state?.id === "co" && districtNumber
    ? `/${election.cycle}/colorado/district${districtNumber}/candidates#${candidacy.id}`
    : null;
  const pending = issues.every((issue) => issue.record === null);
  const compactPreview = preview && candidacy.id === "jason-crow-2026";
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  return (
    <main className={`candidate-page platform-page${preview ? " platform-preview" : ""}${compactPreview ? " platform-preview-minimal" : ""}`}>
      <div className="candidate-content platform-content">
        {listUrl ? <Link href={listUrl} className="candidate-back">← Back to candidates</Link> : <Link href="/" className="candidate-back">← Back to map</Link>}
        {preview && <aside className="platform-pending" aria-label="Draft preview"><h2>Draft preview — not approved</h2><p>This local preview shows how the researched content will look. It does not record human review or publish these drafts. Source dates are unknown; current 2026 applicability still needs confirmation.</p><Link href={`/platforms/${candidacy.id}`}>View public page</Link></aside>}
        {!preview && process.env.NODE_ENV === "development" && <p><Link href={`/preview/platforms/${candidacy.id}`}>Preview draft platform</Link> · Local development only</p>}
        <header className="candidate-header">
          {preview && candidate.portrait && <Image className="platform-portrait" src={candidate.portrait.src} width={144} height={168} unoptimized alt={`Portrait of ${candidate.givenName} ${candidate.familyName}`} />}
          <p>{election.cycle} / {state?.name ?? "State unavailable"} / {geography.name}</p>
          <h1>{candidate.givenName} {candidate.familyName}</h1>
          {preview && <p className="platform-intro">Where the candidate stands</p>}
          <p>U.S. House · {geography.name} · {candidacy.party}</p>
          <p className="platform-election">{election.stage.charAt(0).toUpperCase() + election.stage.slice(1)} election · {election.date ?? "Election date unavailable"}</p>
          {candidacy.status === "certified-write-in" && <p>Certified write-in</p>}
          {candidacy.status === "withdrawn" && <p>Withdrawn</p>}
          {candidacy.campaignWebsite && <a className="candidate-website" href={candidacy.campaignWebsite.url}>Campaign website</a>}
        </header>
        {pending && <aside className="platform-pending" aria-label="Review status"><h2>Platform review pending</h2><p>No approved issue reviews are available for this candidacy yet. This does not mean the candidate has no policy positions.</p></aside>}
        <PlatformNavigation issues={issues.map(({ id, label }) => ({ id, label }))} />
        <p className="platform-limitations">Coverage is limited to the sources and research dates listed for each reviewed issue. Summaries are not endorsements or a complete account of the candidate’s views. “Not yet reviewed” is different from finding no stated position in the sources reviewed.</p>
        <div className="platform-issues">
          {issues.map(({ id, label, record }) => (
            <section key={id} id={id} className="platform-issue" aria-labelledby={`${id}-heading`} tabIndex={-1}>
              <h2 id={`${id}-heading`}>{label}</h2>
              {!record ? <p className="platform-status">Not yet reviewed</p> : <>
                <p className="platform-status">{record.publication === "draft" ? (record.status === "position-found" ? "Draft: position found — awaiting human review" : "Draft: no stated position found — awaiting human review") : (record.status === "position-found" ? "Reviewed: position found" : "No stated position found in sources reviewed")}</p>
                {record.status === "no-position-found" && <p>This finding applies only to the research scope below. It does not establish that the candidate has no position.</p>}
                {record.proposals.map((proposal) => (
                  <article key={proposal.id} className="platform-proposal">
                    {compactPreview ? <>
                      <p className="platform-statement" id={`proposal-${proposal.id}`}>
                        <ThesisStatement proposal={proposal} sourceById={sourceById} />
                      </p>
                    </> : <><h3>{proposal.summary}</h3>
                    <details>
                      <summary>Exact excerpts &amp; sources</summary>
                      {proposal.evidence.map((evidence, index) => {
                        const source = sourceById.get(evidence.sourceId);
                        return <div className="platform-evidence" key={`${evidence.sourceId}-${index}`}>
                          <blockquote>{evidence.excerpt}</blockquote>
                          <p>Excerpt locator: {evidence.locator}</p>
                          {source && <Source source={source} />}
                        </div>;
                      })}
                    </details></>}
                  </article>
                ))}
                <div className="platform-review">
                  <p>Researched: <time dateTime={record.researchedAt}>{record.researchedAt}</time> · Reviewed: {record.review.reviewedAt ?? "Pending"} · Approved: {record.approval?.approvedAt ?? "Not approved"}</p>
                  {(!compactPreview || record.proposals.length === 0) && <p><strong>Research scope:</strong> {record.researchScope}</p>}
                  {!compactPreview && <details>
                    <summary>Sources reviewed</summary>
                    {record.sourceIds.map((sourceId) => {
                      const source = sourceById.get(sourceId);
                      return source ? <Source key={source.id} source={source} /> : null;
                    })}
                  </details>}
                </div>
              </>}
            </section>
          ))}
        </div>
        {preview && candidate.portrait && <footer className="platform-photo-credit"><p>Portrait: {candidate.portrait.credit}.{candidate.portrait.licenseUrl && <> <a href={candidate.portrait.licenseUrl}>Image license</a>.</>}</p></footer>}
      </div>
    </main>
  );
}
