import { expect, test } from "@playwright/test";

const SECOND_IMAGE_DELAY_MS = 1_500;
const ROTATION_INTERVAL_MS = 10_000;

async function waitForSecondPortrait(page: import("@playwright/test").Page) {
  const portrait = page.getByTestId("homepage-founder-portrait");
  await page.clock.fastForward(SECOND_IMAGE_DELAY_MS);
  await expect(portrait).toHaveAttribute("data-secondary-ready", "true");
  return portrait;
}

async function selectTheme(page: import("@playwright/test").Page, theme: "light" | "dark") {
  await page.getByTestId("public-theme-trigger").click();
  await page.getByTestId(`public-theme-option-${theme}`).click();
}

async function setVisibility(page: import("@playwright/test").Page, visibility: "hidden" | "visible") {
  await page.evaluate((nextVisibility) => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => nextVisibility });
    document.dispatchEvent(new Event("visibilitychange"));
  }, visibility);
}

test("Homepage hero portrait rotates without layout shift and pauses for hover, hidden pages, and offscreen state", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.clock.install();
  await page.setViewportSize({ width: 1440, height: 920 });
  await page.goto("/en", { waitUntil: "domcontentloaded" });

  const portrait = page.getByTestId("homepage-founder-portrait");
  await expect(portrait).toHaveAttribute("data-active-portrait", "1");
  await expect(portrait.locator('[data-portrait-source="/Hussein-Alharathi-1.webp"] img')).toBeVisible();
  const before = await portrait.evaluate((element) => ({ width: element.clientWidth, height: element.clientHeight }));

  await waitForSecondPortrait(page);
  await expect(portrait).toHaveAttribute("data-rotation-state", "running");
  await page.clock.fastForward(ROTATION_INTERVAL_MS);
  await expect(portrait).toHaveAttribute("data-active-portrait", "2");
  const after = await portrait.evaluate((element) => ({ width: element.clientWidth, height: element.clientHeight }));
  expect(after).toEqual(before);

  await portrait.hover();
  await expect(portrait).toHaveAttribute("data-rotation-state", "paused");
  await page.clock.fastForward(ROTATION_INTERVAL_MS * 2);
  await expect(portrait).toHaveAttribute("data-active-portrait", "2");
  await page.mouse.move(0, 0);
  await expect(portrait).toHaveAttribute("data-rotation-state", "running");
  await page.clock.fastForward(ROTATION_INTERVAL_MS);
  await expect(portrait).toHaveAttribute("data-active-portrait", "1");

  await setVisibility(page, "hidden");
  await expect(portrait).toHaveAttribute("data-rotation-state", "paused");
  await page.clock.fastForward(ROTATION_INTERVAL_MS * 2);
  await expect(portrait).toHaveAttribute("data-active-portrait", "1");
  await setVisibility(page, "visible");
  await expect(portrait).toHaveAttribute("data-rotation-state", "running");

  await page.getByTestId("homepage-services-index").scrollIntoViewIfNeeded();
  await expect(portrait).toHaveAttribute("data-rotation-state", "paused");
  await page.clock.fastForward(ROTATION_INTERVAL_MS * 2);
  await expect(portrait).toHaveAttribute("data-active-portrait", "1");
  await portrait.scrollIntoViewIfNeeded();
  await expect(portrait).toHaveAttribute("data-rotation-state", "running");
  await page.clock.fastForward(ROTATION_INTERVAL_MS);
  await expect(portrait).toHaveAttribute("data-active-portrait", "2");
  expect(pageErrors).toEqual([]);
});

test("Homepage hero portrait remains static with reduced motion", async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ar", { waitUntil: "domcontentloaded" });
  const portrait = page.getByTestId("homepage-founder-portrait");
  await expect(portrait).toHaveAttribute("data-active-portrait", "1");
  await expect(portrait).toHaveAttribute("data-rotation-state", "reduced");
  await page.clock.fastForward(ROTATION_INTERVAL_MS * 3);
  await expect(portrait).toHaveAttribute("data-active-portrait", "1");
  await expect(portrait.locator('[data-portrait-source="/Hussein-Alharathi-2.webp"]')).toHaveCount(0);
});

test("Homepage portrait keeps localized presentation, themes, and responsive bounds", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  for (const [locale, theme] of [["ar", "light"], ["ar", "dark"], ["en", "light"], ["en", "dark"]] as const) {
    await page.setViewportSize({ width: 1440, height: 920 });
    await page.goto(`/${locale}`, { waitUntil: "domcontentloaded" });
    await selectTheme(page, theme);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    await expect(page.locator("html")).toHaveClass(theme === "dark" ? /dark/ : /^(?!.*dark).*$/);
    await expect(page.getByTestId("homepage-founder-portrait")).toHaveAttribute("data-active-portrait", "1");
  }

  for (const width of [360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByTestId("homepage-founder-portrait")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }

  expect(pageErrors).toEqual([]);
});

test("Homepage portrait touch interaction pauses and resumes without changing focus order", async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.clock.install();
  await page.goto("/en", { waitUntil: "domcontentloaded" });
  const portrait = await waitForSecondPortrait(page);
  await portrait.evaluate((element) => element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch" })));
  await expect(portrait).toHaveAttribute("data-rotation-state", "paused");
  await portrait.evaluate((element) => element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch" })));
  await expect(portrait).toHaveAttribute("data-rotation-state", "running");
  await page.keyboard.press("Tab");
  expect(await portrait.evaluate((element) => !element.contains(document.activeElement))).toBe(true);
  await context.close();
});
