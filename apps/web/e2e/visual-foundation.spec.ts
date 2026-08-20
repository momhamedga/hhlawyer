import { expect, test } from "@playwright/test";

const pages = ["/ar", "/en", "/ar/services", "/en/services", "/ar/consultation", "/en/contact"] as const;

test("Modern Trust public routes keep semantic surfaces, locale attributes, themes, and mobile width", async ({ page }) => {
  for (const viewport of [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 768, height: 900 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    for (const path of pages) {
      const errors: string[] = [];
      page.once("pageerror", (error) => errors.push(error.message));
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("class", /font-(arabic|english)/);
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      expect(errors).toEqual([]);
    }
  }
  await page.goto("/en");
  await page.getByTestId("public-theme-trigger").click();
  await page.getByTestId("public-theme-option-dark").click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
});

test("Modern Trust admin shell keeps locale-safe navigation and horizontal table access", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ar/admin/login");
  await expect(page.locator("header[data-admin-shell='true']")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goto("/en/admin/login");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator("header[data-admin-shell='true']")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
