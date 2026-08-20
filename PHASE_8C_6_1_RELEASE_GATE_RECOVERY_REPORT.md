# Phase 8C.6.1 — Public Site Release Gate Recovery Report

## 1. Executive Summary

Phase 8C.6.1 resolved the Prisma Windows file-lock blocker safely. The isolated database blocker remains: the configured isolated URL reaches the database server but authentication is rejected. No credential, data, schema, migration, backend product code, or public UI was changed. Under the phase safety rule, the recovery stops here and requires an owner-provided valid isolated Neon connection string.

## 2. Previous blockers

| Blocker | Previous state | Recovery result |
| --- | --- | --- |
| Isolated Test DB | Authentication failure | Still blocked; action required from Product Owner |
| Prisma generate | Windows `EPERM` query-engine rename lock | Resolved; actual generate passed |

## 3. Root cause — isolated DB

The observed failure is a direct Prisma authentication rejection from the configured isolated database server. The URL is present, syntactically loadable, uses `sslmode=require`, and identifies a host distinct from Main and Shared Test. This rules out an environment-variable absence, Main/Test fallback, and a schema/migration error.

The remaining observable cause is invalid or no-longer-authorized isolated credentials (for example, an old connection string, changed password, changed role, or wrong user for the intended isolated branch). The diagnostic cannot safely distinguish those credential-side causes without access to the Neon branch/account.

**ISOLATED DB CREDENTIAL ACTION REQUIRED**

The Product Owner must securely replace `DATABASE_URL_TEST_ISOLATED` in `apps/api/.env` with a current connection string for the intended disposable isolated Neon branch, with a user/password authorized for that branch and `sslmode=require`. Do not send credentials in chat. After it is updated, rerun the isolated connectivity/migration check and `admin-users.isolated.integration.test.ts`; no skip is acceptable.

## 4. Root cause — Prisma lock

`prisma generate` previously failed on Windows while renaming `query_engine-windows.dll.node`. The loaded native engine was locked by the active local E2E API server process.

## 5. Process ownership review

The lock holder was conclusively project-owned:

| PID | Type | Command summary | Project-owned |
| --- | --- | --- | --- |
| 34348 | Node / tsx child | `apps/api/src/scripts/e2e-test-server.ts` | YES |

It was the listener on localhost port 4000 and its source contains a `SIGTERM` graceful shutdown handler. A targeted SIGTERM was sent only to PID 34348; it exited. No external process was terminated.

## 6. Database identity verification

No connection string was printed.

| Variable | Exists | Host fingerprint | Database | SSL |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | YES | `dec75a7854a5` | `neondb` | require |
| `DATABASE_URL_TEST` | YES | `fc99f2e1734c` | `neondb` | require |
| `DATABASE_URL_TEST_ISOLATED` | YES | `96ed24ba6500` | `neondb` | require |

All three identities are pairwise distinct.

## 7. Isolated DB recovery

Not completed because the configured isolated credentials were rejected. No replacement was invented or written. No isolated fixtures, destructive action, reset, `db push`, or migration operation was attempted.

## 8. Prisma generate recovery

PASS. After the project E2E server shut down safely:

```text
pnpm db:validate  → PASS
pnpm db:generate  → PASS (Prisma Client 6.19.3 generated)
```

This is an actual successful generate, not a reliance on a previously generated client.

## 9. Migration status

Main database migration status was previously verified read-only as up to date in Phase 8C.6. Shared Test connectivity was verified. Isolated migration status cannot be queried until valid isolated credentials are supplied. No migration history or schema was changed.

## 10. Full API result

FAIL / blocked. The most recent full integration run yielded 53 passed and 2 skipped, with the isolated suite setup/cleanup erroring on authentication. The required target remains 55/55, 0 skipped, 0 failed after credentials are restored.

## 11. Full Playwright result

PASS — 49/49, exit code 0 in the Phase 8C.6 final baseline. This recovery changed no product UI, browser tests, routing, or application behaviour.

## 12. Public regression

PASS. Homepage, Services, Service Detail, About, Consultation, Contact, Header, Footer, BrandLogo, locale routing, themes, booking, contact submission, authentication, RBAC, and API contracts were not modified in this recovery.

## 13. Security/Data safety

- No secret or connection string was printed.
- Main, Shared Test, and Isolated Test identities remain distinct.
- No Main fixture writes, resets, deletions, schema pushes, migration mutations, or credential changes occurred.
- No test was weakened, skipped, or given a higher timeout.

## 14. Files modified

- `PHASE_8C_6_1_RELEASE_GATE_RECOVERY_REPORT.md`

No product source file was modified in this recovery.

## 15. Database changes

None.

## 16. Quality gates

| Gate | Result |
| --- | --- |
| Public baseline Playwright | PASS — 49/49 |
| Lint | PASS — Phase 8C.6 final run |
| TypeScript | PASS — Phase 8C.6 final run |
| Build | PASS — Phase 8C.6 final run |
| Audit | PASS — Phase 8C.6 final run |
| Frozen install | PASS — Phase 8C.6 final run |
| Prisma validate | PASS — current recovery |
| Prisma generate | PASS — current recovery |
| Full API | FAIL — isolated DB authentication blocker |

## 17. Final decision

The Prisma lock recovery is complete. The final public release gate remains **not ready** solely because the isolated database credentials must be repaired and the isolated/full API suites must then run cleanly with no skips. Do not start Phase 8D or Admin Redesign yet.

## PHASE 8C.6.1 STATUS

Isolated DB Root Cause: ACTION REQUIRED

Isolated DB Connectivity: FAIL

Database Isolation: PASS

Main DB Safety: PASS

Prisma Validate: PASS

Prisma Generate: PASS

Migration Status: FAIL

Isolated API Tests: FAIL

Full API Regression: FAIL

Full Playwright: PASS

Public UI Regression: PASS

Lint: PASS

TypeScript: PASS

Build: PASS

Audit: PASS

git diff --check: PASS

BACKEND PRODUCT CODE CHANGED: NO

DATABASE SCHEMA CHANGED: NO

DATABASE DATA CHANGED: NO

PUBLIC SITE FINAL CONSISTENCY: FAIL

PUBLIC SITE RELEASE READY: NO

READY FOR PHASE 8D — CONTENT STRATEGY: NO
