# Phase 8B.1 — UX/UI Redesign Exploration

## 1. Why Phase 8A visual direction was rejected

Phase 8A made the product technically consistent, accessible, bilingual, and theme-safe. It intentionally preserved much of the original DOM and visual structure, however. The resulting experience stayed too card-led and conventional for a premium legal brand: it did not establish a memorable editorial point of view, and its Header and Footer were functionally sound but visually generic.

## 2. Current UX problems

- Public pages repeat a familiar hero → cards → CTA rhythm rather than creating a narrative.
- Visual hierarchy leans on surface treatment instead of composition, type, and whitespace.
- Service and credibility content often has equal visual weight, making priority unclear.
- Existing Admin operations are usable but feel like a page collection rather than an intentional workspace.
- Shared compatibility CSS makes existing screens visually safer but is not a long-term redesign strategy.

## 3. Responsive problems found

- Dense desktop navigation compresses into a conventional link stack rather than an intentional mobile experience.
- Repeated card grids need composition changes rather than only column-count breakpoints.
- Table density needs a clear mobile overflow contract and compact filter controls.
- Large decorative regions need reserved space and text wrapping rules at 360–430 px.

## 4. Navigation problems

The existing public header is compact and technically correct but does not communicate a point of view. It has limited hierarchy between brand, navigation, language, theme, and CTA. Admin navigation is likewise functional but not a cohesive workspace concept.

## 5. Footer problems

The existing Footer is structurally correct but follows a predictable information layout. It does not create a decisive final brand moment or connect the consultation CTA, contact hierarchy, and identity strongly enough.

## 6. Page hierarchy problems

Homepage, services, and about content use similar container/card treatment. Their section transitions lack distinctive rhythm; the Founder/counsel story is insufficiently central, and public CTA moments do not always feel like the natural conclusion of a page.

## 7. Design 01 philosophy — Editorial Luxury Law

An architectural, high-end legal practice. The system is driven by large editorial typography, asymmetry, rules, numbered sections, tall visual fields, and generous whitespace. It is intentionally low-density and authority-led rather than decorative.

## 8. Design 01 Public architecture

- Minimal centered navigation inside a ruled masthead.
- Asymmetric headline with vertical issue label and architectural visual field.
- Full-width statement before an indexed services list.
- Magazine/profile Founder section and rule-based three-step process.
- Large typographic closing footer rather than a standard column grid.

## 9. Design 01 Admin architecture

A restrained executive workspace: a permanent calm side rail, serif-like heading rhythm for orientation, solid list/table surfaces, and no public-facing luxury decoration.

## 10. Design 02 philosophy — Modern Legal Tech

A precise, digital-first legal platform. The identity comes from modular grids, signal/data modules, structured density, and crisp operational feedback—not generic blue SaaS aesthetics.

## 11. Design 02 Public architecture

- Structured split hero paired with a visible “matter signal” module.
- Metric strip and interactive service explorer.
- System/timeline explanation of the legal working model.
- Structured footer that reads as an operating platform.

## 12. Design 02 Admin architecture

This is the strongest operational concept: an information-grid workspace with a dark command sidebar, visible metrics, compact filters, a purposeful queue, status tags, and an adjacent today/activity panel.

## 13. Design 03 philosophy — Bold Human-Centered Legal

A direct, warmer legal identity that leads with the person behind the work. It uses strong statement typography, controlled organic forms, fewer boxes, and direct conversation-focused language.

## 14. Design 03 Public architecture

- Statement-led hero with a confident, easy-to-find consultation CTA.
- Trust strip in place of generic statistics cards.
- Story-based service entries, not a default grid of uniform cards.
- Founder portrait as a primary credibility component.
- Distinctive closing statement footer.

## 15. Design 03 Admin architecture

A professional but more expressive workspace: a compact icon rail, elevated operational surfaces, strong type scale, and the same calm status/filter/table affordances.

## 16. Arabic / RTL strategy

Arabic uses Cairo throughout. All preview routes are rendered under the existing locale provider with `lang="ar"`, `dir="rtl"`, and the Arabic font class. New preview layouts rely on grid and logical border/inline properties, so the hierarchy mirrors intentionally rather than merely translating English text.

## 17. English / LTR strategy

English uses Inter through the existing locale provider with `lang="en"` and `dir="ltr"`. Direction switching preserves the equivalent preview route and retains each direction’s composition.

## 18. Light / Dark strategy

Every preview uses its own scoped `--preview-*` token set. The existing light/dark/system provider remains the source of truth; dark sets complete, contrast-safe surface/text/border palettes rather than applying an inversion after the fact.

## 19. Responsive strategy

Layouts were conceived at desktop, tablet, and mobile scales:

- Desktop: composition and hierarchy drive layout.
- Tablet: asymmetric/dual compositions remain legible with fewer columns.
- Mobile: dedicated menu, single-column editorial/service flows, 2-up metrics where useful, collapsed admin rail, and overflow-safe data tables.

Focused smoke covered 360px; the CSS additionally has intentional behavior at 680px and 950px for phone/tablet, and desktop architecture scales through 1920px using clamps and proportional gutters.

## 20. Accessibility

Previews retain semantic landmarks, labelled navigation, accessible inputs/selects, visible focus indicators, text labels for statuses, touch-sized controls, and reduced-motion overrides. They are designed to remain implementable at the project’s WCAG 2.2 AA baseline.

## 21. Comparison table

| Area | Design 01 | Design 02 | Design 03 |
| --- | --- | --- | --- |
| Brand feeling | Editorial, premium, architectural | Precise, advanced, digital-first | Direct, warm, memorable |
| Creativity | Typography and asymmetric rhythm | Modular system composition | Statement, story, and organic form |
| Legal authority | Highest ceremonial authority | Highest operational authority | Highest relational authority |
| Human warmth | Restrained | Moderate | Highest |
| Admin UX | Executive calm | Strongest data workspace | Professional, expressive workspace |
| Mobile UX | Editorial flow / full-screen menu | Compact system controls | Clear conversation-first flow |
| Content density | Low | High but controlled | Medium |
| Best suited for | Premium private practice | Growth-oriented legal platform | Founder-led client relationship brand |

## 22. Files created

- `apps/web/src/components/design-preview/PreviewExperience.tsx`
- `apps/web/src/components/design-preview/PreviewExperience.module.css`
- `apps/web/src/app/[locale]/design-preview/page.tsx`
- `apps/web/src/app/[locale]/design-preview/[direction]/page.tsx`
- `apps/web/src/app/[locale]/design-preview/[direction]/admin/page.tsx`
- `apps/web/e2e/design-exploration.spec.ts`
- `PHASE_8B_1_DESIGN_EXPLORATION.md`

## 23. Files modified

- `apps/web/src/app/globals.css` — only isolated preview-route chrome containment (`body:has(.previewCanvas)`); production routes are unaffected.

## 24. Verification

| Check | Result |
| --- | --- |
| Focused design-preview browser smoke | PASS — 2/2 |
| Full Playwright regression | PASS — 20/20 |
| Lint | PASS |
| TypeScript | PASS |
| Production build | PASS |
| Production business logic changed | NO |
| Production database changed | NO |
| Production UI replaced | NO |

The development browser reports a known `cz-shortcut-listen` attribute mismatch injected by the installed Chrome extension. The focused spec recorded no application `pageerror`; it is not an application hydration/runtime defect.

## 25. Local preview URLs

Web is left running after final verification. The proxy redirects non-localized paths to Arabic, so the canonical comparison links are localized:

- Comparison: `http://localhost:3000/ar/design-preview`
- Design 01 Public / Admin: `http://localhost:3000/ar/design-preview/01` / `http://localhost:3000/ar/design-preview/01/admin`
- Design 02 Public / Admin: `http://localhost:3000/ar/design-preview/02` / `http://localhost:3000/ar/design-preview/02/admin`
- Design 03 Public / Admin: `http://localhost:3000/ar/design-preview/03` / `http://localhost:3000/ar/design-preview/03/admin`
- English follows the same paths with `/en/`.

## Decision

No direction was selected or migrated. Product-owner selection of Design 01, 02, 03, or a requested hybrid is required before Phase 8B.2.
