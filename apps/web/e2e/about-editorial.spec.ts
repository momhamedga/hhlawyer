import { expect, test } from "@playwright/test";

const majorSurfaces = ["about-hero", "about-story", "about-philosophy", "about-portrait-moment", "about-uae", "about-practice-links", "about-cta"];

async function selectTheme(page: import("@playwright/test").Page, theme: "light" | "dark") {
  await page.getByTestId("public-theme-trigger").click();
  await page.getByTestId(`public-theme-option-${theme}`).click();
}

async function expectNoOverflow(page: import("@playwright/test").Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test("About is a bilingual founder-led editorial profile with real founder assets and live routes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  for (const locale of ["ar", "en"] as const) {
    await page.setViewportSize({ width: 1440, height: 920 });
    await page.goto(`/${locale}/about`, { waitUntil: "domcontentloaded" });
    await selectTheme(page, "light");
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    await expect(page.getByTestId("about-hero")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByTestId("about-hero").locator("[data-founder-source]")).toHaveAttribute("data-founder-source", "/Hussein-Alharathi-1.webp");
    await expect(page.getByTestId("about-portrait-moment").locator("[data-founder-source]")).toHaveAttribute("data-founder-source", "/Hussein-Alharathi-2.webp");
    await expect.poll(() => page.getByTestId("about-hero").locator("img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.getByTestId("about-portrait-moment").scrollIntoViewIfNeeded();
    await expect.poll(() => page.getByTestId("about-portrait-moment").locator("img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(page.getByTestId("about-practice-links").locator("a")).toHaveCount(5);
    await expect(page.getByTestId("about-practice-links").locator("a").first()).toHaveAttribute("href", new RegExp(`^/${locale}/services/`));
    await expect(page.getByTestId("about-cta").getByRole("link")).toHaveAttribute("href", `/${locale}/consultation#consultation`);
    await expectNoOverflow(page);

    const pageText = await page.getByTestId("about-hero").locator("xpath=..").innerText();
    if (locale === "ar") expect(pageText).not.toMatch(/Practice approach|Editorial note|View service|Request a consultation/);
    else expect(pageText).not.toMatch(/مجالات الممارسة|ملاحظة تحريرية|عرض الخدمة|اطلب استشارة/);

    for (const testId of majorSurfaces) {
      const surface = await page.getByTestId(testId).evaluate((element) => `${getComputedStyle(element).backgroundColor} ${getComputedStyle(element).backgroundImage}`);
      expect(surface).not.toMatch(/33, 26, 21|30, 23, 19|21, 17, 14|13, 10, 9/);
    }
  }
  expect(errors).toEqual([]);
});

test("About renders the same editorial system in dark mode and honors reduced motion", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en/about", { waitUntil: "domcontentloaded" });
  await selectTheme(page, "dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  for (const testId of majorSurfaces) await expect(page.getByTestId(testId)).toBeVisible();
  await expect(page.getByTestId("about-philosophy").locator("li")).toHaveCount(3);
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test("About remains usable without overflow on mobile widths", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const locale of ["ar", "en"] as const) {
    for (const width of [360, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/${locale}/about`, { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("about-hero")).toBeVisible();
      await page.getByTestId("about-cta").scrollIntoViewIfNeeded();
      await expect(page.getByTestId("about-cta").getByRole("link")).toBeVisible();
      await expectNoOverflow(page);
    }
  }
  expect(errors).toEqual([]);
});

test("About metadata remains canonical to the official bilingual production domain", async ({ page }) => {
  await page.goto("/ar/about", { waitUntil: "domcontentloaded" });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hhlawyer.ae/ar/about");
  await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute("href", "https://hhlawyer.ae/ar/about");
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", "https://hhlawyer.ae/en/about");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://hhlawyer.ae/ar/about");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /عن المحامي/);
  await page.goto("/en/about", { waitUntil: "domcontentloaded" });
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /About the Attorney/);
});
