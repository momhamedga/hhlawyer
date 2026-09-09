import { expect, test, type Page } from "@playwright/test";

async function setTheme(page: Page, theme: "light" | "dark" | "system") {
  await page.getByTestId("public-theme-trigger").click();
  await page.getByTestId(`public-theme-option-${theme}`).click();
}

test("homepage Team content is bilingual, local, semantic, and unique", async ({ page }) => {
  for (const locale of ["ar", "en"] as const) {
    await page.goto(`/${locale}`);
    const section = page.getByTestId("homepage-team");
    await expect(section).toHaveCount(1);
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("heading", { level: 2, name: locale === "ar" ? "فريق العمل" : "Our Team" })).toBeVisible();
    await expect(section.getByRole("heading", { level: 3, name: locale === "ar" ? "حسين الحارثي" : "Hussein Alharathi" })).toBeVisible();
    await expect(section.getByRole("heading", { level: 3, name: locale === "ar" ? "المستشار مصطفى منصور" : "Mostafa Mansour" })).toBeVisible();
    await expect(section.getByText(locale === "ar" ? "محامٍ وكاتب عدل خاص" : "Lawyer & Private Notary", { exact: true })).toBeVisible();
    await expect(section.getByText(locale === "ar" ? "مستشار قانوني" : "Legal Consultant", { exact: true })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");

    const expectedSources = ["/Hussein-Alharathi-2.webp", "/mostafa.webp"];
    for (let index = 0; index < expectedSources.length; index += 1) {
      const figure = section.locator("figure").nth(index);
      await expect(figure).toHaveAttribute("data-portrait-source", expectedSources[index]);
      const image = figure.locator("img");
      await figure.scrollIntoViewIfNeeded();
      await expect(image).toBeVisible();
      await expect.poll(() => image.evaluate((element) => {
        const portrait = element as HTMLImageElement;
        return portrait.complete && portrait.naturalWidth > 0 && portrait.naturalHeight > 0;
      })).toBe(true);
      expect(await image.evaluate((element) => {
        const portrait = element as HTMLImageElement;
        return {
          height: portrait.getBoundingClientRect().height,
          naturalHeight: portrait.naturalHeight,
          naturalWidth: portrait.naturalWidth,
          sameOrigin: new URL(portrait.currentSrc).origin === location.origin,
          source: portrait.currentSrc,
          width: portrait.getBoundingClientRect().width,
        };
      })).toMatchObject({ naturalHeight: expect.any(Number), naturalWidth: expect.any(Number), sameOrigin: true, source: expect.stringContaining("/_next/image") });
    }
  }
});

test("homepage Team follows light, dark, and resolved system themes", async ({ page }) => {
  for (const scenario of [
    { scheme: "dark" as const, theme: "light" as const, resolved: "light" },
    { scheme: "light" as const, theme: "dark" as const, resolved: "dark" },
    { scheme: "light" as const, theme: "system" as const, resolved: "light" },
    { scheme: "dark" as const, theme: "system" as const, resolved: "dark" },
  ]) {
    await page.emulateMedia({ colorScheme: scenario.scheme });
    await page.goto("/en");
    await setTheme(page, scenario.theme);
    const section = page.getByTestId("homepage-team");
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    if (scenario.resolved === "dark") await expect(page.locator("html")).toHaveClass(/dark/);
    else await expect(page.locator("html")).not.toHaveClass(/dark/);
    const colors = await section.evaluate((element) => ({ background: getComputedStyle(element).backgroundColor, color: getComputedStyle(element).color }));
    expect(colors.background).not.toBe(colors.color);
  }
});

test("homepage Team reflows without overflow at every approved width", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 1280, 1024, 768, 430, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(width === 390 ? "/ar" : "/en");
    const section = page.getByTestId("homepage-team");
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    const cards = section.locator("article");
    await expect(cards).toHaveCount(2);
    const first = await cards.nth(0).boundingBox();
    const second = await cards.nth(1).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    if (width <= 430) expect(Math.abs(first!.x - second!.x)).toBeLessThanOrEqual(1);
    else expect(Math.abs(first!.y - second!.y)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
