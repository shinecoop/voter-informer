import Link from "next/link";
import Image from "next/image";
import { sourceTextUrl } from "../domain/source-link";
import { PlatformNavigation } from "./platform-navigation";
import type { Entity } from "../domain/schema";
import { type CandidatePlatform, getRepository } from "../repositories";

function Source({ source }: { source: Entity<"sources"> }) {
  return (
    <div className="platform-source">
      <a href={source.url} target="_blank" rel="noopener noreferrer" title="Opens in a new tab">{source.title}</a>
      <p>Publisher: {source.publisher} · Publication date: {source.publishedAt ?? "Unknown"} · Retrieved: <time dateTime={source.retrievedAt}>{source.retrievedAt}</time></p>
      <p>Source locator: {source.locator}</p>
    </div>
  );
}

// Editorial emphasis for this preview, matched to unchanged, evidence-backed summaries.
const thesisPhrases: Record<string, string[]> = {
  "workforce": [
    "investing in workforce development, apprenticeship training"
  ],
  "affordable-supply": [
    "create new affordable housing"
  ],
  "public-option": [
    "I will fight for a public option"
  ],
  "education-access": [
    "student loans are affordable",
    "community colleges and technical training opportunities are available and reliable"
  ],
  "international-climate": [
    "re-engage with other nations to work towards climate solutions",
    "encouraging clean energy transitions"
  ],
  "dreamers": [
    "provide the Dreamers with a path towards citizenship"
  ],
  "gun-safety": [
    "protect Second Amendment rights",
    "pass common-sense gun safety laws"
  ],
  "ethics-transparency": [
    "crack down on dark money in politics",
    "strengthen ethics rules"
  ],
  "va-benefits": [
    "protecting veterans’ benefits",
    "improving access, quality, and timeliness of VA health care"
  ],
  "global-engagement": [
    "resume its global leadership position in international institutions",
    "promote human rights and democracy abroad"
  ]
};

// Visible text after each heading distinguishes issue sections from navigation and prose.
const sourceSections: Record<string, { heading: string; followingText: string }> = {
  workforce: { heading: "Better Jobs & More Economic Opportunity", followingText: "Coloradans deserve good-paying jobs that can support their families." },
  "affordable-supply": { heading: "Housing Affordability", followingText: "Immigration" },
  "public-option": { heading: "Health Care", followingText: "Housing Affordability" },
  "education-access": { heading: "Education", followingText: "Environment" },
  "international-climate": { heading: "Environment", followingText: "Foreign Policy" },
  dreamers: { heading: "Immigration", followingText: "LGBTQ Rights" },
  "gun-safety": { heading: "Gun Violence Prevention", followingText: "Protecting Colorado Communities" },
  "ethics-transparency": { heading: "Fighting Corruption", followingText: "Putting People Over Special Interests" },
  "va-benefits": { heading: "Veterans", followingText: "Women’s Rights" },
  "global-engagement": { heading: "Foreign Policy", followingText: "Gun Violence Prevention" },
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
  const section = sourceSections[proposal.id];
  const sourceUrl = section
    ? sourceTextUrl(source.url, section.heading, section.followingText)
    : sourceTextUrl(source.url, evidence.excerpt);
  let offset = 0;
  const parts = [];
  for (const phrase of thesisPhrases[proposal.id] ?? []) {
    if (!evidence.excerpt.replace(/\s+/g, " ").includes(phrase)) continue;
    const start = proposal.summary.indexOf(phrase, offset);
    if (start < 0) continue;
    const preceding = proposal.summary.slice(offset, start);
    offset = start + phrase.length;
    parts.push(preceding, <a key={phrase} className="platform-claim" href={sourceUrl} target="_blank" rel="noopener noreferrer" aria-describedby="platform-external-note" title={`${source.title} — ${evidence.locator} (opens in a new tab)`}>{phrase}</a>);
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
  const firstRecord = issues[0]?.record;
  const sharedReview = compactPreview && firstRecord && issues.every(({ record }) => record &&
    record.researchedAt === firstRecord.researchedAt &&
    record.review.reviewedAt === firstRecord.review.reviewedAt &&
    record.approval?.approvedAt === firstRecord.approval?.approvedAt
  ) ? firstRecord : null;
  const sharedDraftStatus = compactPreview && issues.length > 0 && issues.every(({ record }) =>
    record?.publication === "draft" && record.status === "position-found"
  );
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  return (
    <main className={`candidate-page platform-page${preview ? " platform-preview" : ""}${compactPreview ? " platform-preview-minimal" : ""}`}>
      <div className="candidate-content platform-content">
        {listUrl ? <Link href={listUrl} className="candidate-back">← Back to candidates</Link> : <Link href="/" className="candidate-back">← Back to map</Link>}
        {compactPreview && <a className="platform-skip" href="#platform-issues">Skip to policy positions</a>}
        {compactPreview && <aside className="platform-draft-notice" aria-label="Draft preview"><h2>Draft preview — not approved</h2><Link href={`/platforms/${candidacy.id}`}>View public page</Link></aside>}
        {preview && !compactPreview && <aside className="platform-pending" aria-label="Draft preview"><h2>Draft preview — not approved</h2><p>This local preview shows how the researched content will look. It does not record human review or publish these drafts. Source dates are unknown; current 2026 applicability still needs confirmation.</p><Link href={`/platforms/${candidacy.id}`}>View public page</Link></aside>}
        {!preview && process.env.NODE_ENV === "development" && <p><Link href={`/preview/platforms/${candidacy.id}`}>Preview draft platform</Link> · Local development only</p>}
        <header className="candidate-header">
          {preview && candidate.portrait && <Image className="platform-portrait" src={candidate.portrait.src} width={144} height={168} unoptimized loading="eager" alt={`Portrait of ${candidate.givenName} ${candidate.familyName}`} />}
          {!compactPreview && <p>{election.cycle} / {state?.name ?? "State unavailable"} / {geography.name}</p>}
          <h1>{candidate.givenName} {candidate.familyName}</h1>
          {preview && <p className="platform-intro">Where the candidate stands</p>}
          <p>U.S. House · {geography.name} · {candidacy.party}</p>
          <p className="platform-election">{election.stage.charAt(0).toUpperCase() + election.stage.slice(1)} election · {election.date ?? "Election date unavailable"}</p>
          {candidacy.status === "certified-write-in" && <p>Certified write-in</p>}
          {candidacy.status === "withdrawn" && <p>Withdrawn</p>}
          {candidacy.campaignWebsite && <a className="candidate-website" href={candidacy.campaignWebsite.url} target="_blank" rel="noopener noreferrer" title="Opens in a new tab">Campaign website</a>}
        </header>
        {pending && <aside className="platform-pending" aria-label="Review status"><h2>Platform review pending</h2><p>No approved issue reviews are available for this candidacy yet. This does not mean the candidate has no policy positions.</p></aside>}
        <PlatformNavigation issues={compactPreview ? [] : issues.map(({ id, label }) => ({ id, label }))} />
        {!compactPreview && <p className="platform-limitations">Coverage is limited to the sources and research dates listed for each reviewed issue. Summaries are not endorsements or a complete account of the candidate’s views. “Not yet reviewed” is different from finding no stated position in the sources reviewed.</p>}
        <div className="platform-issues" id="platform-issues" tabIndex={compactPreview ? -1 : undefined}>
          {issues.map(({ id, label, record }) => (
            <section key={id} id={id} className="platform-issue" aria-labelledby={`${id}-heading`} tabIndex={-1}>
              <h2 id={`${id}-heading`}>{label}</h2>
              {!record ? <p className="platform-status">Not yet reviewed</p> : <>
                {!sharedDraftStatus && <p className="platform-status">{record.publication === "draft" ? (record.status === "position-found" ? "Draft: position found — awaiting human review" : "Draft: no stated position found — awaiting human review") : (record.status === "position-found" ? "Reviewed: position found" : "No stated position found in sources reviewed")}</p>}
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
                {(!sharedReview || !compactPreview || record.proposals.length === 0) && <div className="platform-review">
                  {!sharedReview && <p>Researched: <time dateTime={record.researchedAt}>{record.researchedAt}</time> · Reviewed: {record.review.reviewedAt ?? "Pending"} · Approved: {record.approval?.approvedAt ?? "Not approved"}</p>}
                  {(!compactPreview || record.proposals.length === 0) && <p><strong>Research scope:</strong> {record.researchScope}</p>}
                  {!compactPreview && <details>
                    <summary>Sources reviewed</summary>
                    {record.sourceIds.map((sourceId) => {
                      const source = sourceById.get(sourceId);
                      return source ? <Source key={source.id} source={source} /> : null;
                    })}
                  </details>}
                </div>}
              </>}
            </section>
          ))}
        </div>
        {compactPreview && <footer className="platform-research-notes" role="region" aria-labelledby="platform-research-heading">
          <h2 id="platform-research-heading">Research notes</h2>
          <div className="platform-research-columns">
            <div>
              <p>Summaries cover only the linked sources and research dates. They are not endorsements or a complete account of the candidate’s views. Unreviewed does not mean no position.</p>
              <p>Source dates are unknown; applicability to 2026 still needs confirmation. This preview does not approve or publish drafts.</p>
              <p id="platform-external-note">Source links open in a new tab at the relevant issue heading in supporting browsers. Expand the section to read the quoted passage. Campaign links also open in a new tab.</p>
            </div>
            <div>
              {sharedDraftStatus && <p className="platform-status platform-shared-status">All {issues.length} issues: Draft: position found — awaiting human review</p>}
              {sharedReview && <p className="platform-shared-review">Researched: <time dateTime={sharedReview.researchedAt}>{sharedReview.researchedAt}</time> · Reviewed: {sharedReview.review.reviewedAt ?? "Pending"} · Approved: {sharedReview.approval?.approvedAt ?? "Not approved"}</p>}
            </div>
          </div>
        </footer>}
        {preview && candidate.portrait && <footer className="platform-photo-credit"><p>Portrait: {candidate.portrait.credit}.{candidate.portrait.licenseUrl && <> <a href={candidate.portrait.licenseUrl} target="_blank" rel="noopener noreferrer" title="Opens in a new tab">Image license</a>.</>}</p></footer>}
      </div>
    </main>
  );
}
