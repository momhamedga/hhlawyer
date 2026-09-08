import { expect, test, type Page, type Route } from "@playwright/test";

const now = "2099-12-20T08:15:00.000Z";
const recordId = "accessibility-record";

const service = {
  id: recordId,
  slug: "criminal-law",
  name: "Criminal Law",
  description: "Canonical service description",
  isActive: true,
  sortOrder: 1,
  createdAt: now,
  updatedAt: now,
};

const consultation = {
  id: recordId,
  referenceNumber: "CONS-2099-000001",
  name: "Accessibility Client",
  email: "accessibility@example.test",
  phone: "+971501234567",
  preferredDate: "2099-12-31T12:00:00.000Z",
  preferredTime: "09:00 AM",
  status: "PENDING",
  createdAt: now,
  updatedAt: now,
  message: "Arabic العربية and English prose (REF-2099).",
  service: { id: service.id, slug: service.slug, name: service.name },
};

const contact = {
  id: recordId,
  name: "Accessibility Sender",
  email: "sender@example.test",
  subject: "Accessible message",
  message: "Arabic العربية and English prose (MSG-2099).",
  status: "UNREAD",
  createdAt: now,
  updatedAt: now,
};

const managedUser = {
  id: recordId,
  name: "Managed User",
  email: "managed@example.test",
  role: "STAFF",
  isActive: true,
  lockedUntil: null,
  lastLoginAt: now,
  createdAt: now,
  updatedAt: now,
};

async function fulfill(route: Route, data: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(status < 400 ? { success: true, data } : { success: false, error: { code: "NOT_FOUND", message: "Not found" } }),
  });
}

function overview() {
  return {
    authenticated: true,
    period: { range: "30d", startsAt: "2099-11-20T00:00:00.000Z", endsAt: now },
    consultations: { total: 1, periodTotal: 1, byStatus: { PENDING: 1, CONFIRMED: 0, RESCHEDULED: 0, COMPLETED: 0, CANCELLED: 0 } },
    contacts: { total: 1, periodTotal: 1, unread: 1, byStatus: { UNREAD: 1, READ: 0, REPLIED: 0, ARCHIVED: 0 } },
    services: { total: 1, active: 1, inactive: 0 },
    users: { total: 2, active: 2, inactive: 0, byRole: { ADMIN: 1, LAWYER: 0, STAFF: 1 } },
    recentConsultations: [consultation],
    recentContacts: [contact],
    recentActivity: [],
  };
}

async function mockAdminApi(page: Page, role: "ADMIN" | "LAWYER" | "STAFF" = "ADMIN") {
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.endsWith("/auth/me")) return fulfill(route, { user: { id: "test-operator", name: "Test Operator", email: "operator@example.test", role } });
    if (path.endsWith("/admin/overview")) return fulfill(route, overview());
    if (path.endsWith(`/admin/consultations/${recordId}`)) return fulfill(route, consultation);
    if (path.endsWith("/admin/consultations")) return fulfill(route, { items: [consultation], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } });
    if (path.endsWith(`/admin/contacts/${recordId}`)) return fulfill(route, contact);
    if (path.endsWith("/admin/contacts")) return fulfill(route, { items: [contact], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } });
    if (path.endsWith(`/admin/users/${recordId}`)) return fulfill(route, managedUser);
    if (path.endsWith("/admin/users")) return fulfill(route, { items: [managedUser], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } });
    if (path.endsWith(`/admin/services/${recordId}`)) return fulfill(route, service);
    if (path.endsWith("/admin/services")) return fulfill(route, { items: [service], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } });
    if (request.method() === "POST" || request.method() === "PATCH") return fulfill(route, {});
    return fulfill(route, null, 404);
  });
}

async function expectDescribedError(page: Page, selector: string) {
  const input = page.locator(selector);
  await expect(input).toHaveAttribute("aria-invalid", "true");
  const ids = ((await input.getAttribute("aria-describedby")) ?? "").split(/\s+/).filter(Boolean);
  expect(ids.length).toBeGreaterThan(0);
  const descriptions = await Promise.all(ids.map((id) => page.locator(`#${id}`).textContent()));
  expect(descriptions.some((description) => Boolean(description?.trim()))).toBe(true);
}

test("login has a working skip link and associated validation errors in both locales", async ({ page }) => {
  for (const locale of ["ar", "en"] as const) {
    await page.goto(`/${locale}/admin/login`);
    await expect(page.locator("main#admin-main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await page.keyboard.press("Tab");
    const skip = page.locator('a[href="#admin-main"]');
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#admin-main")).toBeFocused();
    await page.locator('button[type="submit"]').click();
    await expectDescribedError(page, 'input[type="email"]');
    await expectDescribedError(page, 'input[type="password"]');
  }
});

test("all Admin routes expose one main, one h1, named navigation and current location", async ({ page }) => {
  await mockAdminApi(page);
  const routes = [
    "/admin",
    "/admin/consultations",
    `/admin/consultations/${recordId}`,
    "/admin/contacts",
    `/admin/contacts/${recordId}`,
    "/admin/users",
    `/admin/users/${recordId}`,
    "/admin/services",
    `/admin/services/${recordId}`,
  ];
  for (const locale of ["ar", "en"] as const) {
    for (const route of routes) {
      await page.goto(`/${locale}${route}`);
      await expect(page.locator("main#admin-main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
      await expect(page.getByTestId("admin-desktop-navigation")).toHaveAttribute("aria-label", /.+/);
      await expect(page.getByTestId("admin-desktop-navigation").locator('[aria-current="page"]')).toHaveCount(1);
    }
  }
});

test("desktop record tables have scoped headers and mobile records are not duplicated", async ({ page }) => {
  await mockAdminApi(page);
  for (const route of ["users", "services"] as const) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`/en/admin/${route}`);
    const desktop = page.getByTestId(route === "users" ? "admin-users-desktop-list" : "admin-services-desktop-list");
    const mobile = page.getByTestId(route === "users" ? "admin-users-mobile-list" : "admin-services-mobile-list");
    await expect(desktop).toBeVisible();
    await expect(mobile).toBeHidden();
    const headers = desktop.locator("th");
    expect(await headers.count()).toBeGreaterThan(0);
    expect(await headers.evaluateAll((elements) => elements.map((element) => element.getAttribute("scope")))).toEqual(Array(await headers.count()).fill("col"));
    await page.setViewportSize({ width: 360, height: 667 });
    await expect(desktop).toBeHidden();
    await expect(mobile).toBeVisible();
    await expect(mobile.locator("li article")).toHaveCount(1);
  }
});

test("mobile navigation and account dialogs preserve keyboard focus and selected theme state", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 667 });
  await mockAdminApi(page);
  await page.goto("/en/admin/consultations");
  const navTrigger = page.getByTestId("admin-mobile-nav-trigger");
  await navTrigger.focus();
  await page.keyboard.press("Enter");
  await expect(navTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(navTrigger).toBeFocused();

  const accountTrigger = page.getByTestId("admin-account-trigger");
  await accountTrigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId("admin-account-theme-option-system")).toHaveAttribute("aria-pressed", "true");
  await expect(dialog.locator('svg[aria-label]')).toHaveCount(0);
  await dialog.getByTestId("admin-account-theme-option-dark").click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(dialog.getByTestId("admin-account-theme-option-dark")).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(accountTrigger).toBeFocused();
});

test("create user validation focuses and describes the first invalid field", async ({ page }) => {
  await mockAdminApi(page);
  await page.goto("/en/admin/users");
  await page.getByTestId("admin-users-create").click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Name").fill("Valid Name");
  await dialog.getByTestId("create-user-submit").click();
  await expect(dialog.getByLabel("Email")).toBeFocused();
  await expectDescribedError(page, 'div[role="dialog"] input[type="email"]');
  await expectDescribedError(page, 'div[role="dialog"] input[type="password"]');
});

test("create and edit service validation focuses and describes invalid fields", async ({ page }) => {
  await mockAdminApi(page);
  await page.goto("/en/admin/services");
  await page.getByTestId("services-create").click();
  const dialog = page.getByRole("dialog");
  await dialog.getByTestId("service-create-slug").fill("valid-slug");
  await dialog.getByTestId("service-create-sort-order").fill("-1");
  await dialog.getByTestId("service-create-submit").click();
  await expect(dialog.getByTestId("service-create-name")).toBeFocused();
  await expectDescribedError(page, '[data-testid="service-create-name"]');
  await expectDescribedError(page, '[data-testid="service-create-description"]');
  await expectDescribedError(page, '[data-testid="service-create-sort-order"]');

  await page.keyboard.press("Escape");
  await page.goto(`/en/admin/services/${recordId}`);
  const form = page.getByTestId("service-edit");
  await form.getByLabel("Service name").fill("");
  await form.getByLabel("Description").fill("");
  await form.getByLabel("Order").fill("-1");
  await form.locator('button[type="submit"]').click();
  await expect(form.getByLabel("Service name")).toBeFocused();
  await expectDescribedError(page, '[data-testid="service-edit"] input:not([type="number"])');
  await expectDescribedError(page, '[data-testid="service-edit"] textarea');
  await expectDescribedError(page, '[data-testid="service-edit"] input[type="number"]');
});

test("user identity and password errors stay associated with their own fields", async ({ page }) => {
  await mockAdminApi(page);
  await page.goto(`/en/admin/users/${recordId}`);
  const identity = page.getByTestId("user-edit");
  await identity.getByLabel("Name").fill("");
  await identity.locator('button[type="submit"]').click();
  await expect(identity.getByLabel("Name")).toBeFocused();
  await expectDescribedError(page, '[data-testid="user-edit"] input[autocomplete="name"]');

  const password = page.getByTestId("user-password-reset");
  const passwordForm = password.locator("xpath=ancestor::form");
  await password.fill("short");
  await passwordForm.locator('button[type="submit"]').click();
  await expect(password).toBeFocused();
  await expectDescribedError(page, '[data-testid="user-password-reset"]');
  await expect(passwordForm.getByRole("alert")).toBeVisible();
});

test("reduced motion disables the session spinner animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/api/v1/auth/me", () => undefined);
  await page.goto("/en/admin");
  const spinner = page.getByTestId("admin-session-loading").locator("main span");
  await expect(spinner).toBeVisible();
  await expect(spinner).toHaveCSS("animation-name", "none");
});

test("light, dark, and system themes preserve measured Admin AA token contrast", async ({ page }) => {
  await mockAdminApi(page);
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/en/admin");
  const pairs = [
    ["--admin-text", "--admin-canvas", 4.5],
    ["--admin-text-muted", "--admin-canvas", 4.5],
    ["--admin-brand-foreground", "--admin-brand", 4.5],
    ["--admin-accent-foreground", "--admin-accent", 4.5],
    ["--admin-status-attention", "--admin-status-attention-bg", 4.5],
    ["--admin-status-success", "--admin-status-success-bg", 4.5],
    ["--admin-status-danger", "--admin-status-danger-bg", 4.5],
    ["--admin-focus", "--admin-canvas", 3],
  ] as const;

  async function measure(theme: "light" | "dark" | "system", scheme: "light" | "dark") {
    await page.emulateMedia({ colorScheme: scheme });
    await page.evaluate((selected) => {
      localStorage.setItem("theme", selected);
      document.documentElement.classList.toggle("dark", selected === "dark" || (selected === "system" && matchMedia("(prefers-color-scheme: dark)").matches));
    }, theme);
    return page.evaluate((tokenPairs: ReadonlyArray<readonly [string, string, number]>) => {
      const root = document.querySelector<HTMLElement>("[data-admin-root]")!;
      function rgb(variable: string) {
        const probe = document.createElement("span");
        probe.style.color = `var(${variable})`;
        root.append(probe);
        const value = getComputedStyle(probe).color.match(/[\d.]+/g)!.slice(0, 3).map(Number);
        probe.remove();
        return value;
      }
      function luminance([red, green, blue]: number[]) {
        const channels = [red, green, blue].map((value) => {
          const channel = value / 255;
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
      }
      return tokenPairs.map(([foreground, background, minimum]) => {
        const first = luminance(rgb(foreground));
        const second = luminance(rgb(background));
        return { foreground, background, minimum, ratio: (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05) };
      });
    }, pairs);
  }

  for (const [theme, scheme] of [["light", "light"], ["dark", "dark"], ["system", "light"], ["system", "dark"]] as const) {
    const results = await measure(theme, scheme);
    for (const result of results) expect(result.ratio, `${theme}/${scheme} ${result.foreground} on ${result.background}`).toBeGreaterThanOrEqual(result.minimum);
  }
});

test("role-based navigation stays absent for non-admin identities", async ({ page }) => {
  await mockAdminApi(page, "STAFF");
  await page.goto("/en/admin/consultations");
  const nav = page.getByTestId("admin-desktop-navigation");
  await expect(nav.getByText("Consultations", { exact: true })).toBeVisible();
  await expect(nav.getByText("Team & Access", { exact: true })).toHaveCount(0);
  await expect(nav.getByText("Services", { exact: true })).toHaveCount(0);
});
