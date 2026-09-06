import type { ContactSubmission } from "@hhlawyer/types";
import { ContactMessageStatus } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error-handler.js";
import { createEmailNotifier, logNotificationFailure } from "../../services/email/email.service.js";
import type { EmailLocale, EmailNotifier } from "../../services/email/email.types.js";

export async function createContactMessage(input: ContactSubmission, requestId?: string, database: PrismaClient = prisma, notifier: EmailNotifier = createEmailNotifier(), locale: EmailLocale = "en") {
  if (input.website) throw new AppError(400, "SPAM_DETECTED", "Unable to submit the message.");
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
