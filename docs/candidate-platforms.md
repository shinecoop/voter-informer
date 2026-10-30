# Candidate platform pages and Crow research

## Routes and coverage

Every listed U.S. House candidacy has `/platforms/<candidacyId>`, including `/platforms/jason-crow-2026`. Names and **View platform** links open these pages. Return navigation targets the original candidate row and restores saved nested-list scroll position in the same tab when browser storage is available. Direct returns still target the row without storage.

The initial common issue taxonomy is economy, housing, health care, education, climate and energy, immigration, gun policy, democracy, veterans, and foreign policy. This is a deliberately limited taxonomy, not a complete inventory of a candidate's views. For example, the single health-care draft is not comprehensive reproductive-health coverage. No positions are inferred for other issues or candidates.

## Roster-wide user-testing MVP — October 30, 2026

All 38 listed candidates now use the identical shared reader as Crow, including the compact topic/summary rows, portrait when available, source links in new tabs, and research notes. Research coverage is recorded in `platformResearch`; every candidate has an inspected-source scope, date, limitations, and source references. Missing positions are bounded to the named sources and are not inferred from party affiliation. See [the roster evidence ledger](platform-roster-evidence-audit.md).

`getCandidatePlatformForUserTesting` now supports all valid House candidacies. The standard approved-only repository and schema approval requirements remain intact. Research data stays draft with no invented reviewer or approval, even after automated evidence and code review. A separate development-only preview route remains available. This expands the owner-authorized user-testing MVP from Crow to the full roster.

## Initial Crow user-testing MVP — October 30, 2026

At the project owner’s explicit direction, `/platforms/jason-crow-2026` now serves the current preview’s design, ten draft summaries, source-heading links, portrait, and research notes in production. This is a narrow exception for user testing, not an attestation of human research review. The page identifies itself as an unreviewed MVP. Approval and review metadata remain unchanged.

Initially, `getCandidatePlatformForUserTesting` allowed only `jason-crow-2026`; the roster-wide extension above supersedes that restriction. The development preview remains available at its existing URL and still returns 404 in production. The historical approval procedure and research audit below remain applicable when transitioning out of user testing.

## Local draft preview

Run `npm run dev` and open <http://127.0.0.1:3000/preview/platforms/jason-crow-2026>. This uses the same compact platform layout with all ten drafted proposals, inline source links, and research notes. A status notice and shared research notes identify unapproved drafts; missing approval dates are never fabricated.

The preview selects the highest editorial version per issue, including drafts, through a separate development-only read path. Both the route and repository return no preview outside `NODE_ENV=development`; production requests return 404. It is noindex/nofollow, not an authenticated CMS. Keep development bound to loopback; do not expose it to a public network. No research data or approval metadata is modified. The standard repository continues to exclude drafts; the roster-wide user-testing route is the explicit exception described above.

Run `npm run test:preview` for the Chromium development-preview checks; this reuses a running loopback development server on port 3000, or starts and stops one if none is running. Production browser checks separately verify the preview is unavailable.

## Storage and public boundary

`platformIssues` revisions in `data/research.json` bind to a House **candidacy**, not a timeless candidate. Each has a unique ID, positive version, taxonomy issue, research date/scope, reviewed source IDs, and either:

- `position-found`: at least one proposal, each with a summary and exact excerpts resolving to sources in that revision's reviewed-source list;
- `no-position-found`: no proposals, but explicit sources, date, and scope. This is an editorial finding requiring the same approval as a proposal, not an inference from missing data.

Missing approved revisions render **Not yet reviewed**. Source metadata includes publisher, known publication date or explicit unknown, retrieval date, and locator. Evidence uses native disclosures without hiding other issue sections.

Public repository reads omit drafts. `getCandidatePlatform` selects the highest-version published, reviewed, explicitly approved revision for each candidacy/issue. A higher draft version does not replace the last approved version or its dates. Version numbers express editorial revision ordering, not the chronology of undated candidate statements.

Platform publication additionally requires `approval: { humanReviewer, approvedAt }`, separate from editorial review metadata. Drafts must have `approval: null`. These are recorded attestations, not authentication: a file schema cannot prove that the identified human actually inspected the evidence. Do not use real people's names or record human approval on their behalf.

Source records themselves have no publication flag. Draft prose is filtered from public page rendering, not confidential in this version-controlled dataset. Use only public evidence and non-sensitive editor identifiers.

## Manual editorial procedure

1. Collect primary sources, preserving title, publisher, URL, retrieval date, known publication date, excerpt, and locator. Never infer dates from retrieval or incidental page content.
2. Draft an attributed, neutral summary preserving qualifications. Separate supporting factual claims and accomplishments from statements of intent; do not import unverified campaign statistics.
3. Review exact quote fidelity and surrounding context, source-to-claim fit, chronology, conflicts, and scope. Automated collection and evidence audits leave `publication: "draft"` and `approval: null`; they are not human approval.
4. A human editor must inspect the source passages and audit findings. Confirm applicability to this election and resolve conflicting or superseded statements. For no-position findings, inspect the expressly listed scope and sources; do not imply universal absence.
5. Only after that human decision, set `review.state: "reviewed"`, `review.reviewer`, and `review.reviewedAt`, record that human's identifier/date in `approval`, and set `publication: "published"` for the specific approved revision. No approval was supplied for the Crow drafts in this change.
6. For a substantive update, add a new unique revision ID and increment `version`; retain previous published records unchanged. Keep the new revision draft/null approval until separately approved.
7. Run `npm run check` and `npm run test:e2e`, inspect the resulting page, and rebuild/redeploy through the normal separately authorized workflow. File edits do not promise live updates or automatic freshness checks.

## Jason Crow acquisition — 2026-10-25

Direct page retrieval was used after the user waived Firecrawl. No Firecrawl scrape or authentication occurred.

- **C**: [Fighting for Colorado Values](https://jasoncrow.org/values/), Jason Crow for Congress, campaign primary source. The footer identifies the campaign. Source ID `crow-campaign-values-20261025`.
- **H**: [Issues | Representative Jason Crow](https://crow.house.gov/issues), Office of Congressman Jason Crow, U.S. House of Representatives, official office primary source. Source ID `crow-house-issues-20261025`. Only the index descriptions were inspected; linked detail pages were not.

Both returned accessible content. The old `https://jasoncrowforcongress.com/issues/` returned 404; the returned campaign navigation linked to the accessible Values page. The failed endpoint is not evidence for any policy proposal.

No reliable publication/update dates were identified for C or H. The independent audit also found no Last-Modified header or publication/modification metadata in its checks. Dates are stored as null, never inferred from retrieval. C mixes historical references, relative language, and policy statements; it cannot be assigned wholesale to the 2026 campaign. Neither source can be ranked as newer from the inspected evidence.

These interested primary sources establish what the campaign or office states, not independent truth, outcomes, or policy effectiveness. H is not independent corroboration of C. Additional source IDs on a revision may document context; the excerpt's own `sourceId` identifies its actual support.

## Evidence audit ledger

Audit workflow: `edit-evidence` (the available evidence-review skill), including a separate read-only second-pass agent. All ten summaries, quotations, locators, and surrounding sections were checked against directly retrieved C/H pages on 2026-10-25. Exact excerpts are retained in each proposal's `evidence` in `data/research.json` rather than duplicated here. **DIRECT means the inspected source supports the attributed wording; it does not prove effectiveness or confirm a renewed 2026 commitment.**

| Revision / claim | Source and passage | Support | Limitation / action |
| --- | --- | --- | --- |
| `crow-2026-economy-v1`: workforce, apprenticeships, growing industries | C, Better Jobs & More Economic Opportunity, “By investing…” | DIRECT | Investment proposal, not proven job creation; no amount/timetable inferred. |
| `crow-2026-housing-v1`: government/private partnership for affordable sale and rental housing | C, Housing Affordability, final sentence | DIRECT | No subsidy design, budget, or construction target inferred. |
| `crow-2026-health-care-v1`: public option with cost/choice as stated aims | C, Health Care, “I will fight for a public option…” | DIRECT | Preserve aim versus demonstrated effect. Original double space in “for  consumers” retained. Surrounding text discusses keeping existing coverage. |
| `crow-2026-education-v1`: affordable loans/education and community/technical training | C, Education, “We must ensure…” | DIRECT | Broad goals, not a specified loan rate, tuition cap, or forgiveness plan. |
| `crow-2026-climate-energy-v1`: international climate cooperation/clean energy | C, Environment, “We must re-engage…” | DIRECT | Do not assign “re-engage” to a treaty or administration. |
| `crow-2026-immigration-v1`: Dreamer citizenship path and broader reform | C, Immigration, “I believe we should…” | DIRECT | Explicit citizenship path applies to Dreamers, not automatically all undocumented immigrants. Family-unity/border-security context inspected. |
| `crow-2026-gun-policy-v1`: office-attributed gun safety and Second Amendment goals | H, Gun Violence Prevention / Protecting Colorado Communities | DIRECT | Index gives no individual measures. Past legislative actions on C are not substituted for current proposals. |
| `crow-2026-democracy-v1`: office-attributed dark-money and ethics goals | H, Fighting Corruption / Putting People Over Special Interests, final sentence | DIRECT | No claim that trust was restored or a particular law enacted. |
| `crow-2026-veterans-v1`: benefits, claims, VA access/quality/timeliness | C, Veterans, opening sentence | DIRECT | Goals, not verified improvements, benefit amounts, or deadlines. |
| `crow-2026-foreign-policy-v1`: international institutions, rights, democracy | C, Foreign Policy, “America needs…” | DIRECT | No country-specific policy or dated interpretation of surrounding administration criticism inferred. |

### Findings and remaining blockers

- **No fabricated/contradicted quotation or substantive summary defect identified** in these ten claims. The audit confirmed all ten excerpts and locators, including the original health-care double space.
- **MAJOR if represented as confirmed current policy:** current 2026 applicability remains **UNVERIFIED** for every statement. Obtain dated reaffirmation or a human decision grounded in current evidence before publishing as current election research. No “latest statement” claim is made.
- **MINOR, corrected:** H's metadata title was adjusted to the retrieved HTML title, `Issues | Representative Jason Crow`.
- Campaign navigation provenance was observed in the initial retrieval; the independent two-source audit did not separately retest that route. Publisher attribution is independently supported by the campaign footer.
- The ten populated revisions remain `publication: "draft"`, with null reviewer/review date and `approval: null`. Automated review supplies no human attestation. Crow’s records remain unapproved. As of October 30, the explicit user-testing exception above exposes them without claiming approval.
- This is partial research within ten categories, not complete issue coverage. Linked detail pages, dated reaffirmations, historical versions, legislative records, and outcome evidence were outside this audit. No guarantee of correctness or publication readiness is implied.

## Verification

Schema/repository tests exercise evidence resolution, candidacy association, explicit approval, draft exclusion, scope/status consistency, and prior approved-version retention. Chromium tests exercise the production Crow MVP, other candidates’ pending content, issue deep links, mobile/keyboard operation, nested-list return navigation, invalid routes, and the actual page rendered against a separate synthetic approved snapshot (including no-position and draft-revision states). Synthetic approvals are test-only and never applied to Crow or production data. The unavailable `dev-browser` skill was replaced by the project's existing Playwright browser workflow.

The [completeness follow-up](platform-completeness-audit.md) records all 380 issue checks, 208 issue findings containing 209 source-linked summaries, and initially 35 sourced portraits. The subsequent [presentation review](portrait-quality-review.md) retains 26 photos and uses the default silhouette for twelve candidates. A checked gap is distinct from “no position”; unsupported or ambiguously attributed material remains unimported. All ten Crow excerpts were rechecked and retained.
