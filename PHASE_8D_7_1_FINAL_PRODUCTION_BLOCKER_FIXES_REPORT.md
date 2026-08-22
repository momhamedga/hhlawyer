# PHASE 8D.7.1 — Final Production Blocker Fixes

**Date:** 2026-08-22
**Scope:** F-01 mobile theme selector, F-02 web CSP, F-03 API Permissions-Policy only.

## 1. Executive Summary

All three requested fixes are implemented and verified locally against a production build. The mobile dialog now contains an accessible inline Light/Dark/System selector, the web app emits an enforced nonce-based CSP, and the API emits a restrictive Permissions-Policy header.

Release is blocked before commit/push because the required full API integration gate finished **62/63 passed, 1 failed, 0 skipped**. The failure is an existing isolated Last-Admin concurrency test outside this phase's permitted auth/RBAC scope. No commit, push, Vercel deployment, Railway deployment, or production verification was performed.

## 2. Findings Addressed

| Finding | Local result |
| --- | --- |
| F-01 — mobile theme selector absent in deployed navigation | PASS |
| F-02 — web CSP absent | PASS |
| F-03 — API Permissions-Policy absent | PASS |

## 3. F-01 Root Cause

The mobile header reused the desktop floating `ThemeToggle` popover. At mobile width the trigger was not available in the navigation dialog, so users had no practical selector.

## 4. Mobile Theme Fix

- Preserved the pre-existing Phase 8D.6.2 work; it matched the approved design and was not recreated.
- Added the `inline` display variant to the shared theme primitive while preserving the desktop popover as its default variant.
- Mobile navigation now renders an inline **Appearance / المظهر** group with Light, Dark, and System controls.
- Each control has `aria-pressed`, a `min-h-11` touch target (at least 44px), keyboard behavior, RTL/LTR labels, persisted `next-themes` state, and no nested mobile popover.
- Choosing a theme does not close the mobile dialog. Escape still closes the dialog and restores focus to the menu trigger.

## 5. F-02 Root Cause

The existing web response header configuration had the standard hardening headers but no Content-Security-Policy. A static policy using permissive inline scripts would have weakened script protection; a plain nonce policy would also have broken the `next-themes` initialization script unless the nonce was propagated.

## 6. CSP Architecture

The CSP is created per document request in the current Next.js `proxy.ts` architecture:

1. Proxy generates a cryptographically random nonce.
2. It sends the CSP to both the request seen by Next and the document response.
3. `RootLayout` reads `x-nonce` through `headers()`.
4. The nonce is passed to `next-themes`, so its initialization script is CSP-compatible.

This follows the installed Next.js 16 CSP guidance. It does not add a new dynamic-rendering cost: the app already reads request headers for locale selection and was already rendered dynamically.

## 7. CSP Directives

Production policy includes:

- `default-src 'self'`
- `script-src 'self' 'nonce-…' 'strict-dynamic'` — no production `unsafe-eval` and no script `unsafe-inline`
- `style-src 'self' 'nonce-…' 'sha256-nzTgYzXYDNe6BAHiiI7NNlfK8n/auuOAhh2t92YvuXo='`
- `style-src-attr 'unsafe-inline'` for existing React/Next inline style attributes
- `img-src 'self' blob: data:`
- `font-src 'self'`
- `connect-src 'self' https://hhlawyerapi-production-3634.up.railway.app`
- `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `object-src 'none'`
- `upgrade-insecure-requests` for non-local production hosts

The single style hash is the observed stable `next-themes` transition-suppression style injected while changing themes. It is necessary because browsers ignore `unsafe-inline` in `style-src` when a nonce is present. Development additionally permits `unsafe-eval` and the local API origin only; production does not.

## 8. CSP Browser Compatibility

A production `next build` plus `next start` browser run passed. No CSP, hydration, or page runtime error was observed across the audited routes. Next image requests were observed as successful browser responses; the policy allows only same-origin image sources, blobs, and data URLs.

## 9. Railway API connect-src

The exact production Railway origin is allowlisted in `connect-src`; no `https:` wildcard or arbitrary origin was introduced. The localhost API origin is development-only.

## 10. F-03 Root Cause

Helmet 8 provides the existing API hardening headers but does not emit Permissions-Policy. The API had no centralized explicit Permissions-Policy middleware.

## 11. API Permissions-Policy

The API application now sets one centralized restrictive header after Helmet:

`accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()`

It does not change CORS, cookies, auth, rate limits, DTOs, endpoints, or error envelopes.

## 12. Security Header Matrix

| Header | Web local production build | API focused integration |
| --- | --- | --- |
| Content-Security-Policy | PASS — enforced nonce policy | PASS — existing Helmet CSP preserved |
| Strict-Transport-Security | Vercel production baseline; not emitted by local HTTP server | PASS |
| X-Content-Type-Options | PASS | PASS |
| X-Frame-Options | PASS | PASS |
| Referrer-Policy | PASS | PASS |
| Permissions-Policy | PASS — existing web policy | PASS — new restrictive API policy |

## 13. Accessibility

PASS. The mobile theme selector has a visible labelled group, pressed-state semantics, keyboard activation, touch support, focus behavior, 44px minimum height, dialog persistence after selection, Escape close behavior, and Arabic RTL / English LTR coverage.

## 14. Performance

PASS. The CSP is header-only and adds no client bundle. The final web build completed with the existing 53-route output. The application was already request-header/dynamic-rendering based before this phase; CSP introduces no additional rendering-mode change.

## 15. Files Modified

- `apps/web/src/components/shared/Header/index.tsx` — uses the approved inline mobile selector.
- `apps/web/src/components/theme/ThemeToggle.tsx` — adds the reusable inline variant while preserving desktop popover behavior.
- `apps/web/e2e/homepage-mobile-navigation-recovery.spec.ts` — focused mobile accessibility/persistence coverage.
- `apps/web/src/proxy.ts` — nonce CSP generation and response/request propagation.
- `apps/web/src/app/layout.tsx` — obtains and forwards the nonce.
- `apps/web/src/components/providers/ThemeProvider.tsx` — forwards nonce to `next-themes`.
- `apps/api/src/app.ts` — centralized API Permissions-Policy header.
- `apps/api/src/modules/consultations/consultations.integration.test.ts` — verifies health-endpoint security headers.

## 16. Files Created

- `apps/web/e2e/security-headers.spec.ts` — CSP header and browser compatibility coverage.
- `PHASE_8D_7_1_FINAL_PRODUCTION_BLOCKER_FIXES_REPORT.md` — this report.

Temporary local Playwright configuration and runtime logs were not part of the intended release set and were not staged.

## 17. Web Tests

- Focused production-build CSP and mobile suite: **5/5 PASS**.
- Verified Arabic and English mobile widths: 360px, 375px, 390px, and 430px.
- Verified Light, Dark, System, local persistence, system preference change, touch input, keyboard activation, no mobile floating theme popover, dialog persistence, and no horizontal overflow.

## 18. API Tests

- Focused health/security-header integration test: **20/20 PASS**.
- New API Permissions-Policy assertion passed with all previously emitted security-header assertions.

## 19. Full API Regression

**FAIL — 62/63 passed, 1 failed, 0 skipped.**

Failed test:

`src/modules/auth/admin-users.isolated.integration.test.ts > isolated last active ADMIN invariant > preserves at least one ADMIN under real concurrent disable requests`

The failed assertion requires one concurrent operation to return HTTP 409 / `LAST_ADMIN_PROTECTED`. The preceding assertion accepted exactly one HTTP 200 outcome, but the required 409 outcome was absent. The test output did not expose a safe underlying response body/status for the non-successful concurrent outcome.

This test and the relevant user-admin/RBAC route were not modified in this phase. Correcting it would require an out-of-scope Last-Admin concurrency/auth investigation, so no auth behavior, test weakening, retry policy, database, or schema change was made.

## 20. Public Regression

**PASS — 30/30.**

The executed public set covered homepage/mobile navigation, services, consultation, contact, locale routing, production redesign, CSP, and focused theme behavior. Consultation/contact tests intercepted their API routes and explicitly verified no real submission.

## 21–26. Quality Gates

| Gate | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS |
| Lint | PASS |
| TypeScript | PASS |
| Web build | PASS |
| API build | PASS |
| Audit | PASS — no known vulnerabilities |
| `git diff --check` | PASS |

## 27. Secret Scan

PASS. The intended F-01/F-02/F-03 source and test files contain no database URLs, auth secret, email API key, private key, or credential value. The Railway origin is a public endpoint, not a secret.

## 28. Database Safety

No database schema, Prisma schema, migration, reset, or production data change was made. The required integration suite used its configured test databases and cleaned test fixtures according to its existing design.

## 29. API Contract Safety

PASS. No API route, response envelope, request DTO, CORS behavior, auth behavior, or email/consultation contract changed. Only a response security header was added.

## 30. Remaining Risks

1. The full API regression gate has one out-of-scope isolated concurrency failure; release must not proceed until it is investigated and green.
2. Production verification remains pending because the no-commit rule was honored after that failed gate.
3. Production Vercel must be checked for `upgrade-insecure-requests`; localhost intentionally omits that directive to allow local HTTP production-build smoke testing. Vercel production is not a localhost host and receives it.

## 31. Final Decision

The requested fixes are locally complete and their focused/public gates are green. However, the required full API gate is red. Therefore staging, commit, push, deployment, and production verification were not authorized by the phase rules.

## PHASE 8D.7.1 STATUS

F-01 Mobile Theme:
PASS

Mobile Theme Released:
NOT RUN

Arabic Mobile:
PASS

English Mobile:
PASS

360px:
PASS

390px:
PASS

430px:
PASS

Light:
PASS

Dark:
PASS

System:
PASS

Theme Persistence:
PASS

No Mobile Theme Popover:
PASS

F-02 Web CSP:
PASS

CSP Enforced:
PASS

CSP Header:
PASS

CSP Script Compatibility:
PASS

CSP Style Compatibility:
PASS

CSP Image Compatibility:
PASS

CSP Font Compatibility:
PASS

CSP Railway API Connectivity:
PASS

CSP Browser Console:
PASS

F-03 API Permissions-Policy:
PASS

API Permissions-Policy Header:
PASS

API Existing Security Headers:
PASS

Accessibility:
PASS

Performance Safety:
PASS

Full API:
FAIL — 62/63

API Failed:
1

API Skipped:
0

Public Regression:
PASS — 30/30

Lint:
PASS

TypeScript:
PASS

Web Build:
PASS

API Build:
PASS

Audit:
PASS

git diff --check:
PASS

Secret Scan:
PASS

Commit:
NOT RUN

Commit Hash:
NOT RUN

Push:
NOT RUN

Vercel Deployment:
NOT RUN

Railway Deployment:
NOT RUN

Production CSP:
NOT RUN

Production Mobile Theme:
NOT RUN

Production API Permissions-Policy:
NOT RUN

DATABASE SCHEMA CHANGED:
NO

DATABASE DATA CHANGED:
NO

PRISMA CHANGED:
NO

MIGRATIONS CHANGED:
NO

API CONTRACT CHANGED:
NO

RAILWAY VARIABLES CHANGED:
NO

VERCEL SETTINGS CHANGED:
NO

F-01 RESOLVED:
NO — production verification pending

F-02 RESOLVED:
NO — production verification pending

F-03 RESOLVED:
NO — production verification pending

READY FOR FINAL PRODUCTION ACCEPTANCE:
NO
