import type { ConsultationSubmission } from "@hhlawyer/types";
import { CONSULTATION_BOOKING_DAY_COUNT, consultationCalendarDates } from "@hhlawyer/validation";
import { ConsultationStatus, Prisma, PublicSubmissionScope } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { env } from "../../config/env.js";
import { createDatabaseErrorDiagnostic } from "../../lib/database-error.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error-handler.js";
import { createEmailNotifier, logNotificationFailure } from "../../services/email/email.service.js";
import type { EmailLocale, EmailNotifier } from "../../services/email/email.types.js";
import {
  claimNotificationAttempt,
  consultationPayloadHmac,
  executeIdempotentSubmission,
  recordNotificationOutcome,
  resolveExistingIdempotentSubmission,
} from "../public-submissions/idempotency.js";

type TransactionClient = Prisma.TransactionClient;

const consultationTransactionTimeoutMs = 15_000;

function bookingWindow(now: Date) {
  const dates = consultationCalendarDates(now, CONSULTATION_BOOKING_DAY_COUNT, env.BUSINESS_TIME_ZONE);
  return { year: Number(dates[0]!.slice(0, 4)), dates };
}

/** Stores a selected calendar day at UTC noon so its YYYY-MM-DD value is deterministic. */
export function dateToStorageInstant(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function formatConsultationReference(year: number, sequence: number) {
  return `CONS-${year}-${String(sequence).padStart(6, "0")}`;
}

async function nextSequence(transaction: TransactionClient, year: number) {
  const result = await transaction.$queryRaw<Array<{ lastValue: number }>>(Prisma.sql`
    INSERT INTO "ConsultationCounter" ("year", "lastValue", "updatedAt")
    VALUES (${year}, 1, CURRENT_TIMESTAMP)
    ON CONFLICT ("year") DO UPDATE
    SET "lastValue" = "ConsultationCounter"."lastValue" + 1,
        "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "lastValue"
  `);

  const sequence = result[0]?.lastValue;
  if (!sequence) {
    throw new AppError(
      500,
      "DATABASE_ERROR",
      "Unable to create the consultation request.",
      undefined,
      createDatabaseErrorDiagnostic(undefined, "consultation.create"),
    );
  }
  return sequence;
}

async function createConsultationBusiness(transaction: TransactionClient, input: ConsultationSubmission, year: number) {
  const service = await transaction.service.findUnique({
    where: { id: input.serviceId },
    select: { isActive: true, slug: true, name: true },
  });
  if (!service || !service.isActive) {
    throw new AppError(404, "SERVICE_NOT_FOUND", "The selected service is not available.");
  }

  const sequence = await nextSequence(transaction, year);
  const consultation = await transaction.consultation.create({
    data: {
      referenceNumber: formatConsultationReference(year, sequence),
      serviceId: input.serviceId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      preferredDate: dateToStorageInstant(input.preferredDate),
      preferredTime: input.preferredTime,
      message: input.message,
      status: ConsultationStatus.PENDING,
    },
    select: { id: true, referenceNumber: true, status: true, createdAt: true, preferredDate: true },
  });
  return { consultation, service };
}

async function sendLegacyNotification(created: Awaited<ReturnType<typeof createConsultationBusiness>>, input: ConsultationSubmission, notifier: EmailNotifier, requestId: string | undefined, locale: EmailLocale) {
  try {
    await notifier.sendConsultationNotification({ referenceNumber: created.consultation.referenceNumber, serviceSlug: created.service.slug, serviceName: created.service.name, name: input.name, email: input.email, phone: input.phone, preferredDate: created.consultation.preferredDate, preferredTime: input.preferredTime, receivedAt: created.consultation.createdAt, message: input.message, locale });
  } catch (error) {
    logNotificationFailure(requestId, notifier.provider, "consultation", error);
  }
}

export async function createConsultation(input: ConsultationSubmission, idempotencyKey: string | undefined, now = new Date(), database: PrismaClient = prisma, notifier: EmailNotifier = createEmailNotifier(), requestId?: string, locale: EmailLocale = "en") {
  if (input.website) {
    throw new AppError(400, "SPAM_DETECTED", "Unable to submit the consultation request.");
  }

  try {
    const fingerprint = idempotencyKey ? consultationPayloadHmac(input) : undefined;
    if (idempotencyKey && fingerprint) {
      const replay = await resolveExistingIdempotentSubmission({
        database,
        scope: PublicSubmissionScope.CONSULTATION,
        key: idempotencyKey,
        payloadHmac: fingerprint,
      });
      if (replay) {
        if (!replay.value.referenceNumber) {
          throw new AppError(500, "IDEMPOTENCY_STATE_INVALID", "Unable to resolve the original consultation request.");
        }
        return { referenceNumber: replay.value.referenceNumber, status: ConsultationStatus.PENDING, createdAt: replay.value.createdAt };
      }
    }

    const window = bookingWindow(now);
    if (!window.dates.includes(input.preferredDate)) {
      throw new AppError(400, "VALIDATION_ERROR", "Please select an available date.", {
        preferredDate: ["Please select a date within the available booking window."],
      });
    }

    if (!idempotencyKey) {
      const created = await database.$transaction(
        (transaction) => createConsultationBusiness(transaction, input, window.year),
        { timeout: consultationTransactionTimeoutMs },
      );
      await sendLegacyNotification(created, input, notifier, requestId, locale);
      return created.consultation;
    }

    const result = await executeIdempotentSubmission({
      database,
      scope: PublicSubmissionScope.CONSULTATION,
      key: idempotencyKey,
      payloadHmac: fingerprint!,
      now,
      transactionTimeoutMs: consultationTransactionTimeoutMs,
      async createBusiness(transaction) {
        const { consultation, service } = await createConsultationBusiness(transaction, input, window.year);
        return {
          stored: { businessId: consultation.id, createdAt: consultation.createdAt, referenceNumber: consultation.referenceNumber },
          value: { consultation, service },
        };
      },
    });

    if (result.kind === "replay") {
      if (!result.value.referenceNumber) {
        throw new AppError(500, "IDEMPOTENCY_STATE_INVALID", "Unable to resolve the original consultation request.");
      }
      return { referenceNumber: result.value.referenceNumber, status: ConsultationStatus.PENDING, createdAt: result.value.createdAt };
    }

    if (await claimNotificationAttempt(database, result.idempotencyId)) {
      let sent = false;
      try {
        await notifier.sendConsultationNotification({ referenceNumber: result.value.consultation.referenceNumber, serviceSlug: result.value.service.slug, serviceName: result.value.service.name, name: input.name, email: input.email, phone: input.phone, preferredDate: result.value.consultation.preferredDate, preferredTime: input.preferredTime, receivedAt: result.value.consultation.createdAt, message: input.message, locale });
        sent = true;
      } catch (error) {
        logNotificationFailure(requestId, notifier.provider, "consultation", error);
      }
      await recordNotificationOutcome(database, result.idempotencyId, sent);
    }
    return result.value.consultation;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      500,
      "DATABASE_ERROR",
      "Unable to create the consultation request.",
      undefined,
      createDatabaseErrorDiagnostic(error, "consultation.create"),
    );
  }
}

export type PrismaClientLike = PrismaClient;
