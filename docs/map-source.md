# Landing map geometry

The bundled SVG paths derive from [us-atlas 3.0.1](https://github.com/topojson/us-atlas), specifically [states-albers-10m.json](https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-albers-10m.json), downloaded 2026-10-24. Upstream redistributes the U.S. Census Bureau's **2017 cartographic state boundaries**, projected using Albers USA into a 975 × 610 viewport. Alaska and Hawaii are inset and rescaled; U.S. territories are not represented. The map includes all 50 states and Washington, D.C.

This is an illustrative state-selection map, not a verified 2026 congressional or ballot-boundary dataset. No research coverage or district scope is inferred from it.

`src/components/us-map-paths.ts` is generated once, then bundled locally. The browser performs no geographic fetch, projection, or geometry parsing and needs no mapping dependency. Shared arcs are simplified at 0.4 projected units and coordinates rounded to one decimal; borders therefore remain aligned. The generated source includes an input SHA-256 for reproducibility. To regenerate, download the pinned JSON as data, then run:

```sh
python3 scripts/generate-map.py /path/to/states-albers-10m.json
```

The page displays only the SVG on white, with `#dbdbdb` states and white borders. Accessible names and instructions remain available to assistive technology. Hover/focus enlarges unselected states 5%. Clicking a state or pressing Enter/Space frames its original bounds in the central 75% of the viewport, preserving aspect ratio. A single requestAnimationFrame loop uses time-based exponential interpolation to smoothly move the SVG viewBox; a new selection continues from the current camera. Border strokes stay one screen pixel at any zoom.

Escape or a click on the blank background restores the national view. A ResizeObserver reframes the selected state when the viewport changes. Reduced-motion users receive immediate camera changes. Animation frames, resize observers, and media-query listeners are cleaned up on selection change and unmount. Both page scroll axes remain disabled. No dependencies or mapping library are added.

## Upstream license

Copyright 2013-2019 Michael Bostock

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.

## Colorado congressional districts

After Colorado's camera finishes zooming, the page lazy-loads eight district paths from the **U.S. Census Bureau TIGERweb Legislative service, layer 0: 120th Congressional Districts**, January 1, 2026 vintage. Checked and retrieved 2026-10-24. [Layer metadata](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Legislative/MapServer/0) identifies the Census Bureau as the source. The Census [120th Congress documentation](https://www.census.gov/programs-surveys/decennial-census/about/rdo/congressional-districts.120th_Congress.html) identifies these as the boundaries for the 2026 election cycle and reports no Colorado boundary change from 2024. The eight returned GEOIDs are 0801–0808, all with CDSESSN 120 and STATE 08.

The geographic-data request is read-only:

```text
https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Legislative/MapServer/0/query?where=STATE%3D%2708%27&outFields=GEOID,STATE,CD120,CDSESSN,NAME&returnGeometry=true&outSR=4326&geometryPrecision=5&maxAllowableOffset=0.001&f=geojson
```

Save that GeoJSON locally, then run `python3 scripts/generate-colorado-districts.py /path/to/colorado-cd120.geojson`. The standard-library-only generator validates the eight district IDs, state, Congress, polygon types, and coordinate extent; records the input SHA-256; and reproduces the lower-48 Albers projection used by the national SVG. Coordinates are rounded to three projected decimals. Server-side generalization is 0.001 geographic degrees, so these are simplified display boundaries, not survey-grade or address/ballot lookup geometry.

The base district layer is clipped to the existing illustrative state outline to avoid seams with the 2017 national map; it does not replace that national boundary dataset. District highlights expand 5% above neighboring shapes, use stable original hit targets, and support keyboard focus/selection. They do not trigger a second camera zoom. Escape returns to the national map and restores focus to Colorado when a district was focused. No visible text, new dependencies, external runtime geographic service, candidate research, or county-overlap claim is introduced. Other states retain the existing behavior.

Attribution: U.S. Census Bureau, TIGERweb. Census-produced geographic data are available for public use; see the Bureau's [TIGER/Line technical documentation](https://www2.census.gov/geo/pdfs/maps-data/data/tiger/tgrshp2024/TGRSHP2024_TechDoc.pdf). Recheck boundary vintage before using the display for a future election cycle.
