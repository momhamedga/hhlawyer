import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { consultationCalendarDates } from "@hhlawyer/validation";
import type { Prisma, PrismaClient } from "@prisma/client";
import { createApp } from "../../app.js";
import { createTestPrismaClient } from "../../lib/test-database.js";
import type { EmailNotifier } from "../../services/email/email.types.js";
import type { ConsultationNotification, ContactNotification } from "../../services/email/email.types.js";
import {
  contactPayloadHmac,
  hashIdempotencyKey,
} from "./idempotency.js";

const marker = `IDEMPOTENCY_TEST_${Date.now()}`;
const origin = "http://localhost:3000";
const database = createTestPrismaClient();
const keys: string[] = [];
const contactNotifications: ContactNotification[] = [];
const consultationNotifications: ConsultationNotification[] = [];
const notifier: EmailNotifier = {
  provider: "test",
  async sendContactNotification(notification) { contactNotifications.push(notification); },
  async sendConsultationNotification(notification) { consultationNotifications.push(notification); },
};
const app = createApp({ database, notifier, contactRateLimit: 100, consultationRateLimit: 100 });
const transitionApp = createApp({ database, notifier, contactRateLimit: 100, consultationRateLimit: 100, publicFormIdempotencyRequired: false });
const enforcedApp = createApp({ database, notifier, contactRateLimit: 100, consultationRateLimit: 100, publicFormIdempotencyRequired: true });
let serviceId = "";

function key() {
  const value = randomUUID();
  keys.push(value);
  return value;
}

function withTwoPartyClaimBarrier(source: PrismaClient) {
  let arrivals = 0;
  let release!: () => void;
  const bothArrived = new Promise<void>((resolve) => { release = resolve; });

  async function arrive() {
    arrivals += 1;
    if (arrivals === 2) release();
    await bothArrived;
  }

  return new Proxy(source, {
    get(target, property) {
      if (property !== "$transaction") return Reflect.get(target, property, target);
      return async (callback: (transaction: Prisma.TransactionClient) => Promise<unknown>, options?: { timeout?: number }) => target.$transaction(async (transaction) => {
        const delegate = transaction.publicSubmissionIdempotency;
        const synchronizedDelegate = new Proxy(delegate, {
          get(delegateTarget, delegateProperty) {
            if (delegateProperty !== "create") return Reflect.get(delegateTarget, delegateProperty, delegateTarget);
            return async (args: Parameters<typeof delegate.create>[0]) => {
              await arrive();
              return delegate.create(args);
            };
          },
        });
        const synchronizedTransaction = new Proxy(transaction, {
          get(transactionTarget, transactionProperty) {
            if (transactionProperty === "publicSubmissionIdempotency") return synchronizedDelegate;
            return Reflect.get(transactionTarget, transactionProperty, transactionTarget);
          },
        });
        return callback(synchronizedTransaction as Prisma.TransactionClient);
      }, options);
    },
  }) as PrismaClient;
}

function contactPayload(suffix: string) {
  return {
    name: `${marker}_contact_${suffix}`,
    email: `${suffix}@example.test`,
    subject: `Legal enquiry ${suffix}`,
    message: `This is the complete idempotency contact message for ${suffix}.`,
    website: "",
  };
}

function consultationPayload(suffix: string) {
  return {
    serviceId,
    name: `${marker}_consultation_${suffix}`,
    email: `${suffix}@example.test`,
    phone: "+971 50 123 4567",
    preferredDate: consultationCalendarDates()[3]!,
    preferredTime: "09:00 AM",
    message: `Idempotency consultation ${suffix}.`,
    website: "",
  };
}

function postContact(payload: ReturnType<typeof contactPayload>, idempotencyKey?: string, target = app) {
  const submission = request(target).post("/api/v1/contact").set("Origin", origin);
  if (idempotencyKey !== undefined) submission.set("Idempotency-Key", idempotencyKey);
  return submission.send(payload);
}

function postConsultation(payload: ReturnType<typeof consultationPayload>, idempotencyKey?: string, target = app) {
  const submission = request(target).post("/api/v1/consultations").set("Origin", origin);
  if (idempotencyKey !== undefined) submission.set("Idempotency-Key", idempotencyKey);
  return submission.send(payload);
}

beforeAll(async () => {
  const service = await database.service.findFirst({ where: { isActive: true }, orderBy: { slug: "asc" } });
  if (!service) throw new Error("TEST_SERVICE_NOT_FOUND");
  serviceId = service.id;
});

afterAll(async () => {
  await database.contactMessage.deleteMany({ where: { name: { startsWith: marker } } });
  await database.consultation.deleteMany({ where: { name: { startsWith: marker } } });
  await database.publicSubmissionIdempotency.deleteMany({ where: { keyHash: { in: keys.map(hashIdempotencyKey) } } });
  await database.$disconnect();
});

describe("contact idempotency", () => {
  it("requires a key before database or email side effects", async () => {
    const payload = contactPayload("missing_key");
    const notificationsBefore = contactNotifications.length;
    const response = await postContact(payload);
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("IDEMPOTENCY_KEY_REQUIRED");
    expect(await database.contactMessage.count({ where: { name: payload.name } })).toBe(0);
    expect(contactNotifications).toHaveLength(notificationsBefore);
  });

  it.each([
    ["UUIDv1", "6ba7b810-9dad-11d1-80b4-00c04fd430c8"],
    ["UUIDv3", "6fa459ea-ee8a-3ca4-894e-db77e160355e"],
    ["UUIDv5", "886313e1-3b8a-5372-9b90-0c9aee199e5d"],
    ["UUIDv7", "01941f00-7d00-7000-8000-000000000000"],
    ["nil UUID", "00000000-0000-0000-0000-000000000000"],
    ["malformed value", "not-a-uuid"],
  ])("rejects an invalid %s key before database or email side effects", async (label, invalidKey) => {
    const payload = contactPayload(`invalid_key_${label.replaceAll(" ", "_")}`);
    const notificationsBefore = contactNotifications.length;
    const response = await postContact(payload, invalidKey);
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("IDEMPOTENCY_KEY_INVALID");
    expect(await database.contactMessage.count({ where: { name: payload.name } })).toBe(0);
    expect(contactNotifications).toHaveLength(notificationsBefore);
  });

  it("creates and notifies once for a first valid request", async () => {
    const payload = contactPayload("first");
    const idempotencyKey = key();
    const response = await postContact(payload, idempotencyKey);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ success: true, data: { status: "received" } });
    expect(await database.contactMessage.count({ where: { name: payload.name } })).toBe(1);
    expect(contactNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(1);
    expect((await database.publicSubmissionIdempotency.findUnique({ where: { scope_keyHash: { scope: "CONTACT", keyHash: hashIdempotencyKey(idempotencyKey) } } }))?.notificationState).toBe("SENT");
  });

  it("replays the original response without a second row or provider attempt", async () => {
    const payload = contactPayload("sequential_replay");
    const idempotencyKey = key();
    const first = await postContact({ ...payload, name: ` ${payload.name} `, email: payload.email.toUpperCase(), subject: ` ${payload.subject} `, message: ` ${payload.message} ` }, idempotencyKey);
    const replay = await postContact(payload, idempotencyKey);
    expect([first.status, replay.status]).toEqual([201, 201]);
    expect(replay.body).toEqual(first.body);
    expect(await database.contactMessage.count({ where: { name: payload.name } })).toBe(1);
    expect(contactNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(1);
  });

  it("rejects same-key different-payload reuse without side effects", async () => {
    const payload = contactPayload("conflict");
    const idempotencyKey = key();
    expect((await postContact(payload, idempotencyKey)).status).toBe(201);
    const conflict = await postContact({ ...payload, subject: "A different normalized subject" }, idempotencyKey);
    expect(conflict.status).toBe(409);
    expect(conflict.body.error.code).toBe("IDEMPOTENCY_KEY_CONFLICT");
    expect(await database.contactMessage.count({ where: { name: payload.name } })).toBe(1);
    expect(contactNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(1);
  });

  it("resolves concurrent identical requests to one result and one provider attempt", async () => {
    const payload = contactPayload("concurrent");
    const idempotencyKey = key();
    const synchronizedApp = createApp({ database: withTwoPartyClaimBarrier(database), notifier, contactRateLimit: 100, consultationRateLimit: 100 });
    const responses = await Promise.all([postContact(payload, idempotencyKey, synchronizedApp), postContact(payload, idempotencyKey, synchronizedApp)]);
    expect(responses.map((response) => response.status)).toEqual([201, 201]);
    expect(responses[1]!.body).toEqual(responses[0]!.body);
    expect(await database.contactMessage.count({ where: { name: payload.name } })).toBe(1);
    expect(await database.publicSubmissionIdempotency.count({ where: { scope: "CONTACT", keyHash: hashIdempotencyKey(idempotencyKey) } })).toBe(1);
    expect(contactNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(1);
  });

  it("allows the same payload with different keys as two intentional submissions", async () => {
    const payload = contactPayload("different_keys");
    const responses = await Promise.all([postContact(payload, key()), postContact(payload, key())]);
    expect(responses.every((response) => response.status === 201)).toBe(true);
    expect(await database.contactMessage.count({ where: { name: payload.name } })).toBe(2);
    expect(contactNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(2);
  });

  it("preserves business success and never reattempts a failed notification", async () => {
    const payload = contactPayload("notification_failure");
    const idempotencyKey = key();
    let attempts = 0;
    const failingNotifier: EmailNotifier = {
      provider: "test",
      async sendContactNotification() { attempts += 1; throw new Error("EXPECTED_TEST_FAILURE"); },
      async sendConsultationNotification() {},
    };
    const failingApp = createApp({ database, notifier: failingNotifier, contactRateLimit: 100 });
    const send = () => request(failingApp).post("/api/v1/contact").set("Origin", origin).set("Idempotency-Key", idempotencyKey).send(payload);
    const first = await send();
    const replay = await send();
    expect([first.status, replay.status]).toEqual([201, 201]);
    expect(replay.body).toEqual(first.body);
    expect(attempts).toBe(1);
    expect(await database.contactMessage.count({ where: { name: payload.name } })).toBe(1);
    expect((await database.publicSubmissionIdempotency.findUnique({ where: { scope_keyHash: { scope: "CONTACT", keyHash: hashIdempotencyKey(idempotencyKey) } } }))?.notificationState).toBe("FAILED");
  });

  it("replays an expired-but-not-cleaned record deterministically", async () => {
    const payload = contactPayload("expired");
    const idempotencyKey = key();
    const first = await postContact(payload, idempotencyKey);
    await database.publicSubmissionIdempotency.update({
      where: { scope_keyHash: { scope: "CONTACT", keyHash: hashIdempotencyKey(idempotencyKey) } },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });
    const replay = await postContact(payload, idempotencyKey);
    expect(replay.status).toBe(201);
    expect(replay.body).toEqual(first.body);
    expect(await database.contactMessage.count({ where: { name: payload.name } })).toBe(1);
  });

  it("never steals an existing processing claim and resolves it with a bounded response", async () => {
    const payload = contactPayload("processing");
    const idempotencyKey = key();
    await database.publicSubmissionIdempotency.create({
      data: {
        scope: "CONTACT",
        keyHash: hashIdempotencyKey(idempotencyKey),
        payloadHmac: contactPayloadHmac(payload),
        expiresAt: new Date(Date.now() + 60_000),
      },
    });
    const response = await postContact(payload, idempotencyKey);
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("IDEMPOTENCY_REQUEST_IN_PROGRESS");
    expect(await database.contactMessage.count({ where: { name: payload.name } })).toBe(0);
    expect(contactNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(0);
  });

  it("counts replays against the existing endpoint rate limit", async () => {
    const payload = contactPayload("replay_rate_limit");
    const idempotencyKey = key();
    const limitedApp = createApp({ database, notifier, contactRateLimit: 2 });
    const send = () => request(limitedApp).post("/api/v1/contact").set("Origin", origin).set("Idempotency-Key", idempotencyKey).send(payload);
    expect((await send()).status).toBe(201);
    expect((await send()).status).toBe(201);
    const limited = await send();
    expect(limited.status).toBe(429);
    expect(limited.body.error.code).toBe("RATE_LIMITED");
    expect(await database.contactMessage.count({ where: { name: payload.name } })).toBe(1);
  });
});

describe("consultation idempotency", () => {
  it("requires a key before consultation, counter, or email side effects", async () => {
    const payload = consultationPayload("missing_key");
    const year = Number(payload.preferredDate.slice(0, 4));
    const counterBefore = await database.consultationCounter.findUnique({ where: { year } });
    const notificationsBefore = consultationNotifications.length;
    const response = await postConsultation(payload);
    const counterAfter = await database.consultationCounter.findUnique({ where: { year } });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("IDEMPOTENCY_KEY_REQUIRED");
    expect(await database.consultation.count({ where: { name: payload.name } })).toBe(0);
    expect(counterAfter?.lastValue).toBe(counterBefore?.lastValue);
    expect(consultationNotifications).toHaveLength(notificationsBefore);
  });

  it("rejects an invalid key without side effects", async () => {
    const payload = consultationPayload("invalid_key");
    const response = await postConsultation(payload, "not-a-uuid");
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("IDEMPOTENCY_KEY_INVALID");
    expect(await database.consultation.count({ where: { name: payload.name } })).toBe(0);
  });

  it("creates a first consultation with one reference and provider attempt", async () => {
    const payload = consultationPayload("first");
    const idempotencyKey = key();
    const response = await postConsultation(payload, idempotencyKey);
    expect(response.status).toBe(201);
    expect(response.body.data.referenceNumber).toMatch(/^CONS-\d{4}-\d{6}$/);
    expect(await database.consultation.count({ where: { name: payload.name } })).toBe(1);
    expect(consultationNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(1);
    expect((await database.publicSubmissionIdempotency.findUnique({ where: { scope_keyHash: { scope: "CONSULTATION", keyHash: hashIdempotencyKey(idempotencyKey) } } }))?.notificationState).toBe("SENT");
  });

  it("replays the same reference without another row, counter increment, or provider attempt", async () => {
    const payload = consultationPayload("sequential_replay");
    const year = Number(payload.preferredDate.slice(0, 4));
    const counterBefore = (await database.consultationCounter.findUnique({ where: { year } }))?.lastValue ?? 0;
    const idempotencyKey = key();
    const first = await postConsultation({ ...payload, name: ` ${payload.name} `, email: payload.email.toUpperCase() }, idempotencyKey);
    const replay = await postConsultation(payload, idempotencyKey);
    const counterAfter = (await database.consultationCounter.findUnique({ where: { year } }))?.lastValue ?? 0;
    expect([first.status, replay.status]).toEqual([201, 201]);
    expect(replay.body).toEqual(first.body);
    expect(await database.consultation.count({ where: { name: payload.name } })).toBe(1);
    expect(counterAfter - counterBefore).toBe(1);
    expect(consultationNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(1);
  });

  it("rejects same-key different-payload reuse without another row, counter, or email", async () => {
    const payload = consultationPayload("conflict");
    const year = Number(payload.preferredDate.slice(0, 4));
    const idempotencyKey = key();
    expect((await postConsultation(payload, idempotencyKey)).status).toBe(201);
    const counterAfterFirst = (await database.consultationCounter.findUnique({ where: { year } }))?.lastValue;
    const conflict = await postConsultation({ ...payload, message: "A different normalized consultation message." }, idempotencyKey);
    expect(conflict.status).toBe(409);
    expect(conflict.body.error.code).toBe("IDEMPOTENCY_KEY_CONFLICT");
    expect(await database.consultation.count({ where: { name: payload.name } })).toBe(1);
    expect((await database.consultationCounter.findUnique({ where: { year } }))?.lastValue).toBe(counterAfterFirst);
    expect(consultationNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(1);
  });

  it("resolves concurrent identical requests with one row, reference, counter increment, and provider attempt", async () => {
    const payload = consultationPayload("concurrent");
    const year = Number(payload.preferredDate.slice(0, 4));
    const counterBefore = (await database.consultationCounter.findUnique({ where: { year } }))?.lastValue ?? 0;
    const idempotencyKey = key();
    const synchronizedApp = createApp({ database: withTwoPartyClaimBarrier(database), notifier, contactRateLimit: 100, consultationRateLimit: 100 });
    const responses = await Promise.all([postConsultation(payload, idempotencyKey, synchronizedApp), postConsultation(payload, idempotencyKey, synchronizedApp)]);
    const counterAfter = (await database.consultationCounter.findUnique({ where: { year } }))?.lastValue ?? 0;
    expect(responses.map((response) => response.status)).toEqual([201, 201]);
    expect(responses[1]!.body).toEqual(responses[0]!.body);
    expect(await database.consultation.count({ where: { name: payload.name } })).toBe(1);
    expect(await database.publicSubmissionIdempotency.count({ where: { scope: "CONSULTATION", keyHash: hashIdempotencyKey(idempotencyKey) } })).toBe(1);
    expect(counterAfter - counterBefore).toBe(1);
    expect(consultationNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(1);
  });

  it("allows the same payload with different keys and allocates two references", async () => {
    const payload = consultationPayload("different_keys");
    const responses = await Promise.all([postConsultation(payload, key()), postConsultation(payload, key())]);
    expect(responses.every((response) => response.status === 201)).toBe(true);
    expect(new Set(responses.map((response) => response.body.data.referenceNumber)).size).toBe(2);
    expect(await database.consultation.count({ where: { name: payload.name } })).toBe(2);
    expect(consultationNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(2);
  });

  it("preserves consultation success and never reattempts a failed notification", async () => {
    const payload = consultationPayload("notification_failure");
    const idempotencyKey = key();
    let attempts = 0;
    const failingNotifier: EmailNotifier = {
      provider: "test",
      async sendContactNotification() {},
      async sendConsultationNotification() { attempts += 1; throw new Error("EXPECTED_TEST_FAILURE"); },
    };
    const failingApp = createApp({ database, notifier: failingNotifier, consultationRateLimit: 100 });
    const send = () => request(failingApp).post("/api/v1/consultations").set("Origin", origin).set("Idempotency-Key", idempotencyKey).send(payload);
    const first = await send();
    const replay = await send();
    expect([first.status, replay.status]).toEqual([201, 201]);
    expect(replay.body).toEqual(first.body);
    expect(attempts).toBe(1);
    expect(await database.consultation.count({ where: { name: payload.name } })).toBe(1);
    expect((await database.publicSubmissionIdempotency.findUnique({ where: { scope_keyHash: { scope: "CONSULTATION", keyHash: hashIdempotencyKey(idempotencyKey) } } }))?.notificationState).toBe("FAILED");
  });

  it("replays an accepted first-day consultation after Dubai midnight while rejecting a new attempt", async () => {
    const beforeDubaiMidnight = new Date("2026-09-14T19:59:00.000Z");
    const afterDubaiMidnight = new Date("2026-09-14T20:01:00.000Z");
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      vi.setSystemTime(beforeDubaiMidnight);
      const payload = { ...consultationPayload("midnight_replay"), preferredDate: consultationCalendarDates()[0]! };
      const year = Number(payload.preferredDate.slice(0, 4));
      const idempotencyKey = key();
      const counterBefore = (await database.consultationCounter.findUnique({ where: { year } }))?.lastValue ?? 0;
      const first = await postConsultation(payload, idempotencyKey);
      const counterAfterFirst = (await database.consultationCounter.findUnique({ where: { year } }))?.lastValue ?? 0;

      expect(first.status).toBe(201);
      expect(counterAfterFirst - counterBefore).toBe(1);
      expect(await database.consultation.count({ where: { name: payload.name } })).toBe(1);
      expect(consultationNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(1);

      vi.setSystemTime(afterDubaiMidnight);
      expect(consultationCalendarDates()[0]).not.toBe(payload.preferredDate);
      const replay = await postConsultation(payload, idempotencyKey);
      const rejectedNewAttempt = await postConsultation(payload, key());
      const counterAfterReplay = (await database.consultationCounter.findUnique({ where: { year } }))?.lastValue ?? 0;

      expect(replay.status).toBe(201);
      expect(replay.body).toEqual(first.body);
      expect(replay.body.data.referenceNumber).toBe(first.body.data.referenceNumber);
      expect(rejectedNewAttempt.status).toBe(400);
      expect(rejectedNewAttempt.body.error.code).toBe("VALIDATION_ERROR");
      expect(await database.consultation.count({ where: { name: payload.name } })).toBe(1);
      expect(counterAfterReplay).toBe(counterAfterFirst);
      expect(consultationNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("replays an expired-but-not-cleaned consultation record", async () => {
    const payload = consultationPayload("expired");
    const idempotencyKey = key();
    const first = await postConsultation(payload, idempotencyKey);
    await database.publicSubmissionIdempotency.update({
      where: { scope_keyHash: { scope: "CONSULTATION", keyHash: hashIdempotencyKey(idempotencyKey) } },
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });
    const replay = await postConsultation(payload, idempotencyKey);
    expect(replay.status).toBe(201);
    expect(replay.body).toEqual(first.body);
    expect(await database.consultation.count({ where: { name: payload.name } })).toBe(1);
  });
});

describe("idempotency privacy and scope separation", () => {
  it("stores only key hash and payload HMAC, with scope-separated payload identities", async () => {
    const sharedKey = key();
    const contact = contactPayload("privacy");
    const consultation = consultationPayload("privacy");
    expect((await postContact(contact, sharedKey)).status).toBe(201);
    expect((await postConsultation(consultation, sharedKey)).status).toBe(201);

    const records = await database.publicSubmissionIdempotency.findMany({
      where: { keyHash: hashIdempotencyKey(sharedKey) },
      orderBy: { scope: "asc" },
    });
    expect(records).toHaveLength(2);
    expect(records[0]!.keyHash).toBe(hashIdempotencyKey(sharedKey));
    expect(records[0]!.payloadHmac).not.toBe(records[1]!.payloadHmac);
    expect(records.find((record) => record.scope === "CONTACT")?.payloadHmac).toBe(contactPayloadHmac(contact));
    const stored = JSON.stringify(records);
    expect(stored).not.toContain(sharedKey);
    expect(stored).not.toContain(contact.name);
    expect(stored).not.toContain(contact.email);
    expect(stored).not.toContain(contact.message);
  });
});

describe("public-form idempotency rollout modes", () => {
  it("preserves legacy behavior without claiming idempotency when transition mode is false", async () => {
    const contact = contactPayload("transition_legacy_contact");
    const consultation = consultationPayload("transition_legacy_consultation");
    const claimsBefore = await database.publicSubmissionIdempotency.count();
    const contactResponse = await postContact(contact, undefined, transitionApp);
    const consultationResponse = await postConsultation(consultation, undefined, transitionApp);

    expect([contactResponse.status, consultationResponse.status]).toEqual([201, 201]);
    expect(await database.contactMessage.count({ where: { name: contact.name } })).toBe(1);
    expect(await database.consultation.count({ where: { name: consultation.name } })).toBe(1);
    expect(contactNotifications.filter((notification) => notification.name === contact.name)).toHaveLength(1);
    expect(consultationNotifications.filter((notification) => notification.name === consultation.name)).toHaveLength(1);
    expect(await database.publicSubmissionIdempotency.count()).toBe(claimsBefore);
  });

  it("uses full idempotency for a supplied UUIDv4 while transition mode is false", async () => {
    const payload = contactPayload("transition_keyed");
    const idempotencyKey = key();
    const first = await postContact(payload, idempotencyKey, transitionApp);
    const replay = await postContact(payload, idempotencyKey, transitionApp);
    const conflict = await postContact({ ...payload, subject: "Different transition payload" }, idempotencyKey, transitionApp);

    expect([first.status, replay.status, conflict.status]).toEqual([201, 201, 409]);
    expect(replay.body).toEqual(first.body);
    expect(conflict.body.error.code).toBe("IDEMPOTENCY_KEY_CONFLICT");
    expect(await database.contactMessage.count({ where: { name: payload.name } })).toBe(1);
    expect(contactNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(1);
  });

  it("rejects an invalid supplied key while transition mode is false", async () => {
    const payload = contactPayload("transition_invalid_key");
    const response = await postContact(payload, "00000000-0000-0000-0000-000000000000", transitionApp);
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("IDEMPOTENCY_KEY_INVALID");
    expect(await database.contactMessage.count({ where: { name: payload.name } })).toBe(0);
    expect(contactNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(0);
  });

  it("requires keys on both endpoints when enforcement mode is true", async () => {
    const contact = contactPayload("enforced_missing_contact");
    const consultation = consultationPayload("enforced_missing_consultation");
    const contactResponse = await postContact(contact, undefined, enforcedApp);
    const consultationResponse = await postConsultation(consultation, undefined, enforcedApp);

    expect([contactResponse.status, consultationResponse.status]).toEqual([400, 400]);
    expect([contactResponse.body.error.code, consultationResponse.body.error.code]).toEqual(["IDEMPOTENCY_KEY_REQUIRED", "IDEMPOTENCY_KEY_REQUIRED"]);
    expect(await database.contactMessage.count({ where: { name: contact.name } })).toBe(0);
    expect(await database.consultation.count({ where: { name: consultation.name } })).toBe(0);
  });

  it("accepts and replays valid UUIDv4 keys when enforcement mode is true", async () => {
    const payload = consultationPayload("enforced_keyed");
    const idempotencyKey = key();
    const first = await postConsultation(payload, idempotencyKey, enforcedApp);
    const replay = await postConsultation(payload, idempotencyKey, enforcedApp);

    expect([first.status, replay.status]).toEqual([201, 201]);
    expect(replay.body).toEqual(first.body);
    expect(await database.consultation.count({ where: { name: payload.name } })).toBe(1);
    expect(consultationNotifications.filter((notification) => notification.name === payload.name)).toHaveLength(1);
  });
});
