import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import rateLimit from "express-rate-limit";
import { createPostConsultation } from "./consultations.controller.js";
import type { PrismaClientLike } from "./consultations.service.js";
import type { EmailNotifier } from "../../services/email/email.types.js";

export function createConsultationsRouter(database?: PrismaClientLike, limit = 5, notifier?: EmailNotifier): ExpressRouter {
  const router: ExpressRouter = Router();
  const consultationRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (request, response) => {
      response.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many consultation requests. Please try again later.",
          requestId: request.requestId,
        },
      });
    },
  });
  router.post("/consultations", consultationRateLimit, createPostConsultation(database, notifier));
  return router;
}
