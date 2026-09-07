import { expect, test, type Page } from "@playwright/test";

const widths = [1440, 1280, 1024, 768, 430, 390, 360] as const;
const now = "2026-09-07T08:00:00.000Z";
const consultation = {
  id: "admin-foundation-consultation",
  referenceNumber: "CONS-2026-000001",
  name: "Foundation Test Client",
  email: "foundation@example.test",
  phone: "+971501234567",
  preferredDate: "2026-09-08T12:00:00.000Z",
  preferredTime: "09:00 AM",
  status: "PENDING",
  createdAt: now,
  updatedAt: now,
  message: "Foundation layout test message.",
  service: { id: "foundation-service", slug: "criminal", name: "Criminal Law" },
} as const;

async function mockAdminApi(page: Page) {
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const data = path.endsWith("/auth/me")
      ? { user: { id: "foundation-admin", name: "Foundation Admin", email: "admin@example.test", role: "ADMIN" } }
      : path.endsWith(`/admin/consultations/${consultation.id}`)
        ? consultation
        : path.endsWith("/admin/consultations")
          ? { items: [consultation], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } }
          : path.endsWith("/admin/overview")
            ? {
                authenticated: true,
                period: { range: url.searchParams.get("range") ?? "30d", startsAt: "2026-08-08T08:00:00.000Z", endsAt: now },
                consultations: { total: 1, periodTotal: 1, byStatus: { PENDING: 1, CONFIRMED: 0, RESCHEDULED: 0, COMPLETED: 0, CANCELLED: 0 } },
                contacts: { total: 1, periodTotal: 1, unread: 1, byStatus: { UNREAD: 1, READ: 0, REPLIED: 0, ARCHIVED: 0 } },
                services: { total: 1, active: 1, inactive: 0 },
                users: { total: 1, active: 1, inactive: 0, byRole: { ADMIN: 1, LAWYER: 0, STAFF: 0 } },
                recentConsultations: [consultation],
                recentContacts: [],
                recentActivity: [],
              }
            : path.endsWith("/services")
              ? [{ id: "foundation-service", slug: "criminal", name: "Criminal Law", description: "Test service", sortOrder: 1 }]
              : null;

    if (data === null) {
      await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ success: false, error: { code: "NOT_FOUND", message: "Not found" } }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data }) });
  });
}

async function assertAdminBoundary(page: Page, locale: "ar" | "en") {
  await expect(page.locator("[data-admin-root]")).toBeVisible();
  await expect(page.locator("[data-public-header], [data-public-footer]")).toHaveCount(0);
  await expect(page.getByTestId("brand-logo-header")).toHaveCount(0);
  await expect(page.getByTestId("brand-logo-footer")).toHaveCount(0);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("main#admin-main")).toHaveCount(1);
  await expect(page.locator('a[href="#admin-main"]')).toHaveText(locale === "ar" ? "انتقل إلى المحتوى الرئيسي" : "Skip to main content");
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
}

test("public routes retain public chrome while Admin login owns a separate boundary", async ({ page }) => {
  await page.goto("/ar");
  await expect(page.locator("header[data-public-header='true']")).toBeVisible();
  await expect(page.locator("footer[data-public-footer='true']")).toBeVisible();
  await expect(page.getByTestId("brand-logo-header")).toBeVisible();
  await expect(page.getByTestId("brand-logo-footer")).toBeVisible();
  await expect(page.locator("main#public-main")).toHaveCount(1);

  await page.goto("/ar/admin/login");
  await assertAdminBoundary(page, "ar");
  const skip = page.locator('a[href="#admin-main"]');
  await skip.focus();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#admin-main")).toBeFocused();
});

test("Admin foundation resolves light, dark, and system themes", async ({ page }) => {
  await page.goto("/en/admin/login");
  for (const theme of ["light", "dark"] as const) {
    await page.evaluate((value) => localStorage.setItem("hhlawyer-theme", value), theme);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(theme === "dark" ? /dark/ : /^(?!.*\bdark\b)/);
    const canvas = await page.locator("[data-admin-root]").evaluate((element) => getComputedStyle(element).getPropertyValue("--admin-canvas").trim());
    expect(canvas).toBe(theme === "dark" ? "#141210" : "#f3efe8");
  }

  await page.emulateMedia({ colorScheme: "dark" });
  await page.evaluate(() => localStorage.setItem("hhlawyer-theme", "system"));
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await assertAdminBoundary(page, "en");
});

for (const locale of ["ar", "en"] as const) {
  for (const route of [
    "/admin/login",
    "/admin",
    "/admin/consultations",
    `/admin/consultations/${consultation.id}`,
  ]) {
    test(`${locale.toUpperCase()} ${route} keeps the Admin foundation safe at every target width`, async ({ page }) => {
      await mockAdminApi(page);
      await page.goto(`/${locale}${route}`);
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        await assertAdminBoundary(page, locale);
        const dimensions = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }));
        expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
        const main = await page.locator("main#admin-main").boundingBox();
        expect(main).not.toBeNull();
        expect(main!.x).toBeGreaterThanOrEqual(0);
        expect(main!.x + main!.width).toBeLessThanOrEqual(width + 1);
      }
    });
  }
}
