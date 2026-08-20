# Phase 8D.5.1 — Railway Production API Release Report

## 1. Executive Summary

This release phase is **blocked before Git staging and Railway deployment** by a fresh full API regression failure. The required suite completed with 54/55 passing tests and one real failure in concurrent consultation reference allocation. In accordance with the phase stop condition, no retry, test modification, timeout change, production deployment, commit, or push was performed.

## 2. Current Temporary Production Architecture

- Temporary Web origin: `https://hhlawyer.vercel.app`
- Intended API shape: Railway-generated HTTPS domain, not yet created or discovered.
- Custom web and API domains remain deferred.

## 3. API Architecture Audit

The API is Express with a built TypeScript start path, Prisma Client 6.19.3, root-level Prisma schema/migrations, explicit environment validation, safe error envelopes, credentialed non-wildcard CORS, and a versioned `/api/v1` router.

## 4. Monorepo Strategy and Railway Root Decision

**Verified Railway Root Directory: repository root.** `apps/api` depends on workspace packages, while `pnpm-lock.yaml`, `pnpm-workspace.yaml`, Prisma schema, migrations, and the pnpm security override are all rooted at the repository root. Deploying from `apps/api` alone would not preserve that dependency topology.

## 5. Node, pnpm, Install, Build, and Start

- Node runtime observed locally: 26.3.0.
- pnpm: 11.12.0 (`packageManager` is `pnpm@11.12.0`).
- Verified install command: `pnpm install --frozen-lockfile`.
- Verified API build command: `pnpm --filter @hhlawyer/api build`.
- Verified production start command: `pnpm --filter @hhlawyer/api start`.

The start command runs built `dist/server.js`; it does not use a dev watcher, E2E server, Vitest, or Playwright.

## 6. PORT and Runtime Safety

The server listens on `env.PORT`; environment validation supplies a local fallback of 4000. Railway must inject `PORT`; it must not be manually hardcoded in production. Node's listener has no restrictive loopback host binding.

## 7. Production Environment Matrix

| Variable | Required in production | Secret | Source/notes |
| --- | --- | --- | --- |
| `NODE_ENV` | Yes | No | `production` |
| `PORT` | Railway-provided | No | Do not configure manually |
| `DATABASE_URL` | Yes for database routes | Yes | Intended Main Neon target only |
| `AUTH_SECRET` | Yes | Yes | Explicit, secure production secret |
| `WEB_ORIGIN` | Yes | No | `https://hhlawyer.vercel.app` for this phase |
| `TRUST_PROXY` | Deployment setting | No | Must be deliberately configured for Railway proxy topology |
| `EMAIL_ENABLED` | Optional | No | Enable only with all required mail settings |
| `EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM`, `CONTACT_NOTIFICATION_TO` | Conditional | API key is secret | Required only when email is enabled |

Test database variables are not production deployment settings.

## 8. Main DB, Prisma, and Security Dependency Checks

- Main / Shared Test / Isolated Test targets were confirmed pairwise distinct without printing secrets.
- Main `prisma migrate status`: PASS — schema up to date with three committed migrations.
- `pnpm db:validate`: PASS.
- `pnpm db:generate`: PASS — Prisma Client 6.19.3 generated successfully.
- The committed pnpm workspace override resolves `deepmerge-ts` to 8.0.1; previous security gate reports 0 High / 0 Critical.

No migration deployment, schema operation, seed, reset, fixture, or write was run against Main.

## 9. HTTP, CORS, Cookies, Proxy, Rate Limit, and Error Review

- Existing health endpoint is `GET /api/v1/health`; it returns only status, timestamp, and request ID.
- Existing services endpoint is `GET /api/v1/services`.
- Root has no route; JSON 404 is expected.
- CORS accepts only requests with no `Origin` or the exact `WEB_ORIGIN`, with credentials enabled and no wildcard origin.
- State-changing origin middleware enforces the same approved origin.
- Production cookies are `HttpOnly`, `Secure`, and `SameSite=Lax`.
- A Vercel-to-Railway admin browser session is cross-site. `SameSite=Lax` is not suitable for credentialed cross-site XHR cookies, so authenticated Admin is correctly classified as **DEFERRED** rather than weakened in this phase.
- `TRUST_PROXY` is explicit/numeric (default 0); Railway's required hop setting must be configured deliberately, not replaced with blanket trust.
- Production limits remain the real application defaults; no E2E bypass is enabled.
- The generic production error envelope avoids exposing Prisma internals, stacks, environment values, filesystem paths, or secrets.

## 10. Full API Regression — Hard Stop

Command: `pnpm test:api:integration`

Result: **FAIL — 54/55 passed, 1 failed, 0 skipped, exit code 1.**

Failed test:

`src/modules/consultations/consultations.integration.test.ts`
`consultation booking API > allocates unique references for concurrent submissions`

Failure stage: real concurrent booking operation. Two requests returned the application's safe `DATABASE_ERROR` response, so the assertion requiring every concurrent response to be HTTP 201 failed at line 120. No raw database detail was exposed. This phase made no retry, timeout increase, test weakening, or code change.

## 11. Isolated API and Remaining Gates

The focused isolated API proof, local production start/smoke, frozen install, lint, TypeScript, build, audit, Git staging review, commit, and push were **not run in this phase after the mandatory full-regression stop**.

## 12. Railway and Vercel Handoff

Railway CLI and Vercel CLI are not installed or connected in the current environment, and no committed Railway/Vercel project configuration exists. No Railway project, public domain, API origin, deployment, or production internet smoke test was created.

Once the concurrency regression is fixed and release gates are green, the required Railway production values are:

- `NODE_ENV=production`
- `WEB_ORIGIN=https://hhlawyer.vercel.app`
- real Main Neon `DATABASE_URL`
- real production `AUTH_SECRET`
- deliberate Railway `TRUST_PROXY` setting

After Railway assigns a real HTTPS domain, Vercel's production `NEXT_PUBLIC_API_URL` must be set to its real `/api/v1` URL. No hostname was invented.

## 13. SEO and Custom Domains

The repository currently centralizes SEO metadata on `https://hhlawyer.ae`. Whether that domain is already live is not evidenced in repository configuration. Per the phase stop condition, no temporary SEO-origin change was made, and no custom domain was configured.

## 14. Worktree, Secret Scan, Staging, Commit, and Push

The existing broad worktree consists of prior public-release monorepo work plus local phase logs. No files were staged during this phase. The preceding release-prep candidate scan found no credential-pattern match outside ignored environment files. No new secret-bearing file was created.

No commit or push was made.

## 15. Files Modified and Database Changes

- Added: `PHASE_8D_5_1_RAILWAY_PRODUCTION_API_RELEASE_REPORT.md`

No backend business logic, API contract, Prisma schema, migration, or database setting was modified.

- Main database schema changed: NO
- Main database data changed: NO
- Test database fixture data changed: YES — the failed canonical test run used the test target only.
- Migration files changed: NO
- Prisma schema changed: NO

## 16. Final Decision

**Railway deployment is blocked.** The next required work is a focused, evidence-based recovery of concurrent consultation reference allocation in the test database. Do not proceed to staging, commit, push, Railway deployment, Vercel deployment, custom domains, or Admin Redesign until the canonical full API suite is green again.
