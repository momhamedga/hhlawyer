import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { createTestPrismaClient } from "../../lib/test-database.js";
import { formatConsultationReference } from "./consultations.service.js";

const marker = `PHASE3B_TEST_${Date.now()}`;
const testDatabase = createTestPrismaClient();
const app = createApp({ database: testDatabase, consultationRateLimit: 100 });
const rateLimitedApp = createApp({ database: testDatabase, consultationRateLimit: 5 });
let serviceId = "";

function validPayload(suffix = "valid") {
  return {
    serviceId,
    name: `${marker}_${suffix}`,
    email: `${suffix}.${Date.now()}@example.test`,
    phone: "+971 50 123 4567",
    preferredDate: "2099-12-31",
    preferredTime: "09:00 AM",
    message: "Integration test consultation.",
    website: "",
  };
}

beforeAll(async () => {
  const service = await testDatabase.service.findFirst({ where: { isActive: true }, orderBy: { slug: "asc" } });
  if (!service) throw new Error("TEST_SERVICE_NOT_FOUND");
  serviceId = service.id;
});

afterAll(async () => {
  await testDatabase.consultation.deleteMany({ where: { name: { startsWith: marker } } });
  await testDatabase.service.updateMany({ where: { id: serviceId }, data: { isActive: true } });
  await testDatabase.$disconnect();
});

describe("consultation booking API", () => {
  it("formats yearly references with a six-digit sequence", () => {
    expect(formatConsultationReference(2026, 1)).toBe("CONS-2026-000001");
    expect(formatConsultationReference(2027, 42)).toBe("CONS-2027-000042");
  });

  it("keeps the health endpoint available", async () => {
    const response = await request(app).get("/api/v1/health");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.headers["permissions-policy"]).toBe("accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()");
    expect(response.headers["content-security-policy"]).toBeDefined();
    expect(response.headers["strict-transport-security"]).toBeDefined();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
    expect(JSON.stringify(response.body)).not.toMatch(/CONTACT_NOTIFICATION_TO|notificationRecipients|primary@example\.test|backup@example\.test/);
  });

  it("creates a pending consultation with a private response", async () => {
    const payload = validPayload("created");
    const response = await request(app).post("/api/v1/consultations").send(payload);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ success: true, data: { status: "PENDING" } });
    expect(response.body.data.referenceNumber).toMatch(/^CONS-\d{4}-\d{6}$/);
    expect(response.body.data).not.toHaveProperty("id");
    expect(response.body.data).not.toHaveProperty("name");
    expect(response.body.data).not.toHaveProperty("email");
    expect(response.body.data).not.toHaveProperty("phone");
    expect(response.body.data).not.toHaveProperty("message");
    expect(JSON.stringify(response.body)).not.toMatch(/CONTACT_NOTIFICATION_TO|notificationRecipients|primary@example\.test|backup@example\.test/);
    const record = await testDatabase.consultation.findUnique({ where: { referenceNumber: response.body.data.referenceNumber } });
    expect(record).toMatchObject({ serviceId, status: "PENDING", name: payload.name });
    expect(record?.preferredDate.toISOString()).toMatch(/^2099-12-31T12:00:00\.000Z$/);
  });

  it.each([
    ["missing name", { name: undefined }],
    ["invalid email", { email: "invalid" }],
    ["invalid phone", { phone: "abc" }],
    ["invalid date", { preferredDate: "2099-02-31" }],
    ["past date", { preferredDate: "2000-01-01" }],
    ["invalid time", { preferredTime: "anytime" }],
    ["missing service", { serviceId: undefined }],
    ["oversized message", { message: "x".repeat(2_001) }],
    ["server controlled status", { status: "CONFIRMED" }],
    ["server controlled reference", { referenceNumber: "CONS-2099-000001" }],
    ["server controlled id", { id: "abc" }],
  ])("rejects %s", async (_label, invalid) => {
    const response = await request(app).post("/api/v1/consultations").send({ ...validPayload("invalid"), ...invalid });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a missing service and an inactive service", async () => {
    const missing = await request(app).post("/api/v1/consultations").send({ ...validPayload("missing"), serviceId: "ck000000000000000000000000" });
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("SERVICE_NOT_FOUND");

    await testDatabase.service.update({ where: { id: serviceId }, data: { isActive: false } });
    const inactive = await request(app).post("/api/v1/consultations").send(validPayload("inactive"));
    expect(inactive.status).toBe(404);
    expect(inactive.body.error.code).toBe("SERVICE_NOT_FOUND");
    await testDatabase.service.update({ where: { id: serviceId }, data: { isActive: true } });
  });

  it("rejects the honeypot without a database record", async () => {
    const payload = { ...validPayload("honeypot"), website: "bot.example" };
    const response = await request(app).post("/api/v1/consultations").send(payload);
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("SPAM_DETECTED");
    expect(await testDatabase.consultation.count({ where: { name: payload.name } })).toBe(0);
  });

  it("returns a safe malformed JSON error", async () => {
    const response = await request(app).post("/api/v1/consultations").set("Content-Type", "application/json").send("{");
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("MALFORMED_JSON");
  });

  it("allows the configured development web origin", async () => {
    const response = await request(app).post("/api/v1/consultations").set("Origin", "http://localhost:3000").send(validPayload("cors"));
    expect(response.status).toBe(201);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });

  it("allocates unique references for concurrent submissions", async () => {
    const responses = await Promise.all(Array.from({ length: 6 }, (_, index) =>
      request(app).post("/api/v1/consultations").send(validPayload(`concurrent_${index}`)),
    ));
    expect(responses.every((response) => response.status === 201)).toBe(true);
    const references = responses.map((response) => response.body.data.referenceNumber);
    expect(new Set(references).size).toBe(references.length);
    expect(references.every((reference) => /^CONS-\d{4}-\d{6}$/.test(reference))).toBe(true);
  });

  it("enforces the endpoint-specific rate limit", async () => {
    for (let index = 0; index < 5; index += 1) {
      const response = await request(rateLimitedApp).post("/api/v1/consultations").send(validPayload(`rate_${index}`));
      expect(response.status).toBe(201);
    }
    const limited = await request(rateLimitedApp).post("/api/v1/consultations").send(validPayload("rate_limited"));
    expect(limited.status).toBe(429);
    expect(limited.body.error.code).toBe("RATE_LIMITED");
  });
});
