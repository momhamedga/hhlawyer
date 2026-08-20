import { expect, test, type Page } from "@playwright/test";

const destinations = ["/", "/services", "/guides", "/about", "/consultation", "/contact"] as const;
const mobileWidths = [360, 375, 390, 430] as const;

function localizedPath(locale: "ar" | "en", destination: string) {
  return destination === "/" ? `/${locale}` : `/${locale}${destination}`;
}

function sourcePath(locale: "ar" | "en", destination: string) {
  return localizedPath(locale, destination === "/" ? "/services" : "/");
}

async function openMobileMenu(page: Page) {
  const trigger = page.getByTestId("public-mobile-menu-trigger");
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return { dialog, trigger };
}

async function expectMobilePanelFits(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const dialog = page.getByRole("dialog");
  expect(await dialog.evaluate((element) => Math.round(element.getBoundingClientRect().width) === window.innerWidth)).toBe(true);
  await expect(dialog.locator("nav a")).toHaveCount(6);
  await expect(dialog.locator('a[href^="tel:"]')).toBeVisible();
  await expect(dialog.locator('a[href^="mailto:"]')).toBeVisible();
  await expect(dialog.getByTestId("mobile-theme-trigger")).toBeVisible();
}

test("mobile menu Link navigation completes for every Arabic and English public destination", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const locale of ["ar", "en"] as const) {
    for (const destination of destinations) {
      const target = localizedPath(locale, destination);
      await page.goto(sourcePath(locale, destination));
      const { dialog } = await openMobileMenu(page);
      await expect(dialog).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
      await expectMobilePanelFits(page);
      await dialog.locator(`a[href="${target}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${target.replaceAll("/", "\\/")}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(dialog).toBeHidden();
    }

    await page.goto(`/${locale}`);
    const { dialog } = await openMobileMenu(page);
    await dialog.locator(`a[href="/${locale}/consultation#consultation"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/consultation#consultation$`));
    await expect(dialog).toBeHidden();
  }
});

test("mobile menu preserves close, focus, theme, and viewport behavior", async ({ page }) => {
  for (const [locale, theme] of [["ar", "light"], ["ar", "dark"], ["en", "light"], ["en", "dark"]] as const) {
    for (const width of mobileWidths) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/${locale}`);
      const { dialog, trigger } = await openMobileMenu(page);
      await page.getByTestId("mobile-theme-trigger").click();
      await page.getByTestId(`mobile-theme-option-${theme}`).click();
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      await expect(dialog).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
      await expectMobilePanelFits(page);
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    }
  }
});

test("clean browser has no application hydration error or extension body attribute", async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const hydrationConsoleErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    consoleErrors.push(message.text());
    if (/hydration|hydrated|didn't match|did not match/i.test(message.text())) hydrationConsoleErrors.push(message.text());
  });

  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect.poll(() => pageErrors).toEqual([]);
  await expect.poll(() => consoleErrors).toEqual([]);
  await expect.poll(() => hydrationConsoleErrors).toEqual([]);
  expect(await page.locator("body").getAttribute("cz-shortcut-listen")).toBeNull();
});
