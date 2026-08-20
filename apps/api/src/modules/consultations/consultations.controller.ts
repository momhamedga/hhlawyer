import { consultationSubmissionSchema } from "@hhlawyer/validation";
import type { ApiSuccess, ConsultationCreated } from "@hhlawyer/types";
import type { RequestHandler } from "express";
import type { ZodError } from "zod";
import { AppError } from "../../middleware/error-handler.js";
import { createConsultation } from "./consultations.service.js";
import type { PrismaClientLike } from "./consultations.service.js";
import type { EmailNotifier } from "../../services/email/email.types.js";

function validationFields(error: ZodError) {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fields[key] ??= [];
    fields[key].push(issue.message);
  }
  return fields;
}

export function createPostConsultation(database?: PrismaClientLike, notifier?: EmailNotifier): RequestHandler {
  return async (request, response, next) => {
  const parsed = consultationSubmissionSchema.safeParse(request.body);
  if (!parsed.success) {
      next(new AppError(400, "VALIDATION_ERROR", "Please correct the highlighted fields.", validationFields(parsed.error)));
      return;
    }

    try {
      const consultation = await createConsultation(parsed.data, new Date(), database, notifier, request.requestId);
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
