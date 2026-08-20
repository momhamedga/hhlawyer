# Phase 8D.5.1.1 — Consultation Concurrency Recovery Report

## 1. Executive Summary

The Railway release blocker was reproduced and resolved with one minimal production change: the consultation interactive Prisma transaction now has an explicit, bounded 15-second timeout. The existing atomic counter algorithm, schema, migration, API contract, and error envelope remain unchanged. Fresh focused, stress, full API, isolated API, Prisma, quality, and security gates all pass.

## 2. Original Release Blocker

The prior full API release run failed at `consultation booking API > allocates unique references for concurrent submissions`: 54/55 passed and two concurrent requests returned the safe `DATABASE_ERROR` response instead of HTTP 201.

## 3. Reproduction Results

Before editing production code, the existing six-request integration file was run three times cleanly: 20/20 passed in each run. The original failure was therefore intermittent at that concurrency level.

A bounded twelve-request test-only stress probe then reproduced the failure. It returned `P2028` from Prisma in the transaction path. A safe diagnostic classification confirmed an expired interactive transaction; no database URL, SQL detail, customer data, or raw error was exposed publicly.

## 4. Current Allocation Algorithm

The booking request validates input and checks the requested active service inside an interactive Prisma transaction. Reference allocation uses one PostgreSQL statement:

1. insert the yearly counter at 1 if absent;
2. otherwise atomically increment `ConsultationCounter.lastValue` via `INSERT ... ON CONFLICT ... DO UPDATE`;
3. return the incremented value;
4. create the consultation with `CONS-YYYY-######` in the same transaction.

Notification happens only after the committed consultation is returned.

## 5. Prisma Schema and Migration Review

- `ConsultationCounter.year` is the singleton primary key per year.
- `Consultation.referenceNumber` is database-unique.
- Migration `20260811130000_consultation_reference_counter` created the counter table as intended.
- No read-then-write counter race exists: the UPSERT is an atomic database operation.

No schema or migration change was required.

## 6. Safe Error Classification and Root Cause

The reproducible internal Prisma code was `P2028` during concurrent interactive transactions. The unique constraint was not violated, and the counter UPSERT continued to produce distinct values for successful operations.

**Root cause:** the default interactive transaction lifetime was too short for legitimate lock waiting when multiple concurrent requests serialize through the same yearly counter row on the shared Neon test target. Waiting transactions expired before their atomic counter operation could complete.

**Classification:** APPLICATION_CONCURRENCY. The problem was transaction configuration under a real, expected database lock queue—not an infrastructure-only connection failure and not a reference-allocation race.

## 7. Chosen Fix

`apps/api/src/modules/consultations/consultations.service.ts` now supplies `{ timeout: 15_000 }` to the existing consultation `$transaction` call.

This is a bounded transaction-lifetime correction, not a test timeout, request retry, sleep, global mutex, in-memory lock, or application-wide queue.

## 8. Why the Fix Is Concurrency-Safe

PostgreSQL remains the only source of concurrency truth. The counter-row UPSERT serializes increments and returns a unique sequence value, while the unique reference constraint remains a second database invariant. The 15-second bound allows legitimate queued transactions to finish without changing their ordering, response format, or successful data.

The design remains safe across multiple Railway processes or instances because it uses no Node-local state.

## 9. Retry Policy

No retry was added. `Retry Added: NO`; `Retry Scope: NONE`.

Validation, missing-service, rate-limit, authentication, and unexpected database errors retain their existing behavior.

## 10. Reference Uniqueness and Controlled Concurrency Proof

After the fix, a clean test-only stress probe issued 12 concurrent consultation creations using the real service path. Result: 12/12 successful, 12 unique correctly formatted `CONS-2099-######` references. The probe deleted its marker-owned fixtures and disconnected cleanly.

## 11. Focused Consultation Integration

The existing `consultations.integration.test.ts` ran twice after the fix from clean processes:

- Run 1: 20/20 PASS
- Run 2: 20/20 PASS

The production test contract was not changed or weakened.

## 12. Full and Isolated API Regression

- `pnpm test:api:integration`: PASS — 55/55, 0 failed, 0 skipped.
- `admin-users.isolated.integration.test.ts`: PASS — 2/2, 0 failed, 0 skipped.

## 13. Prisma and Quality Gates

| Check | Result |
| --- | --- |
| `pnpm db:validate` | PASS |
| `pnpm db:generate` | PASS — Prisma Client 6.19.3 |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm build` | PASS |
| `pnpm audit` | PASS — 0 High, 0 Critical |
| `git diff --check` | PASS |

## 14. Contract and Security Preservation

The consultation request schema, response DTO, reference format, service ID behavior, localized frontend expectations, rate limit, CORS, auth, cookies, and safe `DATABASE_ERROR` envelope are unchanged. Prisma codes and internal transaction details remain unexposed to clients.

## 15. Files Modified

- Modified: `apps/api/src/modules/consultations/consultations.service.ts`
- Added: `PHASE_8D_5_1_1_CONSULTATION_CONCURRENCY_RECOVERY_REPORT.md`

The temporary stress/diagnostic script was deleted and is not part of the release.

## 16. Database Safety and Fixture Activity

- Main database schema changed: NO
- Main database data changed: NO
- Migration files changed: NO
- Prisma schema changed: NO
- Test database fixture activity: YES, marker-owned consultations only; cleaned after the controlled proof and by the integration harness.

## 17. Remaining Risks

Extremely high contention beyond the bounded 15-second interactive transaction lifetime still returns the existing safe database failure rather than retrying arbitrarily. This is intentional: it keeps resource use bounded and preserves the public error contract. Current release-gate and bounded stress concurrency are green.

## 18. Final Release Decision and Railway Readiness

The consultation concurrency release blocker is resolved. The project is ready to resume Phase 8D.5.1 Railway release preparation; no staging, commit, push, Railway deployment, Vercel deployment, domain work, or Admin Redesign was performed in this recovery phase.
