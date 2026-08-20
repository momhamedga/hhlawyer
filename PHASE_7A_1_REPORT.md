# Phase 7A.1 — Services Admin Backend API

## 1. Executive Summary

Services Administration backend is complete. ADMIN-only operators can list, inspect, create, update, and enable/disable services without changing the public services or booking contracts. No schema migration and no frontend Services Admin UI were introduced.

## 2. Scope and Existing Service Model

The existing Prisma `Service` model contains `id`, unique `slug`, `name`, `description`, `isActive`, `sortOrder`, `createdAt`, and `updatedAt`; consultations reference it by `serviceId` with restrictive deletion. Phase 7A.1 adds only protected Admin APIs, shared validation/types, and isolated integration tests.

## 3. Existing Public Contract and Architecture

The public `GET /api/v1/services` remains unchanged: it returns active services only, ordered by `sortOrder`. Public consultation creation already requires an existing active service. New Admin endpoints are separate:

- `GET /api/v1/admin/services`
- `GET /api/v1/admin/services/:id`
- `POST /api/v1/admin/services`
- `PATCH /api/v1/admin/services/:id`
- `PATCH /api/v1/admin/services/:id/status`

## 4. Permission Policy and RBAC

Centralized `SERVICE_READ` and `SERVICE_MANAGE` permissions were added. Both are available only to ADMIN through the existing centralized role mapping. LAWYER and STAFF receive 403; unauthenticated requests receive 401. No route contains a hardcoded role check.

## 5. List, Search, Filters, and Sorting

The list API supports `page`, `limit` (1–100), `search`, `isActive`, `sortBy`, and `sortOrder`. It searches `name` and `slug`; its strict sorting allowlist is `createdAt`, `name`, `slug`, and `sortOrder`. The default is `createdAt desc`. The safe list DTO excludes descriptions and internal fields.

## 6. Detail, Create, and Update

Detail returns a safe operational DTO and returns `404 SERVICE_NOT_FOUND` when absent. Create accepts only normalized `slug`, `name`, `description`, `isActive`, and `sortOrder`; it rejects unknown fields. Update permits only `name`, `description`, and `sortOrder`; status remains isolated to its dedicated endpoint.

## 7. Slug Policy and Uniqueness

Slugs are trimmed, lowercased, ASCII-safe (`a-z`, `0-9`, `-`), and bounded to 120 characters. Duplicate slugs return `409 SERVICE_SLUG_EXISTS`, including database unique-constraint races. Slugs are immutable after creation because there is no redirect/alias infrastructure and changing a public URL could break external links. No transliteration behavior was introduced.

## 8. Status, Delete, Booking, and Public Regression

Status uses strict `{ isActive: boolean }`. Same-status requests return a successful no-op with no audit. There is no DELETE endpoint: historical consultations are preserved. The isolated test creates an inactive service, proves public booking rejects it with no Consultation row, and proves disabled Admin fixtures do not appear in the public catalogue. Existing public services and booking Playwright coverage remain green.

## 9. Audit, Origin, and Error Contracts

Create, changed update, disable, and enable execute with their audit rows in the same Prisma transaction. Events are `SERVICE_CREATED`, `SERVICE_UPDATED`, `SERVICE_DISABLED`, and `SERVICE_ENABLED`; metadata is minimal (slug/status or changed field names), without whole request bodies or descriptions. State-changing routes retain `requireApprovedOrigin`. Safe errors include `VALIDATION_ERROR`, `SERVICE_NOT_FOUND`, `SERVICE_SLUG_EXISTS`, `FORBIDDEN`, and `DATABASE_ERROR`.

## 10. Shared Validation and Types

Shared validation adds Admin Service query/create/update/status schemas. Shared types add safe list/detail DTOs and create/update/status input shapes. There was no Prisma schema change.

## 11. Test Isolation and Coverage

`admin.integration.test.ts` uses `createTestPrismaClient`, unique `phase7a1-service-*` fixtures, and exact cleanup of owned services, audits, consultations, users, and sessions. It verifies:

- unauthenticated, ADMIN, LAWYER, and STAFF access;
- default/custom pagination, invalid page/limit/sort, empty result, search, filter, sorting, and safe DTOs;
- detail and missing-service behavior;
- create persistence, validation, unknown-field rejection, duplicate slug, and audit;
- update persistence, immutable slug rejection, and audit;
- status persistence, no-op audit behavior, enable/disable audits, Origin enforcement, and inactive booking safety.

## 12. Verification Results

- Focused Services Admin integration: PASS — 3/3.
- Full API integration: PASS — 53/53.
- Full Playwright: PASS — 9/9.
- Prisma validate/generate, Main and Test DB checks: PASS.
- Frozen install, lint, TypeScript, build, audit, and `git diff --check`: PASS.

## 13. Security Review

ADMIN-only backend authorization, strict validation, safe DTOs, allowlisted sorting, slug uniqueness, mass-assignment resistance, atomic audit writes, approved-Origin checks, inactive-booking protection, Test isolation, and Main safety were verified. No raw database error or credential was exposed.

## 14. Files Created and Modified

Created:

- `apps/api/src/modules/services/admin.routes.ts`
- `apps/api/src/modules/services/admin.integration.test.ts`
- `PHASE_7A_1_REPORT.md`

Modified:

- `apps/api/src/routes/index.ts`
- `apps/api/src/modules/auth/permissions.ts`
- `packages/validation/src/index.ts`
- `packages/types/src/index.ts`

## 15. Database Changes and Remaining Risks

No migration or schema change occurred. The operational risk remains that public slugs are immutable until a future redirect/alias strategy exists. No deletion is available by design; services are enabled/disabled instead.

## 16. Phase 7A.2 Requirements

Phase 7A.2 may add a Services Admin UI only: list/detail/create/edit/status controls using these APIs, role-aware behavior, and focused browser coverage. It must not alter the public service or booking contract without a separate decision.

## Final Verification Table

| Check | Result |
|---|---|
| Services List API | PASS |
| Service Detail API | PASS |
| Service Create API | PASS |
| Service Update API | PASS |
| Service Status API | PASS |
| Pagination | PASS |
| Search | PASS |
| Filtering | PASS |
| Sorting | PASS |
| Slug Validation | PASS |
| Slug Uniqueness | PASS |
| Inactive Booking Protection | PASS |
| Public Services Regression | PASS |
| Audit Logging | PASS |
| Audit Atomicity | PASS |
| ADMIN Access | PASS |
| LAWYER Denied | PASS |
| STAFF Denied | PASS |
| Origin/CSRF | PASS |
| Test Isolation | PASS |
| Main DB Safety | PASS |
| Full API Regression | PASS — 53/53 |
| Full Playwright Regression | PASS — 9/9 |
| Prisma | PASS |
| Lint | PASS |
| TypeScript | PASS |
| Build | PASS |
| Audit | PASS |
| Git Diff | PASS |
| Security | PASS |

PHASE 7A.1 STATUS

Services List API:
PASS

Service Detail API:
PASS

Service Creation:
PASS

Service Update:
PASS

Service Status:
PASS

Pagination:
PASS

Search:
PASS

Filtering:
PASS

Sorting:
PASS

Slug Safety:
PASS

Inactive Booking Protection:
PASS

Audit Logging:
PASS

RBAC:
PASS

Test Isolation:
PASS

Public Regression:
PASS

Full API Regression:
PASS

Full Browser Regression:
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

READY FOR PHASE 7A.2:
YES
