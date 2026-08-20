import { expect, test, type Page } from "@playwright/test";

async function expectTheme(page: Page, theme: "light" | "dark") {
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(theme === "dark");
}

test("Modern Trust theme controls support light, dark, system, keyboard use, and persistence", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByTestId("public-theme-trigger").click();
  await expect(page.getByTestId("public-theme-option-light")).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.dir)).toBe("rtl");
  const typography = await page.evaluate(() => {
    const cairoFont = getComputedStyle(document.documentElement).getPropertyValue("--font-cairo").trim();
    return { bodyFont: getComputedStyle(document.body).fontFamily, cairoFont };
  });
  expect(typography.cairoFont).not.toBe("");
  expect(typography.bodyFont).toContain(typography.cairoFont.replaceAll('"', "").split(",")[0]);
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");

  const dark = page.getByTestId("public-theme-option-dark");
  await dark.focus();
  await expect(dark).toBeFocused();
  await page.keyboard.press("Enter");
  await expectTheme(page, "dark");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("hhlawyer-theme"))).toBe("dark");

  await page.reload();
  await expectTheme(page, "dark");

  await page.getByTestId("public-theme-trigger").click();
  await page.getByTestId("public-theme-option-light").click();
  await expectTheme(page, "light");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("hhlawyer-theme"))).toBe("light");
  await page.reload();
  await expectTheme(page, "light");

  await page.emulateMedia({ colorScheme: "dark" });
  await page.getByTestId("public-theme-trigger").click();
  await page.getByTestId("public-theme-option-system").click();
  await expectTheme(page, "dark");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("hhlawyer-theme"))).toBe("system");
  await page.reload();
  await expectTheme(page, "dark");

  await page.emulateMedia({ colorScheme: "light" });
  await expectTheme(page, "light");

  await page.goto("/admin/login");
  await page.getByTestId("admin-theme-trigger").click();
  await expect(page.getByTestId("admin-theme-option-dark")).toBeVisible();
  await page.getByTestId("admin-theme-option-dark").click();
  await expectTheme(page, "dark");
  await expect(page.getByRole("heading", { name: "دخول الإدارة" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => Object.keys(localStorage).sort())).toEqual(["hhlawyer-theme"]);
  await expect.poll(() => page.evaluate(() => Object.keys(sessionStorage))).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});
