import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { CONSULTATION_BOOKING_DAY_COUNT, calendarDateInTimeZone, consultationCalendarDates, consultationSubmissionSchema } from "@hhlawyer/validation";
import { createApp } from "../../app.js";
import { createTestPrismaClient } from "../../lib/test-database.js";
import type { EmailNotifier } from "../../services/email/email.types.js";
import { formatConsultationReference } from "./consultations.service.js";

const marker = `PHASE3B_TEST_${Date.now()}`;
const testDatabase = createTestPrismaClient();
let consultationNotificationAttempts = 0;
const notifier: EmailNotifier = {
  provider: "test",
  async sendContactNotification() {},
  async sendConsultationNotification() { consultationNotificationAttempts += 1; },
};
const app = createApp({ database: testDatabase, consultationRateLimit: 100, notifier });
const rateLimitedApp = createApp({ database: testDatabase, consultationRateLimit: 5, notifier });
const origin = "http://localhost:3000";
let serviceId = "";

const boundaryNow = new Date("2026-09-06T20:30:00.000Z");
const boundaryDates = consultationCalendarDates(boundaryNow);

function offsetCalendarDate(value: string, days: number) {
  const date = new Date(`${value}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function withBoundaryClock<T>(action: () => Promise<T>) {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(boundaryNow);
  try {
    return await action();
  } finally {
    vi.useRealTimers();
  }
}

function validPayload(suffix = "valid") {
  return {
    serviceId,
    name: `${marker}_${suffix}`,
    email: `${suffix}.${Date.now()}@example.test`,
    phone: "+971 50 123 4567",
    preferredDate: consultationCalendarDates()[3]!,
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

  it("offers the Dubai business date when the visitor-local calendar is still on the prior day", () => {
    const visitorDate = calendarDateInTimeZone(boundaryNow, "America/New_York");
    const [businessDate] = boundaryDates;

    expect(visitorDate).toBe("2026-09-06");
    expect(businessDate).toBe("2026-09-07");
    expect(visitorDate < businessDate).toBe(true);
    expect(consultationSubmissionSchema.safeParse({ ...validPayload("business_timezone"), preferredDate: businessDate }).success).toBe(true);
  });

  it("defines the deterministic seven-day Dubai booking window including today", () => {
    expect(CONSULTATION_BOOKING_DAY_COUNT).toBe(7);
    expect(boundaryDates).toEqual([
      "2026-09-07",
      "2026-09-08",
      "2026-09-09",
      "2026-09-10",
      "2026-09-11",
      "2026-09-12",
      "2026-09-13",
    ]);
  });

  it.each([
    ["first allowed date", boundaryDates[0]!],
    ["middle allowed date", boundaryDates[3]!],
    ["final allowed date", boundaryDates[6]!],
  ])("accepts the %s through the trusted HTTP API", async (suffix, preferredDate) => {
    const payload = { ...validPayload(`boundary_${suffix.replaceAll(" ", "_")}`), preferredDate };
    const response = await withBoundaryClock(() => request(app).post("/api/v1/consultations").set("Origin", origin).send(payload));

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ success: true, data: { status: "PENDING" } });
    expect(await testDatabase.consultation.count({ where: { name: payload.name } })).toBe(1);
  });

  it.each([
    ["date immediately before the allowed range", offsetCalendarDate(boundaryDates[0]!, -1)],
    ["first calendar date after the UI window", offsetCalendarDate(boundaryDates[6]!, 1)],
    ["far-future date", "2099-12-31"],
  ])("rejects the %s through the trusted HTTP API", async (suffix, preferredDate) => {
    const response = await withBoundaryClock(() => request(app).post("/api/v1/consultations").set("Origin", origin).send({
      ...validPayload(`rejected_${suffix.replaceAll(" ", "_")}`),
      preferredDate,
    }));

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR", fields: { preferredDate: [expect.any(String)] } });
  });

  it("rejects an out-of-window request before consultation, counter, or email side effects", async () => {
    const payload = { ...validPayload("side_effect_guard"), preferredDate: offsetCalendarDate(boundaryDates[6]!, 1) };
    const referenceYear = Number(boundaryDates[0]!.slice(0, 4));
    const consultationCountBefore = await testDatabase.consultation.count({ where: { name: payload.name } });
    const counterBefore = await testDatabase.consultationCounter.findUnique({ where: { year: referenceYear } });
    const notificationsBefore = consultationNotificationAttempts;

    const response = await withBoundaryClock(() => request(app).post("/api/v1/consultations").set("Origin", origin).send(payload));

    const counterAfter = await testDatabase.consultationCounter.findUnique({ where: { year: referenceYear } });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(await testDatabase.consultation.count({ where: { name: payload.name } })).toBe(consultationCountBefore);
    expect(counterAfter?.lastValue).toBe(counterBefore?.lastValue);
    expect(counterAfter?.updatedAt.getTime()).toBe(counterBefore?.updatedAt.getTime());
    expect(consultationNotificationAttempts).toBe(notificationsBefore);
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

  it("rejects missing Origin before consultation, counter, or email side effects", async () => {
    const payload = validPayload("missing_origin");
    const referenceYear = Number(payload.preferredDate.slice(0, 4));
    const consultationCountBefore = await testDatabase.consultation.count({ where: { name: payload.name } });
    const counterBefore = await testDatabase.consultationCounter.findUnique({ where: { year: referenceYear } });
    const notificationsBefore = consultationNotificationAttempts;

    const response = await request(app).post("/api/v1/consultations").send(payload);

    const counterAfter = await testDatabase.consultationCounter.findUnique({ where: { year: referenceYear } });
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("CSRF_ORIGIN_DENIED");
    expect(await testDatabase.consultation.count({ where: { name: payload.name } })).toBe(consultationCountBefore);
    expect(counterAfter?.lastValue).toBe(counterBefore?.lastValue);
    expect(counterAfter?.updatedAt.getTime()).toBe(counterBefore?.updatedAt.getTime());
    expect(consultationNotificationAttempts).toBe(notificationsBefore);
  });

  it("creates a pending consultation with a private response", async () => {
    const payload = validPayload("created");
    const response = await request(app).post("/api/v1/consultations").set("Origin", origin).send(payload);
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
    expect(record?.preferredDate.toISOString()).toBe(`${payload.preferredDate}T12:00:00.000Z`);
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
    const response = await request(app).post("/api/v1/consultations").set("Origin", origin).send({ ...validPayload("invalid"), ...invalid });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects a missing service and an inactive service", async () => {
    const missing = await request(app).post("/api/v1/consultations").set("Origin", origin).send({ ...validPayload("missing"), serviceId: "ck000000000000000000000000" });
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("SERVICE_NOT_FOUND");

    await testDatabase.service.update({ where: { id: serviceId }, data: { isActive: false } });
    const inactive = await request(app).post("/api/v1/consultations").set("Origin", origin).send(validPayload("inactive"));
    expect(inactive.status).toBe(404);
    expect(inactive.body.error.code).toBe("SERVICE_NOT_FOUND");
    await testDatabase.service.update({ where: { id: serviceId }, data: { isActive: true } });
  });

  it("rejects the honeypot without a database record", async () => {
    const payload = { ...validPayload("honeypot"), website: "bot.example" };
    const response = await request(app).post("/api/v1/consultations").set("Origin", origin).send(payload);
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("SPAM_DETECTED");
    expect(await testDatabase.consultation.count({ where: { name: payload.name } })).toBe(0);
  });

  it("returns a safe malformed JSON error", async () => {
    const response = await request(app).post("/api/v1/consultations").set("Origin", origin).set("Content-Type", "application/json").send("{");
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
      request(app).post("/api/v1/consultations").set("Origin", origin).send(validPayload(`concurrent_${index}`)),
    ));
    expect(responses.every((response) => response.status === 201)).toBe(true);
    const references = responses.map((response) => response.body.data.referenceNumber);
    expect(new Set(references).size).toBe(references.length);
    expect(references.every((reference) => /^CONS-\d{4}-\d{6}$/.test(reference))).toBe(true);
  });

  it("enforces the endpoint-specific rate limit", async () => {
    for (let index = 0; index < 5; index += 1) {
      const response = await request(rateLimitedApp).post("/api/v1/consultations").set("Origin", origin).send(validPayload(`rate_${index}`));
      expect(response.status).toBe(201);
    }
    const limited = await request(rateLimitedApp).post("/api/v1/consultations").set("Origin", origin).send(validPayload("rate_limited"));
    expect(limited.status).toBe(429);
    expect(limited.body.error.code).toBe("RATE_LIMITED");
  });
});
