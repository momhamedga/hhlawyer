import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { createTestPrismaClient } from "../../lib/test-database.js";
import type { EmailNotifier } from "../../services/email/email.types.js";
import type { ConsultationNotification, ContactNotification } from "../../services/email/email.types.js";
import { createConsultation } from "../consultations/consultations.service.js";

const marker = `PHASE4_TEST_${Date.now()}`;
const database = createTestPrismaClient();
const contactNotifications: ContactNotification[] = [];
const consultationNotifications: ConsultationNotification[] = [];
const notifier: EmailNotifier = {
  provider: "mock",
  async sendContactNotification(message) { contactNotifications.push(message); },
  async sendConsultationNotification(message) { consultationNotifications.push(message); },
};
const app = createApp({ database, notifier, contactRateLimit: 100, consultationRateLimit: 100 });
const rateApp = createApp({ database, notifier, contactRateLimit: 5 });
let serviceId = "";

function payload(suffix = "valid") { return { name: `${marker}_${suffix}`, email: `${suffix}.${Date.now()}@example.test`, subject: "Legal enquiry", message: "This is a valid contact test message.", website: "" }; }

beforeAll(async () => { const service = await database.service.findFirst({ where: { isActive: true } }); if (!service) throw new Error("TEST_SERVICE_NOT_FOUND"); serviceId = service.id; });
afterAll(async () => { await database.contactMessage.deleteMany({ where: { name: { startsWith: marker } } }); await database.consultation.deleteMany({ where: { name: { startsWith: marker } } }); await database.$disconnect(); });

describe("contact API", () => {
  it("persists a valid unread message and notifies without echoing PII", async () => {
    const input = payload("created");
    const response = await request(app).post("/api/v1/contact").send(input);
    expect(response.status).toBe(201); expect(response.body).toMatchObject({ success: true, data: { status: "received" } });
    expect(response.body.data).not.toHaveProperty("id"); expect(response.body.data).not.toHaveProperty("message"); expect(response.body.data).not.toHaveProperty("email");
    expect(await database.contactMessage.findFirst({ where: { name: input.name } })).toMatchObject({ status: "UNREAD", subject: input.subject });
    expect(contactNotifications).toContainEqual(expect.objectContaining({ subject: input.subject, locale: "en" }));
  });

  it("uses the accepted locale as internal email presentation context without changing either API response", async () => {
    const contact = payload("arabic_email");
    const contactResponse = await request(app).post("/api/v1/contact").set("Accept-Language", "ar-AE,ar;q=0.9").send(contact);
    expect(contactResponse.status).toBe(201);
    expect(contactResponse.body).toMatchObject({ success: true, data: { status: "received" } });
    expect(contactNotifications.at(-1)).toMatchObject({ name: contact.name, locale: "ar" });

    const consultationResponse = await request(app).post("/api/v1/consultations").set("Accept-Language", "ar-AE,ar;q=0.9").send({ serviceId, name: `${marker}_arabic_consultation`, email: "arabic@example.test", phone: "+971501234567", preferredDate: "2099-12-31", preferredTime: "09:00 AM", message: "Arabic email presentation context.", website: "" });
    expect(consultationResponse.status).toBe(201);
    expect(consultationResponse.body).toMatchObject({ success: true, data: { status: "PENDING" } });
    expect(consultationNotifications.at(-1)).toMatchObject({ locale: "ar", serviceSlug: expect.any(String), serviceName: expect.any(String) });
  });

  it.each([["name", { name: "x" }], ["email", { email: "bad" }], ["subject", { subject: "x" }], ["short message", { message: "short" }], ["oversized message", { message: "x".repeat(5_001) }], ["status", { status: "READ" }], ["unknown field", { id: "x" }]])("rejects invalid %s", async (_label, invalid) => {
    const response = await request(app).post("/api/v1/contact").send({ ...payload("invalid"), ...invalid });
    expect(response.status).toBe(400); expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects honeypot data without persistence", async () => { const input = { ...payload("honeypot"), website: "bot" }; const response = await request(app).post("/api/v1/contact").send(input); expect(response.status).toBe(400); expect(response.body.error.code).toBe("SPAM_DETECTED"); expect(await database.contactMessage.count({ where: { name: input.name } })).toBe(0); });
  it("enforces a separate contact limit", async () => { for (let index = 0; index < 5; index += 1) expect((await request(rateApp).post("/api/v1/contact").send(payload(`rate_${index}`))).status).toBe(201); expect((await request(rateApp).post("/api/v1/contact").send(payload("limited"))).status).toBe(429); });

  it("does not trust forwarded IPs unless proxy trust is configured", async () => {
    const direct = createApp({ database, notifier, contactRateLimit: 1, trustProxy: 0 });
    expect((await request(direct).post("/api/v1/contact").set("X-Forwarded-For", "198.51.100.1").send(payload("proxy_direct_1"))).status).toBe(201);
    expect((await request(direct).post("/api/v1/contact").set("X-Forwarded-For", "198.51.100.2").send(payload("proxy_direct_2"))).status).toBe(429);
    const trusted = createApp({ database, notifier, contactRateLimit: 1, trustProxy: 1 });
    expect((await request(trusted).post("/api/v1/contact").set("X-Forwarded-For", "198.51.100.3").send(payload("proxy_trusted_1"))).status).toBe(201);
    expect((await request(trusted).post("/api/v1/contact").set("X-Forwarded-For", "198.51.100.4").send(payload("proxy_trusted_2"))).status).toBe(201);
  });

  it("keeps persisted contact and consultation records when notification fails", async () => {
    const failing: EmailNotifier = { provider: "mock", async sendContactNotification() { throw new Error("FAIL"); }, async sendConsultationNotification() { throw new Error("FAIL"); } };
    const contact = payload("failed_notification");
    expect((await request(createApp({ database, notifier: failing })).post("/api/v1/contact").send(contact)).status).toBe(201);
    expect(await database.contactMessage.count({ where: { name: contact.name } })).toBe(1);
    const consultation = await createConsultation({ serviceId, name: `${marker}_consultation`, email: "notification@example.test", phone: "+971501234567", preferredDate: "2099-12-31", preferredTime: "09:00 AM", message: "notification safety", website: "" }, new Date(), database, failing);
    expect(await database.consultation.count({ where: { referenceNumber: consultation.referenceNumber } })).toBe(1);
  });
});
