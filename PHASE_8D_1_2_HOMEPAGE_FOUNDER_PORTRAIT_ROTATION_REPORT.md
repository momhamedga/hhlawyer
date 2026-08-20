# Phase 8D.1.2 — Homepage Founder Portrait Rotation

## 1. Executive summary

Implemented a client-side, performance-aware rotation for the homepage Hero founder portrait only. The first approved portrait is the initial LCP image; the second is requested after initial render and the images alternate every 10 seconds with a 750 ms opacity cross-fade.

The focused portrait suite passed 4/4. Lint, TypeScript, production build, and `git diff --check` passed. A pre-existing mobile-navigation regression remains reproducible, so the public homepage regression gate and phase completion are not approved.

## 2. Scope and guardrails

Only the homepage Hero portrait implementation and its focused browser coverage were changed. No API, database, Prisma, authentication, administration, FAQ, service-content, or business-logic work was performed.

## 3. Approved portrait assets

- Initial: `/Hussein-Alharathi-1.webp`
- Alternate: `/Hussein-Alharathi-2.webp`

Both existing WebP assets are 171 × 256 pixels. No image was generated, modified, copied, or deleted.

## 4. Component architecture

`HeroPortraitRotation` is a small client component rendered inside the existing stable `.heroPortrait` stage in `EditorialHome`. It owns the active image state, lifecycle listeners, and deferred second-image request; the homepage layout and Hero copy remain unchanged.

## 5. Initial render

Portrait 1 renders immediately with Next Image `preload`, the existing responsive `sizes` value, and localized alt text. It remains the only requested portrait during the initial 1.5-second defer window.

## 6. Rotation timing

After portrait 2 has loaded, a single 10,000 ms timeout advances the active portrait. The next timer is scheduled only after a successful change; there is no per-second interval or polling loop.

## 7. Cross-fade

Both layers occupy the same absolute stage. The active layer has opacity 1 and the inactive layer opacity 0, with a 750 ms ease transition. The existing stage dimensions remain the layout reservation.

## 8. Desktop hover behavior

On fine-pointer devices, pointer entry pauses rotation and pointer leave restarts a fresh 10-second cycle. The focused desktop test verified that no switch occurs while hovering and that rotation resumes after leaving.

## 9. Touch behavior

On coarse-pointer input, the first interaction pauses the current portrait temporarily; a second interaction clears that pause and starts a fresh cycle. The portrait is not focusable and the handler does not prevent scrolling or add a visible control.

## 10. Page visibility behavior

`visibilitychange` pauses the rotation while the document is hidden and restarts a fresh cycle after it is visible again. This was exercised in the focused test with a synthetic visibility transition.

## 11. Off-screen optimization

An `IntersectionObserver` with a 0.1 threshold pauses rotation when the Hero portrait leaves the viewport and restarts it only after re-entry. The focused test scrolls the existing services index into view to verify the pause.

## 12. Reduced-motion behavior

When `prefers-reduced-motion: reduce` is active, portrait 1 stays static, portrait 2 is not requested, rotation never starts, and the CSS transition is disabled. This was verified in the focused suite.

## 13. LCP strategy

Only portrait 1 is preloaded. Portrait 2 is deferred and has no preload hint or priority behavior. This avoids competing for the initial LCP request while still making the alternate portrait available before rotation begins.

## 14. CLS strategy

The rotation layers are absolutely positioned inside the pre-existing, explicitly sized Hero portrait container. The focused test compared the stage client width and height before and after rotation; they are unchanged.

## 15. Loading strategy

Portrait 2 is mounted after the short defer window and is marked ready only after its `onLoad` event. Rotation cannot start before that readiness signal.

## 16. Accessibility

The currently active portrait exposes one localized image alternative; the inactive layer is `aria-hidden`. There is no `aria-live` region, no focus target, and no duplicate announcement. Reduced motion is honored without requiring a user setting.

## 17. Arabic and English

The component uses the current locale and preserves the existing Arabic RTL / English LTR document behavior. Focused browser coverage exercised `/ar` and `/en`.

## 18. Light and dark themes

Focused browser coverage exercised `/ar` and `/en` in both resolved light and dark themes. The portrait itself has no theme-specific bitmap substitution or background canvas.

## 19. Responsive coverage

The focused suite checked widths 360, 375, 390, 430, 768, 1024, 1280, 1440, and 1920 pixels, including mobile interaction behavior and horizontal-overflow assertions.

## 20. SEO and content integrity

The homepage retains one H1. Existing Hero wording, metadata, canonical behavior, routes, and structured public content were not changed.

## 21. Hydration and console safety

The implementation uses the project’s hydration-safe reduced-motion hook. The focused desktop lifecycle test captured no page errors.

## 22. Focused browser test

`apps/web/e2e/homepage-founder-portrait.spec.ts` passed 4/4:

1. initial portrait, delayed alternate loading, 10-second rotation, hover, visibility, off-screen behavior, no CLS, and no page errors;
2. reduced-motion static behavior;
3. locale/theme/viewport matrix;
4. coarse-pointer pause/resume and keyboard-focus safety.

## 23. Relevant homepage regression

`production-redesign.spec.ts` was run as the relevant existing public regression. The logo matrix and remaining public route checks passed when rerun independently. The mobile-menu route case reproducibly failed and prevents a green regression result.

## 24. Regression failure detail

Failing existing test: `homepage mobile menu opens, routes, closes, and restores trigger focus`.

- Step: click the dialog link with `href="/en/services"`.
- Expected: URL matching `/en/services`.
- Actual: the dialog closes but the URL remains `http://localhost:3000/en` after the full 5-second assertion timeout.
- Scope assessment: the failure is in the shared `Header` mobile-dialog navigation behavior, not in the Hero portrait layers. The Header was intentionally not modified during this portrait-only phase.

The initial combined run also showed a dev-server frame-detach interruption for the long public-route matrix; its standalone rerun passed in 54.2 seconds. The mobile route failure remained on standalone rerun and is therefore recorded as a real regression.

## 25. Quality verification

| Command | Result |
| --- | --- |
| Focused founder portrait Playwright spec | PASS — 4/4 |
| Relevant logo regression | PASS — 1/1 standalone |
| Relevant public-route regression | PASS — 1/1 standalone |
| Relevant mobile-menu regression | FAIL — 0/1 |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm build` | PASS |
| `git diff --check` | PASS |

## 26. Lighthouse

No Lighthouse or LHCI dependency/script is present in the repository. No tooling was added solely for this phase. The implementation preserves the LCP strategy, stable layout, reduced-motion behavior, and deferred secondary image described above, but no new Lighthouse score was collected.

## 27. Files modified

- `apps/web/src/components/production/EditorialHome.tsx`
- `apps/web/src/components/production/HeroPortraitRotation.tsx`
- `apps/web/src/components/production/HeroPortraitRotation.module.css`
- `apps/web/e2e/homepage-founder-portrait.spec.ts`
- `PHASE_8D_1_2_HOMEPAGE_FOUNDER_PORTRAIT_ROTATION_REPORT.md`

## 28. Explicit non-changes

- Backend: unchanged.
- Database and Prisma: unchanged.
- Business rules and APIs: unchanged.
- Existing source portrait assets: unchanged.
- Shared Header/mobile navigation: unchanged.

## 29. Release decision

The founder portrait feature is implemented and verified. The phase is not closed because the required relevant homepage regression includes the reproducible mobile-menu navigation failure described above.

## 30. Final status

| Check | Result |
| --- | --- |
| Founder Portrait 1 | PASS |
| Founder Portrait 2 | PASS |
| Initial Portrait | PASS |
| 10s Rotation | PASS |
| Cross-fade | PASS |
| Desktop Hover Pause / Resume | PASS |
| Mobile Touch Behavior | PASS |
| Page Visibility Pause | PASS |
| Offscreen Optimization | PASS |
| Reduced Motion | PASS |
| LCP / Second Image Loading / CLS | PASS |
| Accessibility / Best Practices / SEO | PASS |
| Arabic RTL / English LTR / Light / Dark | PASS |
| Responsive / Mobile / Hydration / Console Errors | PASS |
| Focused E2E | PASS |
| Homepage Regression | FAIL |
| Lint / TypeScript / Build / git diff --check | PASS |
| Phase 8D.1.2 complete | NO |
| Ready for Phase 8D.2 | NO |
