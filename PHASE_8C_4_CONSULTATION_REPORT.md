# Phase 8C.4 — Consultation Page Redesign Report

## 1. Scope

Only the localized public consultation presentation was redesigned:

- `/ar/consultation`
- `/en/consultation`

No approved public page was visually changed. Header, Footer, mobile navigation, logo system, backend, API contracts, Prisma, database, authentication, RBAC, booking semantics, and locale-routing architecture remain unchanged.

## 2. Existing Consultation Behavior Discovered

The existing booking experience is a client-side four-step flow:

1. Select an active public service (`GET /api/v1/services`)
2. Select one of the next seven dates
3. Select an existing time from `BOOKING_TIME_SLOTS`
4. Enter name, email, phone, optional message, and the existing hidden `website` honeypot

It uses React Hook Form, `consultationSubmissionSchema`, React Query, and `POST /api/v1/consultations`. Success is inline and shows a pending consultation reference. Client/API validation uses the existing field mapping and generic error alert.

## 3. Preserved Business Behavior

The service ID, preferred date, preferred time, name, email, phone, optional message, honeypot, Zod validation, API request URL/method/body, existing success reference, success wording, error wording, and loading/disabled behavior are preserved.

One reliability defect was fixed without changing semantics: a rejected `mutateAsync` validation request previously surfaced as an unhandled browser `pageerror` even though the UI rendered the existing field error. The handler now consumes that expected rejection after React Query has set the same existing error state. No request, response, validation rule, or displayed error was changed.

## 4. Art Direction

The page is now a quiet “Private Legal Intake” experience: warm ivory/paper/taupe surfaces, editorial typography, fine gold rules, a document-line motif, an asymmetrical guidance/form composition, and restrained motion. It does not reuse the Homepage Hero or introduce stock/legal imagery.

## 5. Hero

The dedicated consultation Hero states the client-facing purpose, gives a concise existing-workflow context, and uses an abstract document motif rather than a founder portrait. It is light in Light mode and shares the same architecture in Dark mode.

## 6. Main Intake

Desktop uses an editorial two-column layout: contextual guidance beside the primary booking flow. Mobile intentionally becomes a single column, with the form reached immediately after the concise introduction.

## 7. Existing Fields

All existing fields and controls remain present:

- Active service selection
- Preferred date
- Preferred time
- Full name
- Email address
- Phone number
- Optional details/message
- Existing hidden honeypot (`website`)

No service options or stored values were invented or changed.

## 8. Validation

The existing Zod resolver and API field-error mapping remain in use. Labels remain above inputs, invalid inputs retain `aria-invalid` and error association through `BookingInput`, and the design adds clear focus/border visibility without altering validation rules.

## 9. Submission

The unchanged client calls `createConsultation`, which sends the same JSON request to `POST /api/v1/consultations`. The focused E2E confirms the submitted field values, the omitted empty optional message, and preserved honeypot value using an intercepted browser request.

## 10. Loading

The existing submit button retains its disabled/loading state and current localized submitting text. Focused E2E verifies the disabled `Sending request...` state through a delayed mocked response.

## 11. Success

The existing inline success result is preserved: receipt wording, reference label, LTR-isolated reference number, and contact-follow-up wording. No appointment confirmation claim was added.

## 12. Error

The existing generic API alert and field-level validation display are preserved. The expected error rejection no longer creates a browser runtime error; the user still sees the same field error and accessible alert.

## 13. Confidentiality / Context

The page uses restrained, non-absolute context terms: private handling, clear information, and structured communication. It does not claim guaranteed confidentiality, absolute security, a response deadline, acceptance, lawyer assignment, or appointment confirmation.

## 14. What Happens Next

Three concise editorial steps accurately describe the existing flow: provide the essentials, request review, then existing follow-up contact about appointment confirmation. The accompanying note explicitly distinguishes receipt from final appointment confirmation.

## 15. Light

Light mode uses warm ivory, warm white, pale taupe, sand, charcoal text, and brand gold. Hero, intake, form surface, guidance, next steps, reassurance, and closing-adjacent sections have no large dark surface.

## 16. Dark

Dark mode retains the same layout using warm charcoal, deep brown, ivory typography, and gold accents. It is not a separate page.

## 17. Arabic RTL

Arabic renders with native RTL, Cairo inherited from the approved system, logical layout values, Arabic labels, and LTR-isolated email/phone input values.

## 18. English LTR

English renders native LTR with the approved English typography and naturally tuned alignment.

## 19. Translation Audit

Focused browser coverage verifies the Hero, context, steps, form labels, controls, CTA text, AR/EN direction, errors, success copy, and metadata. No cross-language Consultation UI leakage was found.

## 20. Mobile

At 360, 375, 390, and 430 pixels the Hero, guidance, form, steps, and reassurance stack intentionally; no horizontal overflow was found and form controls remain usable.

## 21. Responsive

Browser verification covered 36 states: Arabic and English × Light and Dark × 360, 375, 390, 430, 768, 1024, 1280, 1440, and 1920 pixels. Every state had the expected direction/theme and no horizontal overflow.

## 22. Motion

Only short Hero entrance reveals are used. Existing booking-step transitions remain in place. There is no continuous animation, scroll-jacking, or required motion interaction.

## 23. Reduced Motion

The focused suite emulates `prefers-reduced-motion: reduce`; the page remains fully visible, reachable, and interactive.

## 24. Accessibility

The page has one `h1`, semantic sections, the real form and labels, visible focus treatment, error state support, loading semantics, real controls, large touch targets, reduced-motion support, and RTL/LTR verification.

## 25. SEO

Browser coverage confirms:

- Canonical: `https://hhlawyer.ae/ar/consultation`
- Arabic and English `hreflang` alternates
- Localized Open Graph URL
- Existing localized title and description
- Official domain: `https://hhlawyer.ae`

## 26. Functional E2E

`apps/web/e2e/consultation-editorial.spec.ts` passes **4/4**. It covers bilingual presentation, Light surface audit, actual four-step intake controls, required-field validation, request payload, loading, inline success, API field error, reduced motion, mobile/responsive states, metadata, no page errors, and no overflow.

## 27. Light Surface Audit

Stable selectors inspect the rendered backgrounds of Hero, intake, form surface, context, next steps, and reassurance. The focused test rejects near-black/charcoal/deep-brown surfaces in Light mode.

## 28. Regression

No approved public page was modified. Browser regression results:

- Homepage smoke: **1 passed**
- Services, Service Detail, and About suites: **13 passed**

## 29. Files Created

- `apps/web/src/components/consultation/ConsultationEditorial.tsx`
- `apps/web/src/components/consultation/ConsultationEditorial.module.css`
- `apps/web/e2e/consultation-editorial.spec.ts`
- `PHASE_8C_4_CONSULTATION_REPORT.md`

## 30. Files Modified

- `apps/web/src/app/consultation/page.tsx`
- `apps/web/src/components/consultation/molecules/BookingSystem.tsx`
- `apps/web/src/components/consultation/molecules/BookingSteps.tsx`

## 31. Quality Gates

- `pnpm lint`: PASS
- `pnpm typecheck`: PASS
- `pnpm build`: PASS
- `git diff --check`: PASS

## 32. Visual QA

Actual localhost browser review covered Arabic/English Light/Dark desktop plus Arabic/English 390-pixel mobile. Browser-state checks confirmed direction, resolved theme, and no horizontal overflow. The form design was also exercised through mocked safe functional states.

## 33. Localhost

- Arabic Consultation: http://localhost:3000/ar/consultation
- English Consultation: http://localhost:3000/en/consultation

## 34. Product Owner Approval Boundary

This phase ends with Consultation only. Contact, Admin, and all other pages remain out of scope until explicit product-owner approval.

## Final Status

```text
PHASE 8C.4 STATUS

Consultation Hero:
PASS

Private Legal Intake Direction:
PASS

Existing Form Preserved:
PASS

Existing Fields Preserved:
PASS

Existing Validation Preserved:
PASS

Submission Contract Preserved:
PASS

Loading State:
PASS

Success State:
PASS

Error State:
PASS

What Happens Next:
PASS

No Unsupported Claims:
PASS

Light:
PASS

Light Dark-Surface Audit:
PASS

Dark:
PASS

Arabic RTL:
PASS

English LTR:
PASS

Arabic Localization:
PASS

English Localization:
PASS

Mobile:
PASS

Responsive:
PASS

Accessibility:
PASS

Motion:
PASS

Reduced Motion:
PASS

Canonical:
PASS

Hreflang:
PASS

Official Domain:
PASS — https://hhlawyer.ae

Functional Consultation E2E:
PASS

No Production Test Submission:
PASS

Homepage Regression:
PASS

Services Regression:
PASS

Service Detail Regression:
PASS

About Regression:
PASS

Lint:
PASS

TypeScript:
PASS

Build:
PASS

git diff --check:
PASS

Localhost:
PASS

BACKEND CHANGED:
NO

DATABASE CHANGED:
NO

BUSINESS LOGIC CHANGED:
NO

CONSULTATION READY FOR PRODUCT OWNER REVIEW:
YES

NEXT PAGE AFTER APPROVAL:
CONTACT

READY TO START CONTACT:
NO — WAIT FOR EXPLICIT PRODUCT OWNER APPROVAL
```
