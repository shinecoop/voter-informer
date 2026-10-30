# PRD: Candidate Platform Pages

## 1. Overview

Give every U.S. House candidate listed on Voter Informer a dedicated, shareable platform page. Consolidate current stated policy proposals into a consistent, readable structure with supporting excerpts and external sources. Voters should not need to navigate differently organized campaign websites to find comparable information.

The site documents candidates’ stated intentions, not the truth of campaign claims, guaranteed future behavior, or policy effectiveness. Source-verifiable, human-approved content takes priority over complete coverage.

## 2. Goals

- Provide a platform destination for every listed U.S. House candidacy, including candidates with sparse or unreviewed information.
- Make every published proposal traceable to supporting evidence.
- Clearly distinguish missing positions from unfinished research.
- Require human approval before initial publication and substantive updates.

## 3. User Stories

### US-001: Open a candidate platform
**Description:** As a voter, I want to open a candidate’s platform from my district list so I can research their proposals.

**Acceptance Criteria:**
- [ ] Candidate names and an explicit “View platform” link open a stable page identifying candidate, office, district, and election.
- [ ] Direct navigation and return to the district list work; return navigation preserves list position.
- [ ] Candidates without approved research receive an honest research-pending page, not invented content.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-002: Read proposals and inspect evidence
**Description:** As a voter, I want plain-language summaries and original evidence so I can check the interpretation myself.

**Acceptance Criteria:**
- [ ] Issue navigation leads to shareable issue sections containing summaries, exact supporting excerpts, source links, and review dates.
- [ ] Source details include publisher, publication date when known, and retrieval date; unknown dates are explicit.
- [ ] Supporting evidence can expand without hiding the entire platform.
- [ ] Layout works on mobile and supports keyboard navigation.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-003: Understand coverage gaps
**Description:** As a voter, I want visible research status so missing information is not mistaken for opposition or absence of a position.

**Acceptance Criteria:**
- [ ] Each configured issue distinguishes “Reviewed: position found,” “No stated position found in sources reviewed,” and “Not yet reviewed.”
- [ ] A no-position finding identifies reviewed sources, scope, and review date; it requires human approval.
- [ ] Partial coverage never appears exhaustive; pending issues do not display inferred positions.
- [ ] Typecheck/lint passes.
- [ ] Verify in browser using dev-browser skill.

### US-004: Publish reviewed research safely
**Description:** As an editor, I want evidence-backed drafts and a human approval gate so automation cannot publish unchecked interpretations.

**Acceptance Criteria:**
- [ ] Draft proposals retain source references, excerpts, research dates, and candidacy/issue associations.
- [ ] Initial content and substantive revisions require recorded human approval before publication.
- [ ] Pending revisions leave the previous approved version and its review date visible.
- [ ] Validation rejects unresolved evidence references and unreviewed publication; repository tests exclude drafts.
- [ ] Typecheck, lint, data validation, and relevant tests pass.

## 4. Functional Requirements

- **FR-1:** Scope pages to U.S. House candidacies. Use consistent issue categories across comparable candidates; detailed taxonomy is deferred.
- **FR-2:** Prefer official campaign platforms and other primary evidence of stated intentions. Secondary sources are acceptable with clear attribution and primary-source backlinks where available; never imply inaccessible originals were directly verified.
- **FR-3:** Every published proposal must have a neutral summary, supporting exact excerpt, and resolving source reference. Attribute proposals to the candidate.
- **FR-4:** Preserve qualifications and specificity. “Explore” must not become “will enact”; broad goals must not become invented mechanisms. Note missing implementation details only within the reviewed evidence’s scope.
- **FR-5:** Present the latest clear, human-approved policy statement identified in reviewed sources. Do not infer chronology from unknown dates or silently reconcile unresolved conflicting statements.
- **FR-6:** Do not infer positions from party, endorsements, affiliations, or other candidates. Omit supporting factual claims unless independently substantiated or explicitly attributed as candidate claims.
- **FR-7:** Display last-reviewed dates and coverage limitations. Automated collection and evidence review produce drafts, never human approval.
- **FR-8:** Allow partial publication without requiring every issue to be researched.

## 5. Non-Goals

Past actions, voting records, earlier-position histories, alignment markers, credibility scores, recommendations, comprehensive candidate dossiers, other offices, a complete issue taxonomy, and autonomous publication. Building scraper/reviewer skills or a full editorial CMS is not required by this feature.

## 6. Design and Technical Considerations

Keep district lists compact; use dedicated pages rather than full inline dropdowns. Clearly distinguish editorial summaries from quotations.

Reuse `src/domain/schema.ts`, repository interfaces, source metadata, review gates, and file-backed research where suitable. Extend contracts minimally for excerpts, issue coverage, and approved-version retention. Bind evidence to candidacies, not timeless candidate identities. Existing review metadata records approval but cannot establish that a human actually reviewed evidence. File edits require rebuild/redeployment; do not promise live updates.

## 7. Success Metrics

- Every listed U.S. House candidacy has a working platform destination.
- Every published proposal has inspectable evidence and human approval.
- Zero draft revisions appear publicly in publication-gate tests.
- Browser checks verify navigation, evidence access, coverage states, and mobile/keyboard usability.

## 8. Open Questions

Before implementation, settle the initial issue taxonomy, route convention, evidence-storage extensions, and manual editorial procedure. Review cadence and scraper/evidence-review integration remain follow-up decisions; no automated freshness guarantee is implied.
