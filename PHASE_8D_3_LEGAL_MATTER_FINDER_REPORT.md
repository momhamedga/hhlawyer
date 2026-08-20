# Phase 8D.3 — Legal Matter Finder

## 1. Executive Summary

Implemented the bilingual, frontend-only **“ابدأ من مشكلتك / Find the right practice area”** guided navigator. It reaches only the five existing practice-area routes and never presents legal advice or a diagnosis.

## 2. Product Goal

Help a visitor explore the closest existing practice area through three short, general choices, then continue to that practice area or a normal consultation.

## 3. Existing Architecture Review

The existing locale route, `localizePath`, `localizeService`, service content, editorial homepage, metadata helper, Header/Footer, and theme provider were retained. No existing query-string convention was appropriate for Finder state.

## 4. UX Placement Decision

The selected pattern is a small homepage entry followed by a dedicated route. It preserves the homepage’s approved editorial rhythm while giving the interaction enough room to remain clear on mobile.

## 5. Homepage Entry

A compact teaser appears after the homepage Services Index and before the founder section. It uses an H2, has one valid locale-aware link, and does not add an H1.

## 6. Dedicated Route Decision

Added `/ar/find-your-service` and `/en/find-your-service` using the existing locale convention. The route has localized metadata and a clean Finder reset when the locale changes.

## 7. Content Model

`legal-matter-finder-content.ts` owns bilingual prompts, option labels, restrained result copy, privacy text, and CTA labels. It deliberately does not duplicate service display names.

## 8. Decision Model

`legal-matter-finder.ts` contains a small typed deterministic rule set, separate from JSX and localized copy. There is no AI, scoring, random weighting, API, or backend decision path.

## 9. Questions

Three steps are used: a high-level matter nature, what is useful to explore, and general context. Progress is displayed as `01 / 03` through `03 / 03`.

## 10. Options

All options are predefined native buttons. There is no free-text control and no request for identity, contact, case, company-name, document, or sensitive factual details.

## 11. Criminal Path

`criminal → understand → individual` resolves to `criminal` and links to `/[locale]/services/criminal`.

## 12. Commercial Path

`commercial → compliance → business` resolves to `commercial`, with `taxes` as its single possible related practice area.

## 13. Civil Path

`civil → documents → individual` resolves to `civil`.

## 14. Notary Path

`notary → transaction → document` resolves to `notary`.

## 15. Tax Path

`taxes → compliance → business` resolves to `taxes`.

## 16. Uncertain Path

Any explicitly uncertain signal resolves to a safe general-consultation result, without naming a practice area.

## 17. Result Presentation

The result is an editorial recommendation panel with a service index, the localized title from `localizeService`, a concise explanation, one optional related route, and service/consultation/restart actions.

## 18. Legal Safety

Every result carries one concise bilingual note that the guide helps explore a practice area and is not legal assessment or advice.

## 19. Privacy

The interaction collects only generic predefined choices. It contains no PII fields or legal factual intake.

## 20. Data Storage

Answers use component state only. No localStorage, sessionStorage, cookie, URL query parameter, Zustand state, database, or API persistence is introduced. Refresh resets the Finder.

## 21. Network Behavior

Answering does not issue API requests or non-GET mutations. Existing Next route prefetching is not Finder data transmission and carries no answers.

## 22. Consultation Integration

The consultation action links to the existing plain `/[locale]/consultation` route. No new query parameter or consultation business logic was added.

## 23. Service Integration

Service actions use only canonical existing `/[locale]/services/[slug]` routes. Display titles come from the established service localization source.

## 24. Light

Light mode uses ivory, warm white, taupe, charcoal, and gold; it introduces no large dark surface.

## 25. Dark

Dark mode uses warm charcoal, deep brown, ivory, and muted gold while preserving the same hierarchy and controls.

## 26. Arabic

Arabic copy is concise and natural, rendered in the existing RTL/Cairo public-site foundation.

## 27. English

English copy uses concise, native guidance wording and retains the existing LTR/Inter foundation.

## 28. RTL/LTR

The component uses locale-aware routing and works in both document directions. Switching locale safely resets transient answers while leaving the selected theme intact.

## 29. Mobile

At 360–430px, questions and stacked touch controls remain visible without horizontal overflow; no oversized decorative region was introduced.

## 30. Responsive

Focused E2E checked 360, 375, 390, 430, 768, 1024, 1280, 1440, and 1920px for Arabic/English and light/dark variants.

## 31. Motion

The Finder uses restrained opacity/translation treatment only. A synchronous selection lock prevents rapid repeated selection from skipping steps.

## 32. Reduced Motion

`prefers-reduced-motion` disables Finder animation while keeping all content and actions available.

## 33. Accessibility

The dedicated page has one H1, semantic question headings, native buttons, visible focus styles, logical reading order, concise result-only live announcement, keyboard activation, and RTL/LTR coverage.

## 34. Performance

No package, backend dependency, global store, analytics SDK, carousel, or Finder-only animation library was added. The rules and content are small local modules.

## 35. Best Practices

The feature has typed option/question identifiers, a separate rule module, no clickable divs, no unsafe URL state, and focused automated coverage for error-free interaction.

## 36. SEO

The dedicated route receives localized title/description, canonical URLs, hreflang links, and sitemap entries. No FAQ schema or unjustified structured data was added.

## 37. Indexability

The route is indexable: it contains useful, server-rendered explanatory content, a clear user-navigation purpose, localized metadata, and valid internal destinations. It is not padded with SEO copy.

## 38. E2E

`legal-matter-finder.spec.ts` passed **7/7** in a production local Next run. It covers all five destinations, uncertain handling, navigation, back/restart, keyboard, rapid choices, theme and locale behavior, privacy/storage/network conditions, viewport matrix, reduced motion, metadata, sitemap, and page/console errors.

## 39. Regressions

Relevant public regressions passed: Homepage **8/8**, Services **5/5**, Service Detail **4/4**, FAQ **4/4**, Consultation **7/7**, Mobile Navigation **3/3**, Founder Portrait **4/4**, and locale routing **1/1**.

## 40. Quality Gates

`pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm audit`, and `git diff --check` passed. No Full API suite was needed because no backend contract changed.

## 41. Files Created

- `apps/web/src/i18n/legal-matter-finder-content.ts`
- `apps/web/src/lib/legal-matter-finder.ts`
- `apps/web/src/components/legal-matter-finder/LegalMatterFinder.tsx`
- `apps/web/src/components/legal-matter-finder/LegalMatterFinder.module.css`
- `apps/web/src/components/legal-matter-finder/MatterFinderTeaser.tsx`
- `apps/web/src/components/legal-matter-finder/MatterFinderTeaser.module.css`
- `apps/web/src/app/[locale]/find-your-service/page.tsx`
- `apps/web/e2e/legal-matter-finder.spec.ts`

## 42. Files Modified

- `apps/web/src/components/production/EditorialHome.tsx`
- `apps/web/src/app/sitemap.ts`

## 43. Backend/DB Safety

No backend, API, database, Prisma schema, migration, authentication, admin, or consultation business-logic code changed.

## 44. Remaining Risks

The Finder intentionally remains navigation guidance, not a legal assessment. Product-owner review should focus on legal-content tone and visual preference; no technical release blocker remains.

## 45. Final Decision

Phase 8D.3 is complete and ready for Product Owner visual and functional review on localhost. Legal Guides have not been started.
