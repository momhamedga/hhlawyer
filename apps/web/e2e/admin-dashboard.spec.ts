import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { createTestPrismaClient } from "../../api/src/lib/test-database";
import { hashPassword } from "../../api/src/modules/auth/auth.service";
import { selectValue } from "./select-helpers";

test.describe.configure({ mode: "serial" });

const db = createTestPrismaClient();
const marker = `phase9-4-dashboard-${randomUUID().slice(0, 8)}`;
const password = "phase9-4 secure password";
const userIds: string[] = [];
const entityIds: string[] = [];
let serviceId = "";
let ownsService = false;
let consultationId = "";
let contactId = "";

async function login(page: Page, email: string, locale: "ar" | "en" = "ar") {
  await page.goto(`/${locale}/admin/login`);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  const loginResponse = page.waitForResponse((value) => value.url().endsWith("/auth/login") && value.request().method() === "POST");
  await page.locator("form button").click();
  expect((await loginResponse).status()).toBe(200);
  await page.waitForURL(`**/${locale}/admin`);
}

function emptyOverview() {
  return {
    authenticated: true,
    period: { range: "30d", startsAt: "2026-08-08T08:00:00.000Z", endsAt: "2026-09-07T08:00:00.000Z" },
    consultations: { total: 0, periodTotal: 0, byStatus: { PENDING: 0, CONFIRMED: 0, RESCHEDULED: 0, COMPLETED: 0, CANCELLED: 0 } },
    contacts: { total: 0, periodTotal: 0, unread: 0, byStatus: { UNREAD: 0, READ: 0, REPLIED: 0, ARCHIVED: 0 } },
    services: { total: 0, active: 0, inactive: 0 },
    users: { total: 1, active: 1, inactive: 0, byRole: { ADMIN: 1, LAWYER: 0, STAFF: 0 } },
    recentConsultations: [],
    recentContacts: [],
    recentActivity: [],
  };
}

test.beforeAll(async () => {
  for (const role of ["ADMIN", "LAWYER", "STAFF"] as const) {
    const user = await db.user.create({ data: { email: `${marker}.${role.toLowerCase()}@example.test`, name: `${marker} ${role}`, role, passwordHash: await hashPassword(password) } });
    userIds.push(user.id);
  }
  let service = await db.service.findUnique({ where: { slug: "criminal" } });
  if (!service) {
    service = await db.service.create({ data: { slug: `${marker}-service`, name: `${marker} Service`, description: "Dashboard-only controlled service.", sortOrder: 999_991 } });
    ownsService = true;
  }
  serviceId = service.id;
  const consultation = await db.consultation.create({ data: { referenceNumber: `${marker}-CONSULTATION`, serviceId, name: "Dashboard hidden consultation name", email: "dashboard-hidden@example.test", phone: "+971501234567", preferredDate: new Date("2099-12-31T12:00:00.000Z"), preferredTime: "09:00 AM", message: "DASHBOARD_PRIVATE_CONSULTATION_MESSAGE", status: "PENDING" } });
  consultationId = consultation.id;
  entityIds.push(consultation.id);
  const contact = await db.contactMessage.create({ data: { name: "Dashboard hidden contact name", email: "dashboard-contact-hidden@example.test", subject: `${marker}-CONTACT`, message: "DASHBOARD_PRIVATE_CONTACT_MESSAGE", status: "UNREAD" } });
  contactId = contact.id;
  entityIds.push(contact.id);
  await db.auditLog.create({ data: { userId: userIds[0], action: "DASHBOARD_E2E_EVENT", entity: "ContactMessage", entityId: contact.id, metadata: { privateMessage: "DASHBOARD_PRIVATE_AUDIT_METADATA" } } });
});

test.afterAll(async () => {
  await db.auditLog.deleteMany({ where: { OR: [{ userId: { in: userIds } }, { entityId: { in: entityIds } }] } });
  await db.consultation.deleteMany({ where: { id: consultationId } });
  await db.contactMessage.deleteMany({ where: { id: contactId } });
  if (ownsService) await db.service.deleteMany({ where: { id: serviceId } });
  await db.session.deleteMany({ where: { userId: { in: userIds } } });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await db.$disconnect();
});

test("ADMIN sees real bounded operational data, localized statuses, and safe navigation", async ({ page }) => {
  const overviewResponse = page.waitForResponse((response) => response.url().includes("/admin/overview?range=30d") && response.request().method() === "GET");
  await login(page, `${marker}.admin@example.test`);
  const response = await overviewResponse;
  expect(response.status()).toBe(200);
  const data = (await response.json()).data;

  await expect(page.getByRole("heading", { name: "نظرة عامة", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByTestId("dashboard-consultations-card")).toContainText(String(data.consultations.byStatus.PENDING));
  await expect(page.getByTestId("dashboard-unread-contacts-card")).toContainText(String(data.contacts.unread));
  await expect(page.getByTestId("dashboard-new-requests-card")).toContainText(String(data.consultations.periodTotal));
  await expect(page.getByTestId("dashboard-active-services-card")).toContainText(String(data.services.active));
  await expect(page.getByTestId("dashboard-recent-consultations")).toContainText(`${marker}-CONSULTATION`);
  await expect(page.getByTestId("dashboard-recent-consultations")).toContainText("قيد المراجعة");
  if (!ownsService) await expect(page.getByTestId("dashboard-recent-consultations")).toContainText("القانون الجنائي");
  await expect(page.getByTestId("dashboard-recent-contacts")).toContainText(`${marker}-CONTACT`);
  await expect(page.getByTestId("dashboard-recent-contacts")).toContainText("غير مقروءة");
  await expect(page.getByTestId("dashboard-recent-activity")).toContainText("DASHBOARD_E2E_EVENT");
  await expect(page.locator("body")).not.toContainText("DASHBOARD_PRIVATE_CONSULTATION_MESSAGE");
  await expect(page.locator("body")).not.toContainText("dashboard-hidden@example.test");
  await expect(page.locator("body")).not.toContainText("DASHBOARD_PRIVATE_CONTACT_MESSAGE");
  await expect(page.locator("body")).not.toContainText("DASHBOARD_PRIVATE_AUDIT_METADATA");

  for (const range of ["7d", "90d"] as const) {
    const request = page.waitForResponse((item) => item.url().includes(`/admin/overview?range=${range}`) && item.request().method() === "GET");
    await selectValue(page.getByTestId("dashboard-range"), range);
    expect((await request).status()).toBe(200);
  }
  await page.getByTestId("dashboard-consultations-card").click();
  await expect(page).toHaveURL(/\/admin\/consultations\?status=PENDING$/);
  await page.goto("/ar/admin");
  await page.getByTestId("dashboard-unread-contacts-card").click();
  await expect(page).toHaveURL(/\/admin\/contacts$/);
  await page.goto("/ar/admin");
  await page.getByTestId("dashboard-active-services-card").click();
  await expect(page).toHaveURL(/\/admin\/services$/);
  await page.goto("/ar/admin");
  await page.getByTestId("dashboard-active-users-card").click();
  await expect(page).toHaveURL(/\/admin\/users$/);
  expect(await page.evaluate(() => Object.keys(localStorage).length)).toBe(0);
  expect(await page.evaluate(() => Object.keys(sessionStorage).length)).toBe(0);
});

test("Dashboard exposes a structural loading state and localized English empty state", async ({ page }) => {
  let overviewCalls = 0;
  await page.addInitScript(() => localStorage.setItem("hhlawyer-theme", "dark"));
  await page.route("**/api/v1/admin/overview?range=30d", async (route) => {
    overviewCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 450));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: emptyOverview() }) });
  });
  await page.goto("/en/admin/login");
  await page.locator('input[type="email"]').fill(`${marker}.admin@example.test`);
  await page.locator('input[type="password"]').fill(password);
  await page.locator("form button").click();
  await page.waitForURL("**/en/admin");
  await expect(page.getByTestId("dashboard-loading")).toBeVisible();
  await expect(page.getByTestId("dashboard-loading")).toHaveAttribute("aria-busy", "true");
  await expect(page.getByTestId("dashboard-consultations-card")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Overview", exact: true })).toBeVisible();
  await expect(page.getByText("No consultations at the moment", { exact: true })).toBeVisible();
  await expect(page.getByText("No recent messages", { exact: true })).toBeVisible();
  await expect(page.getByText("No recent admin activity", { exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  expect(overviewCalls).toBe(1);
  for (const width of [1440, 1280, 1024, 768, 430, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test("ADMIN receives a safe dashboard-specific error and retry control", async ({ page }) => {
  await page.route("**/api/v1/admin/overview?range=30d", (route) => route.abort("failed"));
  await login(page, `${marker}.admin@example.test`);
  await expect(page.getByText("تعذر تحميل نظرة عامة", { exact: true })).toBeVisible();
  await expect(page.getByTestId("dashboard-retry")).toBeVisible();
});

test("LAWYER and STAFF are denied dashboard data", async ({ page }) => {
  for (const role of ["lawyer", "staff"] as const) {
    await login(page, `${marker}.${role}@example.test`);
    await page.goto("/ar/admin");
    await page.waitForURL("**/ar/admin/consultations");
    await expect(page.getByTestId("admin-desktop-navigation").locator('[data-nav-id="overview"]')).toHaveCount(0);
    expect(await page.evaluate(async () => (await fetch("http://localhost:4000/api/v1/admin/overview", { credentials: "include" })).status)).toBe(403);
  }
});
