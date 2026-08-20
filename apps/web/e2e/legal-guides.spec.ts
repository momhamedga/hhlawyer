import { expect, test, type Page } from "@playwright/test";

import { guideSlugs, legalGuidesContent } from "../src/i18n/legal-guides-content";

async function selectTheme(page: Page, theme: "light" | "dark") {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByTestId("public-theme-trigger").click();
  await page.getByTestId(`public-theme-option-${theme}`).click();
}

test("typed guides cover five legal-safe bilingual practice areas", () => {
  expect(guideSlugs).toHaveLength(5);
  const prohibitedSpecificLaw = /article\s+\d|federal law|decree|penalt(?:y|ies)|tax rate|filing deadline|المادة\s*\d|قانون اتحادي|مرسوم|عقوبة|نسبة ضريبية|موعد تقديم/i;
  const fakeCredential = /written by|reviewed by|legal reviewer|award|years of experience|أعده|راجعه|جائزة|سنوات الخبرة/i;

  for (const slug of guideSlugs) {
    const ar = legalGuidesContent.ar.guides[slug];
    const en = legalGuidesContent.en.guides[slug];
    expect(ar.practiceSlug).toBe(en.practiceSlug);
    expect(ar.sections).toHaveLength(3);
    expect(en.sections).toHaveLength(3);
    expect(ar.relatedGuideSlugs).toHaveLength(2);
    expect(en.relatedGuideSlugs).toHaveLength(2);
    expect(JSON.stringify(ar)).not.toMatch(prohibitedSpecificLaw);
    expect(JSON.stringify(en)).not.toMatch(prohibitedSpecificLaw);
    expect(JSON.stringify(ar)).not.toMatch(fakeCredential);
    expect(JSON.stringify(en)).not.toMatch(fakeCredential);
  }
});

test("Guides index is bilingual, filterable, keyboard-accessible, and uses real routes", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  for (const locale of ["ar", "en"] as const) {
    await page.goto(`/${locale}/guides`, { waitUntil: "domcontentloaded" });
    const content = legalGuidesContent[locale];
    await expect(page.getByTestId("guides-index")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(content.index.title);
    await expect(page.getByTestId("guides-list").locator('a[data-testid^="guide-row-"]')).toHaveCount(5);
    await expect(page.getByTestId("guides-filter-all")).toHaveAttribute("aria-pressed", "true");
    const commercialFilter = page.getByTestId("guides-filter-commercial");
    await commercialFilter.focus();
    await commercialFilter.press("Enter");
    await expect(commercialFilter).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("guides-list").locator('a[data-testid^="guide-row-"]')).toHaveCount(1);
    await expect(page.getByTestId("guide-row-commercial-relationship-basics")).toHaveAttribute("href", `/${locale}/guides/commercial-relationship-basics`);
    await page.getByTestId("guides-filter-all").click();
    await page.getByTestId("guide-row-commercial-relationship-basics").click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/guides/commercial-relationship-basics$`));
  }

  expect(pageErrors).toEqual([]);
});

test("all known guide details are localized, linked, indexable, and free of locale leakage", async ({ page }) => {
  const arabic = /[\u0600-\u06FF]/;
  const englishUiLeak = /Legal Guides|Practice area|Related practice area|Related guides|Need to discuss|Back to Legal Guides|Key point/i;

  for (const locale of ["ar", "en"] as const) {
    for (const slug of guideSlugs) {
      const guide = legalGuidesContent[locale].guides[slug];
      await page.goto(`/${locale}/guides/${slug}`, { waitUntil: "domcontentloaded" });
      const detail = page.getByTestId("guide-detail");
      await expect(detail).toHaveAttribute("data-guide-slug", slug);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(guide.title);
      await expect(page.getByTestId("guides-practice-link").getByRole("link")).toHaveAttribute("href", `/${locale}/services/${guide.practiceSlug}`);
      await expect(page.getByTestId("guides-consultation-link")).toHaveAttribute("href", `/${locale}/consultation`);
      await expect(page.getByTestId("guides-disclaimer")).toContainText(legalGuidesContent[locale].detail.disclaimer);
      await expect(page.getByTestId("guides-related").locator("a")).toHaveCount(2);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hhlawyer.ae/${locale}/guides/${slug}`);
      await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute("href", `https://hhlawyer.ae/ar/guides/${slug}`);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://hhlawyer.ae/en/guides/${slug}`);
      const text = await detail.innerText();
      if (locale === "ar") expect(text).not.toMatch(englishUiLeak);
      else expect(arabic.test(text)).toBe(false);
    }
  }
});

test("Guides remain light-safe, dark-ready, responsive, and reduced-motion usable", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  for (const [locale, theme] of [["ar", "light"], ["ar", "dark"], ["en", "light"], ["en", "dark"]] as const) {
    await page.goto(`/${locale}/guides`, { waitUntil: "domcontentloaded" });
    await selectTheme(page, theme);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    if (theme === "dark") await expect(page.locator("html")).toHaveClass(/dark/);
    else await expect(page.locator("html")).not.toHaveClass(/dark/);
    if (theme === "light") {
      const surface = await page.getByTestId("guides-index").evaluate((element) => `${getComputedStyle(element).backgroundColor} ${getComputedStyle(element).backgroundImage}`);
      expect(surface).not.toMatch(/rgb\(21, 18, 15\)|rgb\(33, 26, 21\)|rgb\(13, 10, 9\)/);
    }
    for (const width of [360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByTestId("guide-row-criminal-matter-overview")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    await page.goto(`/${locale}/guides/notary-document-preparation`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("guide-article")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/guides/civil-dispute-preparation", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("guide-detail")).toBeVisible();
  await expect(page.getByTestId("guides-consultation-link")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("Guides 404 correctly and contribute every URL to the sitemap", async ({ page }) => {
  const missing = await page.goto("/en/guides/unknown-guide", { waitUntil: "domcontentloaded" });
  expect(missing?.status()).toBe(404);
  const sitemap = await page.request.get("/sitemap.xml");
  await expect(sitemap).toBeOK();
  const text = await sitemap.text();
  for (const locale of ["ar", "en"]) {
    expect(text).toContain(`https://hhlawyer.ae/${locale}/guides`);
    for (const slug of guideSlugs) expect(text).toContain(`https://hhlawyer.ae/${locale}/guides/${slug}`);
  }
});
