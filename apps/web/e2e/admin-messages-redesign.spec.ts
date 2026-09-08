import { expect, test, type Page, type Route } from "@playwright/test";
import { messagesContent } from "../src/features/admin/messages/messages-content";
import { formatLocaleDateTime } from "../src/i18n/format";

const base = {
  id: "message-redesign-unread",
  name: "Inbox Client",
  email: "inbox.client@example.test",
  subject: "Urgent contract review before signing",
  message: "First line\n<img src=x onerror=alert(1)>\nFinal line",
  status: "UNREAD" as const,
  createdAt: "2099-12-20T08:15:00.000Z",
  updatedAt: "2099-12-21T09:30:00.000Z",
};
const read = { ...base, id: "message-redesign-read", name: "Read Client", email: "read@example.test", subject: "Existing client follow-up", status: "READ" as const };

async function fulfill(route: Route, data: unknown, status = 200, code = "DATABASE_ERROR") {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(status === 200 ? { success: true, data } : { success: false, error: { code, message: "Safe test failure" } }) });
}

async function mockAuth(page: Page, role: "ADMIN" | "STAFF" | "LAWYER" = "ADMIN") {
  await page.route("**/api/v1/auth/me", (route) => fulfill(route, { user: { id: `message-${role}`, name: `Message ${role}`, email: `${role.toLowerCase()}@example.test`, role } }));
}

test("message inbox uses bounded URL filters, ephemeral search, sorting, pagination, and unread priority", async ({ page }) => {
  const copy = messagesContent.en;
  const requests: URL[] = [];
  await mockAuth(page);
  await page.route("**/api/v1/admin/contacts?**", async (route) => {
    const url = new URL(route.request().url());
    requests.push(url);
    await fulfill(route, { items: [base, read], pagination: { page: Number(url.searchParams.get("page") ?? 1), limit: Number(url.searchParams.get("limit") ?? 20), total: 42, totalPages: 3 } });
  });
  await page.goto("/en/admin/contacts");
  await expect(page.getByRole("heading", { level: 1, name: copy.title })).toBeVisible();
  await expect(page.getByTestId("messages-desktop-list")).toBeVisible();
  await expect(page.getByTestId("messages-desktop-list").getByText(copy.unreadAttention)).toBeVisible();
  await expect(page.getByText(formatLocaleDateTime(base.createdAt, "en"), { exact: true }).first()).toBeVisible();

  await page.getByTestId("message-status-filter").selectOption("UNREAD");
  await expect(page).toHaveURL(/status=UNREAD/);
  await expect.poll(() => requests.at(-1)?.searchParams.get("status")).toBe("UNREAD");
  await page.getByTestId("message-sort").selectOption("createdAt:asc");
  await expect.poll(() => `${requests.at(-1)?.searchParams.get("sortBy") ?? "createdAt"}:${requests.at(-1)?.searchParams.get("sortOrder")}`).toBe("createdAt:asc");
  await page.getByTestId("message-page-size").selectOption("10");
  await expect.poll(() => requests.at(-1)?.searchParams.get("limit")).toBe("10");
  await page.getByLabel(copy.searchLabel).fill(base.email);
  await expect.poll(() => requests.at(-1)?.searchParams.get("search"), { timeout: 3_000 }).toBe(base.email);
  expect(page.url()).not.toContain(base.email);
  await page.getByTestId("admin-messages-list").getByRole("button", { name: copy.next, exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect.poll(() => requests.at(-1)?.searchParams.get("page")).toBe("2");
  await page.getByTestId("message-status-filter").selectOption("READ");
  await expect(page).not.toHaveURL(/page=2/);
  expect(requests.every((url) => Number(url.searchParams.get("limit") ?? 20) <= 50)).toBe(true);
  const storage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
  expect(storage).not.toContain(base.email);
  expect(storage).not.toContain(base.message);
});

test("message inbox distinguishes loading, errors, empty inbox, and filtered empty results", async ({ page }) => {
  const copy = messagesContent.en;
  let recover = false;
  await mockAuth(page);
  await page.route("**/api/v1/admin/contacts?**", async (route) => {
    if (!recover) { await new Promise((resolve) => setTimeout(resolve, 350)); await fulfill(route, null, 500); return; }
    await fulfill(route, { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });
  await page.goto("/en/admin/contacts", { waitUntil: "domcontentloaded" });
  await expect(page.getByLabel(copy.loadingTitle)).toBeVisible();
  await expect(page.getByText(copy.errorTitle)).toBeVisible();
  recover = true;
  await page.getByRole("button", { name: copy.retry }).click();
  await expect(page.getByText(copy.emptyTitle)).toBeVisible();
  await page.getByTestId("message-status-filter").selectOption("ARCHIVED");
  await expect(page.getByText(copy.filteredEmptyTitle)).toBeVisible();
  await expect(page.getByRole("button", { name: copy.clearFilters }).first()).toBeVisible();
});

for (const width of [430, 390, 360]) {
  test(`message inbox uses compact Arabic mobile records without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockAuth(page);
    await page.route("**/api/v1/admin/contacts?**", (route) => fulfill(route, { items: [base, read], pagination: { page: 1, limit: 20, total: 2, totalPages: 1 } }));
    await page.goto("/ar/admin/contacts");
    await expect(page.getByTestId("messages-mobile-list")).toBeVisible();
    await expect(page.getByTestId("messages-desktop-list")).toBeHidden();
    const filterTrigger = page.getByRole("button", { name: messagesContent.ar.filterButton });
    await filterTrigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(filterTrigger).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("message detail preserves submitted text, sender facts, mailto semantics, and conflict recovery", async ({ page }) => {
  const copy = messagesContent.en;
  let detailReads = 0;
  await mockAuth(page);
  await page.route(`**/api/v1/admin/contacts/${base.id}`, async (route) => { detailReads += 1; await fulfill(route, base); });
  await page.route(`**/api/v1/admin/contacts/${base.id}/status`, (route) => fulfill(route, null, 409, "INVALID_CONTACT_STATUS_TRANSITION"));
  await page.goto(`/en/admin/contacts/${base.id}`);
  await expect(page.getByRole("heading", { level: 1, name: base.subject })).toBeVisible();
  await expect(page.getByText(base.name, { exact: true })).toBeVisible();
  await expect(page.getByText(base.email, { exact: true })).toBeVisible();
  await expect(page.getByTestId("contact-message-body")).toHaveText(base.message);
  await expect(page.getByTestId("contact-message-body").locator("img")).toHaveCount(0);
  await expect(page.getByRole("link", { name: copy.openEmailClientFor(base.name) })).toHaveAttribute("href", `mailto:${base.email}`);
  await expect(page.getByText(formatLocaleDateTime(base.createdAt, "en"), { exact: true }).first()).toBeVisible();
  await expect(page.getByText(formatLocaleDateTime(base.updatedAt, "en"), { exact: true })).toBeVisible();
  const trigger = page.getByRole("button", { name: copy.actionLabels.READ });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("dialog").getByRole("button", { name: copy.confirm }).click();
  await expect(page.getByText(copy.updateConflict)).toBeVisible();
  await expect.poll(() => detailReads).toBeGreaterThan(1);
  await expect(page.getByTestId("contact-status")).toHaveAttribute("data-status", "UNREAD");
});

test("successful message mutation refreshes authoritative detail and Dashboard message data", async ({ page }) => {
  const copy = messagesContent.en;
  let currentStatus: "UNREAD" | "READ" = "UNREAD";
  let overviewReads = 0;
  await mockAuth(page);
  await page.route("**/api/v1/admin/overview?**", async (route) => {
    overviewReads += 1;
    await fulfill(route, {
      authenticated: true,
      period: { range: "30d", startsAt: "2099-11-20T00:00:00.000Z", endsAt: "2099-12-20T23:59:59.000Z" },
      consultations: { total: 0, periodTotal: 0, byStatus: { PENDING: 0, CONFIRMED: 0, RESCHEDULED: 0, COMPLETED: 0, CANCELLED: 0 } },
      contacts: { total: 1, periodTotal: 1, unread: currentStatus === "UNREAD" ? 1 : 0, byStatus: { UNREAD: currentStatus === "UNREAD" ? 1 : 0, READ: currentStatus === "READ" ? 1 : 0, REPLIED: 0, ARCHIVED: 0 } },
      services: { total: 0, active: 0, inactive: 0 },
      users: { total: 1, active: 1, inactive: 0, byRole: { ADMIN: 1, LAWYER: 0, STAFF: 0 } },
      recentConsultations: [], recentContacts: [{ id: base.id, subject: base.subject, status: currentStatus, createdAt: base.createdAt }], recentActivity: [],
    });
  });
  await page.route(`**/api/v1/admin/contacts/${base.id}`, (route) => fulfill(route, { ...base, status: currentStatus }));
  await page.route(`**/api/v1/admin/contacts/${base.id}/status`, async (route) => { currentStatus = "READ"; await fulfill(route, { id: base.id, status: currentStatus }); });

  await page.goto("/en/admin");
  await expect.poll(() => overviewReads).toBe(1);
  await page.getByRole("link", { name: base.subject }).click();
  await page.getByRole("button", { name: copy.actionLabels.READ }).click();
  await page.getByRole("dialog").getByRole("button", { name: copy.confirm }).click();
  await expect(page.getByTestId("contact-status")).toHaveAttribute("data-status", "READ");
  await page.getByRole("link", { name: "Overview" }).first().click();
  await expect.poll(() => overviewReads).toBeGreaterThan(1);
  await expect(page.getByTestId("dashboard-unread-contacts-card")).toContainText("0");
});
