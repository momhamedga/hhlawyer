# PHASE 8C.2.1 — Public Service Detail Report

## 1. Scope

Only the public service-detail presentation was redesigned:

- `/ar/services/[slug]`
- `/en/services/[slug]`

The Admin Service detail route, Services index design, Header, Footer, mobile navigation, backend, database, Prisma, authentication, booking behavior, and route structure were not changed.

## 2. Existing data behavior preserved

The route still reads the same fixed `LAW_SERVICES` catalogue and resolves localized display copy via `localizeService`. The existing five public slugs remain the source of truth. Unknown slugs still use `notFound()`; no generic page or fabricated content was introduced.

The current public detail implementation has no separate DB-created-service rendering path. That safe fixed-catalogue behavior remains unchanged: presentation did not create a database lookup, translate stored text, or alter any data.

## 3. Editorial Legal Dossier concept

The former compact detail layout is now an **Editorial Legal Dossier**: a controlled service hero, readable overview, numbered service capabilities, a concise preparation note, other-practice rows, and a single consultation close. The template is shared while individual service positions and icons give each known practice a restrained visual distinction.

## 4. Hero

- Compact, dedicated service hero—not the Homepage Hero.
- Localized practice label, `Service / 01–05` index, title, original description, consultation CTA, and locale-aware return to Services link.
- Large but controlled typography, revealing meaningful content below the first fold.
- Subtle 450–650ms entrance reveal, disabled under reduced motion.

## 5. Service imagery

The approved local `editorial-office.png` is used through `next/image` with explicit `fill`, `sizes`, meaningful locale-specific alt text, responsive crop positions per known service, an overlay, a gold editorial rule, service number, and contextual caption. No external image was hotlinked and no generic stock gallery was added.

## 6. Overview

The overview presents the existing localized service description at a readable width, followed by existing product-owned neutral context. It contains no new legal advice, guarantees, procedures, outcomes, fees, or deadlines.

## 7. How We Can Help

Existing `service.features` are displayed as two numbered editorial rows. Their titles and descriptions are unchanged in meaning; no unsupported legal claim was added.

## 8. Consultation CTA

The hero and closing CTA both use the existing locale-aware consultation URL and existing `#consultation` fragment. No new query parameter, API request, or booking behavior was introduced.

## 9. Other Services

The current service is excluded. The remaining four known practice areas appear as compact editorial navigation rows that retain their original localized slugs.

## 10. Fixed catalogue behavior

All known catalogue entries resolve through the redesigned template:

`criminal`, `commercial`, `civil`, `notary`, `taxes` — 5/5 in Arabic and 5/5 in English.

## 11. Admin-created fallback

PASS by preservation. The existing public route has no DB-created-service rendering path; an arbitrary unknown slug continues to reach the existing `notFound()` behavior. No visual redesign altered that boundary or manufactured translations for stored content.

## 12. Light

Light uses intentional warm ivory, warm white, taupe, charcoal, and controlled brand-gold rules rather than a dark-layout replica.

## 13. Dark

Dark preserves the same hierarchy using warm charcoal, deep brown, ivory text, and gold accents—without blue or cyan treatments.

## 14. RTL

Arabic was visually reviewed with Cairo and `dir="rtl"`. Logical properties place imagery, rules, link alignment, number hierarchy, and directional arrows correctly.

## 15. LTR

English was visually reviewed with Inter and `dir="ltr"`, including desktop, mobile, related-service navigation, and primary/secondary actions.

## 16. Motion

Hero copy and image use restrained opacity/vertical reveals. Capability rows use short staged reveals only; no decorative bounce or continuous animation is present.

## 17. Reduced motion

The component uses `useReducedMotion` and CSS `prefers-reduced-motion` fallbacks. Focused E2E exercised the mobile detail route with reduced motion enabled.

## 18. Responsive

The desktop hero uses controlled maximum widths; tablet collapses the split hero and sections naturally; mobile presents a single-column hero, legible title, visible CTAs, stacked practice rows, and no overflow.

## 19. Accessibility

- One `h1` per detail page and logical section heading hierarchy.
- Native links and visible keyboard focus.
- Image alt text, descriptive captions, button-free navigation, and non-color-only active affordances.
- Reduced-motion, RTL/LTR, contrast-conscious dark/light tokens, and mobile-sized interactive targets.

## 20. SEO

The locale detail route now derives metadata from the existing service catalogue via `localizedMetadata`. Focused E2E confirmed the official `https://hhlawyer.ae` canonical, `hreflang` alternatives, and Open Graph URL for `/ar/services/criminal`; the same route pattern is used for all known slugs.

## 21. Slug regression

Focused browser smoke resolved all five known slugs in each locale without page errors or horizontal overflow. The original slugs, route shape, and unknown-slug `notFound()` behavior were preserved.

## 22. Files created

- `apps/web/src/components/services/ServiceDetailDossier.tsx`
- `apps/web/src/components/services/ServiceDetailDossier.module.css`
- `apps/web/e2e/service-detail-editorial.spec.ts`
- `PHASE_8C_2_1_PUBLIC_SERVICE_DETAIL_REPORT.md`

## 23. Files modified

- `apps/web/src/app/services/[slug]/page.tsx` — now renders the scoped Dossier component.
- `apps/web/src/app/[locale]/services/[slug]/page.tsx` — adds catalogue-derived localized metadata.
- `apps/web/src/components/services/ServicesEditorial.tsx` — removes hover-only selection, which could replace the selected link while the pointer traveled to it. Selection remains click- and keyboard-focus-driven.

## 24. Quality

| Check | Result |
| --- | --- |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm build` | PASS |
| `git diff --check` | PASS |

## 25. E2E

- Focused Service Detail E2E: PASS — 3/3.
- Services Index regression: PASS — 4/4.
- Homepage reduced-motion smoke: PASS — 1/1.
- Responsive browser matrix: PASS — 36/36 (2 locales × 2 themes × 9 widths).
- No browser page errors, hydration errors, or horizontal overflow were observed during the focused and visual checks.

## 26. Localhost

The running local preview was used for verification:

- Arabic detail: `http://localhost:3000/ar/services/criminal`
- English detail: `http://localhost:3000/en/services/criminal`
- Arabic index: `http://localhost:3000/ar/services`
- English index: `http://localhost:3000/en/services`

## 27. Product Owner approval gate

This phase ends at the completed Service Detail template. About is the next page only after explicit product-owner approval.

PHASE 8C.2.1 STATUS

Public Service Detail:
PASS

Editorial Dossier:
PASS

Existing Data Preserved:
PASS

Existing Slugs Preserved:
PASS

Service Hero:
PASS

Service Imagery:
PASS

Overview:
PASS

How We Can Help:
PASS

Consultation CTA:
PASS

Other Services:
PASS

Back To Services:
PASS

Fixed Catalogue:
PASS

Admin-created Fallback:
PASS

Light:
PASS

Dark:
PASS

Arabic RTL:
PASS

English LTR:
PASS

Responsive:
PASS

Mobile:
PASS

Motion:
PASS

Reduced Motion:
PASS

Accessibility:
PASS

Canonical:
PASS

Hreflang:
PASS

Known Slugs:
PASS — 5/5

Focused Service Detail E2E:
PASS

Services Index Regression:
PASS

Homepage Regression:
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

SERVICE DETAIL READY FOR PRODUCT OWNER REVIEW:
YES

NEXT PAGE AFTER APPROVAL:
ABOUT

READY TO START ABOUT:
NO — WAIT FOR EXPLICIT PRODUCT OWNER APPROVAL
