import { API_VERSION } from "@hhlawyer/config";
import type { ApiSuccess } from "@hhlawyer/types";
import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import type { PrismaClient } from "@prisma/client";
import { createConsultationsRouter } from "../modules/consultations/consultations.routes.js";
import { createContactRouter } from "../modules/contact/contact.routes.js";
import { createAuthRouter } from "../modules/auth/auth.routes.js";
import { createAdminConsultationRouter } from "../modules/consultations/admin.routes.js";
import { createAdminContactRouter } from "../modules/contact/admin.routes.js";
import { createAdminUsersRouter } from "../modules/auth/admin-users.routes.js";
import { prisma } from "../lib/prisma.js";
import { createServicesRouter } from "../modules/services/services.routes.js";
import { createAdminServicesRouter } from "../modules/services/admin.routes.js";
import { createDashboardRouter } from "../modules/dashboard/dashboard.routes.js";
import type { EmailNotifier } from "../services/email/email.types.js";

interface HealthData {
  status: "ok";
  timestamp: string;
  requestId: string;
}

export const apiPrefix = `/api/${API_VERSION}`;

export function createApiRouter(database?: PrismaClient, consultationLimit?: number, contactLimit?: number, notifier?: EmailNotifier, loginLimit?: number): ExpressRouter {
  const router: ExpressRouter = Router();

  router.get("/health", (request, response) => {
  const body: ApiSuccess<HealthData> = {
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      requestId: request.requestId,
    },
  };

  response.status(200).json(body);
  });

  router.use(createConsultationsRouter(database, consultationLimit, notifier));
  router.use(createContactRouter(database, notifier, contactLimit));
  router.use(createAuthRouter(database, loginLimit));
  router.use(createAdminConsultationRouter(database ?? prisma));
  router.use(createAdminContactRouter(database ?? prisma));
  router.use(createAdminUsersRouter(database ?? prisma));
  router.use(createAdminServicesRouter(database ?? prisma));
  router.use(createDashboardRouter(database ?? prisma));
  router.use(createServicesRouter(database));
  return router;
}

export const apiRouter = createApiRouter();
