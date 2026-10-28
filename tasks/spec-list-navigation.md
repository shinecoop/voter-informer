# List navigation and breadcrumbs

## Problem Statement

Map navigation makes reaching candidates slower on desktop and awkward on mobile. Visitors need a fast way to browse available races and switch districts, with a clear indication of their current location.

## Solution

Keep the map as the landing page. Add a shared top bar containing a distinct **Browse races** button and a Map link. The button opens a drill-down panel showing one level of choices at a time: **State → Race → District → Candidates**.

Use a dropdown panel on desktop and a full-screen sheet on mobile. Place quiet, clickable breadcrumbs beneath the top bar as secondary navigation, visually distinct from the primary button and panel.

## User Stories

1. As a visitor, I want the map to remain the landing page, so that I can explore geographically.
2. As a desktop visitor, I want a list navigation shortcut, so that I can reach candidates quickly.
3. As a mobile visitor, I want a full-screen navigation sheet with comfortable tap targets, so that I can browse on a small screen.
4. As a visitor, I want to choose a state, race, and district in successive lists, so that each choice is manageable.
5. As a visitor, I want back controls within the panel, so that I can revise an earlier choice.
6. As a visitor, I want only published coverage listed, so that every destination has useful information.
7. As a visitor viewing candidates, I want the panel to reopen at my district list with my district highlighted, so that I can switch districts quickly.
8. As a visitor, I want clickable breadcrumbs, so that I can see my location and browse from any ancestor.
9. As a keyboard or screen-reader user, I want accessible controls and focus handling, so that I can complete the same journey.
10. As a future visitor, I want races without districts to lead directly to candidates, so that the hierarchy fits the office.

## Implementation Decisions

- Share navigation across the map and candidate pages.
- Interpret Race as the office contested, such as U.S. House, U.S. Senate, or governor. Skip District for offices without districts.
- Initial published coverage is Colorado → U.S. House → Districts 1–8 for the existing 2026 election. Derive available choices from published coverage rather than maintaining a separate competing inventory.
- Selecting a district opens its existing candidates route and closes the panel. Preserve existing candidate URLs.
- Reopening on a candidate page shows its district list and highlights the current district; back controls allow navigation to races and states. At the map root, begin with states.
- Breadcrumb example: **States → Colorado → U.S. House → District 2 → Candidates**. Each ancestor opens the panel at the corresponding choices: Colorado opens races, U.S. House opens districts, and District 2 exposes Candidates. Candidates is the current-page label.
- Treat breadcrumb ancestors as navigation into the shared browser; separate intermediate landing pages are not required.
- Use a prominent primary button and subdued text breadcrumbs to avoid redundant-looking controls.
- Adapt the same navigation model to desktop and mobile. Support long, scrollable lists, visible back and close controls, keyboard operation, Escape dismissal, focus restoration, and appropriate focus containment while the mobile sheet is open.
- Keep the structure extensible to additional offices and states without publishing unavailable destinations.

## Testing Decisions

- Proposed primary seam: browser-level behavior through the existing Playwright end-to-end suite, following existing map-to-candidates and mobile scrolling coverage.
- Verify opening from the map, traversing all levels, back navigation, destination correctness, closing after selection, and reopening at the active district.
- Verify each breadcrumb opens its intended level and unavailable coverage is absent.
- Exercise desktop and mobile layouts, keyboard navigation, dismissal, focus restoration, and scrolling without horizontal overflow.
- Keep map navigation working. Test visible behavior and accessible semantics rather than component internals.
- The districtless flow is an architectural requirement; verify it when corresponding supported coverage is introduced.

## Out of Scope

- Additional election coverage or candidate content.
- Map redesign.
- Mega menus or separate intermediate landing pages.
- Election-year selection.

## Further Notes

This is a navigation feature; reuse existing candidate content and destinations. The primary control and breadcrumbs serve different visual roles but share the same location hierarchy.
