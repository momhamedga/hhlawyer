# Phase 8D.2 — Smart FAQ Per Service

## 1. Executive Summary

Implemented a bilingual, typed, service-specific FAQ system across all five public service-detail pages. Each service has seven distinct, legal-safe questions and answers in Arabic and English, rendered in a lightweight editorial disclosure section between preparation and related services.

No backend, API, database, Prisma, business-rule, admin, or route change was made. All focused and relevant regression tests, lint, TypeScript, build, and `git diff --check` passed.

## 2. Existing Service Content Audit

`service-content.ts` already supplied the service title, positioning description, and two core features for each of Criminal, Commercial, Civil/Personal Status, Private Notary, and Tax/Compliance. `ServiceDetailDossier` then supplied the shared overview, help, preparation, related-service navigation, and closing consultation CTA.

The new FAQ content complements those sections with user-intent questions about scope, preparation, process, consultation, and adjacent services; it does not restate the existing overview or feature rows.

## 3. FAQ Architecture

`service-faq-content.ts` is the single typed content source. `ServiceFaq` reads it from the locale and service slug, while `ServiceDetailDossier` integrates the section between preparation and related services. No bilingual copy is embedded in JSX.

## 4. Typed Content Model

The model includes stable service slugs, stable FAQ IDs, `question`, `answer`, and an internal `intent` union: `understanding`, `preparation`, `process`, `scope`, `consultation`, and `related-service`. TypeScript enforces all five services and both locale records; the focused test verifies seven items, parity, IDs, and non-empty copy.

## 5. Arabic Content Strategy

Arabic content uses concise modern fusha. It is written for clarity and sensitivity, especially for personal-status/civil questions, without literal translation or heavy procedural language.

## 6. English Content Strategy

English content is native legal-service copy focused on context, documents, and an initial conversation. It avoids marketing claims, certainty, and individual legal conclusions.

## 7. Criminal FAQ

Seven questions cover when an initial conversation can help, useful preparation, appropriate scope, information handling, discussing a matter before a step, the first consultation, and possible overlap with another practice area.

## 8. Commercial FAQ

Seven questions cover commercial relationships, contracts, decision context, useful documents, commercial/civil distinction, initial consultation value, and a possible tax/compliance connection.

## 9. Personal Status / Civil FAQ

Seven questions cover the nature of the matter, preparation, sensitive information, the first conversation, understanding options, personal-status/civil distinction, and a possible commercial connection.

## 10. Private Notary FAQ

Seven questions cover the nature of notarisation, document context, preparation, parties and authority, enquiries before an appointment, legal-advice distinction, and commercial-document context.

## 11. Tax & Compliance FAQ

Seven questions cover suitable scope, document organisation, records and agreements, compliance context, initial business review, commercial connections, and beginning a first conversation. The content deliberately does not provide personal tax advice.

## 12. Search Intent Mapping

Every item has an internal intent classification. This makes the seven questions for each service deliberate rather than repetitive and supports future content expansion without needing UI-level intent labels.

## 13. Legal Safety Review

All answers were reviewed to avoid guarantees, timelines, filing instructions, pricing, governmental claims, predictions, probabilities, and personal legal or tax advice. The focused content test additionally rejects common guarantee/fee/probability wording.

## 14. Duplication Audit

Each service has seven service-prefixed stable IDs. Arabic and English intentionally share IDs and intent order for parity; wording and context remain specific to the service. No service receives another service’s FAQ set.

## 15. UI Design

The FAQ uses the existing editorial service-detail language: a numbered section lead, warm ivory/taupe light surface, charcoal text, fine gold rules, spacious numbered rows, and restrained plus/minus treatment. It does not introduce heavyweight SaaS cards.

## 16. Accordion Interaction

Questions are collapsed by default. Native disclosure rows allow users to open one or more questions as needed. Opening a row reveals its answer and changes the icon from plus to minus.

## 17. Radix / Primitive Decision

`@radix-ui/react-accordion` is not installed and no suitable shared accordion primitive exists. A native HTML `details` / `summary` disclosure was selected instead of adding a dependency. This provides built-in button semantics, expanded state, Enter/Space keyboard behavior, and a no-JavaScript fallback.

## 18. Light Mode

The FAQ light surface is a warm ivory/taupe gradient with dark readable text and fine borders. It does not introduce a dark full-width section in light mode.

## 19. Dark Mode

Dark mode uses the service-detail warm charcoal and dark-brown tonal palette, muted gold, ivory text, and the same editorial hierarchy.

## 20. RTL

The component inherits logical layout rules and the document direction. Arabic focused coverage verifies the correct FAQ set, RTL document direction, long-question layout, and no horizontal overflow.

## 21. LTR

English focused coverage verifies the correct English-only criminal FAQ, LTR direction, keyboard disclosure behavior, wrapping, and no horizontal overflow.

## 22. Motion

Opening content uses a restrained 260 ms opacity/position reveal and icon state change. It is CSS-only and does not add a motion-library dependency.

## 23. Reduced Motion

`prefers-reduced-motion: reduce` disables the FAQ animation and icon transitions while preserving native disclosure behavior. Focused browser coverage verified this explicitly.

## 24. Accessibility

The implementation uses native semantic disclosure elements rather than clickable `div`s. The focused test verifies Tab focus, Enter and Space expansion, visible focus styling, readable answers, keyboard operation, and no console/page errors.

## 25. Performance

FAQ content is static and typed. There is no fetch, API call, database request, global state, client timer, dynamic import, or new dependency. The existing service-detail component remains the only pre-existing interactive boundary.

## 26. Best Practices

IDs are stable content IDs, never random or date-based. The implementation has no nested buttons, no duplicate page H1, no console errors, and no hydration warning in focused browser coverage.

## 27. SEO

Visible FAQ content augments the service page’s natural search intent without keyword stuffing, city repetition, hidden copy, or canonical/metadata changes. Focused tests verify canonical, hreflang, and exactly one H1 for every Arabic and English service detail route.

## 28. FAQ Structured Data Decision

FAQPage JSON-LD was intentionally **not added**. Google states that FAQ rich results are now limited to well-known, authoritative government and health websites, which does not describe this law-firm site. Adding markup therefore brings no clear user or search benefit here. The visible, indexable FAQ remains valuable without it. [Google Search Central policy](https://developers.google.com/search/blog/2023/08/howto-faq-changes) and [structured-data quality guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) support this conservative decision.

## 29. Internal Linking

No links were inserted into individual answers. Existing related-service navigation and the single closing consultation CTA already provide natural next actions without creating repetitive CTA links inside the FAQ.

## 30. Responsive QA

Focused coverage exercised 360, 375, 390, 430, 768, 1024, 1280, 1440, and 1920 pixels across Arabic/English and light/dark combinations. The FAQ remains visible with no horizontal overflow.

## 31. E2E

`service-faq.spec.ts` passed 4/4:

1. typed content coverage, parity, unique IDs, expected count, and safe-copy checks;
2. Arabic and English criminal content, keyboard operation, expansion, and console safety;
3. all ten bilingual service detail pages with service mapping, canonical, hreflang, and one H1;
4. theme, direction, viewport, overflow, and reduced-motion behavior.

## 32. Regression

Relevant public regressions passed:

| Suite | Result |
| --- | --- |
| Service detail editorial | PASS — 4/4 |
| Services editorial | PASS — 5/5 |
| Consultation editorial | PASS — 7/7 |
| Homepage public regression | PASS — 8/8 |

## 33. Quality Gates

| Command | Result |
| --- | --- |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm build` | PASS |
| `git diff --check` | PASS |

No Lighthouse/LHCI tooling exists in the repository, and none was added for this phase.

## 34. Files Created

- `apps/web/src/i18n/service-faq-content.ts`
- `apps/web/src/components/services/ServiceFaq.tsx`
- `apps/web/src/components/services/ServiceFaq.module.css`
- `apps/web/e2e/service-faq.spec.ts`
- `PHASE_8D_2_SMART_SERVICE_FAQ_REPORT.md`

## 35. Files Modified

- `apps/web/src/components/services/ServiceDetailDossier.tsx`

## 36. Backend / DB Safety

No backend, API, database, Prisma schema, migration, authentication, RBAC, consultation logic, contact logic, or admin code changed.

## 37. Remaining Risks

The FAQ is deliberately general and not a substitute for individual advice. It should be revisited when the firm changes its supported scope or wants editorial/legal review. FAQPage structured data remains intentionally absent under the current search-result policy.

## 38. Final Decision

Phase 8D.2 is complete. The FAQ system is production-safe within the stated frontend/content scope. Do not start Phase 8D.3 automatically; await Product Owner approval.

## Final Status

| Check | Result |
| --- | --- |
| FAQ Architecture / Typed FAQ Content / AR/EN Parity | PASS |
| Criminal / Commercial / Personal Status-Civil / Private Notary / Tax-Compliance FAQ | PASS |
| Search Intent / Legal Safety / Duplicate Content Audit | PASS |
| Editorial FAQ UI / Accordion / Keyboard / Reduced Motion | PASS |
| Light / Dark / Arabic RTL / English LTR / Responsive / Mobile | PASS |
| Performance / Accessibility / Best Practices / SEO | PASS |
| FAQ Structured Data | NOT ADDED |
| Structured Data Valid | NOT APPLICABLE |
| Canonical / Hreflang / One H1 | PASS |
| Focused FAQ E2E | PASS — 4/4 |
| Service Detail / Services / Consultation / Homepage Regression | PASS |
| Lint / TypeScript / Build / git diff --check | PASS |
| Backend / API / Database / Prisma / Business Logic / Admin changed | NO |
| Legal Matter Finder / Legal Guides started | NO |
| Phase 8D.2 complete | YES |
| Ready for Phase 8D.3 | YES — pending Product Owner approval |
