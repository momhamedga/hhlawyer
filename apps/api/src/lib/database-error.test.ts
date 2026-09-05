import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import { classifyDatabaseError, createDatabaseErrorDiagnostic } from "./database-error.js";

const clientVersion = "6.19.3";
const requestId = "observability-test-request";
const sensitiveMessage = "postgresql://synthetic-user:synthetic-password@db.invalid:5432/synthetic-db?sslmode=require";

function knownRequestError(code: string) {
  return new Prisma.PrismaClientKnownRequestError(sensitiveMessage, {
    code,
    clientVersion,
    meta: { database: "synthetic-db", query: "SELECT synthetic-sensitive-value" },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("database error classification", () => {
  it.each(["P2034", "P2024"])("classifies the known Prisma request code %s", (code) => {
    expect(classifyDatabaseError(knownRequestError(code))).toEqual({
      errorType: "PrismaKnownRequest",
      prismaCode: code,
    });
  });

  it("classifies Prisma initialization errors without their raw message", () => {
    const error = new Prisma.PrismaClientInitializationError(sensitiveMessage, clientVersion, "P1001");
    expect(classifyDatabaseError(error)).toEqual({
      errorType: "PrismaInitialization",
      prismaCode: "P1001",
    });
  });

  it("classifies unknown-request and Rust-panic errors by runtime type", () => {
    const unknownRequest = new Prisma.PrismaClientUnknownRequestError(sensitiveMessage, { clientVersion });
    const rustPanic = new Prisma.PrismaClientRustPanicError(sensitiveMessage, clientVersion);
    expect(classifyDatabaseError(unknownRequest)).toEqual({ errorType: "PrismaUnknownRequest", prismaCode: null });
    expect(classifyDatabaseError(rustPanic)).toEqual({ errorType: "PrismaRustPanic", prismaCode: null });
  });

  it("classifies an ordinary error without serializing sensitive details", () => {
    const diagnostic = createDatabaseErrorDiagnostic(new Error(sensitiveMessage), "consultation.create");
    expect(diagnostic).toEqual({
      errorType: "DatabaseUnknown",
      prismaCode: null,
      operation: "consultation.create",
    });
    expect(JSON.stringify(diagnostic)).not.toContain(sensitiveMessage);
    expect(diagnostic).not.toHaveProperty("message");
    expect(diagnostic).not.toHaveProperty("stack");
    expect(diagnostic).not.toHaveProperty("meta");
  });
});

describe("consultation database error observability", () => {
  it("logs only the safe classification while preserving the public error contract", async () => {
    const database = {
      $transaction: vi.fn().mockRejectedValue(knownRequestError("P2034")),
    } as unknown as PrismaClient;
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const app = createApp({ database, consultationRateLimit: 100 });

    const response = await request(app)
      .post("/api/v1/consultations")
      .set("x-request-id", requestId)
      .send({
        serviceId: "cm00000000000000000000000",
        name: "Observability Test",
        email: "observability@example.test",
        phone: "+971 50 123 4567",
        preferredDate: "2099-12-31",
        preferredTime: "09:00 AM",
        message: "Synthetic test payload",
        website: "",
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Unable to create the consultation request.",
        requestId,
      },
    });
    expect(response.body).not.toHaveProperty("error.errorType");
    expect(response.body).not.toHaveProperty("error.prismaCode");
    expect(response.body).not.toHaveProperty("error.operation");
    expect(errorLog).toHaveBeenCalledTimes(1);
    expect(errorLog).toHaveBeenCalledWith({
      requestId,
      publicCode: "DATABASE_ERROR",
      errorType: "PrismaKnownRequest",
      prismaCode: "P2034",
      operation: "consultation.create",
    });
    expect(JSON.stringify(errorLog.mock.calls)).not.toContain(sensitiveMessage);
  });
});
