import { expect, test, type Page } from "@playwright/test";

type Role = "ADMIN" | "LAWYER" | "STAFF";

const consultation = {
  id: "shell-consultation",
  referenceNumber: "CONS-2026-000321",
  name: "Shell Test Client",
  email: "shell-client@example.test",
  phone: "+971501234567",
  preferredDate: "2026-09-08T12:00:00.000Z",
  preferredTime: "09:00 AM",
  status: "PENDING",
  createdAt: "2026-09-07T08:00:00.000Z",
  updatedAt: "2026-09-07T08:00:00.000Z",
  message: "Shell navigation test.",
  service: { id: "shell-service", slug: "criminal", name: "Criminal Law" },
} as const;

const contact = {
  id: "shell-contact",
  name: "Shell Contact",
  email: "contact@example.test",
  subject: "Shell message",
  message: "Shell contact message.",
  status: "UNREAD",
  createdAt: "2026-09-07T08:00:00.000Z",
  updatedAt: "2026-09-07T08:00:00.000Z",
} as const;

const managedUser = {
  id: "shell-managed-user",
  name: "Managed Lawyer",
  email: "managed@example.test",
  role: "LAWYER",
  isActive: true,
  lockedUntil: null,
  lastLoginAt: null,
  createdAt: "2026-09-07T08:00:00.000Z",
  updatedAt: "2026-09-07T08:00:00.000Z",
} as const;

const managedService = {
  id: "shell-managed-service",
  slug: "criminal",
  name: "Criminal Law",
  description: "Shell service description.",
  isActive: true,
  sortOrder: 1,
  createdAt: "2026-09-07T08:00:00.000Z",
  updatedAt: "2026-09-07T08:00:00.000Z",
} as const;

async function mockAdminApi(page: Page, role: Role, options: { expired?: boolean; authDelay?: number } = {}) {
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (path.endsWith("/auth/me")) {
      if (options.authDelay) await new Promise((resolve) => setTimeout(resolve, options.authDelay));
      if (options.expired) {
        await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required." } }) });
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: { user: { id: `shell-${role.toLowerCase()}`, name: `Shell ${role}`, email: `${role.toLowerCase()}@example.test`, role } } }) });
      return;
    }

    if (path.endsWith("/auth/logout") && request.method() === "POST") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: { loggedOut: true } }) });
      return;
    }

    const data = path.endsWith(`/admin/consultations/${consultation.id}`)
      ? consultation
      : path.endsWith(`/admin/contacts/${contact.id}`)
        ? contact
        : path.endsWith(`/admin/users/${managedUser.id}`)
          ? managedUser
          : path.endsWith(`/admin/services/${managedService.id}`)
            ? managedService
      : path.endsWith("/admin/consultations")
        ? { items: [consultation], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } }
        : path.endsWith("/admin/contacts")
          ? { items: [contact], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } }
          : path.endsWith("/admin/overview")
            ? {
                authenticated: true,
                period: { range: "30d", startsAt: "2026-08-08T08:00:00.000Z", endsAt: "2026-09-07T08:00:00.000Z" },
                consultations: { total: 1, periodTotal: 1, byStatus: { PENDING: 1, CONFIRMED: 0, RESCHEDULED: 0, COMPLETED: 0, CANCELLED: 0 } },
                contacts: { total: 0, periodTotal: 0, unread: 0, byStatus: { UNREAD: 0, READ: 0, REPLIED: 0, ARCHIVED: 0 } },
                services: { total: 1, active: 1, inactive: 0 },
                users: { total: 1, active: 1, inactive: 0, byRole: { ADMIN: 1, LAWYER: 0, STAFF: 0 } },
                recentConsultations: [consultation],
                recentContacts: [],
                recentActivity: [],
              }
            : path.endsWith("/services")
              ? [{ id: "shell-service", slug: "criminal", name: "Criminal Law", description: "Test service", sortOrder: 1 }]
              : null;

    await route.fulfill({
      status: data === null ? 404 : 200,
      contentType: "application/json",
      body: JSON.stringify(data === null ? { success: false, error: { code: "NOT_FOUND", message: "Not found" } } : { success: true, data }),
    });
  });
}

function desktopNavigation(page: Page) {
  return page.getByTestId("admin-desktop-navigation");
}

test("ADMIN sees the complete IA, actual identity, and active detail hierarchy", async ({ page }) => {
  await mockAdminApi(page, "ADMIN");
  await page.goto(`/en/admin/consultations/${consultation.id}`);

  const navigation = desktopNavigation(page);
  for (const id of ["overview", "consultations", "messages", "team", "services"]) {
    await expect(navigation.locator(`[data-nav-id="${id}"]`)).toBeVisible();
  }
  await expect(navigation.locator('[data-nav-id="consultations"]')).toHaveAttribute("aria-current", "page");
  await expect(page.getByTestId("admin-sidebar-identity")).toContainText("Shell ADMIN");
  await expect(page.getByTestId("admin-sidebar-identity")).toContainText("Administrator");
  await expect(page.getByRole("navigation", { name: "Administration breadcrumb" })).toContainText(consultation.id);
  await expect(page.locator("main#admin-main")).toHaveCount(1);
});

test("LAWYER lands on consultations and sees only current readable operations", async ({ page }) => {
  await mockAdminApi(page, "LAWYER");
  await page.goto("/en/admin");
  await page.waitForURL("**/en/admin/consultations");

  const navigation = desktopNavigation(page);
  await expect(navigation.locator('[data-nav-id="consultations"]')).toBeVisible();
  await expect(navigation.locator('[data-nav-id="messages"]')).toBeVisible();
  await expect(navigation.locator('[data-nav-id="overview"], [data-nav-id="team"], [data-nav-id="services"]')).toHaveCount(0);
  await expect(page.getByTestId("admin-sidebar-identity")).toContainText("Lawyer");
});

test("STAFF lands on localized consultations with the Staff identity and safe matrix", async ({ page }) => {
  await mockAdminApi(page, "STAFF");
  await page.goto("/ar/admin");
  await page.waitForURL("**/ar/admin/consultations");

  const navigation = desktopNavigation(page);
  await expect(navigation.getByRole("link", { name: "طلبات الاستشارة" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "الرسائل" })).toBeVisible();
  await expect(navigation.locator('[data-nav-id="overview"], [data-nav-id="team"], [data-nav-id="services"]')).toHaveCount(0);
  await expect(page.getByTestId("admin-sidebar-identity")).toContainText("موظف");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("account controls preserve detail route and query when switching locale and persist theme", async ({ page }) => {
  await mockAdminApi(page, "ADMIN");
  await page.goto(`/en/admin/consultations/${consultation.id}?status=PENDING&sort=desc`);
  await page.getByTestId("admin-account-trigger").click();
  const account = page.getByRole("dialog", { name: "Account" });
  await expect(account).toBeVisible();
  await account.getByTestId("admin-account-theme-option-dark").click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  expect(await page.evaluate(() => localStorage.getItem("hhlawyer-theme"))).toBe("dark");
  await account.getByRole("button", { name: "العربية" }).click();
  await page.waitForURL(`**/ar/admin/consultations/${consultation.id}?status=PENDING&sort=desc`);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("account logout uses the existing endpoint and returns to localized login", async ({ page }) => {
  await mockAdminApi(page, "ADMIN");
  await page.goto("/en/admin/consultations");
  await page.getByTestId("admin-account-trigger").click();
  const responsePromise = page.waitForResponse((response) => response.url().endsWith("/auth/logout") && response.request().method() === "POST");
  await page.getByRole("dialog", { name: "Account" }).getByRole("button", { name: "Log out" }).click();
  expect((await responsePromise).status()).toBe(200);
  await page.waitForURL("**/en/admin/login");
});

for (const locale of ["en", "ar"] as const) {
  test(`${locale.toUpperCase()} mobile sheet traps focus, locks scroll, closes with Escape, and enters from inline-start`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await mockAdminApi(page, "STAFF");
    await page.goto(`/${locale}/admin/contacts`);
    const trigger = page.getByTestId("admin-mobile-nav-trigger");
    await trigger.click();
    const sheet = page.getByTestId("admin-mobile-sheet");
    await expect(sheet).toBeVisible();
    expect(await sheet.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    expect(await page.locator("body").evaluate((element) => getComputedStyle(element).overflow)).toBe("hidden");
    const box = await sheet.boundingBox();
    expect(box).not.toBeNull();
    if (locale === "en") expect(box!.x).toBeLessThanOrEqual(1);
    else expect(box!.x + box!.width).toBeGreaterThanOrEqual(389);

    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    const label = locale === "ar" ? "طلبات الاستشارة" : "Consultations";
    await page.getByTestId("admin-mobile-navigation").getByRole("link", { name: label }).click();
    await page.waitForURL(`**/${locale}/admin/consultations`);
    await expect(page.getByTestId("admin-mobile-sheet")).toHaveCount(0);
  });
}

test("expired auth renders no permission navigation before the existing login redirect", async ({ page }) => {
  await mockAdminApi(page, "STAFF", { authDelay: 350, expired: true });
  await page.goto("/en/admin");
  await expect(page.getByTestId("admin-session-loading")).toBeVisible();
  await expect(page.locator('[data-nav-id="overview"], [data-nav-id="team"], [data-nav-id="services"]')).toHaveCount(0);
  await page.waitForURL("**/en/admin/login");
});

test("responsive acceptance covers every key shell route, breakpoint, locale, and theme mode", async ({ page }) => {
  await mockAdminApi(page, "ADMIN");
  const cases = [
    { width: 1440, locale: "en", theme: "light", route: "/admin/login" },
    { width: 1280, locale: "ar", theme: "dark", route: "/admin" },
    { width: 1024, locale: "en", theme: "light", route: "/admin/consultations" },
    { width: 768, locale: "ar", theme: "dark", route: `/admin/consultations/${consultation.id}` },
    { width: 430, locale: "en", theme: "system", colorScheme: "light", route: "/admin/contacts" },
    { width: 390, locale: "ar", theme: "system", colorScheme: "dark", route: `/admin/users/${managedUser.id}` },
    { width: 360, locale: "en", theme: "dark", route: `/admin/services/${managedService.id}` },
  ] as const;

  for (const item of cases) {
    await page.setViewportSize({ width: item.width, height: 900 });
    if ("colorScheme" in item) await page.emulateMedia({ colorScheme: item.colorScheme });
    await page.goto(`/${item.locale}${item.route}`);
    await page.evaluate((theme) => localStorage.setItem("hhlawyer-theme", theme), item.theme);
    await page.reload();
    await expect(page.locator("[data-admin-root]")).toBeVisible();
    await expect(page.locator("main#admin-main")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", item.locale === "ar" ? "rtl" : "ltr");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (item.route !== "/admin/login") {
      await expect(item.width <= 768 ? page.getByTestId("admin-mobile-nav-trigger") : page.getByTestId("admin-sidebar")).toBeVisible();
    }
  }
});
