import { randomUUID } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { createTestPrismaClient } from "../../api/src/lib/test-database";
import { hashPassword } from "../../api/src/modules/auth/auth.service";
import { consultationsContent } from "../src/features/admin/consultations/consultations-content";

test.describe.configure({ mode: "serial" });

const db = createTestPrismaClient();
const marker = `admin-consultation-${randomUUID().slice(0, 8)}`;
const password = "admin consultation browser password";
let adminId = "";
let staffId = "";
let lawyerId = "";
let serviceId = "";
let consultationId = "";
let referenceNumber = "";

async function login(page: Page, email: string) {
  await page.goto("/admin/login");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill(password);
  const response = page.waitForResponse((value) => value.url().endsWith("/auth/login") && value.request().method() === "POST");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  expect((await response).status()).toBe(200);
  await page.waitForURL(/\/admin$/);
}

test.beforeAll("create isolated consultation fixtures", async () => {
  const service = await db.service.create({
    data: { slug: `${marker}-service`, name: `${marker} Service`, description: "Controlled consultation service.", sortOrder: 999 },
  });
  serviceId = service.id;

  const [admin, staff, lawyer] = await Promise.all((["ADMIN", "STAFF", "LAWYER"] as const).map(async (role) => db.user.create({
    data: { email: `${marker}.${role.toLowerCase()}@example.test`, name: `${marker} ${role}`, passwordHash: await hashPassword(password), role },
  })));
  adminId = admin.id;
  staffId = staff.id;
  lawyerId = lawyer.id;

  referenceNumber = `E2E-${randomUUID().slice(0, 12).toUpperCase()}`;
  const consultation = await db.consultation.create({
    data: {
      referenceNumber,
      serviceId,
      name: `${marker} Client`,
      email: `${marker}@example.test`,
      phone: "+971501234567",
      preferredDate: new Date("2099-12-31T12:00:00.000Z"),
      preferredTime: "09:00 AM",
      message: "Controlled admin consultation fixture.",
      status: "PENDING",
    },
  });
  consultationId = consultation.id;
});

test.afterAll("clean isolated consultation fixtures", async () => {
  await db.auditLog.deleteMany({ where: { OR: [{ entityId: consultationId }, { userId: { in: [adminId, staffId, lawyerId] } }] } });
  await db.session.deleteMany({ where: { userId: { in: [adminId, staffId, lawyerId] } } });
  await db.consultation.deleteMany({ where: { id: consultationId } });
  await db.service.deleteMany({ where: { id: serviceId } });
  await db.user.deleteMany({ where: { id: { in: [adminId, staffId, lawyerId] } } });
  await db.$disconnect();
});

test("admin consultation list, detail, and status update", async ({ page }) => {
  const copy = consultationsContent.ar;
  await login(page, `${marker}.admin@example.test`);
  await page.getByRole("link", { name: "طلبات الاستشارة" }).click();
  await expect(page.getByRole("heading", { name: "طلبات الاستشارة" })).toBeVisible();
  await page.getByLabel(copy.searchLabel).fill(referenceNumber);
  const row = page.getByTestId("consultations-desktop-table").getByText(referenceNumber, { exact: true }).locator("xpath=ancestor::tr");
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: copy.viewDetails }).click();
  await expect(page.getByRole("heading", { name: copy.detailTitle, level: 1 })).toBeVisible();
  await page.getByRole("button", { name: copy.actionLabels.CONFIRMED }).click();
  await page.getByRole("dialog").getByRole("button", { name: copy.confirm }).click();
  await expect(page.getByText(copy.updateSuccess)).toBeVisible();
  await expect(page.locator("header").getByText("مؤكد")).toBeVisible();
  await expect.poll(async () => (await db.consultation.findUnique({ where: { id: consultationId } }))?.status).toBe("CONFIRMED");
  await expect.poll(async () => db.auditLog.count({ where: { entityId: consultationId, action: "CONSULTATION_STATUS_CHANGED" } })).toBe(1);
});

test("staff can read a consultation but cannot see status management controls", async ({ page }) => {
  const copy = consultationsContent.ar;
  await login(page, `${marker}.staff@example.test`);
  await page.goto("/admin/consultations");
  await page.getByLabel(copy.searchLabel).fill(referenceNumber);
  const row = page.getByTestId("consultations-desktop-table").getByText(referenceNumber, { exact: true }).locator("xpath=ancestor::tr");
  await expect(row).toBeVisible();
  await row.getByRole("link", { name: copy.viewDetails }).click();
  await expect(page.getByText(copy.readOnly)).toBeVisible();
  await expect(page.getByRole("button", { name: copy.actionLabels.RESCHEDULED })).toHaveCount(0);
  expect(adminId).not.toBe("");
  expect(staffId).not.toBe("");
});

test("lawyer can perform the next authoritative consultation transition", async ({ page }) => {
  const copy = consultationsContent.ar;
  await login(page, `${marker}.lawyer@example.test`);
  await page.goto(`/admin/consultations/${consultationId}`);
  await page.getByRole("button", { name: copy.actionLabels.RESCHEDULED }).click();
  await page.getByRole("dialog").getByRole("button", { name: copy.confirm }).click();
  await expect(page.getByText(copy.updateSuccess)).toBeVisible();
  await expect.poll(async () => (await db.consultation.findUnique({ where: { id: consultationId } }))?.status).toBe("RESCHEDULED");
  await expect.poll(async () => db.auditLog.count({ where: { entityId: consultationId, action: "CONSULTATION_STATUS_CHANGED" } })).toBe(2);
});
