import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { consultationCalendarDates } from "@hhlawyer/validation";
import type { EmailNotifier } from "./services/email/email.types.js";

const allowedOrigins = [
  "https://hhlawyer.vercel.app",
  "https://hhlawyer.ae",
  "https://www.hhlawyer.ae",
];
const webOriginList = ` ${allowedOrigins.join(" , ")} `;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function createAppForOrigins(origins = webOriginList) {
  vi.stubEnv("WEB_ORIGIN", origins);
  vi.resetModules();
  const { createApp } = await import("./app.js");
  return createApp();
}

describe("CORS and origin validation", () => {
  it("trims and validates comma-separated HTTP(S) origins", async () => {
    const { parseWebOrigins } = await import("./config/env.js");
    expect(parseWebOrigins(webOriginList)).toEqual(allowedOrigins);
    expect(() => parseWebOrigins("https://hhlawyer.ae,not-a-url")).toThrow("WEB_ORIGIN_INVALID");
    expect(() => parseWebOrigins("https://hhlawyer.ae,")).toThrow("WEB_ORIGIN_INVALID");
    expect(() => parseWebOrigins("https://hhlawyer.ae/path")).toThrow("WEB_ORIGIN_INVALID");
  });

  it("allows each configured production origin with credentials", async () => {
    const app = await createAppForOrigins();

    for (const origin of allowedOrigins) {
      const response = await request(app)
        .options("/api/v1/services")
        .set("Origin", origin)
        .set("Access-Control-Request-Method", "GET");

      expect(response.status).toBe(204);
      expect(response.headers["access-control-allow-origin"]).toBe(origin);
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    }
  });

  it("keeps safe requests and CORS preflight available without weakening unsafe routes", async () => {
    const app = await createAppForOrigins();

    expect((await request(app).get("/api/v1/health")).status).toBe(200);
    expect((await request(app).head("/api/v1/health")).status).toBe(200);

    const preflight = await request(app)
      .options("/api/v1/contact")
      .set("Origin", allowedOrigins[1]!)
      .set("Access-Control-Request-Method", "POST");
    expect(preflight.status).toBe(204);
    expect(preflight.headers["access-control-allow-origin"]).toBe(allowedOrigins[1]);
  });

  it("rejects unknown origins through CORS and mutation origin validation", async () => {
    const app = await createAppForOrigins();
    const unknownOrigin = "https://unknown.example";
    const corsResponse = await request(app).get("/api/v1/health").set("Origin", unknownOrigin);
    expect(corsResponse.status).toBe(403);
    expect(corsResponse.body.error.code).toBe("CORS_ORIGIN_DENIED");

    const { requireApprovedOrigin } = await import("./middleware/origin.js");
    let error: unknown;
    requireApprovedOrigin({ get: () => unknownOrigin } as never, {} as never, (value?: unknown) => { error = value; });
    expect(error).toMatchObject({ code: "CSRF_ORIGIN_DENIED" });
  });

  it.each([
    ["disallowed", "https://unknown.example"],
    ["deceptive hyphen", "https://evil-hhlawyer.ae"],
    ["deceptive suffix", "https://hhlawyer.ae.evil.example"],
    ["opaque null", "null"],
    ["malformed", "not-a-valid-origin"],
  ])("rejects a %s Origin exactly", async (_label, origin) => {
    const app = await createAppForOrigins();
    const response = await request(app).post("/api/v1/contact").set("Origin", origin).send({});
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("CORS_ORIGIN_DENIED");
  });

  it("uses the same approved list for CSRF-protected auth routes", async () => {
    const app = await createAppForOrigins();

    for (const origin of allowedOrigins) {
      const response = await request(app).post("/api/v1/auth/login").set("Origin", origin).send({});
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("allows every configured origin through the public mutation guard", async () => {
    const app = await createAppForOrigins();

    for (const origin of allowedOrigins) {
      const response = await request(app).post("/api/v1/contact").set("Origin", origin).send({});
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.headers["access-control-allow-origin"]).toBe(origin);
    }
  });

  it("rejects missing Origin before public or auth side effects", async () => {
    const contactCreate = vi.fn();
    const transaction = vi.fn();
    const userLookup = vi.fn();
    const sessionLookup = vi.fn();
    const contactNotification = vi.fn();
    const consultationNotification = vi.fn();
    const database = {
      contactMessage: { create: contactCreate },
      user: { findUnique: userLookup },
      session: { findUnique: sessionLookup },
      $transaction: transaction,
    } as never;
    const notifier: EmailNotifier = {
      provider: "test",
      sendContactNotification: contactNotification,
      sendConsultationNotification: consultationNotification,
    };
    const app = (await import("./app.js")).createApp({ database, notifier });
    const preferredDate = consultationCalendarDates()[3]!;

    const responses = await Promise.all([
      request(app).post("/api/v1/contact").send({ name: "Origin Guard Contact", email: "origin-contact@example.test", subject: "Legal enquiry", message: "A valid message that must not be persisted.", website: "" }),
      request(app).post("/api/v1/consultations").send({ serviceId: "origin-guard-service", name: "Origin Guard Consultation", email: "origin-consultation@example.test", phone: "+971501234567", preferredDate, preferredTime: "09:00 AM", message: "A valid request that must not be persisted.", website: "" }),
      request(app).post("/api/v1/auth/login").send({ email: "origin-auth@example.test", password: "a securely long password" }),
      request(app).post("/api/v1/auth/refresh").set("Cookie", "hh_refresh=not-used"),
      request(app).post("/api/v1/auth/logout").set("Cookie", "hh_refresh=not-used"),
      request(app).post("/api/v1/contact").set("Origin", "https://attacker.example").send({ name: "Origin Guard Contact", email: "origin-contact@example.test", subject: "Legal enquiry", message: "A valid message that must not be persisted.", website: "" }),
      request(app).post("/api/v1/consultations").set("Origin", "https://attacker.example").send({ serviceId: "origin-guard-service", name: "Origin Guard Consultation", email: "origin-consultation@example.test", phone: "+971501234567", preferredDate, preferredTime: "09:00 AM", message: "A valid request that must not be persisted.", website: "" }),
      request(app).post("/api/v1/auth/login").set("Origin", "https://attacker.example").send({ email: "origin-auth@example.test", password: "a securely long password" }),
      request(app).post("/api/v1/auth/refresh").set("Origin", "https://attacker.example").set("Cookie", "hh_refresh=not-used"),
      request(app).post("/api/v1/auth/logout").set("Origin", "https://attacker.example").set("Cookie", "hh_refresh=not-used"),
    ]);

    expect(responses.map((response) => response.status)).toEqual([403, 403, 403, 403, 403, 403, 403, 403, 403, 403]);
    expect(responses.map((response) => response.body.error.code)).toEqual([
      "CSRF_ORIGIN_DENIED",
      "CSRF_ORIGIN_DENIED",
      "CSRF_REJECTED",
      "CSRF_REJECTED",
      "CSRF_REJECTED",
      "CORS_ORIGIN_DENIED",
      "CORS_ORIGIN_DENIED",
      "CORS_ORIGIN_DENIED",
      "CORS_ORIGIN_DENIED",
      "CORS_ORIGIN_DENIED",
    ]);
    expect(contactCreate).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
    expect(userLookup).not.toHaveBeenCalled();
    expect(sessionLookup).not.toHaveBeenCalled();
    expect(contactNotification).not.toHaveBeenCalled();
    expect(consultationNotification).not.toHaveBeenCalled();
  });
});
