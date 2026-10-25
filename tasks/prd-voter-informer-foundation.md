# PRD: Voter Informer — Technical Foundation and Map-Led Prototype

**Status:** Ready for technical planning; implementation not started  
**Date:** 2026-10-24  
**Project:** `voter-informer`  
**Decision basis:** Product and architecture interview with the project owner. Existing answers supply the clarification required for this PRD; no additional feature interview is necessary.

## 1. Introduction / Overview

Voter Informer will centralize election research so voters can discover races, examine candidate platforms, compare specific policy positions, and follow citations to original evidence without needing an account.

The long-term vision spans local through federal elections. This PRD establishes the technical foundation and a limited-content, desktop-first prototype for U.S. House and Senate elections. The interface will support nationwide geographic exploration, while verified prototype content will cover Colorado's applicable 2026 Senate race and the House districts overlapping Arapahoe County. Exact races and boundaries must be verified before data entry; this document does not assert which districts or candidates qualify.

The central experience is an attractive interactive atlas:

**U.S. map → state → congressional district / race → candidate profile → same-race comparison.**

Senate races belong at the state level; congressional districts lead to House races. Arapahoe County defines the prototype's content scope, not a substitute electoral boundary. The map is an exploration tool, not a personalized ballot finder.

### Product principles

- Inform rather than persuade. Reduced polarization is a hoped-for benefit, not an assumed effect or success metric.
- Apply consistent evidence standards, not artificial balance or forced equivalence.
- Keep party affiliation visible as factual context without using it to rank candidates.
- Make assertions traceable. Citations support verification but do not guarantee accuracy or eliminate legal risk.
- Distinguish a candidate's statements, documented actions, and demonstrated outcomes.
- Expose uncertainty and collection gaps without inferring beliefs or misconduct.
- Be visually engaging without making partisan framing the default.

## 2. Goals

1. Establish a maintainable Next.js and TypeScript application with Tailwind CSS, reproducible local setup, automated checks, and a path to deployment on Vercel within verified free-plan allowances.
2. Establish validated, file-backed election data behind a replaceable data-access layer so a future database does not require rewriting presentation components.
3. Deliver an SVG/D3 desktop exploration flow from the national map to populated Colorado races.
4. Populate verified candidate listings for the agreed prototype geography, covering ballot-qualified candidates regardless of party or prominence.
5. Enable same-race comparison using shared, specific policy questions and traceable evidence; support missing information explicitly.
6. Preserve source dates, review status, and data freshness throughout the model and interface.
7. Keep unsupported areas and unfinished features unmistakably labeled as prototype limitations.

### Delivery boundaries

- **Milestone A — Initial setup:** framework, styling foundation, schemas, repository layer, test tooling, documentation, and deployment configuration. This is the immediate technical setup deliverable.
- **Milestone B — Atlas shell:** national/state/district navigation, race lists, empty states, and clearly labeled feature previews.
- **Milestone C — Verified research prototype:** researched prototype content, profiles, citations, freshness, and comparisons.

Completing Milestone A does not constitute a complete research product. Public research claims require the Milestone C verification gates. No deadline is assumed by this PRD.

## 3. User Stories

Each story should be implemented as a focused change. Data collection can be repeated in small batches rather than treated as one nationwide task.

**Browser verification note:** UI stories include the requested dev-browser verification criterion. That skill is not currently available in this session. At implementation time, use it if available; otherwise document equivalent browser verification, including screenshots and keyboard checks. Do not claim a tool was used when it was not.

### US-001: Establish the application foundation

**Description:** As a developer, I want a reproducible application setup so that contributors can run and check the project consistently.

**Acceptance Criteria:**
- [ ] Set up Next.js, strict TypeScript, and Tailwind CSS using mutually compatible stable versions and one committed dependency lockfile.
- [ ] Provide documented commands for development, production build, typechecking, linting, unit tests, browser tests, and data validation.
- [ ] Provide a minimal styled application shell without requiring an account, database, paid API, or production secret.
- [ ] Typecheck/lint and production build pass.
- [ ] Verify in browser using dev-browser skill.

### US-002: Define validated election and evidence data

**Description:** As a maintainer, I want structured data checked before publication so that invalid references or unsupported claims cannot silently render.

**Acceptance Criteria:**
- [ ] Define runtime-validated schemas for the entities in Section 7.
- [ ] Validate unique IDs, relationships, required provenance fields, date formats, policy labels, and permitted review/publication states.
- [ ] Keep candidate identity separate from election-specific participation and status.
- [ ] Tests reject dangling references, unsupported policy labels, and publication of unreviewed platform-written summaries.
- [ ] Include test fixtures separately from publicly displayed research data.
- [ ] Typecheck/lint and schema tests pass.

### US-003: Isolate file storage behind data-access functions

**Description:** As a developer, I want a storage-independent interface so that a backend can replace files later without changing how the UI obtains research records.

**Acceptance Criteria:**
- [ ] Implement asynchronous data-access functions for geography, elections, races, candidates, policy responses, and sources.
- [ ] UI components do not directly import research data files or parse storage formats.
- [ ] Define loading, missing-record, and error behavior independently of the storage adapter.
- [ ] A contract test exercises the file adapter through the public data-access interface.
- [ ] Typecheck/lint and repository tests pass.

### US-004: Prepare free-tier deployment

**Description:** As a maintainer, I want a deployable build without paid dependencies so that the prototype can be hosted affordably.

**Acceptance Criteria:**
- [ ] Document Vercel deployment steps, build settings, and any required environment variables.
- [ ] Verify current plan eligibility and relevant free-tier limits before actual deployment; document findings and date.
- [ ] No paid integration, automatic paid upgrade, or secret in client code is required.
- [ ] Automated checks run typecheck, lint, data validation, unit tests, and production build; document browser-test execution.
- [ ] Actual external deployment occurs only when deployment access and authorization are available; otherwise record that it remains pending.

### US-005: Display the nationwide atlas shell

**Description:** As a voter, I want a clear national map so that I can begin research geographically.

**Acceptance Criteria:**
- [ ] Render a large, neutral SVG map with identifiable, selectable state shapes.
- [ ] Provide visible focus, accessible state names, and keyboard activation.
- [ ] Clearly label the experience as a prototype with limited populated coverage.
- [ ] Selecting an unpopulated state produces an explicit not-yet-covered state, not a claim that no elections exist.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-006: Navigate Colorado and its congressional districts

**Description:** As a voter, I want to zoom into Colorado and select districts so that I can find relevant House races and statewide Senate races.

**Acceptance Criteria:**
- [ ] Selecting Colorado transitions to a labeled state view and loads its district geometry on demand.
- [ ] District shapes use verified boundaries applicable to the represented election.
- [ ] Every House district overlapping Arapahoe County is selectable and marked as populated once its records are verified.
- [ ] A state-level entry provides access to the applicable Senate race without assigning it to a House district.
- [ ] Provide state/national return controls, keyboard-accessible selection, and reduced-motion behavior.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-007: Verify prototype geography and race scope

**Description:** As an editor, I want a documented scope manifest so that the prototype represents actual electoral boundaries and scheduled elections.

**Acceptance Criteria:**
- [ ] Verify the congressional districts overlapping Arapahoe County using authoritative current sources.
- [ ] Verify Colorado's applicable 2026 Senate election and relevant House election stages.
- [ ] Record source URLs, retrieval dates, boundary vintage, licenses/attribution requirements, and known limitations.
- [ ] Do not silently substitute historical boundaries or county outlines for electoral districts.
- [ ] If required evidence cannot be verified, mark the affected coverage unavailable rather than inventing it.
- [ ] Data validation and scope tests pass.

### US-008: List candidates consistently across the election cycle

**Description:** As a voter, I want a clear race list so that I can see ballot-qualified candidates and understand their current status.

**Acceptance Criteria:**
- [ ] Source inclusion from official ballot qualification or ballot records, not media prominence, fundraising, or party preference.
- [ ] Display names and party affiliation with equal visual prominence; default to surname ordering with deterministic tie-breaking.
- [ ] Separate election stages and show participation status with supporting source/date information.
- [ ] Keep previously ballot-qualified candidates discoverable after primary defeat, withdrawal, or another documented status change.
- [ ] Distinguish incomplete data collection from a verified absence of candidates.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-009: Present consistent candidate profiles

**Description:** As a voter, I want the same profile structure for every candidate so that I can compare evidence and recognize missing information.

**Acceptance Criteria:**
- [ ] Show factual identity and race information, party affiliation, policy responses, relevant record, citations, and freshness information.
- [ ] Prioritize candidates' own published statements when describing stated positions.
- [ ] Label stated positions separately from votes/actions; do not imply that an action caused an outcome without supporting evidence.
- [ ] Missing fields explain research limitations rather than assigning negative scores or inferred positions.
- [ ] Platform-written summaries cannot appear publicly without human review against supporting sources.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-010: Define key local policy questions

**Description:** As a voter, I want locally relevant questions so that important platform details are easier to find.

**Acceptance Criteria:**
- [ ] Store specific, versioned policy questions rather than broad for/against labels for entire subjects.
- [ ] Apply the same questions to every candidate in a race.
- [ ] Give selected key local questions a sourced editorial rationale and ordering.
- [ ] Label selections as “Key local questions,” not representative voter priorities without representative evidence.
- [ ] Keep other available policy questions accessible and preserve prior question versions and dated responses.
- [ ] Typecheck/lint and question-data tests pass.

### US-011: Compare candidates within a race

**Description:** As a voter, I want to compare candidates on the same questions so that I can evaluate differences without a platform-generated recommendation.

**Acceptance Criteria:**
- [ ] Allow selection of at least two candidates participating in the same race and election stage.
- [ ] Present aligned policy questions and evidence using equal visual treatment.
- [ ] Support “Supports,” “Opposes,” “Conditional/mixed,” and “No explicit position found”; substantive labels require specific supporting evidence and review.
- [ ] Missing-position text discloses sources reviewed and the research date through accessible supporting detail.
- [ ] Do not derive positions from party, donations, or associations; do not calculate ideological or best-match scores.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-012: Expose citations and a correction route

**Description:** As a voter, I want to inspect evidence and submit missing sources so that I can verify or challenge what I read.

**Acceptance Criteria:**
- [ ] Substantive assertions have Wikipedia-style inline references to supporting evidence.
- [ ] Citation detail identifies the source, source type, publication/event date where known, retrieval/review dates, and a relevant excerpt or record description.
- [ ] Original-source links are available from profiles and comparisons.
- [ ] Campaign statements are visibly distinguished from official records and independent reporting.
- [ ] Provide a documented correction/source-submission route; a simple contact link is sufficient and no public submission backend is required.
- [ ] Submitted material never publishes automatically.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-013: Display freshness and research status

**Description:** As a voter, I want to know when information was checked so that I do not mistake old evidence for a current assessment.

**Acceptance Criteria:**
- [ ] Track checks separately for ballot status, policy positions, and records rather than using a single misleading page timestamp.
- [ ] Represent source-event dates separately from retrieval and editorial review dates.
- [ ] Display overdue warnings using documented review intervals; test due/overdue behavior with a fixed clock.
- [ ] Financial and polling freshness fields are supported by the model but not presented as live data in the prototype.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-014: Offer historical context without default partisan framing

**Description:** As a voter, I want optional historical election coloring so that I can access context without having party frame the initial map.

**Acceptance Criteria:**
- [ ] Open every new map session with neutral geography rather than partisan shading.
- [ ] Provide an optional “Previous presidential results” overlay labeled with the election year, measure, source, and legend.
- [ ] Where verified comparable data exists, hue represents the winning party and intensity represents the margin; exact values are accessible without color alone.
- [ ] Keep unsupported areas neutral and explain missing or noncomparable historical data.
- [ ] Never silently map results from incompatible boundaries onto current districts or present past results as a forecast.
- [ ] If no suitable dataset has been verified, label the overlay unavailable rather than filling it with placeholders.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-015: Preview deferred polling and financial features honestly

**Description:** As a voter, I want to recognize planned features without confusing them with available research.

**Acceptance Criteria:**
- [ ] Clearly label separate polling and finance entry points as previews/not yet available.
- [ ] Do not display invented poll numbers, financial transactions, donor connections, or candidate allegations.
- [ ] Do not use polling to reorder candidate listings.
- [ ] Document the future distinction between direct campaign contributions and independent spending supporting/opposing a candidate.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

## 4. Functional Requirements

- **FR-1:** The application must permit core exploration and research without registration or login.
- **FR-2:** The geographic shell must support national, state, and congressional-district views, with clear selection and return controls.
- **FR-3:** House races must attach to congressional districts and Senate races to states. County scope must not be represented as a congressional district or personal ballot.
- **FR-4:** Unsupported geography must show an explicit coverage limitation, not an inferred absence of races or candidates.
- **FR-5:** Prototype race scope must be verified against current authoritative geography and election sources before publication.
- **FR-6:** Candidate inclusion must follow ballot qualification regardless of party; previously qualified participation records must remain discoverable as the election progresses.
- **FR-7:** Candidate lists must default to alphabetical surname ordering and equal visual treatment, with factual party labels.
- **FR-8:** Profiles must share a common structure and distinguish candidate statements, documented actions, and evidenced outcomes.
- **FR-9:** Comparisons must be limited to candidates in the same race/stage and ask the same specific policy questions.
- **FR-10:** Policy classifications must be evidence-backed and reviewed; lack of evidence must never be converted into opposition or a negative score.
- **FR-11:** Local-question selection must have sourced rationale and must not conceal the broader available question set.
- **FR-12:** Substantive claims must carry inline citations linked to supporting evidence and original sources.
- **FR-13:** Platform-written position summaries require human review before publication. Drafts must be excluded from public rendering, not merely visually hidden.
- **FR-14:** Research gaps must expose scope/date details and provide a correction route without automatic public publishing.
- **FR-15:** Freshness must be recorded per information category, with overdue review warnings and explicit unknown dates.
- **FR-16:** Political map coloring must be optional, dated, sourced, and neutral where historical comparisons are unsupported.
- **FR-17:** Map controls must remain keyboard usable, labeled, and compatible with reduced-motion preferences even though alternate discovery routes are deferred.
- **FR-18:** Research data must pass schema and relationship validation before production build/publication.
- **FR-19:** Research reads must pass through a storage-independent data-access layer; UI components must not couple directly to files.
- **FR-20:** Polling and financial features must remain nonfunctional, unmistakable previews for this prototype.
- **FR-21:** No paid service, API key, upgrade, or public deployment may be introduced without the appropriate approval/access.

## 5. Non-Goals / Out of Scope

- A complete nationwide live election-information service or guaranteed real-time updates.
- Governor, presidential, other state, county, municipal, judicial, school-board, or ballot-measure research coverage. Historical presidential results are context only.
- A mobile-first experience, dedicated mobile redesign, or list/search discovery routes in this iteration.
- Address lookup, voter registration data, personal ballot matching, or election-administration advice presented as official guidance.
- User accounts, saved personal research histories, or personalized political recommendations.
- Ideological scores, candidate matching, spectrum placement, inferred positions, or a measure of how far users depart from party-line voting.
- Live polls, polling aggregation, live finance ingestion, donor network diagrams, or generalized association graphs.
- Automated nationwide scraping, a CMS, a database, editorial team recruitment, or a complete publishing operations platform.
- Public contributions going live without review.
- Final decisions about side panels, full-page profiles, or quotation-versus-summary presentation.
- Claims that source citation alone guarantees factual correctness or legal safety.

## 6. Design Considerations

### Visual direction

Use the owner's supplied sketch as the conceptual reference, not a pixel-level specification. The reference was shared in conversation and is not a committed repository asset.

- Large central map, attractive typography, crisp boundaries, clear labels, and purposeful state/district zoom transitions.
- Desktop-first research layout with equal prominence for candidates.
- Use visual polish to sustain attention; avoid sensational headlines, constant animation, and default partisan coloring.
- Preserve readability and accessible citation targets in dense comparisons.
- Use semantic controls, visible keyboard focus, adequate contrast, and non-color indicators. Desktop-first does not exempt core controls from accessibility.
- Exact profile/compare layouts remain implementation decisions; no right-hand-panel requirement is implied.
- At smaller widths, provide usable basic containment and an honest desktop-optimized message if necessary; do not claim a completed mobile research experience.

## 7. Technical Considerations

### Agreed stack

| Concern | Requirement |
|---|---|
| Application | Next.js with strict TypeScript |
| Styling | Tailwind CSS; no large component library required |
| Map rendering | SVG with D3 geographic and zoom utilities |
| Research storage | Version-controlled structured files with runtime schema validation |
| Data boundary | Asynchronous repository/query interface, replaceable by a backend adapter |
| Hosting | Target Vercel, subject to verified current free-plan eligibility and limits |
| Tests | Unit tests, data validation, and browser smoke tests |
| Infrastructure | No database, accounts, paid mapping service, or automated ingestion required |

Select and document compatible stable dependency versions and the package manager during setup; none has been verified or installed for this PRD. A lightweight validation library and mainstream unit/browser test tools may be selected during implementation. Do not introduce additional services without justification.

### Minimum data model

These are conceptual entities, not prescribed database tables:

| Entity | Essential responsibility |
|---|---|
| Geography | Stable ID, type, state relationship, boundary vintage/source, geometry reference, county-overlap scope metadata |
| Election | Cycle, stage, date/status, authoritative sources |
| Race | Office, election, constituency, stage relationships |
| Candidate | Stable person ID, name, factual biographical references |
| Candidacy | Candidate/race relationship, party as represented in that race, ballot qualification, dated status and sources |
| Policy question | Stable ID, version, precise wording, topic, applicable scope |
| Local question selection | Race, ordered question references, selection rationale and sources |
| Position evidence | Candidacy, question version, statement/quotation, optional reviewed classification or summary, evidence dates and citations |
| Record entry | Documented vote/action, jurisdiction, date, source references; outcomes stored separately if supported |
| Source | URL, title, source type, publisher, publication/event date where known, retrieval date, excerpt/record locator |
| Review/freshness | Review state, reviewer reference, review date, information category, interval/next-review date |
| Coverage manifest | Populated geography/races, completeness state, verification references, limitations |
| Historical result | Election year, geography/boundary reference, measure, values, source and comparability status |

Use stable IDs rather than names as relationship keys. Store election-specific party affiliation and status with candidacy, not as immutable personal properties. Preserve historical evidence instead of overwriting it when a position changes. Reviewer references identify internal editorial responsibility; they do not require user-account functionality.

### Backend migration boundary

- Components request domain records through typed functions such as retrieving races for a geography or evidence for a candidacy.
- Initial functions read validated files; later implementations may query a database without changing their domain contracts.
- Never use array positions as IDs or encode storage paths in links and component props.
- Keep geometry loading separate from candidate research loading.
- Do not create an otherwise unnecessary API server solely to wrap local files.
- A future backend still requires migration work, authorization, editorial workflows, ingestion, and operations; this architecture reduces coupling rather than promising a cost-free migration.

### Evidence and publication safeguards

- Preserve source attribution and context. A first-party statement establishes what was said, not whether a claimed outcome is true.
- Automated checks enforce evidence presence and review gates; they cannot establish semantic truth.
- Human review must verify quotations, labels, and summaries against the original context before research publication.
- The choice between quote-led and summary-led issue display remains open. If human reviewers are not available, do not publish unreviewed interpretations to fill the UI.
- Label collection incompleteness separately from a completed search finding no explicit position.
- Establish category-specific review intervals before activating overdue warnings; intervals remain an operational decision.
- Use a manual correction channel initially; do not quietly add form-storage or email-service dependencies.

### Geography, performance, and cost

- Verify official boundary sources, election applicability, licensing, and attribution before committing geometry.
- Simplify geometry for display without changing which district is selected; retain source/vintage metadata.
- Do not ship all nationwide district geometry or all research records in the initial browser payload. Load district detail after state selection.
- Keep interactive map code client-side as needed while avoiding unnecessary client-side research bundles.
- Provide recoverable errors for failed geometry loads and missing data.
- Measure actual production-build payloads and map interaction behavior. Set numerical performance budgets after inspecting real geometry; no unmeasured performance claims are acceptance evidence.
- Audit dependencies for paid APIs and document hosting limitations. Free hosting is a prototype constraint, not a guarantee at arbitrary traffic volume.
- No third-party political-interest tracking or behavioral analytics is required. Document any subsequently proposed analytics and privacy implications before adoption.

## 8. Success Metrics / Release Gates

These are acceptance targets, not results already achieved.

### Milestone A: foundation ready

- A fresh checkout can install dependencies and run the documented local/build/check commands without paid credentials.
- Typecheck, lint, schema validation, unit tests, and production build pass.
- Adapter contract tests pass without importing UI components.
- Invalid references and unreviewed publishable summaries are rejected by automated tests.
- Deployment configuration and current free-plan constraints are documented; actual deployment status is explicit.

### Milestone B: atlas ready

- A browser smoke test completes national map → Colorado → populated district → race list and returns to the map.
- Unpopulated states/districts show explicit coverage limitations.
- Mouse and keyboard users can select supported geography and use return controls.
- Neutral coloring is the default; no fabricated research or historical results appear.

### Milestone C: research prototype ready

- Every officially verified ballot-qualified candidate in each selected race/stage appears in the coverage manifest and listing, or the race is explicitly marked incomplete and not claimed as fully covered.
- Every published substantive research assertion has a supporting source reference; every platform-written summary has recorded human review.
- Every profile uses the same structural fields and exposes missing information honestly.
- A browser smoke test selects two same-race candidates, compares a shared question, and opens its original evidence.
- Visible checks/dates and overdue-warning behavior match the underlying review data.
- Polling and financial previews contain zero invented candidate-specific values.

Do not use a change in party preference, reduced polarization, or time-on-site alone as evidence of product accuracy or success. No claim of reduced research time will be made without a measured baseline.

## 9. Open Questions and Verification Tasks

### Required before dependent implementation/publication

1. Which current congressional districts overlap Arapahoe County, and what sources establish that scope for the 2026 election?
2. What are the authoritative Colorado ballot/candidate records and applicable Senate/House election stages and dates?
3. Which geographic datasets provide appropriately licensed state/district boundaries, and what display simplification is acceptable?
4. Is a suitable historical presidential-results dataset comparable with the displayed boundaries? If not, the affected overlay remains unavailable.
5. What current Vercel free-plan eligibility, quotas, and deployment requirements apply?
6. Which compatible package versions, package manager, validation library, and test tools should the setup use?

### Product/editorial choices deliberately left open

7. Who performs human review, and what capacity exists before publishing research summaries?
8. Should issue presentation lead with quotations, reviewed summaries, or both? No unreviewed interpretation is permitted while this remains open.
9. What review intervals apply to ballot status, positions, and documented records?
10. Which specific local policy questions and selection sources suit each populated race?
11. What simple correction/contact route should be published?
12. What exact panel/page layout best supports profiles and comparisons on desktop?
13. What numerical performance budgets follow from a measured geometry/data prototype?

These questions do not block the entire technical foundation. They block only the stories or publication steps that depend on their answers. Facts should be researched by implementers; product/editorial choices should be brought to the owner when needed.

## 10. Implementation Handoff

1. Complete Milestone A without building the full nationwide content operation.
2. Verify geography and election scope before populating real research records.
3. Build the atlas shell and explicit coverage states.
4. Add researched candidate content in small, reviewable batches.
5. Deliver comparison, citations, freshness, and nonfunctional future-feature previews.
6. Record executed checks, browser verification, remaining data gaps, and deployment status at handoff.

This PRD authorizes planning of the agreed foundation and prototype scope. Creating this document does not itself implement the application, publish candidate claims, deploy a service, or approve paid infrastructure.
