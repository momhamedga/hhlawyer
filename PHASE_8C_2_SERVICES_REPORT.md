# PHASE 8C.2 — Services Page Redesign Report

## Executive summary

The public Services experience has been redesigned only at `/ar/services` and `/en/services` as a bilingual Premium Editorial Practice Explorer. The existing service source, five stable slugs, locale routing, service-detail routes, and all backend behavior remain unchanged.

The outcome is intentionally a single editorial decision surface: a contextual hero, a two-panel desktop explorer, a true mobile accordion, and one restrained guidance CTA. It is ready for product-owner review; no subsequent page has been started.

## Scope and preservation

- Redesigned: `/ar/services`, `/en/services`.
- Preserved: `LAW_SERVICES`, `localizeService`, service slugs (`criminal`, `commercial`, `civil`, `notary`, `taxes`), `/[locale]/services/[slug]`, consultation route, API, Prisma schema, database, and administration.
- Not changed: service detail pages, About, Contact, Consultation flow, Header, Footer, mobile navigation, or backend code.

## Experience delivered

### Services Hero

- Editorial hierarchy with the localized practice-area label, focused headline, concise introduction, Abu Dhabi/UAE context, and an architectural line motif.
- Arabic remains RTL and English remains LTR using logical CSS positioning and spacing.

### Practice Explorer

- Desktop uses a two-panel layout: five numbered selectable practice areas at one side and a focused detail panel at the other.
- Every selection retains its existing localized name, description, icon, and route to the original detail slug.
- The contextual office image is local, optimized through `next/image`, and paired with a service-specific icon rather than used as a decorative gallery.
- Keyboard focus and click selection are supported; the selected control exposes `aria-pressed`.

### Mobile interaction

- At 700px and below the desktop presentation becomes a touch-friendly accordion.
- The controls use native buttons with `aria-expanded`; every service detail link remains reachable.
- Only the selected mobile item is actively opened; outgoing content is allowed to complete its short exit motion without affecting navigation.

### Light, dark, motion, and accessibility

- Light uses a warm ivory editorial surface; Dark uses the established deep charcoal/brown palette with distinct gold rules and text contrast.
- Focus-visible outlines, semantic headings, real links, accessible button states, and reduced-motion support are included.
- No visual treatment depends on physical left/right assumptions; RTL arrow direction is adjusted without changing navigation semantics.

## SEO and routing

- Existing locale metadata continues to produce canonical, alternate-language, and Open Graph URLs under `https://hhlawyer.ae`.
- Focused verification confirmed `/ar/services`, `/en/services`, `hreflang`, canonical, and `og:url` metadata use the official production domain.

## Files modified

- `apps/web/src/app/services/page.tsx` — swaps only the old services presentation for the new scoped component.
- `apps/web/src/components/services/ServicesEditorial.tsx` — bilingual interactive Services page.
- `apps/web/src/components/services/ServicesEditorial.module.css` — responsive Modern Trust editorial styling.
- `apps/web/e2e/services-editorial.spec.ts` — focused browser proof for Services behavior and metadata.

## Verification

| Check | Result |
| --- | --- |
| Focused Services Playwright | PASS — 4/4 |
| Desktop practice selection and detail navigation | PASS |
| Mobile accordion and detail navigation | PASS |
| Keyboard focus selection | PASS |
| Arabic RTL and English LTR | PASS |
| Light and Dark themes | PASS |
| Reduced motion | PASS |
| Canonical / hreflang / Open Graph | PASS |
| Homepage regression smoke | PASS — 1/1 |
| Responsive browser matrix | PASS — 36/36 (2 locales × 2 themes × 9 widths) |
| Horizontal overflow / browser page errors | PASS |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm build` | PASS |
| `pnpm audit` | PASS — no known vulnerabilities |
| `git diff --check` | PASS |

## Visual browser review

Browser review covered Arabic and English in Light and Dark at desktop, plus Arabic and English mobile Explorer states. The hero, contextual office imagery, desktop selector, mobile accordion, guidance transition, RTL alignment, and LTR alignment were visually checked. No clipped interactive content, logo-canvas regression, overflow, hydration issue, or browser page error was observed.

## Approval boundary

This phase ends here. The Services detail page is the next candidate only after explicit product-owner approval of this Services direction.

## Final status

PHASE 8C.2 STATUS

Services Hero: PASS

Practice Explorer: PASS

Desktop Interaction: PASS

Mobile Accordion: PASS

Service Navigation: PASS

Service Imagery: PASS

Light Mode: PASS

Dark Mode: PASS

RTL/LTR: PASS

Accessibility: PASS

Motion: PASS

No Overflow: PASS

No Console Errors: PASS

SEO: PASS

Homepage Regression: PASS

Focused Services E2E: PASS

Lint: PASS

TypeScript: PASS

Build: PASS

Audit: PASS

Git Diff: PASS

SERVICE PAGE READY FOR PRODUCT OWNER APPROVAL: YES

NEXT PAGE: SERVICE DETAIL

READY TO CONTINUE: NO — WAIT FOR EXPLICIT PRODUCT OWNER APPROVAL
