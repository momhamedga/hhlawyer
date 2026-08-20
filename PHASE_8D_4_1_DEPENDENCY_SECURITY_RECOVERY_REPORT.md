# Phase 8D.4.1 — Dependency Security Recovery Report

## 1. Executive Summary

The single High-severity `deepmerge-ts` advisory reported after Phase 8D.4 has been remediated without upgrading Prisma, changing application code, altering the Prisma schema, or changing database migrations. The final audit reports no known vulnerabilities.

## 2. Original Advisory

- Severity: High
- Advisory: `GHSA-ggr8-5vv4-36mx` — stack exhaustion while merging recursive object graphs.
- Affected package: `deepmerge-ts`
- Vulnerable range: `< 8.0.0`
- Patched range: `>= 8.0.0`
- Original resolved version: `7.1.5`

## 3. Dependency Chain

The verified dependency chain was:

`hhlawyer` / `@hhlawyer/api` → `@prisma/client@6.19.3` → `prisma@6.19.3` → `@prisma/config@6.19.3` → `deepmerge-ts@7.1.5`.

`pnpm why deepmerge-ts` found one resolved version only. No direct application dependency on `deepmerge-ts` was found.

## 4. Current Versions

| Package | Before | After |
| --- | --- | --- |
| Node.js | 26.3.0 | 26.3.0 |
| pnpm | 11.12.0 | 11.12.0 |
| Prisma CLI | 6.19.3 | 6.19.3 |
| `@prisma/client` | 6.19.3 | 6.19.3 |
| `@prisma/config` | 6.19.3 | 6.19.3 |
| `deepmerge-ts` | 7.1.5 | 8.0.1 |

## 5. Vulnerable and Patched Ranges

`@prisma/config@6.19.3` pins `deepmerge-ts` to `7.1.5`. The audit requires a version at or above `8.0.0`; the final lockfile resolves `8.0.1`.

## 6. Remediation Options

1. Transitive refresh: not possible because Prisma 6.19.3 explicitly pins `7.1.5`.
2. Prisma patch/minor update: not possible within Prisma 6; registry metadata confirms 6.19.3 is the latest Prisma 6 release.
3. Prisma major update: not selected. Prisma 7.9.1 metadata still declares `deepmerge-ts@7.1.5`, so it would add breaking-change risk without resolving this advisory.
4. pnpm override: selected after compatibility analysis.

## 7. Chosen Strategy

An explicit pnpm workspace override resolves `deepmerge-ts` to `8.0.1`:

```yaml
overrides:
  deepmerge-ts: 8.0.1
```

## 8. Why This Strategy

- It is the smallest effective dependency change.
- It is within the advisory's patched range.
- Version 7.1.5 and 8.0.1 expose the same ESM/CommonJS package entry-point shape.
- The installed `@prisma/config` distributed code contains no direct `deepmerge-ts` import or API call; the dependency is declared but is not executed by the inspected Prisma configuration bundle.
- Prisma validation, client generation, all migration-status checks, the isolated proof, and the full API regression all passed with the resolved package.
- A Prisma major upgrade would not fix the reported dependency range and would introduce unrelated breaking-change risk.

## 9. Files Changed

- `pnpm-workspace.yaml` — required pnpm 11 override location.
- `pnpm-lock.yaml` — resolves and records `deepmerge-ts@8.0.1` plus the override.
- `PHASE_8D_4_1_DEPENDENCY_SECURITY_RECOVERY_REPORT.md` — this report.

No product source, API contract, Prisma schema, migration, or test was changed.

## 10. Version Before/After

Prisma and `@prisma/client` remain aligned at `6.19.3`. The only resolved runtime dependency change is `deepmerge-ts` from `7.1.5` to `8.0.1`.

## 11. Prisma Validate

`pnpm db:validate` passed. The Prisma schema is valid.

## 12. Prisma Generate

`pnpm db:generate` passed. Prisma Client `6.19.3` was generated successfully after the dependency change.

## 13. Migration Status

Read-only `prisma migrate status` checks passed for Main, Shared Test, and Isolated Test. Each reports three committed migrations and an up-to-date database schema.

## 14. Database Isolation

`DATABASE_URL`, `DATABASE_URL_TEST`, and `DATABASE_URL_TEST_ISOLATED` were present, pairwise distinct, and the isolated target requires TLS (`sslmode=require`).

## 15. Main DB Safety

Main was used only for read-only migration status. No fixtures, writes, schema changes, migrations, or resets were run against Main.

## 16. Isolated API

`admin-users.isolated.integration.test.ts` passed: 2/2 tests, 0 failed, 0 skipped. This executed both sequential and concurrent Last Admin protections against the isolated target.

## 17. Full API

`pnpm test:api:integration` passed: 55/55 tests, 0 failed, 0 skipped. This is a fresh run after the Prisma-adjacent lockfile change.

## 18. Legal Guides Regression

`legal-guides.spec.ts` passed as part of the focused public browser regression: 5/5 tests.

## 19. Public Regression

A production-mode Playwright run passed 40/40 tests across Legal Guides, Homepage, Services, Service Detail, FAQ, Legal Matter Finder, Consultation, Mobile Navigation, and Locale Routing. It used a temporary local production server on a separate port; the temporary Playwright configuration was removed afterward.

## 20. Frozen Install

`pnpm install --frozen-lockfile` passed after the final lockfile update.

## 21. Audit Result

`pnpm audit` reports: `No known vulnerabilities found`. High vulnerabilities: 0. Critical vulnerabilities: 0.

## 22. Lint

`pnpm lint` passed.

## 23. TypeScript

`pnpm typecheck` passed.

## 24. Build

`pnpm build` passed. The optimized production build generated successfully, including the Guides routes.

## 25. Git Diff

`git diff --check` passed. Existing unrelated worktree changes remain preserved.

## 26. Security Regression Review

The fresh full API regression covers the existing auth, session, RBAC, CORS/origin, Last Admin, DTO, and booking-related backend safeguards. The fresh public suite covers the public browser paths. No security policy or product behavior was changed.

## 27. Remaining Vulnerabilities

None reported by `pnpm audit` at the time of verification.

## 28. Remaining Risks

The remediation uses an explicit pnpm override because Prisma 6 has no safe patch/minor path for this advisory. The override is documented and protected by the completed Prisma, API, and browser regression gates. Future Prisma releases should be reviewed so this override can be removed once Prisma publishes a compatible patched dependency itself.

## 29. Final Decision

The Phase 8D.4 dependency security blocker is resolved. Legal Guides remains release-ready, with no product code or database schema changes made in this recovery phase.

## 30. Final Verification

| Check | Result |
| --- | --- |
| Advisory identified | PASS |
| Dependency chain verified | PASS |
| Security advisory resolved | PASS |
| Frozen install | PASS |
| Prisma validate / generate | PASS / PASS |
| Main / Shared / Isolated migrations | PASS / PASS / PASS |
| Isolated API | PASS — 2/2 |
| Full API | PASS — 55/55 |
| Legal Guides | PASS — 5/5 |
| Public regression | PASS — 40/40 |
| Lint / TypeScript / Build | PASS / PASS / PASS |
| Audit | PASS — 0 High, 0 Critical |
| `git diff --check` | PASS |
