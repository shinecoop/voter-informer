# Vercel deployment preparation

**Documentation checked: 2026-10-24. Actual deployment: pending authorization and account access.** No hosted project or account settings have been changed.

## Verified free-plan constraints

The [Vercel Hobby plan](https://vercel.com/docs/plans/hobby) is free for **personal, non-commercial use only**. The owner must verify that the intended project use qualifies; a civic purpose alone does not establish eligibility. Team collaboration is not included. If the project does not qualify, stop and choose an approved hosting arrangement rather than automatically upgrading.

Relevant included usage shown by that page at verification:

| Resource | Hobby allowance |
| --- | --- |
| Fast Data Transfer | 100 GB |
| Fast Origin Transfer | 10 GB |
| CDN requests | 1,000,000 |
| Active CPU | 4 CPU-hours |
| Provisioned memory | 360 GB-hours |
| Function invocations | 1,000,000 |
| Deployments per day | 100 |

Most exhausted usage limits require waiting until 30 days have passed. There is no guarantee of uninterrupted service under traffic spikes. The [platform limits](https://vercel.com/docs/limits) also set a 45-minute build limit and 100 MB Hobby CLI source-upload limit. Recheck these linked pages and the account dashboard immediately before deploying; allowances and terms can change. No paid add-ons or automatic upgrade are required or configured.

The initial route can be prerendered from local data at build time, with no database, external APIs, remote fonts, dynamic image pipeline, scheduled jobs or request-time research fetches. It still consumes build and CDN resources. Measure future map assets and traffic before claiming the prototype will remain within quotas.

## Deployment steps (after authorization)

1. Run `npm ci`, `npm run check`, install Chromium if necessary, and `npm run test:e2e` locally.
2. Confirm the account qualifies for Hobby and the intended repository connection is authorized. Connecting a Git provider and deploying are external changes requiring approval.
3. Import the repository in Vercel; root directory is the repository root. Choose **Next.js**, Node **24.x**, install command **npm ci**, build command **npm run build**, and default Next.js output. `vercel.json` records the framework and commands.
4. No environment variables or secrets are required. Do not enable a paid integration or upgrade. Do not configure a custom output directory or static-export mode.
5. Verify the preview's foundation notice, keyboard skip link, stylesheet, and lack of published candidate research. Inspect build output, usage dashboard and build logs; do not treat a preview as verified research coverage.
6. Promote only after the owner approves publication. Git integration can create later deployments automatically; confirm its behavior before enabling it. To roll back use Vercel's previous-deployment controls; rollback does not remove already disclosed public content or refund consumed quota.

CI is a repository workflow, not automatically a Vercel publication gate. Before production use, configure the authorized hosting workflow to require successful checks, or deploy only a locally verified revision. The build itself always validates data, but does not run lint, unit, or browser tests.
