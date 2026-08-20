import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { createTestPrismaClient } from "../../lib/test-database.js";
import { hashPassword } from "../auth/auth.service.js";

const marker = `phase7b1-${Date.now()}`; const password = "phase7b1 secure password";
const db = createTestPrismaClient(); const app = createApp({ database: db });
const userIds: string[] = []; const serviceIds: string[] = []; const consultationIds: string[] = []; const contactIds: string[] = [];
let actorId = ""; const agents = {} as Record<"ADMIN" | "LAWYER" | "STAFF", ReturnType<typeof request.agent>>;
async function createUser(role: "ADMIN" | "LAWYER" | "STAFF", suffix: string, isActive = true) { const user = await db.user.create({ data: { email: `${marker}.${suffix}@example.test`, name: `${marker} ${suffix}`, role, isActive, passwordHash: await hashPassword(password) } }); userIds.push(user.id); return user; }
beforeAll(async () => { for (const role of ["ADMIN", "LAWYER", "STAFF"] as const) { const user = await createUser(role, role.toLowerCase()); if (role === "ADMIN") actorId = user.id; const agent = request.agent(app); expect((await agent.post("/api/v1/auth/login").send({ email: user.email, password })).status).toBe(200); agents[role] = agent; } }, 30_000);
afterAll(async () => { await db.auditLog.deleteMany({ where: { OR: [{ userId: { in: userIds } }, { entityId: { in: [...serviceIds, ...consultationIds, ...contactIds] } }] } }); await db.consultation.deleteMany({ where: { id: { in: consultationIds } } }); await db.contactMessage.deleteMany({ where: { id: { in: contactIds } } }); await db.service.deleteMany({ where: { id: { in: serviceIds } } }); await db.session.deleteMany({ where: { userId: { in: userIds } } }); await db.user.deleteMany({ where: { id: { in: userIds } } }); await db.$disconnect(); });

describe("admin dashboard overview", () => {
  it("aggregates controlled Test data with safe bounded operational DTOs", async () => {
    expect((await request(app).get("/api/v1/admin/overview")).status).toBe(401);
    const before = (await agents.ADMIN.get("/api/v1/admin/overview?range=7d")).body.data;
    expect(before.authenticated).toBe(true);
    expect((await agents.ADMIN.get("/api/v1/admin/overview?range=all")).body.error.code).toBe("VALIDATION_ERROR");
    const active = await db.service.create({ data: { slug: `${marker}-active`, name: `${marker} active`, description: "Controlled dashboard active service.", sortOrder: 900001 } });
    const inactive = await db.service.create({ data: { slug: `${marker}-inactive`, name: `${marker} inactive`, description: "Controlled dashboard inactive service.", isActive: false, sortOrder: 900002 } });
    serviceIds.push(active.id, inactive.id);
    for (const status of ["PENDING", "CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED"] as const) { const item = await db.consultation.create({ data: { referenceNumber: `${marker}-${status}`, serviceId: active.id, name: "Dashboard consultation PII", email: "dashboard@example.test", phone: "+971501234567", preferredDate: new Date("2099-12-31T12:00:00.000Z"), preferredTime: "09:00 AM", message: "Dashboard consultation private body.", status } }); consultationIds.push(item.id); }
    for (const status of ["UNREAD", "READ", "REPLIED", "ARCHIVED"] as const) { const item = await db.contactMessage.create({ data: { name: "Dashboard contact PII", email: "dashboard-contact@example.test", subject: `${marker}-${status}`, message: "Dashboard contact private body.", status } }); contactIds.push(item.id); }
    await createUser("ADMIN", "summary-admin"); await createUser("LAWYER", "summary-lawyer"); await createUser("STAFF", "summary-staff"); await createUser("STAFF", "summary-inactive", false);
    await db.auditLog.create({ data: { userId: actorId, action: "DASHBOARD_FIXTURE_EVENT", entity: "DashboardFixture", entityId: contactIds[0], metadata: { privateBody: "must not be returned" } } });
    const response = await agents.ADMIN.get("/api/v1/admin/overview?range=7d");
    expect(response.status).toBe(200); expect(response.headers["cache-control"]).toContain("private"); expect(response.headers["cache-control"]).toContain("no-store");
    const data = response.body.data; expect(data.authenticated).toBe(true); expect(data.period.range).toBe("7d");
    expect(data.consultations.total).toBe(before.consultations.total + 5); expect(data.consultations.periodTotal).toBeGreaterThanOrEqual(before.consultations.periodTotal + 5);
    for (const status of ["PENDING", "CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED"] as const) expect(data.consultations.byStatus[status]).toBe(before.consultations.byStatus[status] + 1);
    expect(data.contacts.total).toBe(before.contacts.total + 4); expect(data.contacts.periodTotal).toBeGreaterThanOrEqual(before.contacts.periodTotal + 4);
    for (const status of ["UNREAD", "READ", "REPLIED", "ARCHIVED"] as const) expect(data.contacts.byStatus[status]).toBe(before.contacts.byStatus[status] + 1);
    expect(data.services).toMatchObject({ total: before.services.total + 2, active: before.services.active + 1, inactive: before.services.inactive + 1 });
    expect(data.users).toMatchObject({ total: before.users.total + 4, active: before.users.active + 3, inactive: before.users.inactive + 1 });
    expect(data.users.byRole.ADMIN).toBe(before.users.byRole.ADMIN + 1); expect(data.users.byRole.LAWYER).toBe(before.users.byRole.LAWYER + 1); expect(data.users.byRole.STAFF).toBe(before.users.byRole.STAFF + 2);
    const consultation = data.recentConsultations.find((item: { referenceNumber: string }) => item.referenceNumber === `${marker}-PENDING`);
    expect(consultation).toBeDefined(); expect(consultation).not.toHaveProperty("name"); expect(consultation).not.toHaveProperty("email"); expect(consultation).not.toHaveProperty("message");
    const contact = data.recentContacts.find((item: { subject: string }) => item.subject === `${marker}-UNREAD`);
    expect(contact).toBeDefined(); expect(contact).not.toHaveProperty("name"); expect(contact).not.toHaveProperty("email"); expect(contact).not.toHaveProperty("message");
    const activity = data.recentActivity.find((item: { action: string }) => item.action === "DASHBOARD_FIXTURE_EVENT");
    expect(activity).toMatchObject({ entity: "DashboardFixture", entityId: contactIds[0], actor: { id: actorId, role: "ADMIN" } }); expect(activity).not.toHaveProperty("metadata"); expect(activity).not.toHaveProperty("ipAddress"); expect(activity).not.toHaveProperty("userAgent");
  });
  it("allows only ADMIN dashboard access", async () => { expect((await agents.LAWYER.get("/api/v1/admin/overview")).status).toBe(403); expect((await agents.STAFF.get("/api/v1/admin/overview")).status).toBe(403); });
});
