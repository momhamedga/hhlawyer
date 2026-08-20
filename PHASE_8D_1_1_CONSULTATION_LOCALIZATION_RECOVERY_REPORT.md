# Phase 8D.1.1 — Consultation Localization & API Runtime Correction

## 1. Executive Summary

The Arabic consultation flow was rendering the canonical English API service name when a service was selected. The cause was a presentation-layer resolver that only used the centralized service content for English and otherwise fell back to `service.name` from the API.

The correction is frontend-only. Service selection and booking still retain and submit the canonical `serviceId`; only the visible title, date, and time are localized.

## 2. Root Cause — Service Localization

`BookingSystem` obtains active services with `GET /api/v1/services`, keeps the chosen `service.id` in the `serviceId` form field, and previously printed `selectedService.name` in the summary. `ServiceStep` used `localizeService`, but that resolver returned centralized content only for `en`; for `ar` it returned the raw API name. The same API fields are `id`, `slug`, `name`, `description`, and `sortOrder`.

## 3. Root Cause — API ERR_CONNECTION_REFUSED

`NEXT_PUBLIC_API_URL` resolves to `http://localhost:4000/api/v1` by default. A browser `ERR_CONNECTION_REFUSED` occurs when the independently-run API process on port 4000 is not running. It is not a services-route or localization defect. During this verification the API health endpoint and services endpoint both returned HTTP 200.

## 4. API Root 404 Explanation

The API is intentionally mounted under `/api/v1`. `GET /` passes to the JSON not-found middleware and returns HTTP 404; this is expected. The real endpoints are `GET /api/v1/health` and `GET /api/v1/services`.

## 5. Service Identity Strategy

The stable API/DB identity remains `serviceId` and `slug`. `slug` resolves the locale-specific presentation in `service-content.ts`; `serviceId` is preserved in React Hook Form state and in the consultation POST payload. No API, database, Prisma, slug, or admin-service name changed.

## 6. Arabic Service Mapping

Known slugs resolve from `serviceContent.ar`: القانون الجنائي، القانون التجاري والشركات، الأحوال الشخصية والمنازعات المدنية، خدمات الكاتب العدل الخاص، والضرائب والامتثال.

## 7. English Service Mapping

Known slugs resolve from `serviceContent.en`: Criminal Law, Commercial and Corporate Law, Personal Status and Civil Matters, Private Notary Services, and Tax and Compliance.

## 8. Consultation Arabic Audit

The Arabic service step, selected summary, form labels, loading/error state, progress, and success copy were browser-tested. Known dynamic service names no longer fall through to English. The fallback for an unknown API slug is the localized existing `SERVICE_NOT_FOUND` message, rather than a silent raw-English fallback.

## 9. Consultation English Audit

The English service step and summary resolve to the English centralized content. The existing English labels, loading/error state, validation, success state, and accessible form labels remain intact.

## 10. Date/Time Localization

`formatConsultationDate` now renders the chosen ISO date using the existing locale formatter. Arabic booking times are formatted with `Intl.DateTimeFormat("ar-AE-u-nu-latn")`, producing an Arabic day-period representation rather than literal `AM`/`PM`. English retains the canonical, natural slot text. Stored date and time values are unchanged.

## 11. Summary Localization

The summary now uses the same locale-aware service resolver as the service selection UI and display-only date/time formatters. It never substitutes a localized name into the booking payload.

## 12. API Error-State Localization

The existing localized `servicesError` message is shown in the booking card for an unavailable services API. A focused browser test verifies Arabic and English error text using a safely aborted request.

## 13. Payload Contract Preservation

The focused E2E test captured the outgoing POST body. It still contains the selected canonical `serviceId`, ISO `preferredDate`, canonical `preferredTime` (`09:00 AM` in the tested English case), form details, and honeypot field. No business payload field changed.

## 14. Runtime Configuration

The web client uses `NEXT_PUBLIC_API_URL` or its existing fallback `http://localhost:4000/api/v1`. The official local command is `pnpm dev`, which starts the web and API workspaces together; `pnpm dev:web` and `pnpm dev:api` are the individual alternatives. CORS permits the configured `WEB_ORIGIN`; no CORS or process-management change was necessary.

## 15. Browser QA

Live read-only browser smoke passed for `/ar/consultation` and `/en/consultation` against the running services API in Light and Dark themes at 360, 390, 430, and 1440 px. It confirmed five live services, correct localized titles, no overflow, and no page errors.

## 16. Accessibility

Existing semantic buttons, form labels, error alerts, progress `aria-label`, and direction attributes were preserved. The added display formatter does not alter control identity or accessible interaction.

## 17. Responsive

Focused Consultation E2E and live smoke confirmed no horizontal overflow on the required mobile widths and desktop. Mobile theme selection was exercised through the existing mobile navigation dialog.

## 18. Tests

- Focused `consultation-editorial.spec.ts`: 7/7 PASS.
- Live Consultation browser smoke: 1/1 PASS.
- Services + Service Detail + locale routing regression: 10/10 PASS.

An obsolete Services assertion expecting `Tax Law and Compliance` was updated to read `serviceContent.en.taxes.title`, the approved centralized content (`Tax and Compliance`). No assertion was removed or weakened.

## 19. Regression

The affected public regression set passed: Consultation, Services, Service Detail, and locale routing. The documented Phase 8C public baseline remains 49/49; a full suite was not rerun because this phase did not change unrelated public surfaces and running the legacy real-submit tests against the active local API would not be an isolated test-database run.

## 20. Quality Gates

`pnpm lint`, `pnpm typecheck`, `pnpm build`, and `git diff --check` all passed.

## 21. Files Created

- `PHASE_8D_1_1_CONSULTATION_LOCALIZATION_RECOVERY_REPORT.md`

## 22. Files Modified

- `apps/web/src/i18n/format.ts`
- `apps/web/src/components/consultation/molecules/BookingSystem.tsx`
- `apps/web/e2e/consultation-editorial.spec.ts`
- `apps/web/e2e/services-editorial.spec.ts`

## 23. Backend/DB Safety

No backend, database, Prisma schema, migration, seed, service record, API contract, authentication, or booking-rule change was made. Browser smoke performed GET requests only; no Main database fixture or booking was created.

## 24. Remaining Risks

New public service slugs must be added to `service-content.ts` before publication. Unknown slugs remain operationally selectable but display the localized existing unavailable-service message instead of leaking a raw canonical name. The API process must be started alongside the web process for local runtime requests.

## 25. Final Decision

The dynamic API-backed consultation presentation is now locale-aware, Arabic time display does not leak English AM/PM, and the booking payload contract is preserved. Phase 8D.1.1 is complete; no Phase 8D.2 work was started.

## Final Verification

| Check | Result |
| --- | --- |
| Service localization root cause | PASS |
| API runtime root cause | PASS |
| API root 404 | EXPECTED |
| Focused Consultation E2E | PASS — 7/7 |
| Live browser smoke | PASS — 1/1 |
| Services/Detail/locale regression | PASS — 10/10 |
| Lint | PASS |
| TypeScript | PASS |
| Build | PASS |
| git diff --check | PASS |
