import { consultationSubmissionSchema } from "@hhlawyer/validation";
import type { ApiSuccess, ConsultationCreated } from "@hhlawyer/types";
import type { RequestHandler } from "express";
import type { ZodError } from "zod";
import { env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { createConsultation } from "./consultations.service.js";
import type { PrismaClientLike } from "./consultations.service.js";
import type { EmailNotifier } from "../../services/email/email.types.js";
import { resolveEmailLocale } from "../../services/email/email.locale.js";
import { requireIdempotencyKey } from "../public-submissions/idempotency.js";

function validationFields(error: ZodError) {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fields[key] ??= [];
    fields[key].push(issue.message);
  }
  return fields;
}

export function createPostConsultation(database?: PrismaClientLike, notifier?: EmailNotifier, publicFormIdempotencyRequired = env.PUBLIC_FORM_IDEMPOTENCY_REQUIRED): RequestHandler {
  return async (request, response, next) => {
  const parsed = consultationSubmissionSchema.safeParse(request.body);
  if (!parsed.success) {
      next(new AppError(400, "VALIDATION_ERROR", "Please correct the highlighted fields.", validationFields(parsed.error)));
      return;
    }

    try {
      const idempotencyKey = requireIdempotencyKey(request.get("Idempotency-Key"), publicFormIdempotencyRequired);
      const consultation = await createConsultation(parsed.data, idempotencyKey, new Date(), database, notifier, request.requestId, resolveEmailLocale(request.get("accept-language")));
      const body: ApiSuccess<ConsultationCreated> = {
        success: true,
        data: {
          referenceNumber: consultation.referenceNumber,
          status: "PENDING",
          createdAt: consultation.createdAt.toISOString(),
        },
      };
      response.status(201).json(body);
    } catch (error) {
      next(error);
    }
  };
}
