import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { createTestPrismaClient } from "../../api/src/lib/test-database";
import { hashPassword } from "../../api/src/modules/auth/auth.service";

test.describe.configure({ mode: "serial" });

const db = createTestPrismaClient();
const marker = `phase7b2-dashboard-${randomUUID().slice(0, 8)}`;
const password = "phase7b2 secure password";
const userIds: string[] = []; const entityIds: string[] = [];
let serviceId = ""; let consultationId = ""; let contactId = "";

async function login(page: Page, email: string) {
  await page.goto("/admin/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  const response = page.waitForResponse((value) => value.url().endsWith("/auth/login") && value.request().method() === "POST");
  await page.locator("form button").click();
  expect((await response).status()).toBe(200);
  await page.waitForURL(/\/admin$/);
}

test.beforeAll(async () => {
  for (const role of ["ADMIN", "LAWYER", "STAFF"] as const) {
    const user = await db.user.create({ data: { email: `${marker}.${role.toLowerCase()}@example.test`, name: `${marker} ${role}`, role, passwordHash: await hashPassword(password) } });
    userIds.push(user.id);
  }
  const service = await db.service.create({ data: { slug: `${marker}-service`, name: `${marker} Service`, description: "Dashboard-only controlled service.", sortOrder: 999_991 } });
  serviceId = service.id; entityIds.push(service.id);
  const consultation = await db.consultation.create({ data: { referenceNumber: `${marker}-CONSULTATION`, serviceId, name: "Dashboard hidden consultation name", email: "dashboard-hidden@example.test", phone: "+971501234567", preferredDate: new Date("2099-12-31T12:00:00.000Z"), preferredTime: "09:00 AM", message: "DASHBOARD_PRIVATE_CONSULTATION_MESSAGE", status: "PENDING" } });
  consultationId = consultation.id; entityIds.push(consultation.id);
  const contact = await db.contactMessage.create({ data: { name: "Dashboard hidden contact name", email: "dashboard-contact-hidden@example.test", subject: `${marker}-CONTACT`, message: "DASHBOARD_PRIVATE_CONTACT_MESSAGE", status: "UNREAD" } });
  contactId = contact.id; entityIds.push(contact.id);
  await db.auditLog.create({ data: { userId: userIds[0], action: "DASHBOARD_E2E_EVENT", entity: "ContactMessage", entityId: contact.id, metadata: { privateMessage: "DASHBOARD_PRIVATE_AUDIT_METADATA" } } });
});

test.afterAll(async () => {
  await db.auditLog.deleteMany({ where: { OR: [{ userId: { in: userIds } }, { entityId: { in: entityIds } }] } });
  await db.consultation.deleteMany({ where: { id: consultationId } });
  await db.contactMessage.deleteMany({ where: { id: contactId } });
  await db.service.deleteMany({ where: { id: serviceId } });
  await db.session.deleteMany({ where: { userId: { in: userIds } } });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await db.$disconnect();
});

test("ADMIN sees real safe dashboard data, range requests, and navigation", async ({ page }) => {
  await login(page, `${marker}.admin@example.test`);
  await expect(page.getByRole("heading", { name: "لوحة التحكم" })).toBeVisible();
  await expect(page.getByTestId("dashboard-consultations-card")).toBeVisible();
  await expect(page.getByTestId("dashboard-unread-contacts-card")).toBeVisible();
  await expect(page.getByTestId("dashboard-consultation-status")).toBeVisible();
  await expect(page.getByTestId("dashboard-contact-status")).toBeVisible();
  await expect(page.getByTestId("dashboard-recent-consultations")).toContainText(`${marker}-CONSULTATION`);
  await expect(page.getByTestId("dashboard-recent-contacts")).toContainText(`${marker}-CONTACT`);
  await expect(page.getByTestId("dashboard-recent-activity")).toContainText("DASHBOARD_E2E_EVENT");
  await expect(page.locator("body")).not.toContainText("DASHBOARD_PRIVATE_CONSULTATION_MESSAGE");
  await expect(page.locator("body")).not.toContainText("dashboard-hidden@example.test");
  await expect(page.locator("body")).not.toContainText("DASHBOARD_PRIVATE_CONTACT_MESSAGE");
  await expect(page.locator("body")).not.toContainText("DASHBOARD_PRIVATE_AUDIT_METADATA");
  for (const range of ["7d", "90d"] as const) {
    const request = page.waitForResponse((response) => response.url().includes(`/admin/overview?range=${range}`) && response.request().method() === "GET");
    await page.getByTestId("dashboard-range").selectOption(range);
    expect((await request).status()).toBe(200);
  }
  await page.getByTestId("dashboard-consultations-card").click();
  await expect(page).toHaveURL(/\/admin\/consultations$/);
  await page.goto("/admin");
  await page.getByTestId("dashboard-unread-contacts-card").click();
  await expect(page).toHaveURL(/\/admin\/contacts$/);
  await page.goto("/admin");
  await page.getByTestId("dashboard-active-services-card").click();
  await expect(page).toHaveURL(/\/admin\/services$/);
  await page.goto("/admin");
  await page.getByTestId("dashboard-active-users-card").click();
  await expect(page).toHaveURL(/\/admin\/users$/);
  expect(await page.evaluate(() => Object.keys(localStorage).length)).toBe(0);
  expect(await page.evaluate(() => Object.keys(sessionStorage).length)).toBe(0);
});

test("ADMIN receives a safe dashboard-specific error and retry control", async ({ page }) => {
  await page.route("**/api/v1/admin/overview?range=30d", (route) => route.abort("failed"));
  await login(page, `${marker}.admin@example.test`);
  await expect(page.getByText("تعذر تحميل لوحة التحكم.", { exact: true })).toBeVisible();
  await expect(page.getByTestId("dashboard-retry")).toBeVisible();
});

test("LAWYER and STAFF are denied dashboard data", async ({ page }) => {
  for (const role of ["lawyer", "staff"] as const) {
    await login(page, `${marker}.${role}@example.test`);
    await page.goto("/admin");
    await expect(page.getByRole("alert").filter({ hasText: "ليس لديك صلاحية الوصول إلى لوحة التحكم." })).toBeVisible();
    expect(await page.evaluate(async () => (await fetch("http://localhost:4000/api/v1/admin/overview", { credentials: "include" })).status)).toBe(403);
  }
});
