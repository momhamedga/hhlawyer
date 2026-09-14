import type { ContactSubmission } from "@hhlawyer/types";
import { ContactMessageStatus, PublicSubmissionScope } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error-handler.js";
import { createEmailNotifier, logNotificationFailure } from "../../services/email/email.service.js";
import type { EmailLocale, EmailNotifier } from "../../services/email/email.types.js";
import {
  claimNotificationAttempt,
  contactPayloadHmac,
  executeIdempotentSubmission,
  recordNotificationOutcome,
} from "../public-submissions/idempotency.js";

export async function createContactMessage(input: ContactSubmission, idempotencyKey: string | undefined, requestId?: string, database: PrismaClient = prisma, notifier: EmailNotifier = createEmailNotifier(), locale: EmailLocale = "en", now = new Date()): Promise<{ createdAt: Date }> {
  if (input.website) throw new AppError(400, "SPAM_DETECTED", "Unable to submit the message.");

  if (!idempotencyKey) {
    let contact;
    try {
      contact = await database.contactMessage.create({
        data: { name: input.name, email: input.email, subject: input.subject, message: input.message, status: ContactMessageStatus.UNREAD },
        select: { createdAt: true },
      });
    } catch {
      throw new AppError(500, "DATABASE_ERROR", "Unable to receive the message.");
    }

    try {
      await notifier.sendContactNotification({ name: input.name, email: input.email, subject: input.subject, message: input.message, receivedAt: contact.createdAt, locale });
    } catch (error) {
      logNotificationFailure(requestId, notifier.provider, "contact", error);
    }
    return contact;
  }

  let result;
  try {
    result = await executeIdempotentSubmission({
      database,
      scope: PublicSubmissionScope.CONTACT,
      key: idempotencyKey,
      payloadHmac: contactPayloadHmac(input),
      now,
      async createBusiness(transaction) {
        const contact = await transaction.contactMessage.create({
          data: { name: input.name, email: input.email, subject: input.subject, message: input.message, status: ContactMessageStatus.UNREAD },
          select: { id: true, createdAt: true },
        });
        return { stored: { businessId: contact.id, createdAt: contact.createdAt }, value: contact };
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, "DATABASE_ERROR", "Unable to receive the message.");
  }

  if (result.kind === "first" && await claimNotificationAttempt(database, result.idempotencyId)) {
    let sent = false;
    try {
      await notifier.sendContactNotification({ name: input.name, email: input.email, subject: input.subject, message: input.message, receivedAt: result.value.createdAt, locale });
      sent = true;
    } catch (error) {
      logNotificationFailure(requestId, notifier.provider, "contact", error);
    }
    await recordNotificationOutcome(database, result.idempotencyId, sent);
  }
  return { createdAt: result.value.createdAt };
}
