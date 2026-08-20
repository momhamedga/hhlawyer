# Phase 8C.6.3 — Test Database Provisioning & Final API Gate Recovery

## 1. Executive Summary

The release recovery remains blocked, but the failure mode is now precisely established. The isolated target is reachable and safely distinct from Main and Shared Test; its complete application schema is already present, but its Prisma migration history is empty. Applying `prisma migrate deploy` would attempt to create already-existing schema objects, so no provisioning command was run. Shared Test connectivity is also demonstrably unstable (3/5 controlled checks passed, 2/5 failed), so the Full API gate was not rerun.

This phase made no product, UI, API, Prisma-schema, migration-file, or test change.

## 2. Database Identity

All required variables were present. Parsed host/database fingerprints were pairwise distinct; credentials and connection strings were not printed.

| Target | Present | Fingerprint | SSL |
| --- | --- | --- | --- |
| Main | Yes | `da8772a220d1` | `require` |
| Shared Test | Yes | `14330d02f340` | `require` |
| Isolated Test | Yes | `bf41fcfdc512` | `require` |

The identity guard passed: Main != Shared Test, Main != Isolated Test, and Shared Test != Isolated Test.

## 3. Isolated DB Previous State

`prisma migrate status`, explicitly directed to `DATABASE_URL_TEST_ISOLATED`, found all three committed migrations unapplied:

- `20260811103000_initial_foundation`
- `20260811130000_consultation_reference_counter`
- `20260811150000_auth_sessions`

## 4. Isolated Schema Inspection

Read-only inspection confirmed CASE A: `_prisma_migrations` exists but has no completed rows, while the application schema already exists.

- Tables present: `User`, `Service`, `Consultation`, `ContactMessage`, `AuditLog`, `ConsultationCounter`, `Session`.
- Required enums, unique constraints, secondary indexes, and the Session indexes are present.
- The objects match the combined effects of the three committed migrations.

This is not evidence of a missing schema. It is a migration-history inconsistency.

## 5. Provisioning Decision

No provisioning operation was performed. `prisma migrate deploy` is not safe for this pre-existing schema with an empty history: it would attempt to create relations, types, and indexes that already exist. The phase expressly forbids using `migrate resolve`, `db push`, manual SQL patching, or migration edits to conceal that inconsistency.

## 6. Migration Command Used

No migration-changing command was used. Only read-only `prisma migrate status` was executed against the isolated and Shared Test targets.

## 7. Isolated Migration Result

Isolated migration status: **FAIL** — schema objects exist, but the committed migration chain is not recorded as applied.

Isolated direct connectivity remains PASS from the prior closure check. The prior isolated Last Admin proof remains 2/2 PASS; it was not rerun after the provisioning stop condition.

## 8. Isolated API Result

Not rerun in this phase because the required precondition, an up-to-date isolated migration status, is not satisfied. No isolated fixtures were created in this phase.

## 9. Shared Test Connectivity Investigation

Five sequential, lightweight `DATABASE_URL_TEST` connectivity checks were run with a short controlled interval:

| Attempt | Result |
| --- | --- |
| 1 | PASS |
| 2 | PASS |
| 3 | PASS |
| 4 | FAIL |
| 5 | FAIL |

No project-owned stale Prisma engine holder, `prisma migrate dev`, Vitest runner, API test server, or E2E process was present at the time of inspection. This points to unstable Shared Test/Neon availability rather than a local process conflict. Tests and timeout policies were not changed.

## 10. Shared Test Migration Status

Shared Test migration status is **PASS**: Prisma reports the database schema is up to date.

## 11. Full API Result

Not rerun. The required prerequisites were not simultaneously met:

- Isolated migration status is not up to date.
- Shared Test connectivity is unstable.

The last closure attempt had 48 successful cases before Contact Admin could not establish a Shared Test connection, which resulted in two automatic skipped cases. This phase did not substitute manual per-file runs for the required full suite.

## 12. Main DB Safety

Main connectivity check passed. No Main migration, reset, schema operation, or fixture write was performed.

## 13. Test Fixture Activity

No fixtures were created by this phase. The controlled connectivity checks and migration statuses were read-only.

## 14. Prisma Validation

`pnpm db:validate`: PASS.

`pnpm db:generate`: PASS.

## 15. Quality Gates

| Gate | Result |
| --- | --- |
| Lint | PASS |
| TypeScript | PASS |
| Build | PASS |
| Audit | PASS — no known vulnerabilities |
| `git diff --check` | PASS |

## 16. Public Playwright Baseline

PASS — 49/49. No product or UI code changed, so the existing documented baseline remains applicable and was not rerun.

## 17. Files Modified

Only this report was added. A temporary read-only inspection script was created and removed during the phase; it is not present in the repository.

## 18. Database Changes

- Main database schema/data: no change.
- Shared Test schema/fixture data: no change in this phase.
- Isolated Test schema/fixture data: no change in this phase.

## 19. Remaining Blockers

1. Re-provision `DATABASE_URL_TEST_ISOLATED` from an environment whose schema and Prisma migration history are coherent, or obtain explicit database-owner direction for a safe recovery. Do not force history with `migrate resolve`.
2. Restore stable Shared Test Neon connectivity for a full test-run duration.
3. After both blockers are cleared, run one clean `pnpm test:api:integration` and require 55/55 PASS with 0 skipped.

## 20. Final Decision

The Phase 8C release gate is not approved. The state is safe: no Main target was written, no migration was forced, and no code or tests were weakened.

PHASE 8C.6.3 STATUS

Database Isolation: PASS

Main DB Connectivity: PASS

Main DB Safety: PASS

Shared Test Connectivity: FAIL

Shared Test Connectivity Stability: FAIL

Shared Test Migration Status: PASS

Isolated DB Connectivity: PASS

Isolated Schema Inspection: PASS

Isolated Migration Provisioning: FAIL

Isolated Migration Status: FAIL

Isolated API Tests: FAIL

Full API Regression: FAIL — 48/55

API Skipped Tests: 2

Prisma Validate: PASS

Prisma Generate: PASS

Lint: PASS

TypeScript: PASS

Build: PASS

Audit: PASS

git diff --check: PASS

Public Playwright Baseline: PASS — 49/49

PRODUCT CODE CHANGED: NO

PRISMA SCHEMA CHANGED: NO

MIGRATION FILES CHANGED: NO

MAIN DATABASE SCHEMA CHANGED: NO

MAIN DATABASE DATA CHANGED: NO

TEST DATABASE SCHEMA CHANGED: NO

TEST DATABASE FIXTURE DATA CHANGED: NO

PUBLIC SITE FINAL CONSISTENCY: FAIL

PUBLIC SITE RELEASE READY: NO

PHASE 8C COMPLETE: NO

READY FOR PHASE 8D — ARABIC/ENGLISH CONTENT STRATEGY: NO
