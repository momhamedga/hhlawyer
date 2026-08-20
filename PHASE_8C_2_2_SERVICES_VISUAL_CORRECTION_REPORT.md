# PHASE 8C.2.2 — Services + Service Detail Visual Correction Report

## 1. Scope

Corrected only the public Services Explorer and public Service Detail routes:

- `/ar/services`, `/en/services`
- `/ar/services/[slug]`, `/en/services/[slug]`

No Admin route, Header, Footer, Homepage, API, Prisma schema, database, authentication, booking behavior, service slug, or business logic was changed.

## 2. Problems corrected

1. Light Mode used dark full-width sections in the Services guidance and detail preparation/closing areas.
2. All services relied on a single office image.
3. Desktop service names were selection controls rather than direct destinations.
4. Detail headings included the English `Service / 01` label in Arabic.
5. The detail feature rows exposed Arabic source content in the English experience.

## 3. Arabic localization correction

Arabic detail now uses `الخدمة / 01` rather than `Service / 01`. The Arabic Services and Service Detail UI was checked against English interface labels. All controls, labels, CTAs, headings, navigation, and captions are Arabic on `/ar`.

## 4. Light-mode art direction

Light mode now stays daylight editorial from first section through closing CTA:

| Area | Light treatment |
| --- | --- |
| Services guidance | Warm ivory / pale taupe band with a small charcoal CTA only |
| Detail hero | Bright local service photography with a soft ivory overlay |
| Overview | Warm white / ivory |
| Capabilities | Light sand / pale taupe |
| Preparation | Warm ivory to light taupe |
| Other Services | Warm white / cream |
| Consultation close | Soft taupe / ivory with a small charcoal CTA |

No main Services or Detail section uses black, charcoal, near-black, dark brown, `#15110e`, or `#211a15` as its Light Mode background.

## 5. Dark-mode preservation

Dark mode retains the established warm-charcoal evening legal-office composition, ivory typography, brand gold, and strong but restrained image overlays. It remains visually distinct from the new Light treatment.

## 6. Unique service imagery

Five production-owned local images were created using the built-in image-generation workflow. They share a premium UAE legal editorial art direction: warm daylight, ivory/stone/walnut materials, restrained Abu Dhabi context, no logos, no text, no government emblems, and no stock-handshake or foreign-courtroom imagery.

### 7. Image mapping

| Service | Asset | Visual direction |
| --- | --- | --- |
| Criminal | `apps/web/public/images/services/criminal.png` | Private confidential consultation and case-review setting |
| Commercial | `apps/web/public/images/services/commercial.png` | Executive boardroom with Abu Dhabi business skyline |
| Civil | `apps/web/public/images/services/civil.png` | Calm private consultation room |
| Notary | `apps/web/public/images/services/notary.png` | Document-authentication workspace |
| Taxes | `apps/web/public/images/services/taxes.png` | Structured compliance-record workspace |

`serviceVisuals.ts` is the presentation mapping used by both the Explorer preview and detail hero. Focused E2E proves each slug resolves to its own source; the five local assets also have distinct SHA-256 hashes.

### Generation prompt set

Built-in image generation was used for five portrait 3:4 editorial legal photographs. Each prompt specified: premium UAE legal-office setting; bright warm natural daylight; ivory, beige stone, walnut and muted-gold palette; no people posing; no text, logos, emblems, watermark, stock handshake, gavel, foreign courthouse, or fake data. The subject varied only by service context: confidential consultation, boardroom, calm civil consultation, document authentication, or compliance records.

## 8. Services navigation

The desktop Explorer now has valid separate controls:

- The full service name is a real, large locale-aware link to `/[locale]/services/[slug]`.
- The adjacent icon button changes the focused preview, with `aria-pressed` and a localized accessible name.

This avoids nested interactive elements while giving every service a direct navigation affordance. The mobile accordion retains a native `aria-expanded` button and a clear, locale-aware service-detail CTA.

## 9. Detail hero

The Dossier hero now obtains its image and localized descriptive alt text from the same service-visual mapping. Each known slug uses its own image in Arabic and English. Light overlay/caption treatment is ivory and gold; Dark retains an appropriate deep overlay.

## 10. Light CTA correction

The detail preparation and closing sections are no longer dark blocks in Light Mode. They are editorial light bands with charcoal text and a contained charcoal action button. Dark surfaces are re-enabled only under the resolved `.dark` theme.

## 11. Other Services navigation

Other Services remains a list of four real locale-aware links, excludes the current service, has a service number and directional arrow, and was exercised through focused E2E keyboard navigation.

## 12. Responsive

The Services Explorer and Service Detail were browser-checked across 72 route states:

- 2 locales × 2 themes × 9 widths (`360`, `375`, `390`, `430`, `768`, `1024`, `1280`, `1440`, `1920`) × 2 representative routes.

No horizontal overflow, direction regression, or page error occurred.

## 13. Accessibility

- Real anchors for desktop and related-service navigation.
- Separate native preview buttons with `aria-pressed`.
- Mobile native accordion buttons with `aria-expanded`.
- Localized descriptive image alternatives.
- Visible focus styles, one `h1`, logical headings, touch-friendly actions, RTL/LTR directional arrows, and reduced-motion support.

## 14. Reduced motion

Existing reduced-motion behavior remains active for Explorer and Dossier transitions. Focused browser coverage exercised the mobile service-detail route with reduced motion enabled.

## 15. SEO

Canonical, `hreflang`, Open Graph route URL, and the official production origin remain unchanged and were re-verified under `https://hhlawyer.ae`.

## 16. Files created

- `apps/web/public/images/services/criminal.png`
- `apps/web/public/images/services/commercial.png`
- `apps/web/public/images/services/civil.png`
- `apps/web/public/images/services/notary.png`
- `apps/web/public/images/services/taxes.png`
- `apps/web/src/components/services/serviceVisuals.ts`
- `apps/web/src/components/services/serviceDetailCopy.ts`
- `PHASE_8C_2_2_SERVICES_VISUAL_CORRECTION_REPORT.md`

## 17. Files modified

- `apps/web/src/components/services/ServicesEditorial.tsx`
- `apps/web/src/components/services/ServicesEditorial.module.css`
- `apps/web/src/components/services/ServiceDetailDossier.tsx`
- `apps/web/src/components/services/ServiceDetailDossier.module.css`
- `apps/web/e2e/services-editorial.spec.ts`
- `apps/web/e2e/service-detail-editorial.spec.ts`

## 18. Tests

- Focused Services + Service Detail Playwright: **PASS — 9/9**.
- Covers localization leak checks, real service links, five unique sources, Light-surface audit, mobile accordion, Dark mode, reduced motion, all known slugs, related navigation, canonical, `hreflang`, Open Graph URL, and no page errors/overflow.
- Homepage reduced-motion regression smoke: **PASS — 1/1**.

## 19. Visual review

Browser screenshots were inspected for:

- `/ar/services`, `/en/services` in Light and Dark desktop, plus mobile.
- All five Arabic and all five English detail slugs in Light and Dark desktop.
- Detail capabilities and consultation close in both modes.

The final inspection confirmed bright unique service visuals, fully light Light Mode section rhythm, preserved Dark Mode depth, localized Arabic UI, English feature translation, and no dark Light-Mode blocks.

## 20. Quality gates

| Check | Result |
| --- | --- |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm build` | PASS |
| `git diff --check` | PASS |

## 21. Localhost URLs

- `http://localhost:3000/ar/services`
- `http://localhost:3000/en/services`
- `http://localhost:3000/ar/services/criminal`
- `http://localhost:3000/en/services/criminal`

## 22. Final status

PHASE 8C.2.2 STATUS

Arabic UI Localization: PASS
English UI Localization: PASS

Arabic English-Leak Check: PASS

Services Light Mode: PASS
Services Dark Mode: PASS

Light Mode Dark-Surface Audit: PASS

Criminal Unique Image: PASS
Commercial Unique Image: PASS
Civil Unique Image: PASS
Notary Unique Image: PASS
Taxes Unique Image: PASS

Unique Service Images: PASS — 5/5

Services Clickable Navigation: PASS
Mobile Service Navigation: PASS

Service Detail Hero: PASS
Service-Specific Detail Image: PASS

Detail Light Mode: PASS
Detail Dark Mode: PASS
Detail Dark-Surface Audit: PASS

Other Services Links: PASS

Arabic RTL: PASS
English LTR: PASS
Responsive: PASS
Mobile: PASS
Accessibility: PASS
Reduced Motion: PASS

Known Slugs AR: PASS — 5/5
Known Slugs EN: PASS — 5/5

Canonical: PASS
Hreflang: PASS
Official Domain hhlawyer.ae: PASS

Homepage Regression: PASS

Lint: PASS
TypeScript: PASS
Build: PASS
git diff --check: PASS

BACKEND CHANGED: NO
DATABASE CHANGED: NO
BUSINESS LOGIC CHANGED: NO

SERVICES + SERVICE DETAIL FINAL REVIEW READY: YES

NEXT PAGE AFTER APPROVAL: ABOUT

READY TO START ABOUT: NO — WAIT FOR EXPLICIT PRODUCT OWNER APPROVAL
