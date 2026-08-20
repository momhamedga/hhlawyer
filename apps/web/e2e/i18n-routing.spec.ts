import { expect, test } from "@playwright/test";

test("locale routes redirect, switch direction, font, and preserve the equivalent public route", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/ar$/);
  await expect.poll(() => page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir }))).toEqual({ lang: "ar", dir: "rtl" });

  await page.goto("/ar/services");
  const englishSwitcher = page.locator("header").getByRole("link", { name: "Switch to English" });
  await expect(englishSwitcher).toHaveAttribute("href", "/en/services");
  await englishSwitcher.focus();
  await englishSwitcher.press("Enter");
  await expect(page).toHaveURL(/\/en\/services$/);
  await expect.poll(() => page.evaluate(() => ({ lang: document.documentElement.lang, dir: document.documentElement.dir, font: document.documentElement.classList.contains("font-english") }))).toEqual({ lang: "en", dir: "ltr", font: true });
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Home" })).toBeVisible();

  const arabicSwitcher = page.locator("header").getByRole("link", { name: "التبديل إلى العربية" });
  await expect(arabicSwitcher).toHaveAttribute("href", "/ar/services");
  await arabicSwitcher.focus();
  await arabicSwitcher.press("Enter");
  await expect(page).toHaveURL(/\/ar\/services$/);
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("font-arabic"))).toBe(true);
});
