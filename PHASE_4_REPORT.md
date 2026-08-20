# Phase 4 — Contact API, Notification Architecture, and Abuse Hardening

## 1. Executive Summary

Phase 4 delivers real contact-message handling end to end. The former contact timeout simulation was replaced by React Hook Form, shared Zod validation, typed fetch, Express persistence to Neon, safe abuse controls, and real browser verification against the isolated Test branch.

## 2. Contact Architecture

`ContactForm → RHF → shared Zod → TanStack Query → typed fetch → Express → shared Zod → contact service → Prisma → Neon → independent internal notification attempt`.

## 3. Contact API Contract

`POST /api/v1/contact` accepts only strict `name`, `email`, `subject`, `message`, and `website` fields. It returns HTTP 201 with `{ status: "received", createdAt }`, without internal IDs or message/PII echoing.

## 4. Validation

One shared `contactSubmissionSchema` validates normalized name (2–100), lowercase email, subject (3–150), message (10–5000), and the honeypot. Both browser and API use it; server validation remains authoritative.

## 5. Persistence

Validated input is mapped explicitly to `ContactMessage`; every new record starts `UNREAD`. The existing database model was sufficient, so no migration was added or changed.

## 6. Rate Limiting

Contact has its own 5-per-IP/15-minute limiter, separate from consultations and the existing global limiter. It returns safe HTTP 429 `RATE_LIMITED` envelopes.

## 7. Honeypot

The non-focusable hidden `website` field is strictly validated. A populated value produces `SPAM_DETECTED`, creates no record, and triggers no notification.

## 8. Email Architecture

`EmailNotifier` isolates notification calls from routes and domain persistence. It supports contact and consultation internal notifications, a disabled default provider, a production Resend HTTP provider, and injected mocks for tests.

## 9. Email Provider

Resend was selected as the single TypeScript-compatible transactional provider. No SDK dependency is required; its REST call is isolated in `ResendEmailNotifier`. No provider credential was found, so no real message was sent.

## 10. Environment Variables

`EMAIL_ENABLED`, `EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM`, `CONTACT_NOTIFICATION_TO`, and `TRUST_PROXY` are documented only as placeholders in `apps/api/.env.example`. They are API-only—no email secret is exposed to Next.js.

## 11. Delivery Failure Semantics

The message is persisted first. Notification runs afterward, outside the Prisma transaction. Provider failure logs only request ID, provider, category, and a safe code; it does not delete or invalidate the received contact/consultation.

## 12. Consultation Notification Integration

The same notifier is called after a successful consultation transaction. Its failure cannot roll back a valid booking. The default disabled notifier preserves all Phase 3B behavior until credentials are enabled.

## 13. Trusted Proxy

`TRUST_PROXY` is a validated hop count (0–10), defaulting to `0`; the app never sets `trust proxy = true`. Tests prove forwarded headers do not bypass limits by default and work as distinct client IPs when one trusted proxy hop is explicitly configured. Production must set the known deployment hop count.

## 14. PII Logging Safety

No contact or consultation body is logged. Email failures log safe metadata only. The shutdown path was also changed from raw error logging to a safe shutdown code.

## 15. API Tests

The isolated Vitest/Supertest suite now has 32 passing tests. It covers valid contact persistence, `UNREAD`, validation, strict server fields, honeypot, rate limiting, proxy behavior, CORS through browser flows, notification success/failure semantics, and consultation regression/concurrency.

## 16. Email Tests

Mock notifier tests prove contact notification is invoked with operational data, provider failure leaves the persisted message intact, raw provider errors are not returned, and failed consultation notification leaves a real consultation intact. Automated tests never send real email.

## 17. Contact E2E

Playwright drove Chrome through `/contact`, entered a valid Arabic contact request, received only the real success UI after HTTP 201, and wrote the record to Test. The exact E2E record was deleted afterward.

## 18. Booking Regression

The existing booking Playwright test and the Phase 3B consultation integration/concurrency tests passed unchanged under the new notification architecture.

## 19. Accessibility

Contact fields now have labels, IDs, error associations, `aria-invalid`, alert errors, `aria-busy`, correct autocomplete, and a polite success announcement. The honeypot is hidden and excluded from keyboard navigation.

## 20. CORS

The explicit `WEB_ORIGIN` policy remains in place and permits only the required GET/HEAD/OPTIONS/POST methods. Browser E2E validates both contact and booking POSTs from the approved local origin.

## 21. Files Created

- `apps/api/src/modules/contact/*`
- `apps/api/src/services/email/*`
- `apps/api/src/modules/contact/contact.integration.test.ts`
- `apps/web/e2e/contact.spec.ts`
- `PHASE_4_REPORT.md`

## 22. Files Modified

- Shared validation/types, API environment, app/router/consultation layers, safe server logging, web API client, ContactForm, and ContactAtoms.

## 23. Dependencies Added

No Phase 4 runtime dependency was added. Existing Vitest/Supertest/Playwright and native fetch support the implementation.

## 24. Database Changes

None. The pre-existing `ContactMessage` model already provides all required fields, status, and indexes.

## 25. Security Review

Verified: strict server validation, Prisma parameterization, 16 KB JSON limit, dedicated rate limit, honeypot, explicit CORS, Helmet, safe errors, proxy defaults, PII-safe logging, HTML escaping for notification content, Test isolation, and API-only secrets. CAPTCHA/Turnstile remains a future production hardening decision; rate limiting plus honeypot is sufficient for this development baseline.

## 26. Verification Commands

Ran `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm audit`, `pnpm db:validate`, `pnpm db:generate`, Main/Test migration status, Main/Test database checks, `pnpm test:api:integration`, and `pnpm test:web:e2e`.

## 27. Verification Results

All executed quality, schema, database, API, consultation-regression, contact, and browser tests passed. Main and Test both report two migrations up to date. No automated data was written to Main.

## 28. Remaining Risks

Real email delivery requires a verified Resend account, sender, recipient, and API key. The production host's exact proxy hop count must be configured before deployment. Rate limiting/honeypot do not replace CAPTCHA against sophisticated automated abuse.

## 29. Deferred Work

Authentication, admin dashboard, lawyer workflow, confirmation emails, calendar availability, SMS/WhatsApp, payments, CMS, analytics, bilingual routing, and theming remain out of scope.

## 30. Phase 5 Recommendations

Provision email credentials and send one controlled non-client smoke notification; configure the production trusted-proxy hop count; then authorize the next product phase separately.

## Final Verification Table

| Check | Result |
| --- | --- |
| Install | PASS |
| Lint | PASS |
| TypeScript | PASS |
| Build | PASS |
| Audit | PASS |
| Prisma Validate | PASS |
| Main DB | PASS |
| Test DB | PASS |
| Test Isolation | PASS |
| Consultation Regression | PASS |
| Contact API | PASS |
| Contact Validation | PASS |
| Contact Persistence | PASS |
| Contact Rate Limit | PASS |
| Honeypot | PASS |
| Email Architecture | PASS |
| Real Email Delivery | PENDING CREDENTIALS |
| Email Failure Safety | PASS |
| Trusted Proxy | PASS |
| PII-safe Logging | PASS |
| CORS | PASS |
| Accessibility | PASS |
| Contact E2E | PASS |
| Booking E2E | PASS |

## PHASE 4 STATUS

Contact API:
PASS

Contact Persistence:
PASS

Email Architecture:
PASS

Real Email Delivery:
PENDING

Rate Limiting:
PASS

Anti-Spam:
PASS

Trusted Proxy:
PASS

Test Isolation:
PASS

Consultation Regression:
PASS

Contact Integration:
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

READY FOR PHASE 5:
YES
