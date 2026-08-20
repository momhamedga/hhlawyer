import { expect, test, type Page } from "@playwright/test";

import { legalMatterFinderContent } from "../src/i18n/legal-matter-finder-content";
import { resolveLegalMatterFinder, type FinderAnswers } from "../src/lib/legal-matter-finder";

async function selectTheme(page: Page, theme: "light" | "dark") {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByTestId("public-theme-trigger").click();
  await page.getByTestId(`public-theme-option-${theme}`).click();
}

async function completeFinder(page: Page, answers: readonly string[]) {
  for (const answer of answers) await page.getByTestId(`finder-option-${answer}`).click();
}

test("typed finder rules cover every current service and keep choices privacy-safe", () => {
  const paths: ReadonlyArray<[FinderAnswers, string]> = [
    [{ nature: "criminal", focus: "understand", setting: "individual" }, "criminal"],
    [{ nature: "commercial", focus: "disagreement", setting: "business" }, "commercial"],
    [{ nature: "civil", focus: "documents", setting: "individual" }, "civil"],
    [{ nature: "notary", focus: "transaction", setting: "document" }, "notary"],
    [{ nature: "taxes", focus: "compliance", setting: "business" }, "taxes"],
  ];

  for (const [answers, expected] of paths) {
    expect(resolveLegalMatterFinder(answers)).toMatchObject({ kind: "recommendation", primary: expected });
  }
  expect(resolveLegalMatterFinder({ nature: "unsure", focus: "understand", setting: "individual" })).toEqual({ kind: "uncertain" });
  expect(resolveLegalMatterFinder({ nature: "criminal", focus: "unsure", setting: "individual" })).toEqual({ kind: "uncertain" });
  expect(resolveLegalMatterFinder({ nature: "criminal", focus: "understand", setting: "unclear" })).toEqual({ kind: "uncertain" });

  for (const locale of ["ar", "en"] as const) {
    expect(legalMatterFinderContent[locale].questions).toHaveLength(3);
    expect(JSON.stringify(legalMatterFinderContent[locale])).not.toMatch(/email address|phone number|case number|رقم القضية|البريد الإلكتروني|رقم الهاتف/i);
  }
});

test("Arabic finder resolves Criminal Law, uses the localized service title, and routes without query state", async ({ page }) => {
  await page.goto("/ar/find-your-service", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("legal-matter-finder")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ابدأ من مشكلتك");
  await completeFinder(page, ["criminal", "understand", "individual"]);

  const result = page.getByTestId("finder-result");
  await expect(result).toHaveAttribute("data-finder-result", "criminal");
  await expect(result.getByRole("heading", { level: 2 })).toHaveText("القانون الجنائي");
  await expect(page.getByTestId("finder-service-link")).toHaveAttribute("href", "/ar/services/criminal");
  await expect(page.getByTestId("finder-consultation-link")).toHaveAttribute("href", "/ar/consultation");
  await page.getByTestId("finder-service-link").click();
  await expect(page).toHaveURL(/\/ar\/services\/criminal$/);
});

test("English finder resolves commercial matter, exposes at most one related service, and routes to consultation", async ({ page }) => {
  await page.goto("/en/find-your-service", { waitUntil: "domcontentloaded" });
  await completeFinder(page, ["commercial", "compliance", "business"]);

  const result = page.getByTestId("finder-result");
  await expect(result).toHaveAttribute("data-finder-result", "commercial");
  await expect(result.getByRole("heading", { level: 2 })).toHaveText("Commercial and Corporate Law");
  await expect(result.locator("a[href='/en/services/taxes']")).toHaveCount(1);
  await expect(page.getByTestId("finder-consultation-link")).toHaveAttribute("href", "/en/consultation");
  await page.getByTestId("finder-consultation-link").click();
  await expect(page).toHaveURL(/\/en\/consultation$/);
});

test("remaining service paths and the uncertain path are deterministic", async ({ page }) => {
  for (const [answers, expected] of [
    [["civil", "documents", "individual"], "civil"],
    [["notary", "transaction", "document"], "notary"],
    [["taxes", "compliance", "business"], "taxes"],
  ] as const) {
    await page.goto("/en/find-your-service", { waitUntil: "domcontentloaded" });
    await completeFinder(page, answers);
    await expect(page.getByTestId("finder-result")).toHaveAttribute("data-finder-result", expected);
  }

  await page.goto("/en/find-your-service", { waitUntil: "domcontentloaded" });
  await completeFinder(page, ["unsure", "understand", "individual"]);
  await expect(page.getByTestId("finder-result")).toHaveAttribute("data-finder-result", "uncertain");
  await expect(page.getByTestId("finder-service-link")).toHaveCount(0);
  await expect(page.getByTestId("finder-consultation-link")).toHaveAttribute("href", "/en/consultation");
});

test("finder supports keyboard choice, back, restart, theme persistence, and intentional locale reset", async ({ page }) => {
  await page.goto("/en/find-your-service", { waitUntil: "domcontentloaded" });
  const commercial = page.getByTestId("finder-option-commercial");
  await commercial.focus();
  await commercial.press("Enter");
  await expect(page.getByTestId("finder-back")).toBeEnabled();
  await page.getByTestId("finder-back").click();
  await commercial.evaluate((button: HTMLButtonElement) => { button.click(); button.click(); button.click(); });
  await expect(page.getByTestId("finder-option-understand")).toBeVisible();
  await selectTheme(page, "dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByTestId("finder-back")).toBeEnabled();
  await page.getByTestId("finder-back").click();
  await expect(page.getByTestId("finder-option-commercial")).toBeVisible();
  await page.getByTestId("finder-restart").click();
  await expect(page.getByTestId("finder-back")).toBeDisabled();

  await page.locator("header").getByRole("link", { name: "التبديل إلى العربية" }).click();
  await expect(page).toHaveURL(/\/ar\/find-your-service$/);
  await expect(page.getByTestId("finder-back")).toBeDisabled();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("finder keeps interaction in memory and has no page or console errors", async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const interactionRequests: Array<{ method: string; type: string; url: string }> = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });

  await page.goto("/en/find-your-service", { waitUntil: "domcontentloaded" });
  const before = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, href: location.href }));
  page.on("request", (request) => interactionRequests.push({ method: request.method(), type: request.resourceType(), url: request.url() }));
  const notary = page.getByTestId("finder-option-notary");
  await notary.focus();
  await notary.press("Space");
  await completeFinder(page, ["transaction", "document"]);
  await expect(page.getByTestId("finder-result")).toHaveAttribute("data-finder-result", "notary");
  const after = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage }, href: location.href }));
  expect(after).toEqual(before);
  expect(interactionRequests.filter((request) => request.method !== "GET" || request.url.includes("/api/")).length).toBe(0);
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("finder teaser, metadata, responsive layout, and reduced motion are release-ready", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("homepage-matter-finder")).toBeVisible();
  await expect(page.getByTestId("homepage-matter-finder").locator("a")).toHaveAttribute("href", "/en/find-your-service");

  for (const [locale, theme] of [["ar", "light"], ["ar", "dark"], ["en", "light"], ["en", "dark"]] as const) {
    await page.goto(`/${locale}/find-your-service`, { waitUntil: "domcontentloaded" });
    await selectTheme(page, theme);
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    for (const width of [360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByTestId("finder-option-criminal")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/find-your-service", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-testid="legal-matter-finder"] section').last()).toHaveCSS("animation-name", "none");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hhlawyer.ae/en/find-your-service");
  await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute("href", "https://hhlawyer.ae/ar/find-your-service");
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", "https://hhlawyer.ae/en/find-your-service");
  const sitemap = await page.request.get("/sitemap.xml");
  await expect(sitemap).toBeOK();
  expect(await sitemap.text()).toContain("https://hhlawyer.ae/ar/find-your-service");
  expect(await sitemap.text()).toContain("https://hhlawyer.ae/en/find-your-service");
});
