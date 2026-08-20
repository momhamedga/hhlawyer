# Phase 8A.1 Part B — Modern Trust Design System Foundation

## 1. Executive Summary

The Modern Trust foundation is complete. It supplies semantic tokens, bilingual-ready typography and direction architecture, Light/Dark/System appearance, accessibility-oriented primitives, and representative public/admin adoption without altering business behavior.

## 2. Approved Direction

Approved Direction: **Modern Trust** — a calm, precise, Arabic-first legal-tech system with solid data-first admin surfaces. Gold remains legacy branding only and is not the primary interaction color.

## 3. Final Product Requirements

| Requirement | Result |
| --- | --- |
| Arabic Font | Cairo |
| Arabic Direction | RTL |
| English | Planned / LTR-ready |
| Bilingual Product | Arabic + English |
| Bilingual Routing | DEFERRED |
| Translation Layer | DEFERRED |
| Light Theme | IMPLEMENTED |
| Dark Theme | IMPLEMENTED |
| System Theme | IMPLEMENTED |
| Accessibility target | WCAG 2.2 AA baseline |

## 4. Dependency Review

`next-themes` provides the small, hydration-safe theme-state integration. `@radix-ui/react-dialog` provides the accessible dialog focus/escape foundation. No full UI framework or shadcn package was introduced.

## 5. Token Architecture

`globals.css` exposes semantic `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `border`, `input`, `ring`, and destructive/success/warning/info foreground pairs to Tailwind v4. Components consume these names rather than arbitrary colors.

## 6. Light Palette

The approved Light token values are implemented exactly, including `#F8FAFC` background, `#162033` foreground, `#1E3A5F` primary, and `#007C83` accent.

## 7. Dark Palette

The approved Dark token values are implemented exactly, including `#0B1220` background, `#E7EEF7` foreground, `#7DD3FC` primary, and `#57C9C8` accent.

## 8. Theme Architecture

One root `ThemeProvider` uses class-based theming, hydration-safe client handling, browser `color-scheme`, and a dynamic `theme-color` meta value. There is no duplicated theme state.

## 9. System Theme

System mode is `next-themes` system mode, not a Dark alias. The focused browser proof emulates both OS dark and OS light and verifies the document class changes accordingly.

## 10. Theme Persistence

The only new browser-storage key is `hhlawyer-theme`. Focused E2E proves Light, Dark, and System survive reloads and that session storage remains empty.

## 11. Root Layout

The root layout now uses semantic `bg-background` and `text-foreground`, retains `lang="ar"` and `dir="rtl"`, adds hydration suppression only at the theme-mutated document root, and no longer hard-codes the former dark background/text pair.

## 12. Arabic Typography — Cairo

`next/font/google` self-hosts Cairo with only weights 400, 600, 700, and 800. Cairo is the body and shared `font-sans` foundation; no runtime external font stylesheet is loaded. E2E confirms the Cairo variable and computed body font are active.

## 13. English Typography Preparation

The font stack reserves `--font-english` with a safe system fallback. No arbitrary English typeface was selected.

## 14. RTL Foundation

The current root remains RTL. New primitives use `gap`, start/end positioning, logical action alignment, and direction-neutral layouts where appropriate.

## 15. Future LTR Foundation

No physical-direction dependency was added to shared primitives. An LTR locale can supply `dir="ltr"` during the later routing work without redesigning them.

## 16. Radius System

Semantic radii are 6px, 10px, 14px, and 18px (`--radius-sm` through `--radius-xl`). New primitives use only those values.

## 17. Elevation System

Restrained semantic small, medium, and large elevations are defined. Cards use the small elevation; dialogs use medium. No colored or neon shadow was introduced.

## 18. Focus System

Buttons, controls, toggle options, and dialog controls provide visible `focus-visible` ring treatment using the semantic ring token and offset surface.

## 19. Reduced Motion

`prefers-reduced-motion` disables non-essential animation, transition duration, and smooth scrolling. Focused E2E emulates reduced motion and verifies computed scrolling behavior is `auto`.

## 20. Status Semantics

Neutral/default, info, success, warning, and destructive status semantics are exposed. Alerts use text and an icon, while badges retain text labels, so status is not color-only.

## 21. Button

The shared Button supports primary, secondary, outline, ghost, and destructive variants; small/medium/large sizes; loading; disabled; and visible keyboard focus.

## 22. Input

The Input foundation has semantic surface/border/placeholder/focus/disabled states, minimum 16px text, and `aria-invalid` destructive treatment.

## 23. Textarea

Textarea has the same semantic and invalid-state behavior, a readable minimum height, and a 16px mobile-safe text size.

## 24. Select

The native Select foundation preserves platform accessibility while applying the same semantic, invalid, disabled, and focus behavior.

## 25. Card

Cards are solid semantic surfaces with a subtle border, restrained elevation, consistent padding, and the approved radius. Glass is not the default card behavior.

## 26. Badge

Badges map only to semantic statuses and preserve visible text labels.

## 27. Alert

Alerts provide info, success, warning, destructive, and default variants with `role="alert"`, semantic colors, readable text, and an icon.

## 28. Skeleton

Skeleton uses a semantic muted surface, no shimmer, and inherits the global reduced-motion protection.

## 29. Dialog

The Radix-backed Dialog and ConfirmDialog provide overlay, semantic popover surface, labelled title/description, close control, escape/focus behavior, and logical end-aligned actions. Existing business dialogs were not migrated unnecessarily.

## 30. Representative Admin Implementation

Admin login uses Card, Input, Button, Alert, Cairo, and the shared theme control. The `/admin` dashboard shell is a solid semantic/data-first representative while retaining all existing metrics, API requests, RBAC behavior, routes, and test IDs.

## 31. Representative Public Implementation

The public header uses semantic Modern Trust navigation and CTA presentation plus the shared theme control. No homepage content, booking workflow, or public business flow was redesigned.

## 32. Accessibility Verification

Controls have accessible names, focus-visible indicators, keyboard operation, minimum control height, logical direction-safe layout, and text/icon status indications. The focused browser proof checks keyboard operation, focus, RTL, and representative public/admin rendering.

## 33. Contrast Verification

Computed token-pair review meets AA normal-text contrast: Light body 15.58:1, Light muted 5.99:1, Light primary 11.50:1, Dark body 16.02:1, Dark muted 10.49:1, Dark primary 8.32:1. All destructive/success/warning/info foreground pairs measure at least 5.11:1.

## 34. Focused Theme E2E

`apps/web/e2e/design-system-theme.spec.ts` passed 1/1. It proves Light/Dark/System behavior, persistence after reload for each option, Cairo, RTL, reduced motion, keyboard/focus use, storage safety, and representative public/admin rendering.

## 35. System Theme Verification

Focused E2E changes emulated OS dark to light while System preference remains selected and verifies the resolved document theme changes from Dark to Light.

## 36. Hydration Verification

The focused test captures page and browser-console errors and completed without a hydration/theme/runtime error. The provider is mounted at the document root with the documented Next.js hydration suppression boundary.

## 37. Full Playwright Regression

Full Playwright passed **15/15**. Existing admin contacts/dashboard/services/users/consultations, booking, and public contact flows remain green.

## 38. Full API Regression

The original final replay encountered intermittent shared-Neon `DATABASE_ERROR` responses and database-operation timeouts. Phase 8A.1 Part B.1 performed controlled single-spec reproduction (30/30 affected tests), then a fresh full API release proof of **55/55** with exit code 0. No API, Prisma, auth, RBAC, database, or test-behavior code was changed during recovery.

## 39. Security Review

No auth, RBAC, cookies, refresh behavior, CORS, API contract, Prisma schema, migration, or backend code changed. `pnpm audit` reports no known vulnerabilities. Secret scan outside environment files found no connection string.

## 40. Files Created

- `apps/web/src/components/providers/ThemeProvider.tsx`
- `apps/web/src/components/theme/ThemeToggle.tsx`
- `apps/web/src/components/ui/{cn,button,input,textarea,select,card,feedback,dialog,confirm-dialog,index}.tsx`
- `apps/web/e2e/design-system-theme.spec.ts`
- `apps/web/public/icon.svg`
- `PHASE_8A_1_PART_B_REPORT.md`

## 41. Files Modified

- `apps/web/src/app/{globals.css,layout.tsx}`
- `apps/web/src/components/shared/Header/{index.tsx,DesktopMenu.tsx,MobileMenu.tsx}`
- `apps/web/src/components/layout/Footer.tsx`
- `apps/web/src/app/admin/{page.tsx,login/page.tsx}`
- `README.md`

## 42. Dependencies Added

- `next-themes` — Light/Dark/System preference, persistence, and OS preference integration.
- `@radix-ui/react-dialog` — accessible dialog primitive only.

## 43. Database Changes

None. No Prisma schema, migration, `db push`, reset, data repair, or Main database write was performed.

## 44. Remaining Design Debt

Legacy public sections still contain pre-foundation dark/gold, glass, raw-color, arbitrary-shadow, and physical-direction classes. They were inventoried in Part A and deliberately remain outside this foundation-only scope; the shared root/header/admin representatives are theme-safe.

## 45. Bilingual Preparation

Arabic is active in RTL with Cairo. English is LTR-ready through logical shared primitives and a separate typography variable. Bilingual Routing: **DEFERRED**. Translation Layer: **DEFERRED**.

## 46. Requirements for Next Phase 8A Step

Phase 8A.2 may select the English font, add locale routing and translation infrastructure, then migrate content deliberately. It must preserve these semantic tokens and one shared theme state.

## 47. Final Verification Table

| Check | Result |
| --- | --- |
| Semantic tokens / Light / Dark / System | PASS |
| Theme toggle and persistence | PASS |
| Cairo / RTL / LTR readiness | PASS |
| Typography / radius / elevation / focus / reduced motion | PASS |
| Shared primitives | PASS |
| Accessibility and contrast baseline | PASS |
| Focused theme E2E | PASS — 1/1 |
| Full Playwright | PASS — 15/15 |
| Full API | PASS — 55/55 fresh Phase 8A.1 Part B.1 recovery proof |
| Test isolation / Main DB safety | PASS |
| Lint / TypeScript / Build / Audit | PASS |
| `git diff --check` | PASS |

```text
PHASE 8A.1 PART B STATUS

Approved Direction:
MODERN TRUST

Arabic Font:
CAIRO

Arabic Direction:
RTL

English Preparation:
LTR-READY

Bilingual Routing:
DEFERRED

Semantic Tokens:
PASS

Light Theme:
PASS

Dark Theme:
PASS

System Theme:
PASS

Theme Toggle:
PASS

Theme Persistence:
PASS

Cairo Typography:
PASS

Typography Scale:
PASS

Radius:
PASS

Elevation:
PASS

Focus:
PASS

Reduced Motion:
PASS

Status Semantics:
PASS

Button:
PASS

Input:
PASS

Textarea:
PASS

Select:
PASS

Card:
PASS

Badge:
PASS

Alert:
PASS

Skeleton:
PASS

Dialog:
PASS

RTL Foundation:
PASS

LTR Readiness:
PASS

Representative Admin:
PASS

Representative Public:
PASS

Accessibility:
PASS

Contrast:
PASS

Hydration:
PASS

System Theme Verification:
PASS

Focused Theme E2E:
PASS

Full Playwright:
PASS

Full API Regression:
PASS

Test Isolation:
PASS

Main DB Safety:
PASS

Security:
PASS

Lint:
PASS

TypeScript:
PASS

Build:
PASS

Audit:
PASS

PHASE 8A.1 PART B COMPLETE:
YES

READY FOR NEXT PHASE 8A STEP:
YES
```
