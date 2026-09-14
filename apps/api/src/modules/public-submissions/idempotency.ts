import { createHash, createHmac } from "node:crypto";
import type { ContactSubmission, ConsultationSubmission } from "@hhlawyer/types";
import {
  IdempotencyState,
  NotificationAttemptState,
  Prisma,
  PublicSubmissionScope,
} from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";

const idempotencyKeySchema = z.uuidv4();
const retentionMs = 24 * 60 * 60 * 1_000;
const processingPollDelaysMs = [25, 50, 100, 200] as const;

interface StoredResult {
  businessId: string;
  createdAt: Date;
  referenceNumber?: string;
}

interface FirstResult<T> {
  kind: "first";
  idempotencyId: string;
  value: T;
}

interface ReplayResult {
  kind: "replay";
  idempotencyId: string;
  value: StoredResult;
}

type IdempotentResult<T> = FirstResult<T> | ReplayResult;

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export function requireIdempotencyKey(value: string | undefined, required = true) {
  if (value === undefined) {
    if (!required) return undefined;
    throw new AppError(400, "IDEMPOTENCY_KEY_REQUIRED", "Idempotency-Key header is required.");
  }

  const parsed = idempotencyKeySchema.safeParse(value);
  if (!parsed.success) {
    throw new AppError(400, "IDEMPOTENCY_KEY_INVALID", "Idempotency-Key header must be a valid UUIDv4.");
  }
  return parsed.data;
}

export async function resolveExistingIdempotentSubmission(options: {
  database: PrismaClient;
  scope: PublicSubmissionScope;
  key: string;
  payloadHmac: string;
}) {
  const keyHash = hashIdempotencyKey(options.key);
  const existing = await options.database.publicSubmissionIdempotency.findUnique({
    where: { scope_keyHash: { scope: options.scope, keyHash } },
    select: { id: true },
  });
  if (!existing) return null;
  return resolveExisting(options.database, options.scope, keyHash, options.payloadHmac);
}

export function hashIdempotencyKey(key: string) {
  return createHash("sha256").update(key, "utf8").digest("hex");
}

function payloadHmac(scope: PublicSubmissionScope, canonicalPayload: string) {
  return createHmac("sha256", env.IDEMPOTENCY_HMAC_SECRET)
    .update(`hhlawyer:public-submission:v1:${scope}\n${canonicalPayload}`, "utf8")
    .digest("hex");
}

export function contactPayloadHmac(input: ContactSubmission) {
  return payloadHmac(PublicSubmissionScope.CONTACT, JSON.stringify({
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
  }));
}

export function consultationPayloadHmac(input: ConsultationSubmission) {
  return payloadHmac(PublicSubmissionScope.CONSULTATION, JSON.stringify({
    serviceId: input.serviceId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    message: input.message ?? null,
  }));
}

function replayValue(record: {
  businessId: string | null;
  responseCreatedAt: Date | null;
  responseReferenceNumber: string | null;
}) {
  if (!record.businessId || !record.responseCreatedAt) {
    throw new AppError(500, "IDEMPOTENCY_STATE_INVALID", "Unable to resolve the original submission.");
  }
  return {
    businessId: record.businessId,
    createdAt: record.responseCreatedAt,
    ...(record.responseReferenceNumber ? { referenceNumber: record.responseReferenceNumber } : {}),
  };
}

async function resolveExisting(
  database: PrismaClient,
  scope: PublicSubmissionScope,
  keyHash: string,
  expectedPayloadHmac: string,
): Promise<ReplayResult> {
  for (let attempt = 0; attempt <= processingPollDelaysMs.length; attempt += 1) {
    const record = await database.publicSubmissionIdempotency.findUnique({
      where: { scope_keyHash: { scope, keyHash } },
      select: {
        id: true,
        payloadHmac: true,
        state: true,
        businessId: true,
        responseCreatedAt: true,
        responseReferenceNumber: true,
      },
    });

    if (!record) {
      throw new AppError(500, "IDEMPOTENCY_STATE_INVALID", "Unable to resolve the original submission.");
    }
    if (record.payloadHmac !== expectedPayloadHmac) {
      throw new AppError(409, "IDEMPOTENCY_KEY_CONFLICT", "The idempotency key was already used for a different submission.");
    }
    if (record.state === IdempotencyState.COMPLETED) {
      return { kind: "replay", idempotencyId: record.id, value: replayValue(record) };
    }
    if (attempt < processingPollDelaysMs.length) {
      await delay(processingPollDelaysMs[attempt]!);
    }
  }

  throw new AppError(409, "IDEMPOTENCY_REQUEST_IN_PROGRESS", "The original submission is still being processed.");
}

export async function executeIdempotentSubmission<T>(options: {
  database: PrismaClient;
  scope: PublicSubmissionScope;
  key: string;
  payloadHmac: string;
  now: Date;
  transactionTimeoutMs?: number;
  createBusiness(transaction: Prisma.TransactionClient): Promise<{ stored: StoredResult; value: T }>;
}): Promise<IdempotentResult<T>> {
  const keyHash = hashIdempotencyKey(options.key);

  try {
    return await options.database.$transaction(async (transaction) => {
      const record = await transaction.publicSubmissionIdempotency.create({
        data: {
          scope: options.scope,
          keyHash,
          payloadHmac: options.payloadHmac,
          expiresAt: new Date(options.now.getTime() + retentionMs),
        },
        select: { id: true },
      });
      const created = await options.createBusiness(transaction);
      await transaction.publicSubmissionIdempotency.update({
        where: { id: record.id },
        data: {
          state: IdempotencyState.COMPLETED,
          businessId: created.stored.businessId,
          responseCreatedAt: created.stored.createdAt,
          responseReferenceNumber: created.stored.referenceNumber,
          completedAt: new Date(),
        },
      });
      return { kind: "first", idempotencyId: record.id, value: created.value } as const;
    }, { timeout: options.transactionTimeoutMs });
  } catch (error) {
    if (!isUniqueConstraintError(error)) throw error;

    const existing = await options.database.publicSubmissionIdempotency.findUnique({
      where: { scope_keyHash: { scope: options.scope, keyHash } },
      select: { id: true },
    });
    if (!existing) throw error;
    return resolveExisting(options.database, options.scope, keyHash, options.payloadHmac);
  }
}

export async function claimNotificationAttempt(database: PrismaClient, idempotencyId: string, attemptedAt = new Date()) {
  try {
    const result = await database.publicSubmissionIdempotency.updateMany({
      where: { id: idempotencyId, notificationState: NotificationAttemptState.PENDING },
      data: { notificationState: NotificationAttemptState.ATTEMPTING, notificationAttemptedAt: attemptedAt },
    });
    return result.count === 1;
  } catch {
    return false;
  }
}

export async function recordNotificationOutcome(database: PrismaClient, idempotencyId: string, sent: boolean) {
  try {
    await database.publicSubmissionIdempotency.updateMany({
      where: { id: idempotencyId, notificationState: NotificationAttemptState.ATTEMPTING },
      data: { notificationState: sent ? NotificationAttemptState.SENT : NotificationAttemptState.FAILED },
    });
  } catch {
    // Business success is intentionally preserved if outcome bookkeeping is unavailable.
  }
}
