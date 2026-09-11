import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { Prisma, type PrismaClient, type User, type UserRole } from "@prisma/client";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error-handler.js";

const secret = new TextEncoder().encode(env.AUTH_SECRET);
const dummyHash = "$2b$12$C8sdx.ZGTE3wQpnzOYRlF.dpWnfiU3gRCmVzwCNrlqVeknAEsnrWa";
const lockMs = 15 * 60 * 1000;
export type SafeUser = Pick<User, "id" | "name" | "email" | "role">;
export const toSafeUser = (user: SafeUser): SafeUser => ({ id: user.id, name: user.name, email: user.email, role: user.role });
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const expiry = () => new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86_400_000);

export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function signAccessToken(user: SafeUser) { return new SignJWT({ role: user.role }).setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuer("hhlawyer-api").setAudience("hhlawyer-admin").setExpirationTime(`${env.ACCESS_TOKEN_TTL_MINUTES}m`).sign(secret); }
export async function verifyAccessToken(token: string) { const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"], issuer: "hhlawyer-api", audience: "hhlawyer-admin" }); return { userId: payload.sub!, role: payload.role as UserRole }; }

async function recordFailedLogin(userId: string, now: Date, metadata: { ip?: string; userAgent?: string }, database: PrismaClient) {
  const lockUntil = new Date(now.getTime() + lockMs);
  const states = await database.$queryRaw<Array<{ failedLoginAttempts: number; lockedUntil: Date | null }>>(Prisma.sql`
    UPDATE "User"
    SET
      "failedLoginAttempts" = CASE
        WHEN "lockedUntil" IS NOT NULL AND "lockedUntil" <= ${now} THEN 1
        ELSE "failedLoginAttempts" + 1
      END,
      "lockedUntil" = CASE
        WHEN (
          CASE
            WHEN "lockedUntil" IS NOT NULL AND "lockedUntil" <= ${now} THEN 1
            ELSE "failedLoginAttempts" + 1
          END
        ) >= 5 THEN ${lockUntil}
        ELSE NULL
      END,
      "updatedAt" = ${now}
    WHERE "id" = ${userId}
      AND ("lockedUntil" IS NULL OR "lockedUntil" <= ${now})
    RETURNING "failedLoginAttempts", "lockedUntil"
  `);
  const state = states[0];
  if (state) await audit(database, userId, state.lockedUntil ? "AUTH_ACCOUNT_LOCKED" : "AUTH_LOGIN_FAILED", metadata);
}

export async function login(email: string, password: string, metadata: { ip?: string; userAgent?: string }, database: PrismaClient = prisma) {
  const user = await database.user.findUnique({ where: { email } });
  const match = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);
  const now = new Date();
  if (!user || !match || !user.isActive || (user.lockedUntil && user.lockedUntil > now)) {
    if (user) await recordFailedLogin(user.id, now, metadata, database);
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid credentials.");
  }
  const safe = toSafeUser(user);
  const refresh = randomBytes(48).toString("base64url");
  await database.$transaction([database.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: now } }), database.session.create({ data: { userId: user.id, tokenHash: hashToken(refresh), expiresAt: expiry(), ipAddress: metadata.ip?.slice(0, 64), userAgent: metadata.userAgent?.slice(0, 300) } })]);
  await audit(database, user.id, "AUTH_LOGIN_SUCCESS", metadata);
  return { user: safe, access: await signAccessToken(safe), refresh };
}

export async function rotate(refresh: string, metadata: { ip?: string; userAgent?: string }, database: PrismaClient = prisma) {
  const session = await database.session.findUnique({ where: { tokenHash: hashToken(refresh) }, include: { user: true } });
  if (!session || session.expiresAt <= new Date() || !session.user.isActive) throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  if (session.revokedAt) { await database.session.updateMany({ where: { userId: session.userId, revokedAt: null }, data: { revokedAt: new Date() } }); await audit(database, session.userId, "AUTH_REFRESH_REUSE_DETECTED", metadata); throw new AppError(401, "UNAUTHORIZED", "Authentication is required."); }
  const next = randomBytes(48).toString("base64url"); const now = new Date();
  await database.$transaction([database.session.update({ where: { id: session.id }, data: { revokedAt: now, lastUsedAt: now } }), database.session.create({ data: { userId: session.userId, tokenHash: hashToken(next), expiresAt: expiry(), ipAddress: metadata.ip?.slice(0, 64), userAgent: metadata.userAgent?.slice(0, 300) } })]);
  const user = toSafeUser(session.user); await audit(database, user.id, "AUTH_REFRESH", metadata); return { user, access: await signAccessToken(user), refresh: next };
}
export async function revoke(refresh: string | undefined, metadata: { ip?: string; userAgent?: string }, database: PrismaClient = prisma) { if (refresh) { const session = await database.session.findUnique({ where: { tokenHash: hashToken(refresh) } }); if (session && !session.revokedAt) { await database.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } }); await audit(database, session.userId, "AUTH_LOGOUT", metadata); } } }
export async function audit(database: PrismaClient, userId: string | undefined, action: string, metadata: { ip?: string; userAgent?: string }) { await database.auditLog.create({ data: { userId, action, entity: "AUTH", ipAddress: metadata.ip?.slice(0,64), userAgent: metadata.userAgent?.slice(0,300) } }); }
export async function cleanupSessions(database: PrismaClient = prisma) { return database.session.deleteMany({ where: { OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null } }] } }); }
