import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

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

  it("uses the same approved list for CSRF-protected auth routes", async () => {
    const app = await createAppForOrigins();

    for (const origin of allowedOrigins) {
      const response = await request(app).post("/api/v1/auth/login").set("Origin", origin).send({});
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    }
  });
});
