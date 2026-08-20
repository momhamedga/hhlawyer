import { expect, test } from "@playwright/test";

const directions = ["01", "02", "03"] as const;

test("three isolated directions render public and admin previews in Arabic and English", async ({ page }) => {
  for (const locale of ["ar", "en"] as const) {
    for (const direction of directions) {
      for (const suffix of ["", "/admin"] as const) {
        const errors: string[] = [];
        page.once("pageerror", (error) => errors.push(error.message));
        await page.goto(`/${locale}/design-preview/${direction}${suffix}`);
        await expect(page.getByTestId(`design-preview-${direction}${suffix ? "-admin" : ""}`)).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
        await expect(page.locator("html")).toHaveClass(locale === "ar" ? /font-arabic/ : /font-english/);
        expect(errors).toEqual([]);
      }
    }
  }
});

test("preview routes support theme changes, safe filters, and mobile without document overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const direction of directions) {
    await page.goto(`/ar/design-preview/${direction}`);
    await expect(page.getByTestId(`design-preview-${direction}`)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto("/en/design-preview/02/admin");
  await page.getByTestId("preview-theme-dark").click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByLabel("Search matters").fill("C-2048");
  await expect(page.getByText("Commercial consultation")).toBeVisible();
  await page.getByLabel("Filter status").selectOption("In review");
  await expect(page.getByText("Commercial consultation")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByTestId("preview-theme-light").click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});
