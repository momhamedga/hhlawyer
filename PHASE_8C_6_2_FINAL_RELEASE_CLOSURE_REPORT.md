# Phase 8C.6.2 — Isolated DB Verification & Final Release Closure

## Executive summary

The isolated database URL is configured, distinct from Main and Shared Test, and directly reachable. The isolated Last Admin proof completed successfully (2/2 tests). However, Prisma's read-only migration-status check reports all three committed migrations as unapplied on the isolated branch. In addition, the Shared Test Neon connection was not stable enough to complete the final API regression suite: the Contact Admin integration suite could not connect during setup or cleanup.

This is a verification-only phase. No product code, UI, API behaviour, Prisma schema, migration file, or test was changed. The release gate is therefore **not approved**.

## Environment and isolation

All three required variables were present. Their parsed target identities were pairwise distinct; no connection string or credential was printed.

| Target | Present | Distinct | SSL mode |
| --- | --- | --- | --- |
| Main (`DATABASE_URL`) | Yes | Yes | `require` |
| Shared Test (`DATABASE_URL_TEST`) | Yes | Yes | `require` |
| Isolated Test (`DATABASE_URL_TEST_ISOLATED`) | Yes | Yes | `require` |

Direct isolated connectivity (`SELECT 1`) passed. Main connectivity also passed. The isolation guard remained unchanged and the isolated Last Admin test used only `DATABASE_URL_TEST_ISOLATED`.

## Isolated migration status

The read-only Prisma migration-status command completed with a non-zero result because this isolated branch does not record the following committed migrations as applied:

- `20260811103000_initial_foundation`
- `20260811130000_consultation_reference_counter`
- `20260811150000_auth_sessions`

The isolated database has usable tables (as demonstrated by its passing test), but its Prisma migration history is not up to date. No migration command, schema operation, reset, resolve, or migration-file change was performed.

## API verification

`admin-users.isolated.integration.test.ts` passed with **2/2 tests**, **0 skipped**, including sequential last-admin protection and concurrent admin-disable protection.

The complete API suite cannot be recorded as green. The serial verification executed 48 passing test cases before `src/modules/contact/admin.integration.test.ts` failed its suite hooks. Its `beforeAll` user creation and `afterAll` fixture cleanup both received a Prisma database-reachability error for Shared Test; Vitest consequently reported **2 skipped tests** in that file. A subsequent `db:check:test` had succeeded before the retry, while the retry failed again, demonstrating unstable Shared Test connectivity rather than an assertion failure. No test was edited, skipped manually, or weakened. The remaining five planned cases were not run after this gate failure to avoid additional fixture writes.

## Quality checks

| Check | Result |
| --- | --- |
| `pnpm db:validate` | PASS |
| `pnpm db:generate` | PASS |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm build` | PASS |
| `pnpm audit` | PASS — no known vulnerabilities (after an automatic registry retry) |
| Main DB connectivity | PASS |
| Shared Test connectivity | Intermittent / FAIL for release gate |

`db:generate` initially encountered a Windows file lock held by stale local `prisma migrate dev` and API-development processes. Those stale local processes were stopped; no database command was run against Main, Shared Test, or Isolated Test as part of resolving the local file lock. Generation then passed.

## Public-site baseline

No UI or product code changed in this phase. The documented Phase 8C.6 public Playwright baseline remains **49/49 PASS** and was not rerun, per the phase instruction.

## Safety and scope

- No Main Database fixture was created or intentionally written.
- No database reset, `db push`, migration deployment, migration resolve, schema modification, or new migration occurred.
- No secret or connection string is included in this report.
- The isolated test performed its committed disposable-branch setup and cleanup. Shared Test integration specs created their normal isolated fixtures until the connectivity failure; the failing Contact Admin suite did not complete setup.
- `DATABASE DATA CHANGED` is **YES** because the required integration verification exercises disposable Isolated Test fixtures and Shared Test fixtures, even though no product-data migration or Main write was performed.

## Required remediation before rerun

1. Make the isolated branch's Prisma migration history consistent with the committed migration chain through an explicitly authorized database-provisioning action.
2. Restore stable connectivity to `DATABASE_URL_TEST` for the duration of the serial integration suite.
3. Rerun the whole API suite until it reports 55/55 passing with 0 skipped, then rerun this release closure.

## Final status

PHASE 8C.6.2 STATUS

Isolated DB Connectivity: PASS

Isolated Migration Status: FAIL

Database Isolation: PASS

Isolated API Tests: PASS

Full API Regression: FAIL

Prisma Validate: PASS

Prisma Generate: PASS

Main DB Safety: PASS

Public Playwright Baseline: PASS

Lint: PASS

TypeScript: PASS

Build: PASS

Audit: PASS

git diff --check: PASS

PRODUCT CODE CHANGED: NO

DATABASE SCHEMA CHANGED: NO

DATABASE DATA CHANGED: YES

PUBLIC SITE FINAL CONSISTENCY: FAIL

PUBLIC SITE RELEASE READY: NO

PHASE 8C COMPLETE: NO

READY FOR PHASE 8D — ARABIC/ENGLISH CONTENT STRATEGY: NO
