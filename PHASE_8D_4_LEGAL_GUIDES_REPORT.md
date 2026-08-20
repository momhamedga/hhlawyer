# Phase 8D.4 — Premium Legal Guides / Knowledge Hub

## 1. Executive Summary

Implemented a bilingual, static Legal Guides knowledge hub with five legally conservative guides, one for each current practice area. The feature is frontend/content-only and uses the approved editorial public-site design language.

## 2. Scope

This phase adds public Guides routes, typed content, presentation, frontend-only category filters, navigation links, sitemap entries, and browser coverage. No CMS, search, pagination, backend, API, form, or database work was introduced.

## 3. Existing Architecture Review

The implementation follows the existing App Router locale routes, `localizedMetadata`, `localizeService`, `LAW_SERVICES`, Header, Footer, theme provider, Cairo/Inter typography, and existing E2E conventions. No pre-existing backend Guides architecture was found.

## 4. Guides Product Concept

The experience is an editorial legal knowledge library, not a generic blog. It helps a visitor organise a general question, discover a relevant practice area, and choose an existing next step.

## 5. Routes

Added `/ar/guides`, `/en/guides`, and `/[locale]/guides/[slug]`. Unknown slugs call `notFound()` and return HTTP 404.

## 6. Content Architecture

`legal-guides-content.ts` is the typed bilingual source for guide titles, summaries, article sections, key points, practice-area identity, and related-guide identity. Service display titles always come from the existing centralized service localization.

## 7. Guide Index

The index uses a compact editorial knowledge hero, a selected guide, practice-area navigation, and numbered reading rows. It intentionally avoids a generic card grid, search, pagination, and a client fetch.

## 8. Featured Guide

The first Criminal guide is labelled only as “Selected guide / دليل مختار”; no popularity or performance claim is made.

## 9. Categories

The frontend-only filters are All plus the five existing practice areas. Labels use `localizeService`, not duplicated service translations.

## 10. Criminal Guide

`criminal-matter-overview` gives general orientation around context, available information, and timely professional discussion. It does not state procedure, penalties, or outcomes.

## 11. Commercial Guide

`commercial-relationship-basics` discusses clarity of purpose, documentation, and professional review before commitment without providing a contract or conclusion.

## 12. Civil Guide

`civil-dispute-preparation` covers a general timeline, available correspondence, and questions for an initial conversation. It asks for no website input.

## 13. Notary Guide

`notary-document-preparation` addresses document purpose, available copies, and scope discussion. It does not claim official affiliation, specify government requirements, or confirm a procedure.

## 14. Tax Guide

`tax-compliance-documents` addresses general record organisation and professional review. It contains no tax rates, deadlines, filing instructions, or personal tax advice.

## 15. Legal Content Safety

Content is evergreen, educational, and restrained. It contains no UAE legal articles, law/decree numbers, penalties, deadlines, fees, tax rates, procedural claims, legal diagnosis, outcomes, or guarantees.

## 16. Guide Detail

Each detail page is an editorial reading experience with a genuine back link, practice area, one H1, short introduction, calculated reading time, readable article sections, a practice connection, two related guides, Finder link, consultation CTA, and one disclaimer.

## 17. Typography

Article content is constrained to a 46rem reading measure, with spacious paragraphs, numbered sections, accessible heading hierarchy, and existing Cairo/Inter locale typography.

## 18. Practice Area Connection

Every guide maps to exactly one existing service and links only to `/[locale]/services/[slug]` using its centralized localized title.

## 19. Related Guides

Each guide exposes exactly two static related-guide rows. There is no carousel or infinite content mechanism.

## 20. Consultation CTA

The end CTA uses the established “Arrange a consultation / رتّب استشارة” wording and links to the existing plain `/[locale]/consultation` route without query parameters.

## 21. Disclaimer

Every detail page includes one concise localized informational-purpose disclaimer. It is neither a popup nor repeated throughout the article.

## 22. Arabic

Arabic pages are fully Arabic in content and UI, use the existing RTL/Cairo foundation, and retain Arabic service naming from centralized content.

## 23. English

English pages are fully English in content and UI, use the existing LTR/Inter foundation, and retain English service naming from centralized content.

## 24. Localization Audit

Focused E2E verifies Arabic UI does not contain English Guide UI terminology and English guide detail content contains no Arabic. All ten known detail routes render their matching locale title.

## 25. Light

Light surfaces are warm ivory, white, pale taupe, sand, charcoal text, and muted gold. No large dark or near-black Guides surface is introduced in light mode.

## 26. Dark

Dark mode uses warm charcoal/deep brown with ivory and muted gold. The theme uses existing global architecture and introduces no blue/cyan treatment.

## 27. Responsive

Focused E2E covers 360, 375, 390, 430, 768, 1024, 1280, 1440, and 1920px on Arabic/English index plus representative detail views in light and dark themes.

## 28. Mobile

The mobile index is a clean vertical reading list. Detail pages keep restrained type, no sticky obstruction, no horizontal overflow, and near-full-width consultation action.

## 29. Accessibility

Guides use semantic `main`, `article`, `nav`, sections, one H1, logical H2 structure, native filter buttons with `aria-pressed`, genuine links, visible focus treatment, and keyboard-operable filters.

## 30. Motion

Interaction is limited to restrained hover/color/spacing transitions; no scroll-jacking, parallax article body, floating decoration, or staged article content was added.

## 31. Reduced Motion

The existing global reduced-motion policy and Guides module rules make all content and actions immediately available without transition-dependent usability.

## 32. Performance

Guides are static content rendered by the route. The only client boundary is the small index filter; there is no content API call, image requirement, rich-text runtime, analytics dependency, carousel, global store, or new package.

## 33. SEO

Index and detail routes use the existing localized metadata helper for unique title, description, canonical, hreflang, and Open Graph URL. No keyword stuffing was added.

## 34. Canonical

Focused browser coverage verified canonical URLs for all ten details, and index metadata uses `/ar/guides` and `/en/guides` on the official origin.

## 35. Hreflang

Focused browser coverage verified Arabic and English alternates for all ten details. The index uses the same existing metadata helper.

## 36. Sitemap

The current sitemap now includes both Guide indexes and all five guide detail URLs for each locale: 12 Guides URLs in total.

## 37. Structured Data Decision

No Article or Breadcrumb structured data was added. The project has no approved author, publication, review, or modification facts needed to make that data truthful.

## 38. Homepage Integration Decision

No new homepage Guides section was added. The homepage already includes the approved Services and Matter Finder sequencing; another entry would weaken that intentional rhythm.

## 39. Header/Footer Decision

Guides is present in desktop Header, mobile navigation, and Footer. The Header collapses to the tested mobile menu below its established breakpoint, and the updated mobile regression covers all six destinations.

## 40. FAQ Connection

No FAQ deep link was added because the existing service FAQ has no stable public anchor. Adding an invented anchor would create an unreliable contract.

## 41. Finder Connection

Every detail page includes one calm contextual link to the existing Legal Matter Finder, with no URL state or data transfer.

## 42. 404

Unknown guide slugs are guarded with `notFound()`. Focused E2E verified `/en/guides/unknown-guide` returns HTTP 404.

## 43. E2E

`legal-guides.spec.ts` passed **5/5** in a production local Next run. It covers typed safety, AR/EN index, filters, keyboard, all 10 details, practice/consultation/related links, language-leak audit, responsive and theme matrix, reduced motion, 404, metadata, and sitemap.

## 44. Regression

Production local browser regressions passed: Homepage **8/8**; Services, Service Detail, FAQ, and Matter Finder **20/20**; Mobile Navigation **3/3**; Founder Portrait, locale routing, Consultation, and Contact **16/16**.

## 45. Quality Gates

Lint, TypeScript, production build, and `git diff --check` passed. `pnpm audit` is currently blocked by a high-severity `deepmerge-ts <8.0.0` transitive advisory through Prisma. Prisma/package changes are explicitly outside this phase’s permitted scope.

## 46. Files Created

- `apps/web/src/i18n/legal-guides-content.ts`
- `apps/web/src/components/legal-guides/LegalGuidesIndex.tsx`
- `apps/web/src/components/legal-guides/LegalGuideDetail.tsx`
- `apps/web/src/components/legal-guides/LegalGuides.module.css`
- `apps/web/src/app/[locale]/guides/page.tsx`
- `apps/web/src/app/[locale]/guides/[slug]/page.tsx`
- `apps/web/e2e/legal-guides.spec.ts`

## 47. Files Modified

- `apps/web/src/constants/navigation.ts`
- `apps/web/src/i18n/messages.ts`
- `apps/web/src/components/layout/Footer.tsx`
- `apps/web/src/app/sitemap.ts`
- `apps/web/src/app/globals.css`
- `apps/web/e2e/homepage-mobile-navigation-recovery.spec.ts`

## 48. Backend/DB Safety

No backend, Express, API, Prisma schema, migration, database, authentication, RBAC, admin, consultation submission, contact submission, service ID, or service slug changed.

## 49. Remaining Risks

The sole release-gate risk is the current high-severity Prisma transitive dependency advisory reported by `pnpm audit`. Remediation requires separate explicit authorization because it changes dependencies outside this frontend/content-only scope.

## 50. Final Decision

The Legal Guides implementation is functionally complete and ready for visual Product Owner review on localhost. Security release readiness remains blocked until the separately scoped dependency advisory is resolved. No admin redesign, CMS, search, analytics, or later phase was started.
