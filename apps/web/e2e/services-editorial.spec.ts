import { expect, test } from "@playwright/test";
import { serviceContent } from "../src/i18n/service-content";

async function selectTheme(page: import("@playwright/test").Page, theme: "light" | "dark") {
  await page.getByTestId("public-theme-trigger").click();
  await page.getByTestId(`public-theme-option-${theme}`).click();
}

async function expectNoOverflow(page: import("@playwright/test").Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test("Services Practice Explorer is bilingual, interactive, keyboard-accessible, and routes to preserved details", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  for (const locale of ["ar", "en"] as const) {
    await page.setViewportSize({ width: 1440, height: 920 });
    await page.goto(`/${locale}/services`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    await expect(page.getByTestId("services-hero")).toBeVisible();
    await expect(page.getByTestId("services-explorer")).toBeVisible();
    await expect(page.getByTestId("services-guidance")).toBeVisible();
    await selectTheme(page, "light");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(page.getByTestId("service-index-criminal")).toHaveAttribute("aria-pressed", "true");

    const commercial = page.getByTestId("service-index-commercial");
    await commercial.focus();
    await expect(commercial).toHaveAttribute("aria-pressed", "true");
    await commercial.click();
    const preview = page.getByTestId("service-preview");
    await expect(preview).toContainText(locale === "ar" ? "القانون التجاري والشركات" : "Commercial and Corporate Law");
    await preview.getByRole("link", { name: locale === "ar" ? "عرض الخدمة" : "View service" }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/services/commercial$`));
    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("services-explorer")).toBeVisible();

    for (const theme of ["light", "dark"] as const) {
      await selectTheme(page, theme);
      await expect(page.locator("html")).toHaveClass(theme === "dark" ? /dark/ : /^(?!.*dark).*$/);
      await expectNoOverflow(page);
    }
  }
  expect(pageErrors).toEqual([]);
});

test("Services accordion is touch-friendly and keeps every service detail reachable on mobile", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  for (const locale of ["ar", "en"] as const) {
    for (const width of [360, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/${locale}/services`, { waitUntil: "domcontentloaded" });
      const accordion = page.getByTestId("services-mobile-accordion");
      await accordion.scrollIntoViewIfNeeded();
      await expect(accordion).toBeVisible();
      await expect(accordion.getByRole("button")).toHaveCount(5);
      const notary = page.getByTestId("service-mobile-notary");
      await notary.click();
      await expect(notary).toHaveAttribute("aria-expanded", "true");
      await notary.locator("xpath=..").getByRole("link", { name: locale === "ar" ? "عرض الخدمة" : "View service" }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/services/notary$`));
      await page.goBack({ waitUntil: "domcontentloaded" });
      await expectNoOverflow(page);
    }
  }
  expect(pageErrors).toEqual([]);
});

test("Services metadata stays canonical to the official bilingual production domain", async ({ page }) => {
  await page.goto("/ar/services", { waitUntil: "domcontentloaded" });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hhlawyer.ae/ar/services");
  await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute("href", "https://hhlawyer.ae/ar/services");
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", "https://hhlawyer.ae/en/services");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://hhlawyer.ae/ar/services");
});

test("Services explorer honors reduced motion without losing its content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/services", { waitUntil: "domcontentloaded" });
  const accordion = page.getByTestId("services-mobile-accordion");
  await accordion.scrollIntoViewIfNeeded();
  await page.getByTestId("service-mobile-taxes").click();
  await expect(accordion).toContainText(serviceContent.en.taxes.title);
  await expectNoOverflow(page);
});

test("Services keeps Arabic UI Arabic, makes every practice a real destination, and uses five unique visuals", async ({ page }) => {
  const slugs = ["criminal", "commercial", "civil", "notary", "taxes"];
  await page.setViewportSize({ width: 1440, height: 920 });
  await page.goto("/ar/services", { waitUntil: "domcontentloaded" });
  const arabicUi = await page.getByTestId("services-hero").locator("xpath=..").innerText();
  expect(arabicUi).not.toMatch(/\b(Service|Overview|Practice Area|How We Can Help|Other Services|Preparation|Next Step|Back to Services)\b/);
  const imageSources = new Set<string>();
  for (const slug of slugs) {
    await expect(page.getByTestId(`service-link-${slug}`)).toHaveAttribute("href", `/ar/services/${slug}`);
    await page.getByTestId(`service-index-${slug}`).click();
    const source = await page.getByTestId("service-preview-image").getAttribute("data-service-source");
    expect(source).toBe(`/images/services/${slug}.png`);
    imageSources.add(source ?? "");
  }
  expect(imageSources.size).toBe(5);
  const surface = await page.getByTestId("services-guidance").evaluate((element) => getComputedStyle(element).backgroundImage);
  expect(surface).not.toMatch(/33, 26, 21|13, 10, 9|21, 17, 14/);

  await page.goto("/en/services", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("services-hero").locator("xpath=..")).toContainText("Practice explorer");
  await expect(page.getByTestId("service-link-commercial")).toHaveAttribute("href", "/en/services/commercial");
});
