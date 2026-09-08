import { expect, test, type Page } from "@playwright/test";
import { createTestPrismaClient } from "../../api/src/lib/test-database";
import { hashPassword } from "../../api/src/modules/auth/auth.service";

const db = createTestPrismaClient();
const marker = `phase6b3_${Date.now()}`;
const password = "phase6b3 secure browser password";
const ids = { users: [] as string[], contacts: [] as string[] };
let unreadId = "";
let readId = "";
let repliedId = "";
let archiveId = "";

async function login(page: Page, email: string) {
  await page.goto("/admin/login");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill(password);
  const loginResponse = page.waitForResponse((response) => response.url().endsWith("/auth/login") && response.request().method() === "POST");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  expect((await loginResponse).status()).toBe(200);
  await page.waitForURL(/\/admin$/);
}

test.beforeAll("create isolated contact fixtures", async () => {
  for (const role of ["ADMIN", "STAFF", "LAWYER"] as const) {
    const user = await db.user.create({
      data: {
        email: `${marker}.${role.toLowerCase()}@example.test`,
        name: `${marker} ${role}`,
        role,
        passwordHash: await hashPassword(password),
      },
    });
    ids.users.push(user.id);
  }

  for (const status of ["UNREAD", "READ", "REPLIED", "ARCHIVED"] as const) {
    const contact = await db.contactMessage.create({
      data: {
        name: `${marker}_${status}`,
        email: `${status}@example.test`,
        subject: `${marker} ${status}`,
        message: status === "UNREAD" ? "<b>PHASE6B3_LITERAL</b>" : `message ${status}`,
        status,
      },
    });
    ids.contacts.push(contact.id);
    if (status === "UNREAD") unreadId = contact.id;
    if (status === "READ") readId = contact.id;
    if (status === "REPLIED") repliedId = contact.id;
  }

  const archiveContact = await db.contactMessage.create({
    data: {
      name: `${marker}_ARCHIVE_WORKFLOW`,
      email: "archive@example.test",
      subject: `${marker} ARCHIVE_WORKFLOW`,
      message: "archive workflow",
      status: "REPLIED",
    },
  });
  ids.contacts.push(archiveContact.id);
  archiveId = archiveContact.id;
});

test.afterAll(async () => {
  await db.auditLog.deleteMany({ where: { entityId: { in: ids.contacts } } });
  await db.session.deleteMany({ where: { userId: { in: ids.users } } });
  await db.contactMessage.deleteMany({ where: { id: { in: ids.contacts } } });
  await db.user.deleteMany({ where: { id: { in: ids.users } } });
  await db.$disconnect();
});

test("ADMIN manages contact and audit persists", async ({ page }) => {
  await login(page, `${marker}.admin@example.test`);
  await page.goto("/admin/contacts");

  const search = page.getByTestId("contact-search");
  await expect(search).toBeVisible();
  await search.fill(`${marker} UNREAD`);
  const row = page.getByTestId("messages-desktop-list").locator(`[data-contact-id="${unreadId}"]`);
  await expect(row).toBeVisible();
  await row.getByTestId("contact-view").click();

  await expect(page.getByText("<b>PHASE6B3_LITERAL</b>")).toBeVisible();
  await expect(page.locator("b")).toHaveCount(0);
  await page.getByTestId("contact-status-action-READ").click();
  await page.getByTestId("contact-status-confirm").click();
  await expect(page.getByTestId("contact-status")).toHaveAttribute("data-status", "READ");
  await expect.poll(async () => (await db.contactMessage.findUnique({ where: { id: unreadId } }))?.status).toBe("READ");

  const audit = await db.auditLog.findFirst({ where: { entityId: unreadId, action: "CONTACT_STATUS_CHANGED" } });
  expect(audit?.userId).toBe(ids.users[0]);
  expect(audit?.metadata).toEqual({ oldStatus: "UNREAD", newStatus: "READ" });
});

test("STAFF manages and LAWYER is read only", async ({ page }) => {
  await login(page, `${marker}.staff@example.test`);
  await page.goto(`/admin/contacts/${readId}`);
  await page.getByTestId("contact-status-action-REPLIED").click();
  await page.getByTestId("contact-status-confirm").click();
  await expect(page.getByTestId("contact-status")).toHaveAttribute("data-status", "REPLIED");
  await expect.poll(async () => (await db.contactMessage.findUnique({ where: { id: readId } }))?.status).toBe("REPLIED");

  const audit = await db.auditLog.findFirst({ where: { entityId: readId, action: "CONTACT_STATUS_CHANGED" } });
  expect(audit?.userId).toBe(ids.users[1]);
  expect(audit?.metadata).toEqual({ oldStatus: "READ", newStatus: "REPLIED" });

  await login(page, `${marker}.lawyer@example.test`);
  await page.goto(`/admin/contacts/${repliedId}`);
  await expect(page.getByTestId("contact-readonly-state")).toBeVisible();
  await expect(page.locator('[data-testid^="contact-status-action-"]')).toHaveCount(0);
});

test("ADMIN archives only after confirmation", async ({ page }) => {
  await login(page, `${marker}.admin@example.test`);
  await page.goto(`/admin/contacts/${archiveId}`);

  await page.getByTestId("contact-status-action-ARCHIVED").click();
  await expect(page.getByTestId("contact-archive-dialog")).toBeVisible();
  await page.getByTestId("contact-archive-cancel").click();
  await expect(page.getByTestId("contact-archive-dialog")).toHaveCount(0);
  expect((await db.contactMessage.findUnique({ where: { id: archiveId } }))?.status).toBe("REPLIED");
  expect(await db.auditLog.count({ where: { entityId: archiveId, action: "CONTACT_STATUS_CHANGED" } })).toBe(0);

  await page.getByTestId("contact-status-action-ARCHIVED").click();
  await page.getByTestId("contact-archive-confirm").click();
  await expect(page.getByTestId("contact-status")).toHaveAttribute("data-status", "ARCHIVED");
  await expect.poll(async () => (await db.contactMessage.findUnique({ where: { id: archiveId } }))?.status).toBe("ARCHIVED");
  const audit = await db.auditLog.findFirst({ where: { entityId: archiveId, action: "CONTACT_STATUS_CHANGED" } });
  expect(audit?.metadata).toEqual({ oldStatus: "REPLIED", newStatus: "ARCHIVED" });
  await expect(page.getByTestId("contact-status-actions").locator("button")).toHaveCount(0);
});
