import { contactSubmissionSchema } from "@hhlawyer/validation";
import type { ApiSuccess, ContactMessageCreated } from "@hhlawyer/types";
import type { RequestHandler } from "express";
import type { PrismaClient } from "@prisma/client";
import type { ZodError } from "zod";
import { env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import type { EmailNotifier } from "../../services/email/email.types.js";
import { resolveEmailLocale } from "../../services/email/email.locale.js";
import { requireIdempotencyKey } from "../public-submissions/idempotency.js";
import { createContactMessage } from "./contact.service.js";

function fields(error: ZodError) {
  const result: Record<string, string[]> = {};
  for (const issue of error.issues) { const key = String(issue.path[0] ?? "form"); (result[key] ??= []).push(issue.message); }
  return result;
}

export function createPostContact(database?: PrismaClient, notifier?: EmailNotifier, publicFormIdempotencyRequired = env.PUBLIC_FORM_IDEMPOTENCY_REQUIRED): RequestHandler {
  return async (request, response, next) => {
    const parsed = contactSubmissionSchema.safeParse(request.body);
    if (!parsed.success) { next(new AppError(400, "VALIDATION_ERROR", "Please correct the highlighted fields.", fields(parsed.error))); return; }
    try {
      const idempotencyKey = requireIdempotencyKey(request.get("Idempotency-Key"), publicFormIdempotencyRequired);
      const contact = await createContactMessage(parsed.data, idempotencyKey, request.requestId, database, notifier, resolveEmailLocale(request.get("accept-language")));
      const body: ApiSuccess<ContactMessageCreated> = { success: true, data: { status: "received", createdAt: contact.createdAt.toISOString() } };
      response.status(201).json(body);
    } catch (error) { next(error); }
  };
}
