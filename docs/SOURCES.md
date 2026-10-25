# Sources

Updated: 2026-10-24. Election research is limited to congressional races for now. Add or update an entry whenever an external source informs site content; note what it supports.

## Used on the site

- [us-atlas 3.0.1 state geometry](https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-albers-10m.json) — National SVG state outlines, based on 2017 Census boundaries. [Upstream license](https://github.com/topojson/us-atlas/blob/master/LICENSE).
- [Census TIGERweb: 120th Congressional Districts](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Legislative/MapServer/0) — Colorado’s eight district polygons, January 1, 2026 vintage; queried for STATE 08 and converted to SVG.
- [Census congressional district documentation](https://www.census.gov/programs-surveys/decennial-census/about/rdo/congressional-districts.120th_Congress.html) — Verified that the district vintage applies to the 2026 election cycle and Colorado’s boundaries were unchanged from 2024.
- [Census TIGER/Line technical documentation](https://www2.census.gov/geo/pdfs/maps-data/data/tiger/tgrshp2024/TGRSHP2024_TechDoc.pdf) — Checked geographic-data reuse and attribution guidance; not the source of the district polygons.

Geometry queries, generation details, limitations, and attribution are in [map-source.md](map-source.md).

- [Colorado 2026 official candidate list](https://www.sos.state.co.us/pubs/elections/vote/generalCandidates.html) — Names, districts, parties, write-in designations, and withdrawal checks for all 38 listed U.S. House candidates; checked October 24, 2026.
- [Colorado 2026 election calendar](https://www.sos.state.co.us/pubs/elections/calendars/2026ElectionCalendar.pdf) — November 3 general-election date.
- House biographies: [Neguse](https://history.house.gov/People/Listing/N/NEGUSE,-Joseph-(N000191)/), [Hurd](https://history.house.gov/People/Listing/H/HURD,-Jeff-(H001100)/), [Boebert](https://history.house.gov/People/Listing/B/BOEBERT,-Lauren-(B000825)/), [Crank](https://history.house.gov/People/Listing/C/CRANK,-Jeff-(C001137)/), [Crow](https://history.house.gov/People/Listing/C/CROW,-Jason-(C001121)/), [Pettersen](https://history.house.gov/People/Listing/P/PETTERSEN,-Brittany-(P000620)/), [Evans](https://history.house.gov/People/Listing/E/EVANS,-Gabe-(E000300)/) — Birth dates for election-day ages; Crank's source gives January 1967 only. Other ages remain unavailable.
- House Clerk profiles: [Neguse](https://clerk.house.gov/Members/N000191), [Hurd](https://clerk.house.gov/Members/H001100), [Boebert](https://clerk.house.gov/Members/B000825), [Crank](https://clerk.house.gov/Members/C001137), [Crow](https://clerk.house.gov/Members/C001121), [Pettersen](https://clerk.house.gov/Members/P000620), [Evans](https://clerk.house.gov/Members/E000300) — Seven official portraits, stored locally and displayed in circles.
- [Melat Kiros portrait](https://commons.wikimedia.org/wiki/File:Melat_Kiros_Portrait.jpg) — Andra Turner photograph, CC BY-SA 4.0; original stored unchanged, circular display crop, credit/license linked on the page.
- [Manny Rutinel photograph](https://commons.wikimedia.org/wiki/File:Manny_rutinel.jpg) — Looktothewesternsky photograph, CC0; original stored unchanged and displayed in a circle.

- [Colorado 2026 House campaign website directory](https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections_in_Colorado#External_links) — External-links section supplies 26 candidate-to-campaign-website associations displayed beneath candidate names. Checked October 24, 2026; not used to verify ballot status or policy claims. Candidates without a directory match have no website link.

## Research references — not yet published on the site

- [270toWin: Colorado House elections, 2026](https://www.270towin.com/2026-house-election/states/colorado/) — Confirmed all eight Colorado U.S. House districts are contested; useful for discovering races and incumbent information.
- [Colorado Secretary of State: Elections & Voting](https://www.sos.state.co.us/pubs/elections/main.html) — Official election-information entry point; the specific roster and calendar used on the site are linked above.
- [NBC News: 2026 primary calendar](https://ppe.nbcnews.com/politics/2026-primary-elections/calendar) — Consulted in discussion; flags Colorado District 8 as a race to watch. The main NBC results page was inaccessible, so it did not verify the full race list.
- [Wikipedia: 2026 U.S. House elections in Colorado](https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections_in_Colorado) — Used as a fallback reference in discussion for the eight-district election overview; not used for published candidate facts.

## Technical references

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation) and [Tailwind PostCSS setup](https://tailwindcss.com/docs/installation/using-postcss) — Framework and styling setup guidance.
- [Vercel Hobby plan](https://vercel.com/docs/plans/hobby) and [platform limits](https://vercel.com/docs/limits) — Hosting eligibility and quota information in deployment documentation; recheck before deployment.
