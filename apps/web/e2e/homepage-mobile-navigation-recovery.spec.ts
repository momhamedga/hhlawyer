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
  await expect(dialog.getByTestId("mobile-theme-inline")).toBeVisible();
  await expect(dialog.getByTestId("mobile-theme-trigger")).toHaveCount(0);
  await expect(dialog.getByTestId(/mobile-theme-option-/)).toHaveCount(3);
  for (const option of await dialog.getByTestId(/mobile-theme-option-/).all()) {
    expect(await option.evaluate((element) => element.getBoundingClientRect().height >= 44)).toBe(true);
  }
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

test("mobile menu keeps the inline theme selector accessible, persistent, and within the viewport", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") runtimeErrors.push(message.text()); });

  for (const locale of ["ar", "en"] as const) {
    for (const width of mobileWidths) {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto(`/${locale}`);
      const { dialog } = await openMobileMenu(page);
      await expect(dialog.getByText(locale === "ar" ? "المظهر" : "Appearance", { exact: true })).toBeVisible();
      await expectMobilePanelFits(page);

      const light = dialog.getByTestId("mobile-theme-option-light");
      await light.focus();
      await page.keyboard.press("Enter");
      await expect(light).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("html")).not.toHaveClass(/dark/);
      await expect.poll(() => page.evaluate(() => localStorage.getItem("hhlawyer-theme"))).toBe("light");
      await expect(dialog).toBeVisible();
      await expect(light).toBeFocused();

      const dark = dialog.getByTestId("mobile-theme-option-dark");
      await dark.click();
      await expect(dark).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("html")).toHaveClass(/dark/);

      const system = dialog.getByTestId("mobile-theme-option-system");
      await system.click();
      await expect(system).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator("html")).toHaveClass(/dark/);
      await expect.poll(() => page.evaluate(() => localStorage.getItem("hhlawyer-theme"))).toBe("system");
      await page.emulateMedia({ colorScheme: "light" });
      await expect(page.locator("html")).not.toHaveClass(/dark/);
      await expect(dialog).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
      await expectMobilePanelFits(page);
      await page.reload();
      await expect(page.locator("html")).not.toHaveClass(/dark/);
      const reloaded = await openMobileMenu(page);
      await expect(reloaded.dialog).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
      await expectMobilePanelFits(page);
      await page.keyboard.press("Escape");
      await expect(reloaded.dialog).toBeHidden();
      await expect(reloaded.trigger).toBeFocused();
    }
  }

  expect(runtimeErrors).toEqual([]);
});

test("mobile inline theme selector supports touch without closing the navigation dialog", async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto("/ar");
    const { dialog } = await openMobileMenu(page);
    await dialog.getByTestId("mobile-theme-option-dark").tap();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(dialog).toBeVisible();
    await expectMobilePanelFits(page);
  } finally {
    await context.close();
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
