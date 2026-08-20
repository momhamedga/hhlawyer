import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { createTestPrismaClient } from "../../lib/test-database.js";
import { hashPassword } from "../auth/auth.service.js";

const marker = `phase6b3_api_${Date.now()}`;
const password = "a securely long test password";
const database = createTestPrismaClient();
const app = createApp({ database });
const ids = { users: [] as string[], contacts: [] as string[] };
const agents = {} as Record<"ADMIN" | "STAFF" | "LAWYER", ReturnType<typeof request.agent>>;
let unreadId = "";
let archivedId = "";

beforeAll(async () => {
  for (const role of ["ADMIN", "STAFF", "LAWYER"] as const) {
    const user = await database.user.create({ data: { email: `${marker}.${role.toLowerCase()}@example.test`, name: `${marker} ${role}`, role, passwordHash: await hashPassword(password) } });
    ids.users.push(user.id);
    const agent = request.agent(app);
    expect((await agent.post("/api/v1/auth/login").send({ email: user.email, password })).status).toBe(200);
    agents[role] = agent;
  }
  const contacts = await Promise.all([
    database.contactMessage.create({ data: { name: `${marker} unread`, email: "unread@example.test", subject: `${marker} subject`, message: "private message", status: "UNREAD" } }),
    database.contactMessage.create({ data: { name: `${marker} archived`, email: "archived@example.test", subject: `${marker} archived`, message: "private message", status: "ARCHIVED" } }),
  ]);
  ids.contacts.push(...contacts.map(({ id }) => id));
  unreadId = contacts[0].id;
  archivedId = contacts[1].id;
}, 30_000);

afterAll(async () => {
  await database.auditLog.deleteMany({ where: { entityId: { in: ids.contacts } } });
  await database.session.deleteMany({ where: { userId: { in: ids.users } } });
  await database.contactMessage.deleteMany({ where: { id: { in: ids.contacts } } });
  await database.user.deleteMany({ where: { id: { in: ids.users } } });
  await database.$disconnect();
});

describe("contact administration API", () => {
  it("provides safe read, search, filter, and backend sorting to every authenticated role", async () => {
    for (const role of ["ADMIN", "STAFF", "LAWYER"] as const) {
      const response = await agents[role].get(`/api/v1/admin/contacts?search=${marker}&status=UNREAD&sortBy=status&sortOrder=asc`);
      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0]).toMatchObject({ id: unreadId, status: "UNREAD" });
      expect(response.body.data.items[0]).not.toHaveProperty("message");
      expect((await agents[role].get(`/api/v1/admin/contacts/${unreadId}`)).body.data.message).toBe("private message");
    }
  });

  it("enforces RBAC, CORS, safe audit metadata, and archive terminal transitions", async () => {
    const preflight = await request(app).options(`/api/v1/admin/contacts/${unreadId}/status`).set("Origin", "http://localhost:3000").set("Access-Control-Request-Method", "PATCH");
    expect(preflight.status).toBe(204);
    expect(preflight.headers["access-control-allow-methods"]).toContain("PATCH");

    const forbidden = await agents.LAWYER.patch(`/api/v1/admin/contacts/${unreadId}/status`).set("Origin", "http://localhost:3000").send({ status: "READ" });
    expect(forbidden.status).toBe(403);

    const changed = await agents.ADMIN.patch(`/api/v1/admin/contacts/${unreadId}/status`).set("Origin", "http://localhost:3000").send({ status: "READ" });
    expect(changed.status).toBe(200);
    expect(changed.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    expect((await database.contactMessage.findUnique({ where: { id: unreadId } }))?.status).toBe("READ");
    const audit = await database.auditLog.findFirst({ where: { entityId: unreadId, action: "CONTACT_STATUS_CHANGED" } });
    expect(audit?.metadata).toEqual({ oldStatus: "UNREAD", newStatus: "READ" });
    expect(audit?.metadata).not.toHaveProperty("email");
    expect(audit?.metadata).not.toHaveProperty("message");

    const terminal = await agents.ADMIN.patch(`/api/v1/admin/contacts/${archivedId}/status`).set("Origin", "http://localhost:3000").send({ status: "READ" });
    expect(terminal.status).toBe(409);
    expect(terminal.body.error.code).toBe("INVALID_CONTACT_STATUS_TRANSITION");
    expect(await database.auditLog.count({ where: { entityId: archivedId, action: "CONTACT_STATUS_CHANGED" } })).toBe(0);

    const deniedOrigin = await agents.ADMIN.patch(`/api/v1/admin/contacts/${unreadId}/status`).set("Origin", "https://attacker.example").send({ status: "REPLIED" });
    expect(deniedOrigin.status).toBe(403);
  });
});
