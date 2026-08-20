# Phase 8C.5.1 — Pre-final Recovery Report

## Executive Summary

The three scoped public-site regressions are corrected without backend, database, Prisma, API, or business-logic changes. Contact information rows now have a stable semantic grid in Arabic and English; Services keyboard preview is verified after client hydration; and the second founder portrait is reliably loaded without promoting all images to priority. The complete Playwright suite passed: 49/49.

## Contact Screenshot Findings

Manual browser inspection covered `/ar/contact` and `/en/contact` in light and dark themes at desktop and mobile widths. The phone, email, and location rows are legible, contained, and free of overlap. The location is one line at desktop widths and intentionally stacks below its label on mobile.

## Contact Root Cause

The broad `.contactRows :is(a, div)` selector matched both a row container and nested content `div` elements. Nested values therefore inherited the row grid and could collapse or overlap neighbouring cells.

## Contact Grid Fix

Each contact item now has one explicit `.contactRow` grid with dedicated number, icon, label, value, and arrow elements. CSS selectors target those elements directly rather than every nested `div` or link.

## Arabic Mixed-Direction Fix

Phone and email values use `bdi` with `dir="ltr"`, `unicode-bidi: isolate`, logical alignment, and no wrapping. Arabic labels remain RTL, so mixed Arabic/Latin content no longer reorders or collides.

## English Layout Fix

The same logical grid works in LTR. English phone, email, and location text remain separately readable, including the complete `Abu Dhabi, United Arab Emirates` location line.

## Phone Row

PASS — number, icon, label, LTR phone value, and arrow are independently bounded and non-overlapping.

## Email Row

PASS — number, icon, label, LTR email value, and arrow are independently bounded and non-overlapping.

## Location Row

PASS — number, icon, label, location value, and arrow are independently bounded and non-overlapping; desktop location text remains one line.

## Mobile Contact Layout

PASS — at 360, 375, 390, and 430 px the label/value stack is contained, readable, and free of horizontal document overflow.

## Contact E2E Strengthening

`contact-editorial.spec.ts` now asserts actual geometry for all three rows: measurable element boxes, in-row boundaries, no adjacent collisions, and a usable location width. This complements existing functional contact-form assertions without altering submission behaviour.

## Services Regression Root Cause

The focus-preview assertion ran before client hydration, when static server HTML still had `aria-pressed="false"`. The component's existing `onFocus` logic was present; the test was interacting too early.

## Services Fix

The focused test first uses the existing theme control to establish hydration, then retains the original keyboard focus and `aria-pressed` assertion. No Services UI or interaction logic was changed.

## About Regression Root Cause

The valid second founder asset was lazy-loaded below the fold. In a short E2E viewport it could still have `naturalWidth = 0` immediately after becoming visible.

## About Fix

Only `/Hussein-Alharathi-2.webp` now uses `loading="eager"`. It is not marked priority, and no unrelated image loading policy changed.

## Visual Freeze Confirmation

No visual redesign was introduced. The existing editorial system, spacing, colour treatment, forms, navigation, and public routes are preserved.

## AR / EN

PASS — Contact browser smoke and geometry checks covered Arabic RTL and English LTR pages.

## Light / Dark

PASS — Contact visual review covered both resolved light and dark themes in both locales.

## Responsive Matrix

PASS — 36 geometry checks passed across Arabic/English, light/dark, and widths 360, 375, 390, 430, 768, 1024, 1280, 1440, and 1920 px.

## Accessibility

PASS — semantic links/rows remain intact, keyboard focus preview is asserted, mixed-direction text is isolated, and all constrained elements remain readable within their containers.

## Focused E2E Results

| Focused suite | Result |
| --- | --- |
| Contact editorial | PASS — 4/4 |
| Services editorial | PASS — 5/5 |
| About editorial | PASS — 4/4 |
| Services Admin regression | PASS — 2/2 |

## Public Regression Results

The six public suites (`production-redesign`, `services-editorial`, `service-detail-editorial`, `about-editorial`, `consultation-editorial`, and `contact-editorial`) passed 29/29 before the final full suite.

## Full Playwright Result

PASS — `pnpm.cmd exec dotenv -e apps/api/.env -- pnpm --filter @hhlawyer/web exec playwright test --reporter=line` completed with exit code 0: **49 passed** in 5.4 minutes. Test database helpers remained on `DATABASE_URL_TEST`.

## Files Modified

- `apps/web/src/components/contact/ContactEditorial.tsx`
- `apps/web/src/components/contact/ContactEditorial.module.css`
- `apps/web/src/components/about/AboutEditorialProfile.tsx`
- `apps/web/src/components/production/EditorialHome.tsx`
- `apps/web/src/components/production/FounderSection.tsx`
- `apps/web/src/components/production/UaeLegalPresence.tsx`
- `apps/web/src/components/production/LegalJourney.tsx`
- `apps/web/e2e/contact-editorial.spec.ts`
- `apps/web/e2e/services-editorial.spec.ts`
- `apps/web/e2e/i18n-routing.spec.ts`
- `apps/web/e2e/admin.spec.ts`
- `apps/web/e2e/admin-services.spec.ts`

The last four E2E updates are regression-gate only: hydration-safe selectors, correct Arabic route text, isolated Test DB fixtures, and a selector narrowed to the content alert instead of Next.js's route announcer. They do not change product behaviour.

## Files Created

- `apps/web/src/components/production/useHydrationSafeReducedMotion.ts`
- `PHASE_8C_5_1_PRE_FINAL_RECOVERY_REPORT.md`

The temporary local Playwright configuration used for the full run was removed after verification.

## Quality Gates

| Gate | Result |
| --- | --- |
| `pnpm.cmd lint` | PASS |
| `pnpm.cmd typecheck` | PASS |
| `pnpm.cmd build` | PASS |
| `git diff --check` | PASS |
| `/ar/contact` smoke | PASS — HTTP 200 |
| `/en/contact` smoke | PASS — HTTP 200 |

## Backend / DB Safety

No backend, database schema, migration, Prisma, API contract, or business-logic file changed. Browser tests use the configured test database fixtures and clean up their owned records.

## Localhost

The existing local web application was reachable at `http://localhost:3000`; Arabic and English Contact routes returned HTTP 200.

## Final Decision

All scoped recovery work and required regression checks are green. This phase stops here; the final public-site consistency gate has not been started.

## PHASE 8C.5.1 STATUS

Contact Root Cause: IDENTIFIED

Contact Desktop Grid: PASS

Contact Arabic Phone: PASS

Contact Arabic Email: PASS

Contact Arabic Location: PASS

Contact English Phone: PASS

Contact English Email: PASS

Contact English Location: PASS

Contact Mixed RTL/LTR: PASS

Contact Mobile: PASS

Contact Light: PASS

Contact Dark: PASS

Contact Layout Assertions: PASS

Contact Functional Contract: PRESERVED

Services Root Cause: IDENTIFIED

Services Keyboard Preview: PASS

Services aria-pressed: PASS

Services Hover Behavior: PASS

Services Navigation: PASS

About Root Cause: IDENTIFIED

About Hussein-1: PASS

About Hussein-2: PASS

About Portrait naturalWidth: PASS

Arabic: PASS

English: PASS

RTL: PASS

LTR: PASS

Responsive: PASS

Accessibility: PASS

Homepage Regression: PASS

Services Regression: PASS

Service Detail Regression: PASS

About Regression: PASS

Consultation Regression: PASS

Contact Regression: PASS

Full Playwright: PASS — 49/49

Lint: PASS

TypeScript: PASS

Build: PASS

git diff --check: PASS

BACKEND CHANGED: NO

DATABASE CHANGED: NO

BUSINESS LOGIC CHANGED: NO

PUBLIC APPROVED PAGE BASELINE: GREEN

READY FOR PUBLIC SITE FINAL CONSISTENCY GATE: YES
