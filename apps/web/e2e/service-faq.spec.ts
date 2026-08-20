import { expect, test, type Page } from "@playwright/test";

import { serviceFaqContent, serviceFaqExpectedCount, serviceFaqSlugs } from "../src/i18n/service-faq-content";

const arabic = /[\u0600-\u06FF]/;
const unsafeLanguage = /guarantee|guaranteed|success probability|government fee|\bfee\b|مضمون|احتمال النجاح|رسوم حكومية/i;

async function selectTheme(page: Page, theme: "light" | "dark") {
  await page.getByTestId("public-theme-trigger").click();
  await page.getByTestId(`public-theme-option-${theme}`).click();
}

test("typed service FAQ content preserves service coverage, locale parity, stable IDs, and safe copy", () => {
  expect(serviceFaqSlugs).toHaveLength(5);

  for (const slug of serviceFaqSlugs) {
    const ar = serviceFaqContent.ar[slug];
    const en = serviceFaqContent.en[slug];
    expect(ar.items).toHaveLength(serviceFaqExpectedCount);
    expect(en.items).toHaveLength(serviceFaqExpectedCount);
    expect(new Set(ar.items.map((item) => item.id)).size).toBe(serviceFaqExpectedCount);
    expect(new Set(en.items.map((item) => item.id)).size).toBe(serviceFaqExpectedCount);
    expect(ar.items.map((item) => item.id)).toEqual(en.items.map((item) => item.id));
    expect(ar.items.map((item) => item.intent)).toEqual(en.items.map((item) => item.intent));

    for (const item of [...ar.items, ...en.items]) {
      expect(item.id.startsWith(`${slug}-`)).toBe(true);
      expect(item.question.trim()).not.toBe("");
      expect(item.answer.trim()).not.toBe("");
      expect(item.answer).not.toMatch(unsafeLanguage);
    }
  }
});

test("service FAQ is bilingual, keyboard-operable, and renders only the correct criminal content", async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/ar/services/criminal", { waitUntil: "domcontentloaded" });
  const arabicFaq = page.getByTestId("service-faq");
  await arabicFaq.scrollIntoViewIfNeeded();
  await expect(arabicFaq).toHaveAttribute("data-service-faq", "criminal");
  await expect(arabicFaq.locator("details")).toHaveCount(serviceFaqExpectedCount);
  expect(arabic.test(await arabicFaq.innerText())).toBe(true);
  expect((await arabicFaq.innerText()).includes("Commercial and Corporate Law")).toBe(false);

  const arabicQuestion = arabicFaq.locator("summary").first();
  await arabicQuestion.focus();
  await page.keyboard.press("Enter");
  await expect(arabicFaq.locator("details").first()).toHaveAttribute("open", "");
  await page.keyboard.press("Space");
  await expect(arabicFaq.locator("details").first()).not.toHaveAttribute("open", "");

  await page.goto("/en/services/criminal", { waitUntil: "domcontentloaded" });
  const englishFaq = page.getByTestId("service-faq");
  await englishFaq.scrollIntoViewIfNeeded();
  await expect(englishFaq).toHaveAttribute("data-service-faq", "criminal");
  await expect(englishFaq.locator("details")).toHaveCount(serviceFaqExpectedCount);
  expect(arabic.test(await englishFaq.innerText())).toBe(false);
  await englishFaq.locator("summary").first().click();
  await expect(englishFaq.locator("details").first()).toHaveAttribute("open", "");

  await expect.poll(() => pageErrors).toEqual([]);
  await expect.poll(() => consoleErrors).toEqual([]);
});

test("every service receives its own FAQ and keeps canonical, hreflang, and one H1", async ({ page }) => {
  for (const locale of ["ar", "en"] as const) {
    for (const slug of serviceFaqSlugs) {
      await page.goto(`/${locale}/services/${slug}`, { waitUntil: "domcontentloaded" });
      const faq = page.getByTestId("service-faq");
      await expect(faq).toHaveAttribute("data-service-faq", slug);
      await expect(faq.locator("details")).toHaveCount(serviceFaqExpectedCount);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://hhlawyer.ae/${locale}/services/${slug}`);
      await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute("href", `https://hhlawyer.ae/ar/services/${slug}`);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://hhlawyer.ae/en/services/${slug}`);
    }
  }
});

test("service FAQ remains readable across themes, directions, widths, and reduced motion", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  for (const [locale, theme] of [["ar", "light"], ["ar", "dark"], ["en", "light"], ["en", "dark"]] as const) {
    await page.goto(`/${locale}/services/notary`, { waitUntil: "domcontentloaded" });
    await selectTheme(page, theme);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    if (theme === "dark") await expect(page.locator("html")).toHaveClass(/dark/);
    else await expect(page.locator("html")).not.toHaveClass(/dark/);

    for (const width of [360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const faq = page.getByTestId("service-faq");
      await faq.scrollIntoViewIfNeeded();
      await expect(faq.locator("summary").first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/services/notary", { waitUntil: "domcontentloaded" });
  const reducedFaq = page.getByTestId("service-faq");
  await reducedFaq.locator("summary").first().click();
  await expect(reducedFaq.locator("details").first()).toHaveAttribute("open", "");
  await expect(reducedFaq.locator("details").first().locator("div").last()).toHaveCSS("animation-name", "none");
  await expect.poll(() => pageErrors).toEqual([]);
});
