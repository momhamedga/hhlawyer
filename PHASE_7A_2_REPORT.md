# Phase 7A.2 — Services Admin UI

## Executive Summary

Services Admin UI is complete. ADMIN operators can list, search, filter, sort, page through, create, inspect, edit, enable, and disable services using the Phase 7A.1 API. No public-services, booking, Prisma, or product-backend contract was changed.

## Backend Contracts, API Client, and Query Architecture

`apps/web/src/lib/api/admin-services.ts` consumes the five existing Admin endpoints with `apiFetch`, cookie credentials, and the existing single-flight refresh flow. It supplies normalized filters and stable `adminServicesKeys` for all, lists, and details. Mutations invalidate the relevant Admin Services queries.

## Navigation and List UI

The ADMIN-only dashboard navigation now links to `/admin/services`. The list is a responsive semantic table with service name, slug, textual status, sort order, creation date, and a detail action. It supports debounced server-side name/slug search, active/inactive filtering, allowlisted backend sort choices, pagination, reset, loading skeleton, empty state, and safe error state. Search and service data are not persisted in browser storage.

## Create, Detail, Edit, and Slug UX

The create dialog accepts only the backend fields: slug, name, description, active state, and sort order. It explains that slug is a public URL and cannot be changed later, disables spellcheck/autocomplete for it, and maps duplicate slug errors to a safe Arabic message. Detail renders the full safe DTO. The edit form intentionally contains no slug input and persists only name, description, and sort order. It uses query values until the first edit, avoiding state reset over active edits.

## Status, RBAC, Accessibility, and Responsive Design

Services can be disabled only after an accessible confirmation dialog explaining that public listing and new booking availability stop while historical consultations remain. Cancel creates no request; enable uses the dedicated status endpoint. No delete control exists. Non-ADMIN routes render a clear denial and backend remains authoritative. Controls are labelled, status is textual (not color-only), dialogs use semantic roles, mutations show pending behavior, feedback is announced, and the list uses horizontal overflow at small widths.

## Stable Selectors and E2E

Stable selectors cover search, filters, sort, create fields, rows, detail, edit, status action, and disable dialog controls. `admin-services.spec.ts` uses UUID marker fixtures on `DATABASE_URL_TEST` only and exact cleanup.

Focused E2E passed 2/2. It verifies ADMIN list/search/filter/sort; browser create and DB persistence; immutable-slug UI; edit persistence; `SERVICE_CREATED`, `SERVICE_UPDATED`, `SERVICE_DISABLED`, and `SERVICE_ENABLED` audits; disable cancel and confirm behavior; public-catalogue removal/restoration; LAWYER/STAFF route and direct API denial; and local/session storage safety.

## E2E Test Infrastructure Recovery

The expanded 11-test browser suite exceeded the old E2E-only login and request rate limits. `createApp` now accepts optional test overrides; production defaults remain login 10 and general request 100. Only `e2e-test-server.ts` passes higher local limits, preserving production policy. The final suite passed 11/11.

## Verification Results

- Focused Services Admin Playwright: PASS — 2/2.
- Full Playwright: PASS — 11/11.
- Full API integration: PASS — 53/53.
- Prisma validate/generate and Main/Test database checks: PASS.
- Frozen install, lint, TypeScript, build, audit, and `git diff --check`: PASS.

## Files Created

- `apps/web/src/lib/api/admin-services.ts`
- `apps/web/src/app/admin/services/page.tsx`
- `apps/web/src/app/admin/services/[id]/page.tsx`
- `apps/web/e2e/admin-services.spec.ts`
- `PHASE_7A_2_REPORT.md`

## Files Modified

- `apps/web/src/app/admin/page.tsx`
- `apps/api/src/app.ts`
- `apps/api/src/routes/index.ts`
- `apps/api/src/scripts/e2e-test-server.ts`

The API changes are test-infrastructure configuration only; Services Admin business behavior from 7A.1 is unchanged.

## Dependencies and Database Changes

No dependency, Prisma schema, migration, Main database, or shared Test schema change was made.

## Remaining Risks and Phase 7A.3 Requirements

Slug aliases/redirects remain intentionally unsupported, so slugs are immutable. Contact UI sorting remains deferred. A future 7A.3 release gate should perform final targeted release verification only; it must not add Services features or alter public booking.

## Final Verification Table

| Check | Result |
|---|---|
| Services List UI | PASS |
| Search | PASS |
| Filtering | PASS |
| Sorting | PASS |
| Pagination | PASS |
| Create Service | PASS |
| Service Detail | PASS |
| Slug Immutability | PASS |
| Edit Service | PASS |
| Status Management | PASS |
| Disable Confirmation | PASS |
| Enable Flow | PASS |
| ADMIN Access | PASS |
| LAWYER Denied | PASS |
| STAFF Denied | PASS |
| Accessibility | PASS |
| Responsive UI | PASS |
| Services Admin E2E | PASS — 2/2 |
| Persistence | PASS |
| Audit Verification | PASS |
| Public Services Regression | PASS |
| Booking Regression | PASS |
| Existing Admin Regression | PASS |
| Test Isolation | PASS |
| Main DB Safety | PASS |
| Prisma | PASS |
| Lint | PASS |
| TypeScript | PASS |
| Build | PASS |
| Audit | PASS |
| Security | PASS |

PHASE 7A.2 STATUS

Services List UI:
PASS

Search:
PASS

Filtering:
PASS

Sorting:
PASS

Pagination:
PASS

Create Service:
PASS

Service Detail:
PASS

Slug Immutability:
PASS

Edit Service:
PASS

Status Management:
PASS

Disable Confirmation:
PASS

Enable Flow:
PASS

RBAC-aware UI:
PASS

Route Protection:
PASS

Accessibility:
PASS

Responsive UI:
PASS

Services Admin E2E:
PASS

Persistence:
PASS

Audit Verification:
PASS

Public Regression:
PASS

Existing Regression:
PASS

Test Isolation:
PASS

Security:
PASS

Lint:
PASS

TypeScript:
PASS

Build:
PASS

Audit:
PASS

READY FOR PHASE 7A.3:
YES
