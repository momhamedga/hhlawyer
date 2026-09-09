import { expect, test } from "@playwright/test";

async function selectTheme(page: import("@playwright/test").Page, value: "dark" | "light" | "system") {
  await page.getByTestId("public-theme-trigger").click();
  await page.getByTestId(`public-theme-option-${value}`).click();
}

async function expectOfficialLogos(page: import("@playwright/test").Page, locale: "ar" | "en", theme: "dark" | "light") {
  const source = `/images/logo-${locale}-${theme}-transparent.webp`;
  await expect(page.getByTestId("brand-logo-header")).toHaveAttribute("data-logo-source", source);
  await expect(page.getByTestId("brand-logo-footer")).toHaveAttribute("data-logo-source", source);
}

async function expectMobilePanelSafety(page: import("@playwright/test").Page, dialog: import("@playwright/test").Locator) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for (const locator of [dialog.getByRole("link", { name: /consultation|استشارة/i }), dialog.locator("nav a"), dialog.locator('a[href^="tel:"]'), dialog.locator('a[href^="mailto:"]')]) {
    const count = await locator.count();
    for (let index = 0; index < count; index += 1) {
      const box = await locator.nth(index).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual((await page.viewportSize())!.width);
    }
  }
}

test("editorial public redesign keeps images, service index, theme, locale, and mobile layout usable", async ({ page }) => {
  for (const viewport of [{ width: 360, height: 800 }, { width: 375, height: 800 }, { width: 390, height: 844 }, { width: 430, height: 844 }, { width: 768, height: 900 }, { width: 1024, height: 900 }, { width: 1280, height: 900 }, { width: 1440, height: 900 }, { width: 1920, height: 1000 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/ar");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("homepage-services-index").locator("a").first()).toBeVisible();
    await expect(page.getByTestId("homepage-founder")).toBeVisible();
    await expect(page.getByTestId("homepage-team")).toBeVisible();
    await expect(page.getByTestId("homepage-uae-presence")).toBeVisible();
    await expect(page.getByTestId("homepage-legal-journey")).toBeVisible();
    await expect(page.getByAltText("هندسة مكتب قانوني معاصر")).toBeVisible();
    await expect(page.getByAltText("محامٍ في مكتب معاصر")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await selectTheme(page, "dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await selectTheme(page, "light");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("homepage editorial motion remains accessible with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  for (const testId of ["homepage-services-index", "homepage-founder", "homepage-team", "homepage-uae-presence", "homepage-legal-journey"]) {
    const section = page.getByTestId(testId);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("homepage daylight treatment and production SEO origin remain distinct and canonical", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");
  await selectTheme(page, "light");
  const sections = ["homepage-hero", "homepage-legal-journey", "homepage-final-cta"] as const;
  const lightBackgrounds = await Promise.all(sections.map((testId) => page.getByTestId(testId).evaluate((element) => getComputedStyle(element).backgroundImage)));

  await selectTheme(page, "dark");
  const darkBackgrounds = await Promise.all(sections.map((testId) => page.getByTestId(testId).evaluate((element) => getComputedStyle(element).backgroundImage)));
  expect(darkBackgrounds).not.toEqual(lightBackgrounds);

  await page.goto("/ar");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hhlawyer.ae/ar");
  await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute("href", "https://hhlawyer.ae/ar");
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", "https://hhlawyer.ae/en");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://hhlawyer.ae/ar");

  const sitemap = await page.request.get("/sitemap.xml");
  await expect(sitemap).toBeOK();
  expect(await sitemap.text()).toContain("https://hhlawyer.ae/ar");
  expect(await sitemap.text()).not.toContain("/admin");
  const robots = await page.request.get("/robots.txt");
  await expect(robots).toBeOK();
  expect(await robots.text()).toContain("Sitemap: https://hhlawyer.ae/sitemap.xml");

  await page.goto("/ar/admin/login");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("official locale and resolved-theme logo matrix remains coherent", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ar");
  await selectTheme(page, "light");
  await expectOfficialLogos(page, "ar", "light");
  await page.getByTestId("public-theme-trigger").click();
  await expect(page.getByRole("menu")).toContainText("فاتح");
  await expect(page.getByRole("menu")).toContainText("داكن");
  await expect(page.getByRole("menu")).toContainText("النظام");
  await page.keyboard.press("Escape");
  await selectTheme(page, "dark");
  await expectOfficialLogos(page, "ar", "dark");

  await page.goto("/en");
  await selectTheme(page, "light");
  await expectOfficialLogos(page, "en", "light");
  await page.getByTestId("public-theme-trigger").click();
  await expect(page.getByRole("menu")).toContainText("Light");
  await expect(page.getByRole("menu")).toContainText("Dark");
  await expect(page.getByRole("menu")).toContainText("System");
  await page.keyboard.press("Escape");
  await selectTheme(page, "dark");
  await expectOfficialLogos(page, "en", "dark");

  await page.emulateMedia({ colorScheme: "light" });
  await selectTheme(page, "system");
  await expectOfficialLogos(page, "en", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expectOfficialLogos(page, "en", "dark");
  await expect(page.getByAltText("Hussein Al Harithi in legal attire")).toBeVisible();
});

test("homepage mobile menu opens, routes, closes, and restores trigger focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  const trigger = page.getByTestId("public-mobile-menu-trigger");
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expectMobilePanelSafety(page, dialog);
  const servicesLink = dialog.locator('a[href="/en/services"]');
  await servicesLink.scrollIntoViewIfNeeded();
  await servicesLink.click();
  await expect(page).toHaveURL(/\/en\/services$/);
  await expect(dialog).toBeHidden();
  await page.goBack();
  await trigger.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /close|إغلاق/i }).click();
  await expect(dialog).toBeHidden();
});

test("Arabic mobile menu is RTL, full-width, edge-safe, and closes predictably", async ({ page }) => {
  for (const width of [360, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/ar");
    const trigger = page.getByTestId("public-mobile-menu-trigger");
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveAttribute("dir", "rtl");
    expect(await dialog.evaluate((element) => Math.round(element.getBoundingClientRect().width) === window.innerWidth)).toBe(true);
    await expect(dialog.getByTestId("brand-logo-mobile")).toHaveAttribute("data-logo-source", /\/images\/logo-ar-(light|dark)-transparent\.webp$/);
    await expectMobilePanelSafety(page, dialog);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  }
});

test("remaining public editorial routes render without horizontal overflow or page errors", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  for (const width of [360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/ar/about");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of ["/en/services/criminal", "/ar/consultation", "/en/contact"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }

  await expect.poll(() => pageErrors).toEqual([]);
});

test("modern legal-tech workspace preserves admin controls and table access", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ar/admin/login");
  await expect(page.locator("header[data-admin-shell='true']")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goto("/en/admin/login");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});
