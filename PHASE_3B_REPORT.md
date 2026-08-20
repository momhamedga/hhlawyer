# Phase 3B — Real Consultation Booking Report

## 1. Executive Summary

Phase 3B delivers the first real production feature: an Arabic booking wizard now sends a validated consultation request to Express and receives a database-backed pending reference. The former timeout simulation is removed.

## 2. Architecture

`BookingSystem → React Hook Form → shared Zod → TanStack Query → typed fetch → Express → shared Zod → consultation service → Prisma transaction → Neon`.

## 3. Dependencies Added

- Web: `react-hook-form`, `@hookform/resolvers`, `@tanstack/react-query`, `@playwright/test`.
- API tests: `vitest`, `supertest`, `@types/supertest`.

## 4. Consultation API Contract

`POST /api/v1/consultations` accepts only the strict submission object and returns HTTP 201 with `referenceNumber`, `PENDING`, and `createdAt`. It never returns PII or the internal ID.

## 5. Shared Validation

`@hhlawyer/validation` owns one strict `consultationSubmissionSchema`: CUID service ID, normalized name/email/phone, strict calendar date, canonical time slot, bounded optional message, and honeypot.

## 6. Date/Timezone Contract

`BUSINESS_TIME_ZONE` is startup-validated and defaults to the documented temporary business timezone `Asia/Dubai`. Past-date and reference-year logic use that timezone. A submitted `YYYY-MM-DD` is stored deterministically at **12:00:00 UTC** on that calendar day, avoiding implicit server/browser timezone parsing.

## 7. Time Slot Contract

`BOOKING_TIME_SLOTS` is the single shared list: `09:00 AM`, `10:30 AM`, `01:00 PM`, `04:30 PM`. The browser displays it and the API rejects all other values.

## 8. Service Validation

The API validates the selected CUID inside the transaction and requires an active service. The minimal public `GET /api/v1/services` endpoint was added solely to give the existing UI real IDs; it returns active public service fields only.

## 9. Reference Number Architecture

`ConsultationCounter` is keyed by year. PostgreSQL atomically performs `INSERT ... ON CONFLICT ... DO UPDATE ... RETURNING` and produces `CONS-YYYY-XXXXXX` references.

## 10. Database Migration

New committed migration: `20260811130000_consultation_reference_counter`. The historical initial migration was not edited. It was applied to Main and Test.

## 11. Transaction Strategy

Active-service lookup, counter allocation, and Consultation creation execute in one Prisma interactive transaction. Creation failures roll back the counter increment and no partial consultation is committed.

## 12. API Error Contract

Safe envelopes use `VALIDATION_ERROR`, `SERVICE_NOT_FOUND`, `SPAM_DETECTED`, `RATE_LIMITED`, `MALFORMED_JSON`, `DATABASE_ERROR`, or `INTERNAL_SERVER_ERROR`. Validation includes safe field messages; database internals are not exposed.

## 13. Rate Limiting

The existing global limiter remains. `POST /consultations` additionally enforces 5 attempts per IP per 15 minutes and returns safe HTTP 429 JSON. Express retains its safe default proxy behavior; `trust proxy` was not blindly enabled, so deployment must configure trusted proxies explicitly when applicable.

## 14. Honeypot Protection

The hidden, non-focusable `website` field is part of the strict contract. A populated value is rejected and is never persisted.

## 15. PII / Logging Safety

Request bodies are not logged. The centralized 5xx log is now only `{ requestId, code }`, not a raw error object. The response excludes name, email, phone, message, and internal ID.

## 16. Test Database Safety

Vitest uses `DATABASE_URL_TEST` through `createTestPrismaClient`, which invokes the no-fallback isolation guard. Test cleanup only deletes rows with the suite's unique `PHASE3B_TEST_*` marker. The browser smoke record was separately deleted by its exact marker.

## 17. API Tests

The 20 Vitest/Supertest tests cover health, valid creation, safe response, invalid fields, strict server fields, inactive/missing service, honeypot, malformed JSON, CORS, rate limiting, and persisted Test records.

## 18. Concurrency Test

Six concurrent Test-branch submissions all returned successful, unique `CONS-YYYY-XXXXXX` references. The test does not rely on response order.

## 19. TanStack Query Integration

`QueryProvider` creates one client at a client boundary. Service loading uses a query; booking uses a mutation with `retry: false`, preventing automatic duplicate POST submissions.

## 20. React Hook Form Integration

RHF owns name, email, phone, message, honeypot, selected service, date, and time; Zod resolver supplies client feedback and API field errors are mapped back safely.

## 21. Zustand Responsibility

Zustand now retains only the wizard step. It no longer duplicates submitted form data or server mutation state.

## 22. API Client

Native `fetch` is wrapped in a small typed client with safe response normalization and optional abort support. The public base URL is `NEXT_PUBLIC_API_URL` only.

## 23. Booking Form Integration

The existing visual wizard was preserved. It loads active services with real database IDs and submits the real shared contract. No `setTimeout`, server action simulation, or fake confirmation remains.

## 24. Accessibility

Fields have labels, IDs, invalid/error associations, semantic email/tel autocomplete, `aria-busy`, alert errors, a polite success announcement, keyboard-reachable buttons, and an inaccessible-to-keyboard honeypot.

## 25. Success UX

Only HTTP 201 displays success. It shows the real returned reference and says the firm will contact the client to confirm the appointment; it does not claim a confirmed appointment.

## 26. Error UX

Validation, unavailable service, rate-limit, network, and generic failures yield safe Arabic guidance. The form does not resubmit automatically.

## 27. CORS

The explicit `WEB_ORIGIN` policy now permits the required POST method for `http://localhost:3000`; wildcard origins are not used.

## 28. Files Created

- Consultation modules, public services route, counter migration, API integration tests, Vitest config.
- Query provider, typed web API client, Playwright configuration and real booking smoke test.
- `apps/web/.env.example` and this report.

## 29. Files Modified

- Prisma schema, API environment/error/app/router/database check configuration, shared validation/types, root/API/web manifests and lockfile.
- Existing booking store, inputs, steps, wizard, and web layout.

## 30. Environment Changes

`BUSINESS_TIME_ZONE=Asia/Dubai` is documented in the API example. `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1` is documented in the web example. No real credential was changed or committed.

## 31. Main Database Verification

Main migration status is up to date and the schema/service check passes. No automated test or smoke consultation was written to Main.

## 32. Test Database Verification

Test migration status is up to date; schema/service check passes; all automated database and browser smoke activity used Test only and targeted cleanup was performed.

## 33. End-to-End Smoke Test

Playwright drove installed Chrome through `/consultation`: selected a real service, calendar date, slot, entered form values, sent to a locally running isolated-Test Express server, and observed a real `CONS-YYYY-XXXXXX` confirmation. PASS.

## 34. Security Review

Server validation, strict fields, Prisma parameterization, atomic transaction, rate limiting, honeypot, constrained JSON body, explicit CORS, safe errors, no PII logging, isolated test client, and client-secret separation were verified. CAPTCHA remains intentionally out of scope.

## 35. Verification Commands

`pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm audit`, `pnpm db:validate`, `pnpm db:generate`, migration status for Main/Test, database checks, `pnpm test:api:integration`, and `pnpm test:web:e2e` all ran.

## 36. Verification Results

All required commands passed. API integration: **20/20**. Browser E2E: **1/1**. Audit reported no known vulnerabilities.

## 37. Known Limitations

This phase validates request dates and supported slots only; it does not reserve availability. Proxy trust must be configured for the eventual deployment topology before relying on forwarded IP headers.

## 38. Deferred Work

Contact API, email/SMS/WhatsApp, authentication, admin tooling, lawyer calendar, payments, appointment confirmation workflow, CAPTCHA, bilingual routing, and theming remain deferred. The existing contact form is not given a backend in this phase.

## 39. Phase 4 Recommendations

Authorize a separate scope for notification/confirmation workflow and calendar availability, then add a production-aware trusted-proxy configuration with operations ownership.

## Final Verification Table

| Check | Result |
| --- | --- |
| Install | PASS |
| Lint | PASS |
| TypeScript | PASS |
| Full Build | PASS |
| Audit | PASS |
| Prisma Validate | PASS |
| Prisma Generate | PASS |
| Main Migration Status | PASS |
| Test Migration Status | PASS |
| Main DB Check | PASS |
| Test DB Check | PASS |
| Test Isolation | PASS |
| Health API | PASS |
| Consultation API | PASS |
| Server Validation | PASS |
| Active Service Validation | PASS |
| Reference Generation | PASS |
| Reference Concurrency | PASS |
| Transaction Safety | PASS |
| Rate Limit | PASS |
| Honeypot | PASS |
| PII-safe Logging | PASS |
| API Tests | PASS |
| Integration Tests | PASS |
| React Hook Form | PASS |
| TanStack Query | PASS |
| Real Booking Integration | PASS |
| Fake Booking Removed | PASS |
| Accessibility | PASS |
| CORS | PASS |
| E2E Smoke Test | PASS |

## PHASE 3B STATUS

Consultation API:
PASS

Database:
PASS

Validation:
PASS

Reference Generation:
PASS

Concurrency Safety:
PASS

Rate Limiting:
PASS

Anti-Spam:
PASS

Test Isolation:
PASS

API Tests:
PASS

Booking Integration:
PASS

Accessibility:
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

READY FOR PHASE 4:
YES
