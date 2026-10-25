# Voter Informer

A centralized election research prototype. This change implements **Milestone A** in [the PRD](tasks/prd-voter-informer-foundation.md): application setup, validation, repository contracts, checks, and deployment preparation. The landing page now includes a lightweight interactive state map; Colorado’s districts link to sourced 2026 general-election candidate lists. Policy research and candidate comparison remain unavailable.

## Local setup

Use Node **24.12.0** (`nvm use`) and npm **11.3.0**. No environment variables, API keys, database, account, or paid service are needed.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Development and production servers bind to loopback. Stop with Ctrl-C. The lockfile pins the dependency tree; use `npm ci` rather than resolving versions again. Installing dependencies may execute dependency lifecycle scripts; install only in a trusted checkout.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Validate research and create production build |
| `npm start` | Serve an existing production build |
| `npm run typecheck` | Strict TypeScript checks |
| `npm run lint` | ESLint including Next.js and repository import boundary |
| `npm test` | Offline schema and repository tests |
| `npm run test:watch` | Unit test watch mode |
| `npm run validate:data` | Validate committed research and publication gates |
| `npm run check` | Typecheck, lint, data validation, unit tests, build |
| `npm run test:e2e` | Chromium smoke test against production build |

For browser tests, run `npx --no-install playwright install chromium` once, then `npm run build && npm run test:e2e`. Linux may also need Playwright system dependencies (`--with-deps`, subject to local installation approval). The smoke test owns its loopback server on port 3100 and checks the text-free SVG, state color, centered 75% camera framing, keyboard selection/reset, reduced motion, responsive refitting, browser errors, and disabled scrolling. Screenshot: `test-results/landing-desktop.png`. Generated artifacts are ignored. CI runs all checks plus Chromium tests on pushes and pull requests; no deployment job is configured.

## Verified toolchain

The lockfile resolves Next.js **16.4.3**, React **19.3.1**, TypeScript **5.9.3**, Tailwind CSS **4.3.3**, Zod **4.6.7**, Vitest **5.0.5**, and Playwright **1.64.1**. ESLint **9.39.5** is pinned to satisfy the peer ranges of Next.js’s React/import/accessibility plugins; npm marks that major deprecated, so revisit it when those plugins support ESLint 10. The current audit reports no known vulnerabilities.

Development and production builds explicitly use Next.js’s supported Webpack option. Turbopack’s CSS worker attempted a port bind denied by this managed local environment; Webpack successfully produces the static application without that worker requirement.

## Structure and boundaries

- `src/app`: App Router shell and Tailwind v4 styling; no remote fonts/assets.
- `src/domain/schema.ts`: runtime Zod schemas, inferred types, relationship and publication gates.
- `src/repositories/types.ts`: asynchronous storage-independent read contract.
- `src/repositories/file.ts`: validated file snapshot adapter; replace this behind `getRepository()` to migrate storage.
- `data/research.json`: intentionally empty public research collections.
- `tests/fixtures`: clearly synthetic records, never imported by the application.
- `docs/data.md`: data editing and publication rules.
- `docs/deployment.md`: Vercel settings, current free-plan verification, and pending deployment steps.

The application requests research through `getRepository()`. Reads resolve to detached arrays, missing records to `null`, and load/validation failures reject with `RepositoryError`. Await reads in server components; Next handles rendering/loading failures, while future interactive views should provide their own loading and error UI. A repository instance holds one validated snapshot until process restart/rebuild; file edits are not a live CMS. Question IDs are versioned: `get("questions", id, version)` requires an exact version. Other collections use `get(collection, id)`.

No candidate claims, geometry, historical results, finance data, or polling data have been invented. Subsequent milestones must verify geography and ballot scope before populating research. No commit, remote CI run, or deployment is part of local setup.

The landing map uses locally bundled state SVG paths with no new dependencies or runtime geography download. See [map provenance, license, and regeneration](docs/map-source.md).

Colorado district links open `/2026/colorado/district1/candidates` through district 8. Each list includes the official printed-ballot candidates and labeled certified write-ins, ordered by first name, then surname. Ages use the election date, November 3, 2026. Nine local portraits and seven sourced birth dates are currently available; remaining details are explicitly unavailable. Candidate lists scroll within their page; the map remains locked to the viewport. Sources and credits are linked from each list and recorded in [SOURCES.md](docs/SOURCES.md).
