# Phase 8C.1 — Homepage Brand Reset and Final Correction

## Scope and boundaries

Phase 8C.1 and 8C.1.2 changed the Homepage shell only: Header, theme/language controls, mobile menu, Hero, Homepage service interactions, Founder section, and Footer. No Services, service-detail, About, Consultation, Contact, or Admin route was redesigned. No backend, API, database, migration, authentication, RBAC, or business logic changed.

## Phase 8C.1.2 — Official four-logo architecture

`BrandLogo` is the sole active brand-logo component. It maps the current locale and the actual `next-themes` resolved theme to the authoritative files:

| Locale | Resolved theme | Asset |
| --- | --- | --- |
| Arabic | Light | `images/logo ar light.webp` |
| Arabic | Dark | `images/logo ar dark.webp` |
| English | Light | `images/logo en light.webp` |
| English | Dark | `images/logo en dark.webp` |

System mode follows `resolvedTheme`, not the stored `system` preference. The component has a hydration-safe placeholder until the client can resolve the theme, preventing an incorrect light/dark logo flash. Header, mobile panel, Footer, and Admin shell share this component; no active `/logo.webp` rendering or crop logic remains.

## Header, locale, and theme corrections

- Header uses the complete official lockup at a responsive 150–220px desktop / 115–165px mobile visual range, with no additional manually composed name lockup.
- Consultation remains the primary utility action; language (`EN` / `عربي`) and the single icon theme trigger are visually secondary.
- Theme menu ownership is in `messages.ts`: Arabic labels are فاتح / داكن / النظام and English labels are Light / Dark / System.
- Desktop navigation has active state, direction-aware gold underline reveal, focus visibility, and restrained link/CTA feedback.
- Arabic and English mobile panels are explicitly `rtl` / `ltr`, full-width at phone sizes, compact in type scale, and structured as official logo, numbered navigation, CTA, utilities, and contact details.
- The Radix panel remains keyboard-accessible: trigger, focus trap, route-close, Escape, overlay, Close, focus restoration, and scroll-lock behavior are retained.

## Hero and Founder art direction

The asymmetric dark Hero remains intact. The repeated old logo was removed in favor of a restrained gold rule. Copy, CTA, portrait, and frame now enter in a coordinated 0.58s-or-less sequence with a reduced-motion-safe path; desktop and Arabic type scales are tuned separately. Mobile intentionally stacks copy and portrait.

`Hussein-Alharathi-2.webp` is the Founder image. It now sits in a warm-charcoal editorial field with a thin offset gold frame, localized `01 / Founder` label, intentional crop, and reveal treatment. The section is more compact and balances the portrait against readable supporting copy.

## Footer final composition

The Footer is now a three-zone “Signature Legal Brand Footer”:

1. Editorial consultation closing with supporting line and CTA.
2. Official complete lockup paired with a single coherent contact field.
3. Compact main-navigation and copyright strip.

Light mode uses layered ivory/taupe surfaces, charcoal text, and gold rules. Dark mode uses a deliberate deep warm-charcoal tonal rhythm (`#15110e` / `#211a15`) rather than inversion. The Footer logo follows the same official four-logo mapping as Header and mobile.

## Responsive, accessibility, and visual review

The Homepage was checked at 360, 375, 390, 430, 768, 1024, 1280, 1440, and 1920px in representative Arabic and English states. Focus styles, logical direction-aware layout, real image alt text, full-width mobile navigation, no horizontal document overflow, and no runtime hydration errors were verified.

Local, non-committed review screenshots were retained in `apps/web/test-results/phase-8c-1-2/`:

- AR Light desktop / AR Dark desktop
- EN Light desktop / EN Dark desktop
- AR mobile menu / EN mobile menu
- Founder
- Footer Light / Footer Dark

## Focused proof and quality results

| Check | Result |
| --- | --- |
| Official logo matrix, Header and Footer | PASS |
| System-light / System-dark resolved-logo proof | PASS |
| Theme menu localization | PASS |
| English and Arabic mobile-menu proof | PASS |
| Focused Homepage Playwright suite | PASS — 6/6 |
| Theme and visual foundation Playwright suite | PASS — 3/3 |
| Lint | PASS |
| TypeScript | PASS |
| Production build | PASS |
| `git diff --check` | PASS |
| Localhost `/ar` and `/en` | PASS — HTTP 200 |

## Final status

PHASE 8C.1.2 STATUS

Official Four-Logo System: PASS

AR Light Logo: PASS

AR Dark Logo: PASS

EN Light Logo: PASS

EN Dark Logo: PASS

Header: PASS

Desktop Nav: PASS

Desktop Hover: PASS

Theme Menu Arabic: PASS

Theme Menu English: PASS

Language Switch: PASS

Arabic Mobile Menu: PASS

English Mobile Menu: PASS

Mobile Menu Behavior: PASS

Hero: PASS

Hero Motion: PASS

Hero Responsive: PASS

Founder Hussein-2: PASS

Founder Frame: PASS

Founder Composition: PASS

Footer: PASS

Footer Light: PASS

Footer Dark: PASS

Footer Official Logo: PASS

Footer Responsive: PASS

Color Consistency: PASS

Microinteractions: PASS

Accessibility: PASS

Responsive: PASS

Focused Homepage E2E: PASS

Lint: PASS

TypeScript: PASS

Build: PASS

Localhost: PASS

HOMEPAGE READY FOR PRODUCT OWNER REVIEW: YES

NEXT PAGE: SERVICES

READY TO START SERVICES: NO — WAIT FOR EXPLICIT HOMEPAGE APPROVAL

---
## Phase 8C.1.3 — Homepage Visual Bugfix

### Scope

Visual polish was limited to the approved Homepage: Header and Footer official-logo presentation, Founder portrait composition, and the mobile navigation panel. No backend, database, content, route, service-page, or Homepage-concept changes were made.

### Header logo

- Kept `BrandLogo` as the sole logo renderer and retained the official asset mapping.
- Reduced the desktop logo presentation to a responsive 160–190px visual range and set the compact header baseline to 80px.
- Removed excess wrapper presence so the official asset is displayed naturally on the header surface without an additional card or padding frame.

### Footer logo and balance

- Reduced the desktop Footer lockup by approximately 20% and tightened its rule, contact relationship, vertical spacing, and bottom strip distance.
- Preserved the existing three-zone Footer architecture. Any light or dark canvas visible is intrinsic to the official asset, not an added container.

### Founder portrait

- Kept `Hussein-Alharathi-2.webp` and the approved gold-frame concept.
- Raised the crop with breakpoint-aware object positioning, reduced visual dead space, and modestly tightened section/frame spacing. The head remains visible on desktop and mobile.

### Mobile navigation

- Made the dialog panel viewport-safe (`100dvw`/`100dvh`) with contained vertical scrolling and no horizontal overflow.
- Applied logical, RTL-safe sizing and spacing to the CTA, navigation rows, utilities, and mixed-direction phone/email contacts.
- Verified Arabic at 360, 375, 390, and 430px and English mobile behavior.

### Official four-logo and responsive verification

- Focused Homepage E2E passed 6/6, including exact AR/EN light/dark Header and Footer mappings, the mobile logo, `resolvedTheme` behavior, Founder image identity, mobile-menu safety, and theme controls.
- Manual screenshots were reviewed locally for AR/EN light and dark desktop, AR/EN mobile, Founder, and both Footer themes.
- Automated overflow smoke check passed at 360, 375, 390, 430, 768, 1024, 1280, 1440, and 1920px for both `/ar` and `/en`.

### Quality and localhost

- `pnpm lint`: PASS
- `pnpm typecheck`: PASS
- `pnpm build`: PASS
- `git diff --check`: PASS
- Arabic localhost: `http://localhost:3000/ar` — 200
- English localhost: `http://localhost:3000/en` — 200

PHASE 8C.1.3 STATUS

Header Logo: PASS

Header Logo Alignment: PASS

Footer Logo: PASS

Footer Balance: PASS

Founder Crop: PASS

Founder Frame: PASS

Founder Spacing: PASS

Arabic Mobile Menu: PASS

English Mobile Menu: PASS

Mobile CTA: PASS

Mobile Overflow: PASS

Four Logo Mapping: PASS

Responsive: PASS

Focused Homepage E2E: PASS

Lint: PASS

TypeScript: PASS

Build: PASS

Localhost: PASS

HOMEPAGE READY FOR FINAL PRODUCT OWNER APPROVAL: YES

NEXT PAGE AFTER APPROVAL: SERVICES

READY TO START SERVICES: NO — WAIT FOR EXPLICIT APPROVAL
