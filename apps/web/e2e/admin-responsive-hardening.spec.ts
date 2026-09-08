import { expect, test, type Page, type Route } from "@playwright/test";

const widths = [1440, 1280, 1024, 768, 430, 390, 360] as const;
const heights = [900, 800, 720, 667] as const;
const now = "2099-12-20T08:15:00.000Z";
const longId = `responsive-${"x".repeat(72)}`;
const longName = "Responsive stress name اسم عربي طويل لاختبار إعادة تدفق النصوص داخل مساحة الإدارة ".repeat(2).trim();
const longEmail = `${"responsive.".repeat(9)}operator@example.test`;
const longSlug = `responsive-${"technical-segment-".repeat(6)}catalogue`;
const longSubject = "A long bilingual legal message subject — موضوع قانوني طويل لاختبار الالتفاف الآمن ".repeat(3).trim();
const longBody = `Long legal content سطر قانوني طويل ${"UNBROKEN_TECHNICAL_VALUE_".repeat(10)}\n`.repeat(5);

const service = {
  id: longId,
  slug: longSlug,
  name: longName,
  description: longBody,
  isActive: true,
  sortOrder: 999_999,
  createdAt: now,
  updatedAt: now,
};

const consultation = {
  id: longId,
  referenceNumber: `CONS-${"2099-LONG-REFERENCE-".repeat(5)}`,
  name: longName,
  email: longEmail,
  phone: `+971${"501234567".repeat(4)}`,
  preferredDate: "2099-12-31T12:00:00.000Z",
  preferredTime: "09:00 AM",
  status: "PENDING",
  createdAt: now,
  updatedAt: now,
  message: longBody,
  service: { id: service.id, slug: service.slug, name: service.name },
};

const contact = {
  id: longId,
  name: longName,
  email: longEmail,
  subject: longSubject,
  message: longBody,
  status: "UNREAD",
  createdAt: now,
  updatedAt: now,
};

const managedUser = {
  id: longId,
  name: longName,
  email: longEmail,
  role: "STAFF",
  isActive: true,
  lockedUntil: "2099-12-31T08:00:00.000Z",
  lastLoginAt: now,
  createdAt: now,
  updatedAt: now,
};

const routes = [
  "/admin",
  "/admin/consultations",
  `/admin/consultations/${longId}`,
  "/admin/contacts",
  `/admin/contacts/${longId}`,
  "/admin/users",
  `/admin/users/${longId}`,
  "/admin/services",
  `/admin/services/${longId}`,
] as const;

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
    consultations: { total: 41, periodTotal: 12, byStatus: { PENDING: 7, CONFIRMED: 4, RESCHEDULED: 0, COMPLETED: 0, CANCELLED: 0 } },
    contacts: { total: 31, periodTotal: 9, unread: 6, byStatus: { UNREAD: 6, READ: 2, REPLIED: 1, ARCHIVED: 0 } },
    services: { total: 6, active: 5, inactive: 1 },
    users: { total: 4, active: 4, inactive: 0, byRole: { ADMIN: 1, LAWYER: 2, STAFF: 1 } },
    recentConsultations: [consultation],
    recentContacts: [contact],
    recentActivity: [],
  };
}

async function mockAdminApi(page: Page) {
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (path.endsWith("/auth/me")) {
      await fulfill(route, { user: { id: "responsive-admin", name: longName, email: longEmail, role: "ADMIN" } });
      return;
    }
    if (path.endsWith("/admin/overview")) {
      await fulfill(route, overview());
      return;
    }
    if (path.endsWith(`/admin/consultations/${longId}`)) {
      await fulfill(route, consultation);
      return;
    }
    if (path.endsWith("/admin/consultations")) {
      await fulfill(route, { items: [consultation], pagination: { page: 1, limit: 20, total: 41, totalPages: 3 } });
      return;
    }
    if (path.endsWith(`/admin/contacts/${longId}`)) {
      await fulfill(route, contact);
      return;
    }
    if (path.endsWith("/admin/contacts")) {
      await fulfill(route, { items: [contact], pagination: { page: 1, limit: 20, total: 31, totalPages: 2 } });
      return;
    }
    if (path.endsWith(`/admin/users/${longId}`)) {
      await fulfill(route, managedUser);
      return;
    }
    if (path.endsWith("/admin/users")) {
      await fulfill(route, { items: [managedUser], pagination: { page: 1, limit: 20, total: 21, totalPages: 2 } });
      return;
    }
    if (path.endsWith(`/admin/services/${longId}`)) {
      await fulfill(route, service);
      return;
    }
    if (path.endsWith("/admin/services")) {
      await fulfill(route, { items: [service], pagination: { page: 1, limit: 20, total: 21, totalPages: 2 } });
      return;
    }
    if (path.endsWith("/services")) {
      await fulfill(route, [service]);
      return;
    }
    if (request.method() === "PATCH" || request.method() === "POST") {
      await fulfill(route, {});
      return;
    }
    await fulfill(route, null, 404);
  });
}

async function expectNoHorizontalOverflow(page: Page, context: string) {
  const measurement = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const offenders = Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .filter((element) => {
        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") return false;
        const box = element.getBoundingClientRect();
        return box.width > 0 && (box.left < -1 || box.right > viewport + 1);
      })
      .slice(0, 6)
      .map((element) => ({ className: element.className, tag: element.tagName, testId: element.dataset.testid ?? "" }));
    const textOffenders: Array<{ parent: string; text: string }> = [];
    const walker = document.createTreeWalker(document.querySelector("main") ?? document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode() && textOffenders.length < 6) {
      const node = walker.currentNode as Text;
      const parent = node.parentElement;
      if (!parent || !node.textContent?.trim()) continue;
      const style = getComputedStyle(parent);
      if (style.display === "none" || style.visibility === "hidden") continue;
      let clippedByDesign = false;
      for (let ancestor: HTMLElement | null = parent; ancestor; ancestor = ancestor.parentElement) {
        const overflow = getComputedStyle(ancestor).overflowX;
        if (overflow === "hidden" || overflow === "clip") {
          clippedByDesign = true;
          break;
        }
      }
      if (clippedByDesign) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      if (Array.from(range.getClientRects()).some((rect) => rect.width > 0 && (rect.left < -1 || rect.right > viewport + 1))) {
        textOffenders.push({ parent: parent.tagName, text: node.textContent.trim().slice(0, 80) });
      }
    }
    return { clientWidth: viewport, offenders, scrollWidth: document.documentElement.scrollWidth, textOffenders };
  });
  expect(measurement, `${context}: ${JSON.stringify(measurement.offenders)}`).toMatchObject({ scrollWidth: measurement.clientWidth });
  expect(measurement.textOffenders, `${context}: rendered text crossed the viewport edge`).toEqual([]);
}

async function expectShellMode(page: Page, width: number) {
  if (width <= 768) {
    await expect(page.getByTestId("admin-mobile-nav-trigger")).toBeVisible();
    await expect(page.getByTestId("admin-sidebar")).toBeHidden();
  } else {
    await expect(page.getByTestId("admin-sidebar")).toBeVisible();
    await expect(page.getByTestId("admin-mobile-nav-trigger")).toBeHidden();
  }
}

function listKind(route: string) {
  if (route === "/admin/consultations") return ["consultations-desktop-table", "consultations-mobile-list"] as const;
  if (route === "/admin/contacts") return ["messages-desktop-list", "messages-mobile-list"] as const;
  if (route === "/admin/users") return ["admin-users-desktop-list", "admin-users-mobile-list"] as const;
  if (route === "/admin/services") return ["admin-services-desktop-list", "admin-services-mobile-list"] as const;
  return null;
}

for (const locale of ["ar", "en"] as const) {
  for (const route of routes) {
    test(`${locale.toUpperCase()} ${route} is contained at every approved width`, async ({ page }) => {
      await mockAdminApi(page);
      for (const width of widths) {
        await page.setViewportSize({ width, height: width <= 430 ? 667 : 900 });
        await page.goto(`/${locale}${route}`);
        await expect(page.locator("main#admin-main")).toBeVisible();
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
        await expectShellMode(page, width);
        const list = listKind(route);
        if (list) {
          await expect(page.getByTestId(width <= 768 ? list[1] : list[0])).toBeVisible();
          await expect(page.getByTestId(width <= 768 ? list[0] : list[1])).toBeHidden();
        }
        await expectNoHorizontalOverflow(page, `${locale} ${route} ${width}`);
      }
    });
  }
}

async function expectDialogFits(page: Page, label: string) {
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const result = await dialog.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return {
      bottom: box.bottom,
      clientHeight: element.clientHeight,
      clientWidth: element.clientWidth,
      scrollHeight: element.scrollHeight,
      top: box.top,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth,
    };
  });
  expect(result.top, `${label} top`).toBeGreaterThanOrEqual(-1);
  expect(result.bottom, `${label} bottom`).toBeLessThanOrEqual(result.viewportHeight + 1);
  expect(result.clientWidth, `${label} width`).toBeLessThanOrEqual(result.viewportWidth);
  await expectNoHorizontalOverflow(page, label);
  const close = dialog.getByRole("button", { name: /close|إغلاق|cancel|إلغاء/i }).first();
  await close.scrollIntoViewIfNeeded();
  await expect(close).toBeVisible();
}

test("mobile shell and global Admin dialogs fit short viewports and retain reachable actions", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 667 });
  await mockAdminApi(page);

  await page.goto("/en/admin/users");
  const menuTrigger = page.getByTestId("admin-mobile-nav-trigger");
  await menuTrigger.click();
  await expectDialogFits(page, "mobile navigation");
  expect(await page.locator("body").evaluate((element) => getComputedStyle(element).overflow)).toBe("hidden");
  await page.keyboard.press("Escape");
  await expect(menuTrigger).toBeFocused();

  await page.getByTestId("admin-account-trigger").click();
  await expectDialogFits(page, "account dialog");
  await page.keyboard.press("Escape");

  await page.getByTestId("admin-users-create").click();
  await expectDialogFits(page, "create user dialog");
  await page.keyboard.press("Escape");

  await page.goto("/en/admin/services");
  await page.getByTestId("services-create").click();
  await expectDialogFits(page, "create service dialog");
  await page.keyboard.press("Escape");

  await page.goto(`/en/admin/users/${longId}`);
  await page.getByTestId("user-status-action").click();
  await expectDialogFits(page, "user status dialog");
  await page.keyboard.press("Escape");

  await page.goto(`/en/admin/services/${longId}`);
  await page.getByTestId("service-status-action").click();
  await expectDialogFits(page, "service status dialog");
  await page.keyboard.press("Escape");

  await page.goto(`/en/admin/contacts/${longId}`);
  await page.getByTestId("contact-status-action-READ").click();
  await expectDialogFits(page, "message status dialog");
  await page.keyboard.press("Escape");

  await page.goto(`/en/admin/consultations/${longId}`);
  await page.locator("main#admin-main").getByRole("button").first().click();
  await expectDialogFits(page, "consultation status dialog");
});

for (const height of heights) {
  test(`mobile navigation remains scrollable and contained at 390x${height}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height });
    await mockAdminApi(page);
    await page.goto("/ar/admin/consultations");
    await page.getByTestId("admin-mobile-nav-trigger").click();
    const sheet = page.getByTestId("admin-mobile-sheet");
    await expect(sheet).toBeVisible();
    const box = await sheet.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThanOrEqual(height + 1);
    expect(box!.x + box!.width).toBeGreaterThanOrEqual(389);
    await sheet.getByRole("button", { name: /log out|تسجيل الخروج/i }).scrollIntoViewIfNeeded();
    await expect(sheet.getByRole("button", { name: /log out|تسجيل الخروج/i })).toBeVisible();
    await expectNoHorizontalOverflow(page, `mobile sheet 390x${height}`);
  });
}

test("light, dark, and resolved system themes preserve mobile reflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 720 });
  await mockAdminApi(page);
  for (const theme of ["light", "dark", "system"] as const) {
    await page.emulateMedia({ colorScheme: theme === "system" ? "dark" : theme });
    await page.goto(`/en/admin/services/${longId}`);
    await page.evaluate((value) => localStorage.setItem("hhlawyer-theme", value), theme);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(theme === "light" ? /^(?!.*\bdark\b)/ : /dark/);
    await expectNoHorizontalOverflow(page, `${theme} service detail`);
  }
});

test("constrained reflow and reduced motion keep content and touch controls usable", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 667 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockAdminApi(page);
  await page.goto("/en/admin/services");
  await expect(page.getByTestId("admin-services-mobile-list")).toBeVisible();
  for (const target of [page.getByTestId("admin-mobile-nav-trigger"), page.getByTestId("admin-account-trigger"), page.getByTestId("services-create")]) {
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(43);
  }
  await expectNoHorizontalOverflow(page, "360px equivalent 200% reflow");
});
