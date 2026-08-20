import { expect, test } from "@playwright/test";

async function selectTheme(page: import("@playwright/test").Page, theme: "light" | "dark") {
  await page.getByTestId("public-theme-trigger").click();
  await page.getByTestId(`public-theme-option-${theme}`).click();
}

async function expectNoOverflow(page: import("@playwright/test").Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test("Editorial Legal Dossier preserves every public service slug and stable public routes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const slugs = ["criminal", "commercial", "civil", "notary", "taxes"];

  for (const locale of ["ar", "en"] as const) {
    for (const slug of slugs) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/${locale}/services/${slug}`, { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("service-detail-hero").getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByTestId("service-detail-cta").getByRole("link")).toBeVisible();
      await expectNoOverflow(page);
    }
  }
  expect(errors).toEqual([]);
});

test("Service detail supports bilingual dossier interactions, themes, related navigation, and production metadata", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  for (const locale of ["ar", "en"] as const) {
    await page.setViewportSize({ width: 1440, height: 920 });
    await page.goto(`/${locale}/services/criminal`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    await expect(page.getByTestId("service-detail-overview")).toBeVisible();
    await expect(page.getByTestId("service-detail-help").locator("li")).toHaveCount(2);
    await expect(page.getByTestId("service-detail-other").locator("a")).toHaveCount(4);
    await page.getByTestId("service-detail-other").locator('a[href$="/commercial"]').focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/${locale}/services/commercial$`));
    await page.goBack({ waitUntil: "domcontentloaded" });

    for (const theme of ["light", "dark"] as const) {
      await selectTheme(page, theme);
      if (theme === "dark") await expect(page.locator("html")).toHaveClass(/dark/);
      else await expect(page.locator("html")).not.toHaveClass(/dark/);
      await expectNoOverflow(page);
    }
  }

  await page.goto("/ar/services/criminal", { waitUntil: "domcontentloaded" });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hhlawyer.ae/ar/services/criminal");
  await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute("href", "https://hhlawyer.ae/ar/services/criminal");
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", "https://hhlawyer.ae/en/services/criminal");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://hhlawyer.ae/ar/services/criminal");
  expect(errors).toEqual([]);
});

test("Service detail remains legible and actionable on mobile with reduced motion", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const locale of ["ar", "en"] as const) {
    for (const width of [360, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/${locale}/services/notary`, { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("service-detail-hero")).toBeVisible();
      await page.getByTestId("service-detail-other").scrollIntoViewIfNeeded();
      await expect(page.getByTestId("service-detail-other").locator("a").first()).toBeVisible();
      await page.getByTestId("service-detail-cta").scrollIntoViewIfNeeded();
      await expect(page.getByTestId("service-detail-cta").getByRole("link")).toBeVisible();
      await expectNoOverflow(page);
    }
  }
  expect(errors).toEqual([]);
});

test("Service details localize Arabic interface copy, map each slug to its own visual, and keep light surfaces light", async ({ page }) => {
  const slugs = ["criminal", "commercial", "civil", "notary", "taxes"];
  const sources = new Set<string>();
  await page.setViewportSize({ width: 1440, height: 920 });
  for (const slug of slugs) {
    await page.goto(`/ar/services/${slug}`, { waitUntil: "domcontentloaded" });
    const mainText = await page.getByTestId("service-detail-hero").locator("xpath=..").innerText();
    expect(mainText).not.toMatch(/\b(Service|Overview|Practice Area|How We Can Help|Other Services|Preparation|Next Step|Back to Services)\b/);
    const source = await page.getByTestId("service-detail-image").getAttribute("data-service-source");
    expect(source).toBe(`/images/services/${slug}.png`);
    sources.add(source ?? "");
  }
  expect(sources.size).toBe(5);
  await page.goto("/en/services/criminal", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("service-detail-hero").locator("xpath=..")).toContainText("Legal practice dossier");
  expect(await page.getByTestId("service-detail-help").innerText()).not.toMatch(/[\u0600-\u06FF]/);
  await page.goto("/ar/services/criminal", { waitUntil: "domcontentloaded" });
  for (const testId of ["service-detail-hero", "service-detail-overview", "service-detail-help", "service-detail-prepare", "service-detail-cta"]) {
    const background = await page.getByTestId(testId).evaluate((element) => `${getComputedStyle(element).backgroundColor} ${getComputedStyle(element).backgroundImage}`);
    expect(background).not.toMatch(/33, 26, 21|30, 23, 19|21, 17, 14|13, 10, 9/);
  }
});
