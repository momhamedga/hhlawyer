# PHASE 0 — Technical Audit Report

Audit date: 2026-08-11
Scope: read-only review of the repository, dependency lockfile, configuration, source code, public assets, and existing checks. No product code, packages, database, UI, or backend were changed.

## 1. Executive Summary

The repository is a small Arabic, dark-theme Next.js marketing site for a law firm. It successfully produces a production build and contains no application backend, persistence, authentication, API routes, or email delivery. Its two data-collection journeys are client-side simulations: they display success without transmitting or storing a request.

The release is **not ready for Phase 1**. The immediate blockers are the direct vulnerable Next.js version, eight additional high-severity dependency findings reported by `npm audit`, failed ESLint, non-working lead-generation flows, and broken/missing internal links. The codebase is nevertheless small and can be migrated incrementally with low data-migration risk because there is no existing database or live backend contract to preserve.

## 2. Current Technology Stack

| Area | Verified implementation |
|---|---|
| Framework | Next.js 16.2.1, App Router |
| UI | React 19.2.4, TypeScript strict, Tailwind CSS 4.2.2 |
| Interaction | Framer Motion 12.38.0, Lucide React 0.577.0 |
| Date/state | date-fns 4.1.0, Zustand 5.0.12 |
| Styling/build | `@tailwindcss/postcss`; no standalone Tailwind config |
| Fonts/images | `next/font` (Almarai) and local `next/image` WebP assets |
| Present but unused | `@supabase/supabase-js` 2.99.3 |
| Not present | Express, Prisma, PostgreSQL/Neon client, shadcn/ui, Radix UI, TanStack Query, React Hook Form, Zod, theme library, test framework, Prettier |

`package.json` defines only `dev`, `build`, `start`, and `lint`; it has no `typecheck`, test, or formatting script.

## 3. Current Architecture

The project is a single Next.js application under `src/`, organised into `app`, `components`, `constants`, `types`, `store`, `actions`, and `lib`. Pages compose presentational components and hard-coded constants. The only global client store is `src/store/dateStore.ts` for the booking wizard.

There are 66 source files, 37 TSX files, and 30 files marked `use client`. `src/actions/consultation.ts`, `src/lib/supabase.ts`, `src/lib/utils.ts`, and `src/constants/index.ts` are empty. The presence of empty `actions`/`supabase` files does not provide server functionality.

The root layout renders a `<main>` and every page also renders a `<main>`, creating invalid nested main landmarks. The dynamic service page is also a client component and resolves its server-supplied route params with React `use()`.

## 4. Route Inventory

| Route | Type / build result | Purpose | SEO status | Findings |
|---|---|---|---|---|
| `/` | Static; build PASS | Home | Global metadata only | CTA fragments target IDs that do not exist. |
| `/about` | Static; build PASS | Attorney profile | Page title/description | No OG/Twitter/canonical metadata. |
| `/consultation` | Static; build PASS | Booking UI | Global metadata only | No real booking submission. |
| `/contact` | Static; build PASS | Contact UI | Global metadata only | No real contact submission. |
| `/services` | Static; build PASS | Service list | Page title/description | No OG/Twitter/canonical metadata. |
| `/services/[slug]` | Dynamic; build PASS | Service details | Global metadata only | Valid only for `criminal`, `commercial`, `civil`, `notary`, `taxes`; no per-service metadata or static params. |
| `/services/family` | Resolves dynamic route, then `notFound()` | Footer target | N/A | **Broken**: `family` is not in `LAW_SERVICES`; use the existing `civil` identifier or add a real family service in a later phase. |
| `/team` | No route file | Footer target | N/A | **Broken 404**. |
| `/blog` | No route file | Footer target | N/A | **Broken 404**. |
| `/privacy` | No route file | Footer target | N/A | **Broken 404**. |
| `/terms` | No route file | Footer target | N/A | **Broken 404**. |

The build emitted the six implemented routes plus `/_not-found`; it did not reveal missing linked paths because those paths are not generated routes.

## 5. Component Architecture

Components are grouped by page/domain (`about`, `consultation`, `contact`, `services`, `shared`, `layout`) with an atom/molecule/organism naming convention in some areas. The convention is inconsistent: home components are under `shared/home`, layouts are split between `layout` and `shared/layout`, and many presentational components are client components although they do not need client state.

The largest practical concerns are `BookingSystem.tsx` (wizard UI plus submission simulation), `ContactForm.tsx` (form UI plus submission simulation), and the client-side dynamic service page. Data constants, UI behaviour, and business placeholders are intermingled rather than separated by domain/API boundaries.

## 6. Form Audit

| Form | Fields | Validation | Submission / persistence | UX | Security and accessibility |
|---|---|---|---|---|---|
| Consultation booking | Service, date, time, full name, phone | Step 2 disables next without date; HTML `required` for name/phone; no schema or server validation | Client `useActionState` callback; waits 2 seconds and only logs booking object to browser console; no endpoint, DB, or email | Pending button state; success state is returned but never rendered; errors absent | PII is console-logged. No rate limit, CAPTCHA, CSRF model, consent, error UI, `aria-live`, or server trust boundary. |
| Contact | Name, email, subject, message | Only tests non-empty name/email; email syntax and all optional fields are not validated server-side | Client callback waits 2 seconds then returns success; no endpoint, DB, or email | Pending state and full-screen success overlay; no real failure path | Visible labels exist, but no required attributes, `aria-invalid`, `aria-describedby`, or live error/success announcement. No anti-spam or consent. |

The callbacks reside inside client components and do not contain `'use server'`; they are not Server Actions. Therefore neither form sends information off-device today.

## 7. Backend Reality Check

No application backend was found. Repository-wide discovery found no `app/**/route.ts`, `pages/api`, Express/server entry point, middleware, external API invocation, or server action. Next.js provides rendering only. `src/actions/consultation.ts` is zero bytes.

## 8. Database Reality Check

No Prisma schema/client, SQL migration, database URL, Neon/PostgreSQL package, ORM model, or database call was found. No environment files are present. The installed Supabase SDK is not imported or configured; `src/lib/supabase.ts` is zero bytes. There is no persistence.

## 9. API Reality Check

No route handler, REST/GraphQL API, `fetch`, Axios usage, third-party form endpoint, email provider, or upload endpoint exists. Consequently CORS, endpoint authentication, and CSRF are not currently implemented because there is no API surface to protect.

## 10. Dependency Audit

`npm ci` installed exactly from `package-lock.json`, then `npm audit` reported **9 findings: 8 high, 1 low, 0 critical**. `npm outdated` reports 15 direct packages with newer versions available; no update was performed.

| Package | Installed | Severity / affected range | Dependency path | Production impact | Recommended fix |
|---|---:|---|---|---|---|
| `next` | 16.2.1 | High; `9.3.4-canary.0`–`16.3.0-preview.10` | Direct | Framework server is deployed; advisories include DoS, XSS, SSRF, cache and middleware issues. | Upgrade to the audit-provided 16.3.0, then rebuild/retest. |
| `sharp` | 0.34.5 | High; `<0.35.0` | `next` | Used by Next image optimisation runtime. | Upgrade Next/its resolved Sharp version to a fixed release. |
| `postcss` | 8.4.31 / 8.5.8 | High; `<=8.5.22` | `next`; `@tailwindcss/postcss` | Build-time CSS processing; attackability depends on processing attacker-controlled CSS/maps. | Upgrade the dependency chain. |
| `ws` | 8.20.0 | High; `8.0.0`–`8.20.1` | `@supabase/supabase-js` → realtime | Currently unused by application code. | Remove unused Supabase or upgrade it after confirming future use. |
| `brace-expansion` | 1.1.12 / 5.0.4 | High; `<=1.1.17` or `3.0.0`–`5.0.8` | ESLint/minimatch | Development/tooling DoS exposure. | Update lockfile through compatible tooling updates. |
| `js-yaml` | 4.1.1 | High; `4.0.0`–`4.3.0` | ESLint | Development/tooling DoS exposure. | Update ESLint dependency chain. |
| `nanoid` | 3.3.11 | High; `<=3.3.16` | PostCSS | Build-time exposure. | Upgrade PostCSS chain. |
| `picomatch` | 2.3.1 / 4.0.3 | High; `<=2.3.1` or `4.0.0`–`4.0.3` | eslint-config-next resolver | Development/tooling ReDoS/glob exposure. | Update affected tooling. |
| `@babel/core` | 7.29.0 | Low; `<=7.29.0` | eslint-config-next | Development/tooling arbitrary source-map file read. | Update ESLint/Babel chain. |

The audit tool reports fixes are available. Do not use `npm audit fix --force` blindly; upgrade in a controlled dependency-security task with build and UI regression testing. Supabase is the only clearly unused direct runtime dependency observed. `react-day-picker` is also installed but has no source import.

## 11. Security Audit

| Severity | Finding | Evidence / impact |
|---|---|---|
| HIGH | Vulnerable direct/transitive dependencies | Verified `npm audit` findings listed above. |
| MEDIUM | PII logged in browser console | Booking name and phone are passed to `console.log` in `BookingSystem.tsx`; browser extensions, shared-device users, or diagnostics can expose it. |
| MEDIUM | Missing response-hardening configuration | `next.config.ts` only enables `reactCompiler`; it sets no CSP, `X-Frame-Options`, `Referrer-Policy`, or `Permissions-Policy`. |
| MEDIUM | No anti-abuse controls for future lead forms | No server-side validation, rate limiting, CAPTCHA/honeypot, consent, or durable audit trail exists. Implement before exposing a backend endpoint. |
| LOW | No privacy/terms pages despite collecting intended lead data | Footer directs users to missing legal pages. |
| INFO | No secret exposure found | No `.env*`, `process.env`, API key, cookie, local/session storage, unsafe HTML, `eval`, file upload, or third-party script was found in project source. |
| INFO | HTTPS is deployment-dependent | `metadataBase` uses HTTPS, but HSTS/redirect enforcement is not configured in code and must be confirmed at the host/CDN. |

No confirmed application XSS, CSRF, CORS, SSRF, authentication, or upload vulnerability exists in current application code because it has no external input-processing endpoint. The Next.js advisory still applies to the deployed framework.

## 12. Accessibility Audit

The site uses semantic `header`, `nav`, `footer`, headings, local-image alt text, and labels associated to form inputs. Touch targets generally appear generously sized.

Gaps against WCAG 2.2 AA:

- Nested `<main>` landmarks (root layout and individual pages) are invalid and confuse landmark navigation.
- The mobile-menu trigger lacks an accessible name, `aria-expanded`, and `aria-controls`.
- The mobile drawer has no dialog semantics, focus trap, Escape-key dismissal, focus restoration, or inert background.
- Client-side error messages are not connected to inputs with `aria-describedby`/`aria-invalid`; neither errors nor success use a live region.
- No `prefers-reduced-motion` alternative exists despite continuous pulse, canvas animation, and Framer Motion effects.
- Footer adds an additional `<h1>` on every page, disturbing heading hierarchy.
- Icon-only social links have `href="#"` and no accessible names.
- Visual contrast should be measured, particularly text at `white/10`, `white/20`, and `white/30` on dark/glass backgrounds; the code does not prove AA contrast.

## 13. SEO Audit

Global title template, description, Arabic `lang`/RTL direction, `metadataBase`, and page-level title/description for About and Services exist. `next/image` is used for local visual assets and the `PageHero` displays breadcrumbs.

Missing or incomplete: canonical URLs, Open Graph, Twitter cards, sitemap, robots, structured data (LocalBusiness/LegalService, FAQ, BreadcrumbList), per-page metadata for Contact/Consultation, and per-service metadata. The service details route is dynamic but has no `generateMetadata` or static param generation. The footer contains a decorative extra H1. Broken links and non-existent CTA fragments also reduce crawl/user quality.

## 14. Performance Audit

Positive findings: the production build passes; local WebP images use `next/image`; Almarai uses `next/font` with `display: swap`; home components are declared via `next/dynamic`; no remote scripts/data fetching exist.

Risks/recommendations:

- 30 client components is high for a small static site. Move purely presentational components to Server Components during a targeted optimisation phase.
- The home page wraps all dynamically imported sections in one `Suspense` boundary; the imports have no explicit loading strategies.
- `Footer` is client-rendered only to calculate the current year; it can be server-rendered.
- `DynamicFavicon` runs an unbounded `requestAnimationFrame` loop and is never cancelled on unmount.
- `AnimatedBackground` tracks pointer movement and uses effects; Framer Motion animations are plentiful. Gate motion for reduced-motion users and profile mobile CPU/GPU.
- Only three site-specific images exist and they are local WebP; confirm dimensions/LCP with Lighthouse after a deployment URL exists.

## 15. Code Quality Audit

`npm run lint` **FAILS** with two `@typescript-eslint/no-explicit-any` errors in `ContactAtoms.tsx` and one unused `state` warning in `BookingSystem.tsx`. `tsc --noEmit` and `next build` pass.

No `@ts-ignore`, `@ts-expect-error`, ESLint disables, or unsafe HTML/eval patterns were found. Dead/placeholder code includes the four zero-byte files noted above. Contact data is duplicated and hard-coded. There is no test suite, formatting configuration, or automated quality gate beyond ESLint/build. Comments contain inconsistent informal Arabic and implementation history, which increases maintenance noise.

## 16. Broken Links

- `/team`, `/blog`, `/privacy`, `/terms`: linked in Footer but no matching route.
- `/services/family`: linked in `FOOTER_SECTIONS`; dynamic page returns `notFound()` because the service list uses `civil` instead.
- Social, location card links use `#` placeholders.
- Header, mobile-menu, and hero CTAs use `#consultation`/`#services`, while no elements with those IDs exist; on most routes they do not navigate to the relevant page.

## 17. Broken Functionality

- Booking and contact forms promise success without a request, persistence, notification, or error handling.
- Booking success response is calculated but its `state` is unused, so the user receives no explicit successful booking confirmation in the component.
- Service-detail sidebar and mobile CTA buttons have no action or destination.
- Contact map is explicitly a "Coming Soon" placeholder.
- Contact details conflict across Contact and Footer.

## 18. Contact Data Inconsistencies

| Location | Phone | Email | Address / link |
|---|---|---|---|
| `constants/contact.ts` | `+971 50 XXX XXXX` / `tel:+971500000000` | `law@hussain.ae` | Dubai, commercial tower; map `#` |
| `components/layout/Footer.tsx` | `0502001797` / `tel:+971502001797` | `info@hussein.ae` | Abu Dhabi, UAE; social `#` |
| Metadata | N/A | N/A | Domain `hussein-alharithi.ae` |

Proposal: create a typed, server-safe `siteConfig` package/module in a later phase containing firm legal name, canonical domain, phone (E.164 + display), WhatsApp, emails, office addresses/hours, socials, map URL, and locale-specific display copy. Consume it from metadata, header/footer, contact cards, structured data, and future API notification templates.

## 19. State Management Audit

| State | Classification | Evidence | Assessment |
|---|---|---|---|
| Booking step/date/time/service | Client global/form state | Zustand `useBookingStore` | Appropriate only for a short-lived UI wizard; not persisted. |
| Mobile menu, desktop menu hover, FAQ row, background pointer | Local UI state | React `useState` | Appropriate local state. |
| Form pending/result | Form state | React `useActionState` | Client-only simulation; replace with React Hook Form + Zod when real APIs exist. |
| Server/URL/persisted state | None | No query, URL params beyond route slug, or browser storage | TanStack Query is not yet needed until a server API exists. |

Recommendation: retain Zustand for small client-global UI state, use React Hook Form + Zod for forms, and introduce TanStack Query only with API-backed server state. Do not add Redux Toolkit.

## 20. Design System Audit

The current visual system is dark-only: royal-charcoal, gold, and white opacity tokens defined in `globals.css`; Almarai Arabic typography; extensive rounded cards, blur/glass, shadows, responsive Tailwind utilities, and Framer Motion. Tailwind v4 is configured via CSS and PostCSS, not a `tailwind.config` file.

There is no light theme, system preference, English typography, LTR implementation, semantic token layer, shared button/input/card primitives, or shadcn/Radix layer. Many values are hard-coded as utility strings. Migration plan: first define semantic colour/type/spacing/radius/elevation tokens, then introduce accessible primitives, then support theme + direction at the layout boundary, without visually redesigning existing routes during Phase 1.

## 21. Technical Debt

- Security debt: vulnerable dependency lockfile and no response security policy.
- Product debt: simulated forms and inert CTAs.
- Content debt: inconsistent contact identity and placeholder social/map information.
- Platform debt: no backend, DB, auth, admin, tests, validation, email or legal pages.
- Maintainability debt: empty scaffold files, mixed folder conventions, hard-coded data, and client-heavy rendering.
- Internationalisation/theme debt: Arabic/RTL/dark only despite bilingual/theme goal.

## 22. Critical Issues

No critical-severity `npm audit` finding was reported and no critical application-code vulnerability was confirmed. **None at this time.**

## 23. High Priority Issues

1. Upgrade and retest `next@16.2.1` plus the audited high-severity dependency tree.
2. Replace simulated booking/contact success flows with secure server-backed flows before advertising them as operational.
3. Correct every broken user-facing footer/CTA route and the `family` service mismatch.
4. Resolve conflicting firm contact data before launch.

## 24. Medium Priority Issues

1. Add CSP, framing, referrer, permissions, and deployment HTTPS/HSTS policy.
2. Remove browser-console PII logging.
3. Make lint pass and add type-safe component props.
4. Implement accessible form states and mobile drawer behaviour.
5. Add privacy/terms, required SEO metadata, sitemap/robots, and structured data.

## 25. Low Priority Issues

1. Remove unused Supabase/react-day-picker dependencies and empty scaffold files after confirming no planned use.
2. Reduce unnecessary client components and animation cost.
3. Add formatter, tests, and CI quality/security gates.
4. Standardise comments, folders, and tokens.

## 26. Proposed Target Architecture

Do not migrate in Phase 0. The proposed future structure is:

```text
apps/
  web/       Next.js public site and admin UI
  api/       Express 5 API
packages/
  ui/        accessible reusable primitives
  types/     shared DTO/domain types
  validation/ Zod schemas shared at boundaries
  config/    lint, TypeScript, Tailwind and site config
prisma/      schema and migrations
```

Web must only call a versioned API contract. API owns authentication/authorisation, validation, rate limiting, email orchestration, audit logging, and Prisma persistence. PostgreSQL/Neon is reachable only from API/server infrastructure.

## 27. Proposed Design System

Preserve the existing visual identity first. Establish semantic tokens (`surface`, `text`, `muted`, `brand`, `danger`, focus ring) for light/dark modes; Arabic and English font stacks; RTL/LTR logical spacing; WCAG-compliant contrast; and accessible Button, Link, Input, Textarea, Select, Card, Dialog, Drawer, Alert, and Breadcrumb primitives. Use shadcn/Radix selectively after the package baseline is secured, rather than replacing screens wholesale.

## 28. Recommended Technology Stack

Target stack is suitable after security/version compatibility review: Next.js 16 + React 19 + TypeScript strict + Tailwind v4; Express 5 + TypeScript strict; Prisma 6 + PostgreSQL/Neon; Zod; React Hook Form; TanStack Query; Zustand; Lucide; Framer Motion; shadcn/ui + Radix. Add a transactional email provider, rate limiter, CAPTCHA/honeypot, logging/error reporting, formatter, unit/integration/e2e tests, and CI dependency scanning before production.

## 29. Migration Plan

1. Establish a clean, patched dependency baseline; make lint/build/typecheck reproducible in CI.
2. Correct content inventory, broken routes, links, and a single source of truth for firm data.
3. Define shared types, validation schemas, and security/data-retention requirements.
4. Introduce Prisma/PostgreSQL migrations and Express API with health checks, security middleware, validation, rate limiting, and tests.
5. Replace simulated forms one at a time with API-backed, accessible flows and email notifications.
6. Add authentication and admin capabilities only after roles, audit logging, and threat model are approved.
7. Migrate design tokens, bilingual routing/content, themes, SEO, and performance progressively, validating each route.

Migration risks: changing contact details may affect live business leads; changing service slugs may affect SEO; sharing Zod/types across apps requires careful build tooling; a new booking API introduces PII, anti-spam, retention, and legal/privacy obligations. No data migration risk currently exists because no database/persistence was found.

## 30. Phase 1 Requirements

Before Phase 1 begins, approve: canonical firm contact details; legal/privacy copy and retention policy; service catalogue/slugs; booking rules/timezone/availability; email provider; hosting/domain/CDN; roles and admin requirements; Arabic/English content ownership; and a security baseline. Then create an implementation plan that explicitly sequences dependency remediation, backend/data model, API contracts, forms, accessibility, and migration tests.

---

## Verification Record

- `npm run build`: PASS. Next.js 16.2.1 completed compilation, TypeScript, and route generation. It emitted a Node `DEP0205` deprecation warning.
- `npm exec tsc -- --noEmit`: PASS.
- `npm run lint`: FAIL. Two errors and one warning: explicit `any` at `ContactAtoms.tsx:6,25`; unused `state` at `BookingSystem.tsx:24`.
- `npm audit`: FAIL. 9 findings (8 high, 1 low).
- `npm outdated`: completed and found 15 direct packages with newer releases.
- `format:check`: NOT AVAILABLE; no formatter config or script exists.

PHASE 0 STATUS

Audit: FAIL

Build: PASS

Lint: FAIL

Typecheck: PASS

Format: NOT AVAILABLE

Security Audit: FAIL

Route Audit: FAIL

Architecture Audit: PASS

READY FOR PHASE 1:
NO
