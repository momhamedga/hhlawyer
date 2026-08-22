# PHASE 8D.7.1.1 — Last Admin Concurrency Recovery

## 1. Executive Summary

The reported Last-Admin concurrency failure could not be reproduced. Five independent clean focused runs passed, each proving one `200` mutation, one `409 LAST_ADMIN_PROTECTED` response, and at least one active ADMIN remaining. No production code change was justified or made.

The final full API gate was attempted twice after the focused proof. Both runs were blocked before relevant assertions by Prisma/Neon test-database connectivity failures, so this phase is not release-ready.

## 2. Original Failure

The earlier full API run reported `62/63` with the concurrent disable assertion missing the expected `409 LAST_ADMIN_PROTECTED`. That run did not retain safe competing-response diagnostics, so the exact response/status that replaced the expected `409` cannot be established retroactively.

## 3. Reproduction Results

Five fresh focused processes executed `admin-users.isolated.integration.test.ts` successfully (`2/2` each). The four recorded safe outcome samples were identical:

- responses: `200` and `409 LAST_ADMIN_PROTECTED`
- final active ADMIN count: `1`
- no observed `500` or `DATABASE_ERROR`

An additional bounded run was started but its shell redirection retained only the final output; it is not counted as evidence. No focused failure was reproduced.

## 4. Current Last-Admin Algorithm

`admin-users.routes.ts` performs role/status changes in a Prisma transaction at PostgreSQL `Serializable` isolation. Before a mutation that would remove an active ADMIN role, it counts active ADMINs inside that transaction and rejects a count of one or fewer with `409 LAST_ADMIN_PROTECTED`. A Prisma `P2034` serialization conflict is mapped to that same safe public `409` contract. Successful mutations revoke sessions and write the corresponding audit log within the transaction.

## 5. Required Invariant

At least one active ADMIN must remain. For two concurrent attempts to disable the final two active ADMINs, exactly one may succeed; the competing request must return `409 LAST_ADMIN_PROTECTED` and no successful audit may be written for it.

## 6. Root Cause

Not proven. The original anomalous response was not captured, and the focused concurrency scenario passed consistently. The two new full-suite failures are independently evidenced Prisma/Neon connectivity failures before test assertions, not a demonstrated application concurrency defect.

## 7. Failure Classification

`OTHER` — non-reproducible original test outcome, followed by external test-database connectivity failures. There is insufficient evidence to label this application concurrency, transaction, or error-mapping defect.

## 8. Prisma/PostgreSQL Evidence

Focused outcomes exercised the actual isolated Prisma path and showed the intended serializable outcome (`200` + `409`, final count `1`). The two blocking full-suite attempts failed during Prisma initialization against separate configured test endpoints:

- attempt 1: shared-test auth suite `beforeAll`; `59 passed`, `4 skipped`
- attempt 2: isolated Last-Admin suite `beforeAll` and `afterAll`; `61 passed`, `2 skipped`

Both failures were “can’t reach database server”; neither reached a Last-Admin assertion.

## 9. Chosen Fix

No production fix. Changing transaction behavior, retries, API contracts, or test assertions without a reproducible root cause would be speculative and outside scope.

## 10. Why the Current Mechanism Is Concurrency-Safe

The count and mutation are in the same serializable database transaction. PostgreSQL, not process-local memory, arbitrates conflicting transactions; an encountered serialization conflict is converted to the established safe `409` response.

## 11. Multi-instance Safety

Yes. The mechanism uses PostgreSQL transaction isolation and contains no Node-local mutex, queue, global flag, or single-instance assumption.

## 12. Retry Policy

No retry was added. There is no evidence requiring an application retry and no production code changed.

## 13. Error Contract

The demonstrated losing request is `409` with `LAST_ADMIN_PROTECTED`. No Prisma details were returned in the application response.

## 14. Focused Test Results

Five independent focused runs: `PASS — 5/5` processes, each `2/2` tests. The final focused source contains no temporary logging or diagnostics.

## 15. Controlled Concurrency Proof

The actual concurrent `Promise.allSettled` requests produced exactly one `200` and one `409 LAST_ADMIN_PROTECTED`; the isolated database held one active ADMIN afterward. The successful disable had the expected session revocation and one `USER_DISABLED` audit entry.

## 16. Auth/Admin Regression

Focused isolated test coverage passed `2/2`, covering sequential last-admin protection and concurrent disable protection. The fresh full API regression gate is blocked by connectivity (see section 17).

## 17. Full API Regression

`FAIL — 61/63`, `2 skipped`, on the final confirmation run due to isolated Neon connectivity in `beforeAll`/`afterAll`, before assertions. A preceding attempt also failed due shared Neon connectivity (`59/63`, `4 skipped`). The required `63/63`, zero skipped result was not obtained in this phase.

## 18. Phase 8D.7.1 Regression

No Phase 8D.7.1 product change was touched. Previously verified current-worktree gates remain:

- F-01 Mobile Theme: `PASS`
- F-02 nonce-based Web CSP: `PASS`
- F-03 API Permissions-Policy: `PASS`

## 19. Public Regression

The relevant prior current-worktree public suite passed `30/30`. No web or CSP source was changed in this recovery phase.

## 20–25. Quality Gates

Latest current-worktree verification before this recovery’s infrastructure blocker:

| Gate | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS |
| Lint | PASS |
| TypeScript | PASS |
| Web build | PASS |
| API build | PASS |
| Audit | PASS — no known vulnerabilities |
| `git diff --check` | PASS |

The full API gate was re-run in this phase and is red solely because test-database connectivity prevented the required zero-skipped result.

## 26. Files Modified

No production, auth, API, Prisma schema, migration, or test-behavior file was modified by Phase 8D.7.1.1. Existing Phase 8D.7.1 worktree changes were preserved.

## 27. Files Created

- `PHASE_8D_7_1_1_LAST_ADMIN_CONCURRENCY_RECOVERY_REPORT.md`

## 28. Temporary Files Removed

The temporary safe response-outcome diagnostic was removed from `admin-users.isolated.integration.test.ts` before this report. No test assertion, timeout, retry, or concurrency control was weakened.

## 29. Database Safety

Focused writes used only the project’s isolated test database guard. No production database, schema, migration history, or main data was changed. Test fixture data only was created and cleaned where connectivity permitted.

## 30. API Contract Changes

None in this phase.

## 31. Remaining Risks

The unresolved release blocker is intermittent Neon/Prisma test-database reachability. It must be made stable and the entire API suite must attain `63/63`, zero skipped, before release. The exact original missing-409 condition remains unclassified because it was not captured and cannot now be reproduced.

## 32. Final Decision

Do not commit, push, or deploy. Resume release only after test-database connectivity is restored and a fresh complete API gate passes without failures or skips.

## PHASE 8D.7.1.1 STATUS

Original Failure Reproduced:
NO

Root Cause Proven:
NO

Classification:
OTHER

Last-Admin Invariant:
PASS

Concurrent Disable:
PASS

Exactly One Disable Succeeds:
PASS

Losing Request:
409 LAST_ADMIN_PROTECTED

Final Active Admin Count:
>=1

500 Errors:
0

DATABASE_ERROR:
0

Retry Added:
NO

Retry Scope:
NONE

Multi-instance Safe:
YES

Focused Last-Admin Runs:
PASS — 5/5

Admin/Auth Regression:
FAIL — full suite blocked by connectivity

Full API:
FAIL — 61/63

Failed:
2 setup/cleanup errors (0 assertion failures)

Skipped:
2

F-01 Mobile Theme:
PASS

F-02 Web CSP:
PASS

F-03 API Permissions-Policy:
PASS

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

DATABASE SCHEMA CHANGED:
NO

DATABASE DATA CHANGED:
TEST ONLY

PRISMA SCHEMA CHANGED:
NO

MIGRATIONS CHANGED:
NO

API CONTRACT CHANGED:
NO

COMMIT:
NOT RUN

PUSH:
NOT RUN

VERCEL DEPLOYMENT:
NOT RUN

RAILWAY DEPLOYMENT:
NOT RUN

READY TO RESUME PHASE 8D.7.1 RELEASE:
NO
