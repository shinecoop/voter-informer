# Original-source accordion highlights

Update: At the user’s request, summary links now target the relevant visible issue heading, with following-text context to avoid matching navigation or earlier prose. The verified quotations remain unchanged. New-tab behavior is preserved. The exact-quote-link findings below describe the preceding implementation.

Investigated 2026-10-28 with the agent-browser skill in an isolated browser session (`crow-highlight-investigation`). No source-site code was altered.

## Observations

- Campaign source: https://jasoncrow.org/values/.
- Fifteen accordion containers use `data-index`, without per-section IDs.
- On `DOMContentLoaded`, the inline script opens only index 0 (economy). It sets all other descriptions to `style.display = "none"`.
- Clicking Health Care (index 8) changes its display to `flex` and closes other sections. The URL remains `https://jasoncrow.org/values/`.
- The interaction adds no localStorage entry and no accordion state in sessionStorage.
- The inspected accordion code has no query-parameter, hash, history, or `beforematch` handler. The hidden panels do not use `hidden="until-found"`.
- A fresh navigation to the exact public-option text-fragment URL leaves the quote present in the DOM but its container at `display: none`. Therefore it does not provide a visible quote highlight.

## Reproduction

Open in a fresh tab:

https://jasoncrow.org/values/#:~:text=I%20will%20fight%20for%20a%20public%20option

Inspect the Health Care section. Its passage remains collapsed. Clicking the heading reveals the quote but does not create a shareable expanded-state URL.

## Evidence artifacts

- `.firecrawl/crow-accordion-inline.json`: original inline script captured through agent-browser.
- `.firecrawl/crow-main-js-browser.txt`: external theme script inspected for routing behavior.
- `.firecrawl/crow-health-fresh-navigation.json`: fresh-navigation DOM/visibility result.
- `.firecrawl/crow-health-fresh-navigation.png`: screenshot of that navigation.

## Conclusion

The text-fragment URL can identify the exact quote but cannot force this site's JavaScript accordion to reveal it. Agent-browser can open the accordion in its own browser, which does not persist into an ordinary visitor's fresh navigation. No working shareable native link for the hidden quotes was found. Adding invented section parameters, highlighting titles, or changing researched claims would not repair this.

A reliable original-site solution requires the source owner to support stable section links and opening the linked panel, or change its hidden-panel implementation to support browser find/reveal behavior. A local, explicitly attributed excerpt reader or visitor-installed browser extension could provide an alternative, but changes the browsing experience and is not implemented here.

The existing original-source links and researched wording are unchanged by this investigation. No claim that all native highlights work is made.
