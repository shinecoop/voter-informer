# Crow platform quote audit — 2026-10-28

Update: At the user’s request, summary links now target the relevant visible issue heading, with following-text context to avoid matching navigation or earlier prose. The verified quotations remain unchanged. New-tab behavior is preserved. The exact-quote-link findings below describe the preceding implementation.

Scope: ten draft issue summaries. Sources establish attributed positions, not policy effectiveness, enacted status, or continuing 2026 applicability. Publication dates remain unknown. No human approval is asserted.

Source C: Jason Crow — Fighting for Colorado Values; Jason Crow for Congress; campaign page; undated; https://jasoncrow.org/values/; accessed 2026-10-28 via Firecrawl. Snapshot: `.firecrawl/crow-values.json`.

Source H: Issues | Representative Jason Crow; Office of Congressman Jason Crow; official issue index; undated; https://crow.house.gov/issues; accessed 2026-10-28 via Firecrawl. Snapshot: `.firecrawl/crow-house-issues.json`.

Location | Attributed claim | Source + locator | Support | Limitation | Action
---|---|---|---|---|---
economy | Crow proposes “investing in workforce development, apprenticeship training” and growing industries such as health care, technology, and renewable energy. | C: Better Jobs & More Economic Opportunity, sentence beginning By investing | DIRECT | Undated attributed position; limited source scope | Replace paraphrase link spans with exact body-text quotes; remove title fallback
housing | Crow calls for government resources and private-sector partnerships to “create new affordable housing” for both sale and rent. | C: Housing Affordability, final sentence | DIRECT | Undated attributed position; limited source scope | Replace paraphrase link spans with exact body-text quotes; remove title fallback
health-care | Crow says, “I will fight for a public option,” with the stated aims of reducing costs and increasing consumer choice. | C: Health Care, sentence beginning I will fight for a public option; original double space retained | DIRECT | Undated attributed position; limited source scope | Replace paraphrase link spans with exact body-text quotes; remove title fallback
education | Crow calls for ensuring that “student loans are affordable,” higher-education costs are reasonable, and “community colleges and technical training opportunities are available and reliable.” | C: Education, sentence beginning We must ensure | DIRECT | Undated attributed position; limited source scope | Replace paraphrase link spans with exact body-text quotes; remove title fallback
climate-energy | Crow calls for the U.S. to “re-engage with other nations to work towards climate solutions,” including “encouraging clean energy transitions.” | C: Environment, sentence beginning We must re-engage | DIRECT | Undated attributed position; limited source scope | Replace paraphrase link spans with exact body-text quotes; remove title fallback
immigration | Crow supports efforts to “provide the Dreamers with a path towards citizenship” and broader immigration reform to give other undocumented immigrants and their families greater certainty. | C: Immigration, sentence beginning I believe we should | DIRECT | Undated attributed position; limited source scope | Replace paraphrase link spans with exact body-text quotes; remove title fallback
gun-policy | Crow’s House office says he wants to “protect Second Amendment rights” and “pass common-sense gun safety laws”; the cited passage does not specify individual measures. | H: Gun Violence Prevention / Protecting Colorado Communities, index description | DIRECT | Undated attributed position; limited source scope | Replace paraphrase link spans with exact body-text quotes; remove title fallback
democracy | Crow’s House office says he is fighting to “crack down on dark money in politics,” “strengthen ethics rules,” and restore trust in government. | H: Fighting Corruption / Putting People Over Special Interests, final sentence | DIRECT | Undated attributed position; limited source scope | Replace paraphrase link spans with exact body-text quotes; remove title fallback
veterans | Crow calls for “protecting veterans’ benefits,” improving the benefits-claims system, and “improving access, quality, and timeliness of VA health care.” | C: Veterans, opening sentence | DIRECT | Undated attributed position; limited source scope | Replace paraphrase link spans with exact body-text quotes; remove title fallback
foreign-policy | Crow calls for America to “resume its global leadership position in international institutions” and “promote human rights and democracy abroad.” | C: Foreign Policy, sentence beginning America needs | DIRECT | Undated attributed position; limited source scope | Replace paraphrase link spans with exact body-text quotes; remove title fallback

## Corrections and access limits

MINOR | Summary links | Previous heading fallback highlighted issue titles rather than the evidence. Removed heading directives; every linked quote now targets only that exact phrase, and the renderer links it only if it is present in the stored evidence. Quotation punctuation is outside the anchor. Existing substantive qualifications remain.

The original summaries were supported paraphrases, not fabricated quotations. They were not presented in quotation marks. This revision uses explicitly marked verbatim fragments.

Firecrawl inspected campaign paragraphs surrounding all eight campaign-derived proposals, and official index paragraphs for gun policy and democracy. Five detailed official issue pages were also inspected (`.firecrawl/crow.house.gov-issues-*.md`); the lower-costs and national-security pages do not support substituting their visible text for the existing public-option, immigration, housing, education, veterans, or international-institutions claims. They were not substituted just to obtain a working highlight.

The campaign page uses display:none accordions. Browsers cannot reliably highlight hidden quotes; the economy section works because it starts expanded. Exact quote links are retained without misleading title highlights. No claim that all remote highlights work is made. Unsupported browsers or changed/hidden source text may open the page without highlighting.

No evidence blockers found for the attributed wording. Current 2026 applicability remains unverified. Research and publication status metadata remain unchanged.
