import { expect, test, type Page, type Route } from "@playwright/test";
import { consultationsContent } from "../src/features/admin/consultations/consultations-content";
import { formatConsultationTime, formatLocaleDate, formatLocaleDateTime } from "../src/i18n/format";
import { serviceContent } from "../src/i18n/service-content";
import { selectValue } from "./select-helpers";

const service = { id: "consultation-redesign-service", slug: "criminal", name: "Criminal Law", description: "Test", sortOrder: 1 };
const base = {
  id: "consultation-redesign-pending",
  referenceNumber: "CONS-2099-000951",
  name: "Operational Client",
  email: "operational@example.test",
  phone: "+971501234567",
  preferredDate: "2099-12-31T12:00:00.000Z",
  preferredTime: "09:00 AM",
  status: "PENDING",
  createdAt: "2099-12-20T08:15:00.000Z",
  updatedAt: "2099-12-21T09:30:00.000Z",
  message: "First line\n<img src=x onerror=alert(1)>\nFinal line",
  service: { id: service.id, slug: service.slug, name: service.name },
} as const;
const completed = { ...base, id: "consultation-redesign-completed", referenceNumber: "CONS-2099-000952", name: "Completed Client", status: "COMPLETED" as const };

async function fulfill(route: Route, data: unknown, status = 200) {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(status === 200 ? { success: true, data } : { success: false, error: { code: "DATABASE_ERROR", message: "Safe test failure" } }) });
}

async function mockBase(page: Page, role: "ADMIN" | "LAWYER" | "STAFF" = "ADMIN") {
  await page.route("**/api/v1/auth/me", (route) => fulfill(route, { user: { id: `redesign-${role}`, name: `Redesign ${role}`, email: `${role.toLowerCase()}@example.test`, role } }));
  await page.route("**/api/v1/services", (route) => fulfill(route, [service]));
}

test("consultation work queue uses bounded URL filters, search, sorting, pagination, and pending attention", async ({ page }) => {
  const copy = consultationsContent.en;
  const requests: URL[] = [];
  await mockBase(page);
  await page.route("**/api/v1/admin/consultations?**", async (route) => {
    requests.push(new URL(route.request().url()));
    await fulfill(route, { items: [base, completed], pagination: { page: Number(new URL(route.request().url()).searchParams.get("page") ?? 1), limit: Number(new URL(route.request().url()).searchParams.get("limit") ?? 20), total: 42, totalPages: 3 } });
  });
  await page.goto("/en/admin/consultations");
  await expect(page.getByRole("heading", { level: 1, name: copy.title })).toBeVisible();
  await expect(page.getByTestId("consultations-desktop-table")).toBeVisible();
  await expect(page.getByTestId("consultations-desktop-table").getByText(copy.pendingAttention)).toBeVisible();
  await expect(page.getByTestId("consultations-desktop-table").getByText(serviceContent.en.criminal.title).first()).toBeVisible();
  await expect(page.getByText(formatLocaleDate(base.preferredDate, "en"), { exact: true }).first()).toBeVisible();
  await expect(page.getByText(formatConsultationTime(base.preferredTime, "en"), { exact: true }).first()).toBeVisible();

  await selectValue(page.getByTestId("consultation-status-filter"), "PENDING");
  await expect.poll(() => requests.at(-1)?.searchParams.get("status")).toBe("PENDING");
  await selectValue(page.getByTestId("consultation-service-filter"), service.id);
  await expect.poll(() => requests.at(-1)?.searchParams.get("serviceId")).toBe(service.id);
  await page.getByTestId("consultation-date-from").fill("2099-12-01");
  await page.getByTestId("consultation-date-to").fill("2099-12-31");
  await expect.poll(() => requests.at(-1)?.searchParams.get("dateTo")).toBe("2099-12-31");
  await selectValue(page.getByTestId("consultation-sort"), "preferredDate:asc");
  await expect.poll(() => `${requests.at(-1)?.searchParams.get("sortBy")}:${requests.at(-1)?.searchParams.get("sortOrder")}`).toBe("preferredDate:asc");
  await selectValue(page.getByTestId("consultation-page-size"), "10");
  await expect.poll(() => requests.at(-1)?.searchParams.get("limit")).toBe("10");
  await page.getByLabel(copy.searchLabel).fill(base.referenceNumber);
  await expect.poll(() => requests.at(-1)?.searchParams.get("search"), { timeout: 3_000 }).toBe(base.referenceNumber);
  expect(page.url()).not.toContain(base.referenceNumber);
  await page.getByTestId("admin-consultations-list").getByRole("button", { name: copy.next, exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect.poll(() => requests.at(-1)?.searchParams.get("page")).toBe("2");
  await page.getByRole("button", { name: copy.clearFilters }).last().click();
  await expect(page).toHaveURL(/\/en\/admin\/consultations$/);
  expect(requests.every((url) => Number(url.searchParams.get("limit") ?? 20) <= 50)).toBe(true);
  const storage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
  expect(storage).not.toContain(base.email);
  expect(storage).not.toContain(base.referenceNumber);
});

test("consultation list distinguishes loading, errors, no requests, and filtered empty results", async ({ page }) => {
  const copy = consultationsContent.en;
  let recover = false;
  await mockBase(page);
  await page.route("**/api/v1/admin/consultations?**", async (route) => {
    if (!recover) { await new Promise((resolve) => setTimeout(resolve, 350)); await fulfill(route, null, 500); return; }
    await fulfill(route, { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });
  await page.goto("/en/admin/consultations", { waitUntil: "domcontentloaded" });
  await expect(page.getByLabel(copy.loadingTitle)).toBeVisible();
  await expect(page.getByText(copy.errorTitle)).toBeVisible();
  recover = true;
  await page.getByRole("button", { name: copy.retry }).click();
  await expect(page.getByText(copy.emptyTitle)).toBeVisible();
  await selectValue(page.getByTestId("consultation-status-filter"), "COMPLETED");
  await expect(page.getByText(copy.filteredEmptyTitle)).toBeVisible();
  await expect(page.getByRole("button", { name: copy.clearFilters }).first()).toBeVisible();
});

for (const width of [430, 390, 360]) {
  test(`consultation queue uses compact mobile records without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await mockBase(page);
    await page.route("**/api/v1/admin/consultations?**", (route) => fulfill(route, { items: [base, completed], pagination: { page: 1, limit: 20, total: 2, totalPages: 1 } }));
    await page.goto("/ar/admin/consultations");
    await expect(page.getByTestId("consultations-mobile-list")).toBeVisible();
    await expect(page.getByTestId("consultations-desktop-table")).toBeHidden();
    const filterTrigger = page.getByRole("button", { name: consultationsContent.ar.filterButton });
    await expect(filterTrigger).toBeVisible();
    await filterTrigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(filterTrigger).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("detail preserves plain text and authoritative state when a transition conflicts", async ({ page }) => {
  const copy = consultationsContent.en;
  let detailReads = 0;
  await mockBase(page);
  await page.route(`**/api/v1/admin/consultations/${base.id}`, async (route) => { detailReads += 1; await fulfill(route, base); });
  await page.route(`**/api/v1/admin/consultations/${base.id}/status`, (route) => route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ success: false, error: { code: "INVALID_STATUS_TRANSITION", message: "Conflict" } }) }));
  await page.goto(`/en/admin/consultations/${base.id}`);
  await expect(page.getByRole("heading", { level: 1, name: copy.detailTitle })).toBeVisible();
  await expect(page.getByTestId("consultation-client-message")).toHaveText(base.message);
  await expect(page.getByTestId("consultation-client-message").locator("img")).toHaveCount(0);
  await expect(page.getByText(formatLocaleDateTime(base.createdAt, "en"))).toBeVisible();
  const trigger = page.getByRole("button", { name: copy.actionLabels.CONFIRMED });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("dialog").getByRole("button", { name: copy.confirm }).click();
  await expect(page.getByText(copy.updateConflict)).toBeVisible();
  await expect.poll(() => detailReads).toBeGreaterThan(1);
  await expect(page.getByText("Pending review", { exact: true })).toBeVisible();
});
