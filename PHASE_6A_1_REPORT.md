# Phase 6A.1 — Consultations Admin Backend API

## 1. Executive Summary

Implemented the backend-only consultation administration API. It provides authenticated, role-authorized consultation listing, detail lookup, and status updates with strict validation, deterministic date filtering, safe sorting, CSRF/CORS protection, and transactional audit logging. No frontend, schema migration, or production data change was made.

## 2. Scope

Implemented only:

- `GET /api/v1/admin/consultations`
- `GET /api/v1/admin/consultations/:id`
- `PATCH /api/v1/admin/consultations/:id/status`

No admin UI, contact administration, users administration, service administration, or dashboard work was started.

## 3. Files Inspected

- `apps/api/src/app.ts`
- `apps/api/src/routes/index.ts`
- `apps/api/src/modules/auth/*`
- `apps/api/src/modules/consultations/*`
- `apps/api/src/middleware/*`
- `apps/api/src/lib/test-database.ts`
- `packages/types/src/index.ts`
- `packages/validation/src/index.ts`
- `prisma/schema.prisma`

## 4. Permission Policy

The centralized permission mapping remains authoritative:

| Role | Consultation read | Consultation manage |
| --- | --- | --- |
| ADMIN | Yes | Yes |
| LAWYER | Yes | Yes |
| STAFF | Yes | No |

Routes use the existing `requireAuth` and `requirePermission` middleware. Authentication reloads the current user from the database, so authorization does not rely solely on a JWT role claim.

## 5–10. List API, Pagination, Search, Filters, Date Filtering, and Sorting

The list API uses validated server-side pagination (`page=1`, `limit=20`, maximum `100`) and returns `items` plus `page`, `limit`, `total`, and `totalPages`. Its selected fields omit `message`.

Search is a parameterized, case-insensitive Prisma query across `referenceNumber`, `name`, `email`, and `phone`. Optional filters support `status`, CUID `serviceId`, and inclusive `preferredDate` boundaries derived deterministically from valid `YYYY-MM-DD` input. `dateFrom` cannot exceed `dateTo`.

Sorting is an allowlist only: `createdAt`, `preferredDate`, or `status`; default is `createdAt desc`.

## 11–16. Detail, Status API, Transition Matrix, Same-Status Policy, Transaction, and Audit

Detail returns the operational message, `updatedAt`, and the minimal Service relation. Missing records return `404 CONSULTATION_NOT_FOUND` without database details.

Status updates use a single centralized transition map:

| From | Allowed next statuses |
| --- | --- |
| PENDING | CONFIRMED, CANCELLED |
| CONFIRMED | RESCHEDULED, COMPLETED, CANCELLED |
| RESCHEDULED | CONFIRMED, CANCELLED |
| COMPLETED | None |
| CANCELLED | None |

The same-status request returns `200` and performs no write or audit event. An invalid transition returns `409 INVALID_STATUS_TRANSITION`.

The status read, transition validation, update, and `CONSULTATION_STATUS_CHANGED` audit insert run in one Prisma transaction. Audit metadata contains only `oldStatus` and `newStatus`.

## 17–21. Validation, Shared Types, Error Contract, CSRF, and PII Logging

Reusable Zod schemas were added for list input and strict status updates. Shared safe DTO types were added for list items, details, pagination, list responses, and status input; no Prisma model is exposed as a contract.

The API uses the existing error envelope and safe codes, including `VALIDATION_ERROR`, `CONSULTATION_NOT_FOUND`, `INVALID_STATUS_TRANSITION`, `UNAUTHORIZED`, and `FORBIDDEN`. Database exceptions are mapped to a generic `DATABASE_ERROR` response in read operations.

The authenticated PATCH endpoint enforces approved Origin. CORS now explicitly permits PATCH preflight and rejects disallowed origins with a safe `403 CORS_ORIGIN_DENIED` response rather than a generic internal error. No PII request or response bodies are logged.

## 22–29. Test Database, Role Matrix, API, Audit, and Regression Tests

All data tests use `createTestPrismaClient`, which preserves the existing `DATABASE_URL_TEST` no-fallback isolation guard. Fixtures use exact phase markers, reuse seeded services, and clean only the users, sessions, consultations, and audit rows created by the test.

The Phase 6A.1 integration suite verifies:

- unauthenticated access denial;
- ADMIN, LAWYER, and STAFF read access;
- STAFF mutation denial plus ADMIN and LAWYER mutation access;
- default/custom pagination, limits, invalid query inputs, empty results;
- each search field, status/service/date filters, and all allowed sorting keys;
- safe list fields and complete detail fields;
- every allowed transition, terminal transition rejection, same-status idempotency;
- strict PATCH body handling, origin rejection, successful PATCH preflight;
- transactional audit presence, safe metadata, and no audit for rejected/no-op transitions.

The entire existing API integration suite remains green, including public booking, contact, and authentication regression coverage.

## 30–32. Files Created, Modified, and Database Changes

Created:

- `apps/api/src/modules/consultations/admin.routes.ts`
- `apps/api/src/modules/consultations/admin.integration.test.ts`
- `apps/api/src/middleware/origin.ts`
- `PHASE_6A_1_REPORT.md`

Modified:

- `apps/api/src/routes/index.ts`
- `apps/api/src/app.ts`
- `packages/validation/src/index.ts`
- `packages/types/src/index.ts`

Database changes: none. No migration was created, edited, reset, or applied. Main and Test both report three migrations and an up-to-date schema.

## 33–34. Verification Commands and Results

Executed successfully:

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm audit`
- `pnpm db:validate`
- `pnpm db:generate`
- `pnpm db:status` (Main)
- `prisma migrate status` with the isolated Test database
- `pnpm db:check`
- `pnpm db:check:test`
- `pnpm test:api:integration` — 4 files, 44 tests passed
- Phase 6A.1 suite — 8 tests passed
- `git diff --check`

| Check | Result |
| --- | --- |
| Install | PASS |
| Lint | PASS |
| TypeScript | PASS |
| Build | PASS |
| Audit | PASS |
| Prisma | PASS |
| Main DB | PASS |
| Test DB | PASS |
| Test Isolation | PASS |
| Existing API Regression | PASS |
| Auth Regression | PASS |
| Consultation List API | PASS |
| Pagination | PASS |
| Search | PASS |
| Filters | PASS |
| Date Filter | PASS |
| Sorting | PASS |
| Consultation Detail API | PASS |
| Status Update API | PASS |
| Transition Rules | PASS |
| Same-Status Idempotency | PASS |
| Audit Logging | PASS |
| Audit Atomicity | PASS |
| ADMIN Read | PASS |
| ADMIN Manage | PASS |
| LAWYER Read | PASS |
| LAWYER Manage | PASS |
| STAFF Read | PASS |
| STAFF Manage Denied | PASS |
| CSRF | PASS |
| PII-safe Logging | PASS |
| Security | PASS |

## 35. Remaining Risks

The endpoint intentionally returns PII only to authenticated users with `CONSULTATION_READ`; production access should therefore keep role assignment and `AUTH_SECRET` operational controls protected. Text search remains a standard case-insensitive contains query, appropriate for the current bounded administrative dataset; index strategy should be revisited only with measured production scale.

## 36. Phase 6A.2 Requirements

Phase 6A.2 may consume these stable backend contracts to build an admin consultations UI. It should preserve cookie-based authentication, avoid exposing data in browser logs, and use the supplied pagination/filter/sort parameters. No Phase 6A.2 work was started here.

PHASE 6A.1 STATUS

Consultation List API:
PASS

Consultation Detail API:
PASS

Status Update API:
PASS

Pagination:
PASS

Search:
PASS

Filters:
PASS

Sorting:
PASS

Transition Rules:
PASS

Audit Logging:
PASS

RBAC:
PASS

Test Isolation:
PASS

Existing API Regression:
PASS

Auth Regression:
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

READY FOR PHASE 6A.2:
YES
