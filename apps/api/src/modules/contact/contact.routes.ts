import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import type { PrismaClient } from "@prisma/client";
import rateLimit from "express-rate-limit";
import type { EmailNotifier } from "../../services/email/email.types.js";
import { createPostContact } from "./contact.controller.js";

export function createContactRouter(database?: PrismaClient, notifier?: EmailNotifier, limit = 5): ExpressRouter {
  const router: ExpressRouter = Router();
  router.post("/contact", rateLimit({ windowMs: 15 * 60 * 1000, limit, standardHeaders: "draft-8", legacyHeaders: false, handler: (request, response) => response.status(429).json({ success: false, error: { code: "RATE_LIMITED", message: "Too many contact messages. Please try again later.", requestId: request.requestId } }) }), createPostContact(database, notifier));
  return router;
}
