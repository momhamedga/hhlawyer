import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { createTestPrismaClient } from "../../lib/test-database.js";
import { hashPassword } from "../auth/auth.service.js";

const marker = `phase6a1_${Date.now()}`;
const password = "a securely long test password";
const database = createTestPrismaClient();
const app = createApp({ database });
const ids: { users: string[]; consultations: string[] } = { users: [], consultations: [] };
const agents = {} as Record<"ADMIN" | "LAWYER" | "STAFF", ReturnType<typeof request.agent>>;
let serviceId = "";
let pendingId = "";
let completedId = "";

async function signIn(role: "ADMIN" | "LAWYER" | "STAFF") {
  return agents[role];
}

beforeAll(async () => {
  const service = await database.service.findFirst({ where: { isActive: true } });
  if (!service) throw new Error("TEST_SERVICE_NOT_FOUND");
  serviceId = service.id;

  for (const role of ["ADMIN", "LAWYER", "STAFF"] as const) {
    const user = await database.user.create({
      data: {
        email: `${marker}.${role.toLowerCase()}@example.test`,
        name: `${marker} ${role}`,
        passwordHash: await hashPassword(password),
        role,
      },
    });
    ids.users.push(user.id);

    const agent = request.agent(app);
    const response = await agent.post("/api/v1/auth/login").send({
      email: `${marker}.${role.toLowerCase()}@example.test`,
      password,
    });
    expect(response.status).toBe(200);
    agents[role] = agent;
  }

  const consultations = await Promise.all([
    database.consultation.create({
      data: {
        referenceNumber: `${marker}_PENDING`,
        serviceId,
        name: `${marker} Alpha`,
        email: "alpha@example.test",
        phone: "+971501111111",
        preferredDate: new Date("2099-06-10T12:00:00.000Z"),
        preferredTime: "09:00 AM",
        message: "Private consultation note.",
      },
    }),
    database.consultation.create({
      data: {
        referenceNumber: `${marker}_CONFIRMED`,
        serviceId,
        name: `${marker} Bravo`,
        email: "bravo@example.test",
        phone: "+971502222222",
        preferredDate: new Date("2099-06-11T12:00:00.000Z"),
        preferredTime: "10:00 AM",
        message: "Second private note.",
        status: "CONFIRMED",
      },
    }),
    database.consultation.create({
      data: {
        referenceNumber: `${marker}_COMPLETED`,
        serviceId,
        name: `${marker} Charlie`,
        email: "charlie@example.test",
        phone: "+971503333333",
        preferredDate: new Date("2099-06-12T12:00:00.000Z"),
        preferredTime: "11:00 AM",
        message: "Completed private note.",
        status: "COMPLETED",
      },
    }),
  ]);

  ids.consultations.push(...consultations.map((consultation) => consultation.id));
  pendingId = consultations[0].id;
  completedId = consultations[2].id;
}, 30_000);

afterAll(async () => {
  await database.auditLog.deleteMany({ where: { entityId: { in: ids.consultations } } });
  await database.session.deleteMany({ where: { userId: { in: ids.users } } });
  await database.consultation.deleteMany({ where: { id: { in: ids.consultations } } });
  await database.user.deleteMany({ where: { id: { in: ids.users } } });
  await database.$disconnect();
});

describe("consultation administration API", () => {
  it("requires authentication and gives every authorized role read access", async () => {
    expect((await request(app).get("/api/v1/admin/consultations")).status).toBe(401);

    for (const role of ["ADMIN", "LAWYER", "STAFF"] as const) {
      const agent = await signIn(role);
      const response = await agent.get(`/api/v1/admin/consultations?search=${marker}`);
      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(3);
    }
  });

  it("lists filtered, sorted, paginated records without private messages", async () => {
    const agent = await signIn("ADMIN");
    const response = await agent.get(
      `/api/v1/admin/consultations?search=${marker}&status=CONFIRMED&serviceId=${serviceId}&dateFrom=2099-06-01&dateTo=2099-06-30&sortBy=preferredDate&sortOrder=asc&page=1&limit=1`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.pagination).toMatchObject({ page: 1, limit: 1, total: 1, totalPages: 1 });
    expect(response.body.data.items[0]).toMatchObject({ status: "CONFIRMED", service: { id: serviceId } });
    expect(response.body.data.items[0]).not.toHaveProperty("message");
  });

  it("validates list controls and supports each search, filter, and sorting contract", async () => {
    const admin = await signIn("ADMIN");
    const base = `/api/v1/admin/consultations?search=${marker}`;

    const defaults = await admin.get(base);
    expect(defaults.status).toBe(200);
    expect(defaults.body.data.pagination).toMatchObject({ page: 1, limit: 20, total: 3, totalPages: 1 });

    const page = await admin.get(`${base}&page=2&limit=2&sortBy=createdAt&sortOrder=asc`);
    expect(page.status).toBe(200);
    expect(page.body.data.pagination).toMatchObject({ page: 2, limit: 2, total: 3, totalPages: 2 });
    expect(page.body.data.items).toHaveLength(1);

    for (const term of ["Alpha", "alpha@example.test", "+971501111111", `${marker}_PENDING`]) {
      const response = await admin.get(`/api/v1/admin/consultations?search=${encodeURIComponent(term)}`);
      expect(response.status).toBe(200);
      expect(response.body.data.items.some((item: { referenceNumber: string }) => item.referenceNumber === `${marker}_PENDING`)).toBe(true);
    }

    for (const query of [
      `status=PENDING`,
      `serviceId=${serviceId}`,
      "dateFrom=2099-06-11",
      "dateTo=2099-06-11",
      "dateFrom=2099-06-10&dateTo=2099-06-12",
      "sortBy=createdAt&sortOrder=asc",
      "sortBy=preferredDate&sortOrder=desc",
      "sortBy=status&sortOrder=asc",
    ]) {
      expect((await admin.get(`${base}&${query}`)).status).toBe(200);
    }

    for (const query of [
      "page=0",
      "limit=101",
      "status=UNKNOWN",
      "dateFrom=2099-02-30",
      "dateFrom=2099-06-12&dateTo=2099-06-10",
      "sortBy=name",
    ]) {
      const invalid = await admin.get(`/api/v1/admin/consultations?${query}`);
      expect(invalid.status).toBe(400);
      expect(invalid.body.error.code).toBe("VALIDATION_ERROR");
    }

    const empty = await admin.get("/api/v1/admin/consultations?search=no-such-phase6a1-record");
    expect(empty.status).toBe(200);
    expect(empty.body.data).toMatchObject({ items: [], pagination: { total: 0, totalPages: 0 } });
  });

  it("returns detail with the private message and a stable not-found response", async () => {
    const agent = await signIn("LAWYER");
    const detail = await agent.get(`/api/v1/admin/consultations/${pendingId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data).toMatchObject({ id: pendingId, message: "Private consultation note." });

    const missing = await agent.get("/api/v1/admin/consultations/ck000000000000000000000000");
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("CONSULTATION_NOT_FOUND");
  });

  it("allows ADMIN, LAWYER, and STAFF to read the same safe detail contract", async () => {
    for (const role of ["ADMIN", "LAWYER", "STAFF"] as const) {
      const response = await (await signIn(role)).get(`/api/v1/admin/consultations/${pendingId}`);
      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({ id: pendingId, service: { id: serviceId } });
      expect(response.body.data).not.toHaveProperty("passwordHash");
      expect(response.body.data).not.toHaveProperty("sessions");
    }
  });

  it("allows only managing roles to make valid status changes and writes one safe audit record", async () => {
    const preflight = await request(app)
      .options(`/api/v1/admin/consultations/${pendingId}/status`)
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "PATCH");
    expect(preflight.status).toBe(204);
    expect(preflight.headers["access-control-allow-methods"]).toContain("PATCH");

    const staff = await signIn("STAFF");
    const forbidden = await staff
      .patch(`/api/v1/admin/consultations/${pendingId}/status`)
      .set("Origin", "http://localhost:3000")
      .send({ status: "CONFIRMED" });
    expect(forbidden.status).toBe(403);

    const admin = await signIn("ADMIN");
    const changed = await admin
      .patch(`/api/v1/admin/consultations/${pendingId}/status`)
      .set("Origin", "http://localhost:3000")
      .send({ status: "CONFIRMED" });
    expect(changed.status).toBe(200);
    expect(changed.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    expect(changed.body.data).toMatchObject({ id: pendingId, status: "CONFIRMED" });

    const audit = await database.auditLog.findFirst({
      where: { entityId: pendingId, action: "CONSULTATION_STATUS_CHANGED" },
    });
    expect(audit?.metadata).toEqual({ oldStatus: "PENDING", newStatus: "CONFIRMED" });

    const noOp = await admin
      .patch(`/api/v1/admin/consultations/${pendingId}/status`)
      .set("Origin", "http://localhost:3000")
      .send({ status: "CONFIRMED" });
    expect(noOp.status).toBe(200);
    expect(await database.auditLog.count({ where: { entityId: pendingId } })).toBe(1);
  });

  it("accepts every allowed transition for ADMIN or LAWYER and records only safe metadata", async () => {
    const transitions = [
      ["PENDING", "CONFIRMED"],
      ["PENDING", "CANCELLED"],
      ["CONFIRMED", "RESCHEDULED"],
      ["CONFIRMED", "COMPLETED"],
      ["CONFIRMED", "CANCELLED"],
      ["RESCHEDULED", "CONFIRMED"],
      ["RESCHEDULED", "CANCELLED"],
    ] as const;

    for (const [from, to] of transitions) {
      const consultation = await database.consultation.create({
        data: {
          referenceNumber: `${marker}_${from}_${to}_${ids.consultations.length}`,
          serviceId,
          name: `${marker} transition ${from} ${to}`,
          email: `transition-${ids.consultations.length}@example.test`,
          phone: "+971504444444",
          preferredDate: new Date("2099-07-01T12:00:00.000Z"),
          preferredTime: "01:00 PM",
          status: from,
        },
      });
      ids.consultations.push(consultation.id);

      const operator = await signIn(from === "PENDING" ? "ADMIN" : "LAWYER");
      const response = await operator
        .patch(`/api/v1/admin/consultations/${consultation.id}/status`)
        .set("Origin", "http://localhost:3000")
        .send({ status: to });
      expect(response.status).toBe(200);

      const audit = await database.auditLog.findFirst({
        where: { entityId: consultation.id, action: "CONSULTATION_STATUS_CHANGED" },
      });
      expect(audit?.metadata).toEqual({ oldStatus: from, newStatus: to });
    }
  });

  it("rejects invalid transitions, invalid payloads, and unapproved origins", async () => {
    const lawyer = await signIn("LAWYER");
    const invalidTransition = await lawyer
      .patch(`/api/v1/admin/consultations/${completedId}/status`)
      .set("Origin", "http://localhost:3000")
      .send({ status: "PENDING" });
    expect(invalidTransition.status).toBe(409);
    expect(invalidTransition.body.error.code).toBe("INVALID_STATUS_TRANSITION");

    const cancelled = await database.consultation.create({
      data: {
        referenceNumber: `${marker}_CANCELLED`,
        serviceId,
        name: `${marker} Cancelled`,
        email: "cancelled@example.test",
        phone: "+971505555555",
        preferredDate: new Date("2099-07-02T12:00:00.000Z"),
        preferredTime: "02:00 PM",
        status: "CANCELLED",
      },
    });
    ids.consultations.push(cancelled.id);

    for (const id of [completedId, cancelled.id]) {
      for (const status of ["PENDING", "CONFIRMED"] as const) {
        const response = await lawyer
          .patch(`/api/v1/admin/consultations/${id}/status`)
          .set("Origin", "http://localhost:3000")
          .send({ status });
        expect(response.status).toBe(409);
        expect(response.body.error.code).toBe("INVALID_STATUS_TRANSITION");
      }
    }

    expect(await database.auditLog.count({ where: { entityId: { in: [completedId, cancelled.id] }, action: "CONSULTATION_STATUS_CHANGED" } })).toBe(0);

    const invalidPayload = await lawyer
      .patch(`/api/v1/admin/consultations/${pendingId}/status`)
      .set("Origin", "http://localhost:3000")
      .send({ status: "PENDING", unexpected: true });
    expect(invalidPayload.status).toBe(400);
    expect((await database.consultation.findUnique({ where: { id: pendingId } }))?.email).toBe("alpha@example.test");

    const originDenied = await lawyer
      .patch(`/api/v1/admin/consultations/${pendingId}/status`)
      .set("Origin", "https://attacker.example")
      .send({ status: "CANCELLED" });
    expect(originDenied.status).toBe(403);
    expect(originDenied.body.error.code).toBe("CORS_ORIGIN_DENIED");
  });
});
