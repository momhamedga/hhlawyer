# Phase 8D.1.2.1 — Homepage Release Recovery

## 1. Executive Summary

The homepage release blocker is resolved. Mobile navigation now lets Next.js begin the client-side route transition before closing the controlled Radix Dialog. All Arabic and English public mobile destinations, including the consultation CTA, were exercised in a clean browser.

The observed `cz-shortcut-listen="true"` mismatch was independently investigated. It is not emitted by the application, is absent in clean Playwright Chrome launched with extensions disabled/incognito, and is absent in a production-build browser run. It is classified as browser-extension injection, not an application hydration defect.

## 2. Mobile Menu Root Cause

Each mobile `Link` closed the controlled Dialog in its generic `onClick` handler. That handler ran for the user click before Next.js had established the client-side navigation contract. The observable result was that the dialog closed but the route remained unchanged.

## 3. Mobile Menu Fix

The mobile navigation links and the mobile consultation CTA now use Next.js `Link` `onNavigate={() => setOpen(false)}`. `onNavigate` is called only for same-origin client navigation, so the dialog is closed after navigation has been accepted instead of competing with the original click event.

No hard navigation, `window.location`, router replacement, timeout change, or route normalizer change was introduced.

## 4. Arabic Navigation Verification

At mobile width, the clean browser test navigated to all of the following through the open mobile dialog:

- `/ar`
- `/ar/services`
- `/ar/about`
- `/ar/consultation`
- `/ar/contact`

The Arabic dialog preserved `dir="rtl"`, each target route rendered its H1, and the dialog closed after navigation.

## 5. English Navigation Verification

The same test navigated through the mobile dialog to:

- `/en`
- `/en/services`
- `/en/about`
- `/en/consultation`
- `/en/contact`

No Arabic route leakage was observed. The consultation CTA path was also executed for both locales.

## 6. Radix Accessibility Preservation

The Radix Dialog composition was not changed. Its focus trap, explicit close button, Escape handling, scroll lock, and controlled open state remain intact. Automated coverage verified route-close behavior, Escape close, and trigger-focus restoration across the locale/theme/viewport matrix.

## 7. Hydration Warning Investigation

The visible mismatch was isolated before changing hydration behavior. The application runtime source does not create `cz-shortcut-listen`; a clean controlled browser never receives the attribute and records no React hydration error.

## 8. `cz-shortcut-listen` Source

No executable application source under `apps/web/src` contains `cz-shortcut-listen`. The string exists only in an old diagnostic log and historical phase documentation. The observed body attribute is consistent with browser-extension DOM injection.

## 9. Extension-Free Browser Result

Playwright launched Chrome with an isolated profile, `--disable-extensions`, and `--incognito`. On `/en`, `body.getAttribute("cz-shortcut-listen")` was `null`.

## 10. Playwright Hydration Result

The focused clean-browser test collected `pageerror`, every browser `console.error`, and hydration-specific console text. All three sets were empty in the development server run. The same hydration-focused test passed against a separately launched production `next start` instance.

## 11. `suppressHydrationWarning` Decision

No `suppressHydrationWarning` was added or expanded in this phase. The existing root `<html>` setting was not modified: it is limited to the documented, application-controlled `next-themes` class/color-scheme initialization difference. It does not justify or conceal an extension-created `<body>` attribute.

## 12. Portrait Rotation Regression

The existing founder portrait suite passed 4/4 after the Header fix:

- initial portrait and deferred second portrait;
- 10-second rotation and cross-fade;
- hover, visibility, and off-screen pause/resume;
- reduced motion and true touch-device behavior;
- stable portrait dimensions.

The touch test was corrected to create a real Playwright `hasTouch` mobile context rather than treating a desktop mouse environment with a narrow viewport as a coarse-pointer device.

## 13. Responsive QA

The recovery suite verified Arabic and English light/dark variants at 360, 375, 390, and 430 pixels. It confirms a full-width dialog, no horizontal overflow, five navigation links, reachable CTA, theme control, telephone/email links, correct direction, Escape close, and focus restoration.

## 14. Performance Safety

The fix uses the existing Next.js `Link` behavior and a callback already supported by the installed Next version. It adds no dependency, image request, timer, route reload, or initial-bundle feature. The founder portrait LCP/deferred-image strategy is unchanged.

## 15. Accessibility

No nested interactive element was introduced. Radix semantics remain unchanged; routes close the dialog after accepted client navigation, and keyboard focus returns to the trigger on Escape. The clean-browser assertion also protects against new React hydration failures.

## 16. Best Practices

No error suppression, retry, timeout increase, test skip, or forced `page.goto` workaround was used. The user action itself is what performs navigation.

## 17. SEO Safety

Route paths and metadata logic were not changed. `production-redesign.spec.ts` passed its canonical, alternate-language, Open Graph, robots, and sitemap assertions.

## 18. Tests

| Test | Result |
| --- | --- |
| `homepage-mobile-navigation-recovery.spec.ts` | PASS — 3/3 |
| Founder portrait focused suite | PASS — 4/4 |
| Public production-redesign regression | PASS — 8/8 |
| i18n routing regression | PASS — 1/1 |
| Clean production hydration execution | PASS — 1/1 |

## 19. Quality Gates

| Command | Result |
| --- | --- |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm build` | PASS |
| `git diff --check` | PASS |

No Lighthouse/LHCI command exists in the repository, and none was added for this recovery-only phase.

## 20. Files Modified

- `apps/web/src/components/shared/Header/index.tsx`
- `apps/web/e2e/homepage-mobile-navigation-recovery.spec.ts`
- `apps/web/e2e/homepage-founder-portrait.spec.ts`
- `PHASE_8D_1_2_1_HOMEPAGE_RELEASE_RECOVERY_REPORT.md`

## 21. Backend and Database Safety

Backend, API, database, Prisma schema, migrations, authentication, RBAC, and business logic were not changed. No database operation was run for this phase.

## 22. Final Decision

The mobile navigation release blocker and hydration-source investigation are closed. Phase 8D.1.2 is complete and the project is ready to proceed to Phase 8D.2 only.

## Final Status

| Check | Result |
| --- | --- |
| Mobile Menu Root Cause | PASS |
| Arabic / English Mobile Navigation | PASS |
| Services / About / Consultation / Contact Navigation | PASS |
| Dialog Close / Focus Restoration / Radix Accessibility | PASS |
| Hydration Warning Root Cause | BROWSER EXTENSION |
| `cz-shortcut-listen` in application source | NO |
| Clean Browser Hydration | PASS |
| Application Hydration Error | NONE |
| `suppressHydrationWarning` Added | NO |
| Founder Portrait Rotation | PASS — 4/4 |
| Homepage Regression | PASS — 8/8 |
| Locale Regression | PASS — 1/1 |
| Console Safety | PASS |
| Lint / TypeScript / Build / git diff --check | PASS |
| Backend / Database / Business Logic / Public Design changed | NO |
| Phase 8D.1.2 complete | YES |
| Ready for Phase 8D.2 | YES |
