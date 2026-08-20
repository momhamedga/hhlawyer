import type { ConsultationSubmission } from "@hhlawyer/types";
import { ConsultationStatus, Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { env } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error-handler.js";
import { createEmailNotifier, logNotificationFailure } from "../../services/email/email.service.js";
import type { EmailNotifier } from "../../services/email/email.types.js";

type TransactionClient = Prisma.TransactionClient;

const consultationTransactionTimeoutMs = 15_000;

function businessDateParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: env.BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return { year: Number(value.year), date: `${value.year}-${value.month}-${value.day}` };
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
    throw new AppError(500, "DATABASE_ERROR", "Unable to create the consultation request.");
  }
  return sequence;
}

export async function createConsultation(input: ConsultationSubmission, now = new Date(), database: PrismaClientLike = prisma, notifier: EmailNotifier = createEmailNotifier(), requestId?: string) {
  if (input.website) {
    throw new AppError(400, "SPAM_DETECTED", "Unable to submit the consultation request.");
  }

  const businessDate = businessDateParts(now);
  if (input.preferredDate < businessDate.date) {
    throw new AppError(400, "VALIDATION_ERROR", "Please select a future date.", {
      preferredDate: ["Please select a date that is not in the past."],
    });
  }

  try {
    const consultation = await database.$transaction(async (transaction) => {
      const service = await transaction.service.findUnique({
        where: { id: input.serviceId },
        select: { isActive: true },
      });
      if (!service || !service.isActive) {
        throw new AppError(404, "SERVICE_NOT_FOUND", "The selected service is not available.");
      }

      const sequence = await nextSequence(transaction, businessDate.year);
      const consultation = await transaction.consultation.create({
        data: {
          referenceNumber: formatConsultationReference(businessDate.year, sequence),
          serviceId: input.serviceId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          preferredDate: dateToStorageInstant(input.preferredDate),
          preferredTime: input.preferredTime,
          message: input.message,
          status: ConsultationStatus.PENDING,
        },
        select: { referenceNumber: true, status: true, createdAt: true, preferredDate: true },
      });
      return consultation;
    }, { timeout: consultationTransactionTimeoutMs });
    try {
      await notifier.sendConsultationNotification({ referenceNumber: consultation.referenceNumber, serviceId: input.serviceId, preferredDate: consultation.preferredDate, preferredTime: input.preferredTime, receivedAt: consultation.createdAt });
    } catch {
      logNotificationFailure(requestId, notifier.provider, "consultation");
    }
    return consultation;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DATABASE_ERROR", "Unable to create the consultation request.");
  }
}

export type PrismaClientLike = Pick<PrismaClient, "$transaction">;
