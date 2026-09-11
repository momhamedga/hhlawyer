import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { createTestPrismaClient } from "../../lib/test-database.js";
import { hashPassword } from "./auth.service.js";

const marker = `auth-lockout-${Date.now()}`;
const email = `${marker}@example.test`;
const unknownEmail = `${marker}-unknown@example.test`;
const password = "a securely long test password";
const database = createTestPrismaClient();
const app = createApp({ database, loginRateLimit: 1_000, requestRateLimit: 1_000 });
let userId = "";

async function loginWith(candidatePassword: string, candidateEmail = email) {
  return request(app).post("/api/v1/auth/login").send({ email: candidateEmail, password: candidatePassword });
}

async function userState() {
  return database.user.findUniqueOrThrow({
    where: { id: userId },
    select: { failedLoginAttempts: true, lockedUntil: true },
  });
}

async function setLockoutState(failedLoginAttempts: number, lockedUntil: Date | null) {
  await database.user.update({ where: { id: userId }, data: { failedLoginAttempts, lockedUntil } });
}

beforeAll(async () => {
  const user = await database.user.create({
    data: { email, name: marker, passwordHash: await hashPassword(password), role: "ADMIN" },
  });
  userId = user.id;
});

beforeEach(async () => {
  await setLockoutState(0, null);
  await database.auditLog.deleteMany({ where: { userId } });
  await database.session.deleteMany({ where: { userId } });
});

afterEach(async () => {
  await database.session.deleteMany({ where: { userId } });
});

afterAll(async () => {
  await database.auditLog.deleteMany({ where: { userId } });
  await database.session.deleteMany({ where: { userId } });
  await database.user.delete({ where: { id: userId } });
  await database.$disconnect();
});

describe("authentication lockout state machine", () => {
  it("increments failures below the threshold without locking early", async () => {
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      const response = await loginWith("wrong password");
      expect(response.status).toBe(401);
      expect(response.body.error).toMatchObject({ code: "INVALID_CREDENTIALS", message: "Invalid credentials." });
      expect(await userState()).toMatchObject({ failedLoginAttempts: attempt, lockedUntil: null });
    }
  });

  it("locks on the fifth failed attempt", async () => {
    for (let attempt = 1; attempt <= 5; attempt += 1) expect((await loginWith("wrong password")).status).toBe(401);
    const state = await userState();
    expect(state.failedLoginAttempts).toBe(5);
    expect(state.lockedUntil?.getTime()).toBeGreaterThan(Date.now());
    expect(await database.auditLog.count({ where: { userId, action: "AUTH_ACCOUNT_LOCKED" } })).toBe(1);
  });

  it("rejects an attempt during an active lock without resetting its state", async () => {
    const lockedUntil = new Date(Date.now() + 10 * 60_000);
    await setLockoutState(5, lockedUntil);
    expect((await loginWith(password)).status).toBe(401);
    expect(await userState()).toEqual({ failedLoginAttempts: 5, lockedUntil });
    expect(await database.auditLog.count({ where: { userId } })).toBe(0);
  });

  it("treats the first incorrect attempt after lock expiry as a fresh failure", async () => {
    await setLockoutState(5, new Date(Date.now() - 1_000));
    const response = await loginWith("wrong password");
    expect(response.status).toBe(401);
    expect(response.body.error).toMatchObject({ code: "INVALID_CREDENTIALS", message: "Invalid credentials." });
    expect(await userState()).toEqual({ failedLoginAttempts: 1, lockedUntil: null });
  });

  it("allows the correct password after lock expiry and clears failure state", async () => {
    await setLockoutState(5, new Date(Date.now() - 1_000));
    expect((await loginWith(password)).status).toBe(200);
    expect(await userState()).toEqual({ failedLoginAttempts: 0, lockedUntil: null });
  });

  it("requires five new failures after expiry before locking again", async () => {
    await setLockoutState(5, new Date(Date.now() - 1_000));
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      expect((await loginWith("wrong password")).status).toBe(401);
      expect(await userState()).toMatchObject({ failedLoginAttempts: attempt, lockedUntil: null });
    }
    expect((await loginWith("wrong password")).status).toBe(401);
    const state = await userState();
    expect(state.failedLoginAttempts).toBe(5);
    expect(state.lockedUntil?.getTime()).toBeGreaterThan(Date.now());
  });

  it("counts concurrent fresh failures after expiry and preserves the threshold", async () => {
    await setLockoutState(5, new Date(Date.now() - 1_000));
    const responses = await Promise.all(Array.from({ length: 5 }, () => loginWith("wrong password")));
    expect(responses.every((response) => response.status === 401)).toBe(true);
    const state = await userState();
    expect(state.failedLoginAttempts).toBe(5);
    expect(state.lockedUntil?.getTime()).toBeGreaterThan(Date.now());
    expect(await database.auditLog.count({ where: { userId, action: "AUTH_ACCOUNT_LOCKED" } })).toBe(1);
  });

  it("locks exactly once after five concurrent failures from a clean state", async () => {
    await setLockoutState(0, null);
    const lockTriggerTime = Date.now();
    const responses = await Promise.all(Array.from({ length: 5 }, () => loginWith("wrong password")));
    expect(responses.every((response) => response.status === 401)).toBe(true);
    const state = await userState();
    expect(state.failedLoginAttempts).toBe(5);
    expect(state.lockedUntil).not.toBeNull();
    expect(state.lockedUntil!.getTime()).toBeGreaterThan(lockTriggerTime);
    expect(await database.auditLog.count({ where: { userId, action: "AUTH_LOGIN_FAILED" } })).toBe(4);
    expect(await database.auditLog.count({ where: { userId, action: "AUTH_ACCOUNT_LOCKED" } })).toBe(1);
  });

  it("keeps unknown-email failures generic without creating account state", async () => {
    const response = await loginWith("wrong password", unknownEmail);
    expect(response.status).toBe(401);
    expect(response.body.error).toMatchObject({ code: "INVALID_CREDENTIALS", message: "Invalid credentials." });
    expect(await database.user.count({ where: { email: unknownEmail } })).toBe(0);
    expect(await database.auditLog.count({ where: { userId } })).toBe(0);
  });

  it("clears prior non-threshold failures after a successful login", async () => {
    await setLockoutState(3, null);
    expect((await loginWith(password)).status).toBe(200);
    expect(await userState()).toEqual({ failedLoginAttempts: 0, lockedUntil: null });
  });
});
