import { expect, test, type Page } from "@playwright/test";

type Theme = "light" | "dark" | "system";

async function openPreview(page: Page, locale: "ar" | "en", theme: Theme, colorScheme: "light" | "dark" = "light") {
  await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
  await page.addInitScript((selectedTheme) => localStorage.setItem("hhlawyer-theme", selectedTheme), theme);
  await page.goto(`/${locale}/design-preview/02/admin`);
  const trigger = page.getByTestId("design-preview-status-filter");
  await expect(trigger).toBeVisible();
  return trigger;
}

test("shared Select exposes branded listbox semantics and complete keyboard operation", async ({ page }) => {
  const trigger = await openPreview(page, "en", "light");
  await expect(trigger).toHaveRole("combobox");
  await expect(trigger).toHaveAttribute("aria-label", "Filter status");
  expect((await trigger.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await expect(page.locator("select:visible")).toHaveCount(0);

  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const listbox = page.getByRole("listbox");
  await expect(listbox).toBeVisible();
  await expect(page.getByRole("option")).toHaveCount(4);
  await expect(page.getByRole("option", { name: "All", exact: true })).toHaveAttribute("aria-selected", "true");
  expect(await listbox.evaluate((node) => document.body.contains(node))).toBe(true);
  expect(await trigger.evaluate((node) => node.parentElement?.contains(document.querySelector('[role="listbox"]')) ?? false)).toBe(false);

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("data-value", "In review");
  await expect(trigger).toContainText("In review");

  await trigger.press("ArrowDown");
  await expect(listbox).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(listbox).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("Select follows locale direction and light, dark, and real system themes", async ({ page }) => {
  for (const scenario of [
    { locale: "ar" as const, theme: "light" as const, scheme: "dark" as const, resolved: "light" },
    { locale: "ar" as const, theme: "dark" as const, scheme: "light" as const, resolved: "dark" },
    { locale: "en" as const, theme: "system" as const, scheme: "light" as const, resolved: "light" },
    { locale: "en" as const, theme: "system" as const, scheme: "dark" as const, resolved: "dark" },
  ]) {
    const trigger = await openPreview(page, scenario.locale, scenario.theme, scenario.scheme);
    await expect(page.locator("html")).toHaveAttribute("dir", scenario.locale === "ar" ? "rtl" : "ltr");
    if (scenario.resolved === "dark") await expect(page.locator("html")).toHaveClass(/dark/);
    else await expect(page.locator("html")).not.toHaveClass(/dark/);

    await trigger.click();
    const option = page.getByRole("option").first();
    await expect(option).toBeVisible();
    expect(await option.evaluate((node) => getComputedStyle(node).direction)).toBe(scenario.locale === "ar" ? "rtl" : "ltr");
    const colors = await page.getByRole("listbox").evaluate((node) => {
      const surface = node.closest('[data-radix-select-content]') ?? node;
      const style = getComputedStyle(surface);
      return { background: style.backgroundColor, color: style.color };
    });
    expect(colors.background).not.toBe("rgba(0, 0, 0, 0)");
    expect(colors.color).not.toBe(colors.background);
    await page.keyboard.press("Escape");
  }
});

test("open dropdown remains collision-safe at 1024, 768, 430, 390, and 360 pixel widths", async ({ page }) => {
  for (const width of [1024, 768, 430, 390, 360]) {
    await page.setViewportSize({ width, height: 780 });
    const trigger = await openPreview(page, width === 390 ? "ar" : "en", width === 430 ? "light" : "dark", "dark");
    await trigger.click();
    const content = page.getByRole("listbox").locator("..");
    const box = await content.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.keyboard.press("Escape");
  }
});
