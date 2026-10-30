# Navigation UX review — 2026-10-27

## Scope and direction

Navigation component overhaul, not a sitewide visual redesign. Retain the map, published candidate destinations, progressive breadcrumbs, and short transitions. Use grayscale only; palette decisions remain deferred.

Direction: a compact geographic directory. Colorado’s eight-district roster becomes a quickly scannable list; every selection leaves its scope in the trail. Primary navigation is centered; panel contents remain left-aligned. Keep Arial and avoid new assets, fonts, dependencies, gradients, or decorative chrome. No direction draw is needed for this component-level work within the existing design.

Actual material: Colorado; the 2026 general election; U.S. House; Districts 1–8; roster-backed public routes; candidate-page location; draft platform research kept separate; the existing U.S. map. No sample election content or invented coverage was added.

## Before critique

Evidence: `nav-before-1440.png`, `nav-before-768.png`, `nav-before-390.png`.

- Hierarchy: generic “Districts” heading does not explicitly say what to do or what selection opens.
- Composition: narrow 400px desktop panel; light typographic hierarchy; long lists scroll the entire dialog, including dismissal and back controls.
- Interaction: reopening highlights the active district but starts focus at the heading. No direct arrow/Home/End movement through the list.
- Mobile: no short landscape/touch-specific layout; limited safe-area handling. Long context/enlarged text can crowd the choices.
- States: hover, focus, and current location need clearer separation without introducing hue.

Top three changes: pinned Back/Close; a clearer choice hierarchy; reliable focus and scrolling in constrained viewports.

## Iteration 1 — directory layout

- 480px desktop panel with a 28px action heading, one supporting sentence, and larger readable rows.
- Breadcrumbs retain the selected scope; current scope receives typographic emphasis.
- State/race rows show inventory counts derived from available navigation coverage.
- Neutral surfaces distinguish rest, hover, focus, and current destination. Current destination also has a check and “Current,” plus `aria-current`.
- Choice transition shortened from 160ms to 140ms. Reduced-motion disables travel/animation.
- Added skip links, arrow/Home/End movement, and modifier-click preservation.

Screenshot critique: 60px district rows unnecessarily clipped the eighth row on an 800px-tall desktop. Reduced rows to 56px; all eight now fit at tested 1440×800 and 768×800 sizes. No loss of comfortable target size.

## Iteration 2 — current Web Interface Guidelines

Guidelines fetched fresh before each read-only review:
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

Findings corrected:

- Fixed header could consume the viewport: separated pinned Back/Close from a scrollable body; short viewports scroll context and choices together.
- Landscape touch devices received a cramped desktop dropdown: use a full-screen sheet on short coarse-pointer viewports as well as narrow screens.
- Safe-area offsets missing from skip control: account for top and inline safe areas.
- Current-step breadcrumb caused focus/scroll resets: ignore unchanged levels.
- Text separators could be announced: replace text content with purely visual chevrons.
- Sticky candidate header could cover focused content: measure its height using ResizeObserver and use the value for scroll padding. Clean up observer/property on unmount.
- Heading focus could remain offscreen: allow normal focus scrolling after level changes.

## Final critique

Evidence: `nav-after-1440.png`, `nav-after-768.png`, `nav-after-390.png`; additional constrained-viewport screenshots are generated under `test-results/navigation-short-*.png`.

- Hierarchy: passes the visual check. Action heading, context trail, and choices are distinct, with a single prominent entry point.
- Composition: centered desktop anchor, equal panel margins, left-aligned content. All eight districts fit on the tested standard desktop/tablet viewport; mobile provides a scrollable list.
- Readability: retained the existing typeface; 17px choice labels and 14px supporting text. Long text wraps; enlarged-text checks exercise the constrained case.
- Affordance: full-row links/buttons, directional chevrons, explicit Close/Back labels, and current-location text/check.
- Continuity: exploring never replaces page-location breadcrumbs. Reopening focuses the current district; sticky navigation remains reachable while reading candidate lists.
- Motion: short, interruptible, transform/opacity-only list entrance; no motion dependency for content visibility.
- Restraint: grayscale only; no new imagery or assets, no color-direction decision, no map redesign.
- Remaining tradeoff: very short/enlarged-text layouts intentionally scroll context out of view to prioritize reachable choices and pinned dismissal/back controls.

These are qualitative design judgments, not usability-study results or independent accessibility certification.

## Validation

Passed on the final production build:

- `npm run typecheck`
- `npm run lint`
- `npm test` — 68 unit tests
- `npm run build` — includes data schema/reference/publication validation
- `npm run test:e2e` — 21 Chromium E2E tests
- `git diff --check`

Coverage includes map regression, full traversal, breadcrumb ancestors, current-step no-op, current-district focus, Escape/Tab/Shift+Tab, focus restoration, keyboard choice movement, skip links, reduced motion, modifier-click new tab, sticky navigation, measured enlarged-text offsets, visible focused content, monochrome controls, and 44px minimum control targets.

Viewports: 1440×800, 768×800, 390×500; constrained 1280×320 desktop, 844×390 touch landscape, 320×568 enlarged text, and 320×320 enlarged text. All final listed screenshots were opened and visually reviewed.

Final read-only standards review: no remaining actionable introduced findings.

## Limits / deliberate scope

- The design-taste skill’s referenced scripts and supporting references are absent from its installed directory (only SKILL.md is present). Its prescribed inspector/lint/rubric could not run. Used installed Playwright production-browser screenshots, behavior tests, and DOM/CSS measurements instead; do not interpret this report as a pass from that inspector.
- Browser automation used Chromium, not Safari/Firefox or a physical notched device. Real screen-reader verification remains outstanding.
- Existing global `overscroll-behavior: none` applies to coarse pointers. The guidelines recommend fine-pointer-only page suppression. Left unchanged because it predates this work and affects map/native gesture behavior beyond navigation; modal scroll containment is explicit.
- The browser is transient navigation, not a filterable results page: preview levels do not change the URL. Actual candidate destinations retain their existing deep-linkable URLs.
- Sitewide colors, typography, candidate content redesign, new coverage, and election-year selection remain out of scope.
