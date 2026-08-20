import compression from "compression";
import cors from "cors";
import express from "express";
import type { Express } from "express";
import type { PrismaClient } from "@prisma/client";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";
import { AppError, errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { requestId } from "./middleware/request-id.js";
import { apiPrefix, createApiRouter } from "./routes/index.js";
import type { EmailNotifier } from "./services/email/email.types.js";

interface AppOptions {
  database?: PrismaClient;
  consultationRateLimit?: number;
  contactRateLimit?: number;
  loginRateLimit?: number;
  requestRateLimit?: number;
  trustProxy?: number;
  notifier?: EmailNotifier;
}

export function createApp(options: AppOptions = {}): Express {
  const app: Express = express();
  app.set("trust proxy", options.trustProxy ?? env.TRUST_PROXY);

  app.disable("x-powered-by");
  app.use(requestId);
  app.use(helmet());
  app.use(compression());
  app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === env.WEB_ORIGIN) {
        callback(null, true);
        return;
      }

      callback(new AppError(403, "CORS_ORIGIN_DENIED", "Request origin is not allowed."));
    },
    credentials: true,
    methods: ["GET", "HEAD", "OPTIONS", "POST", "PATCH"],
  }),
  );
  app.use(express.json({ limit: "16kb" }));
  app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: options.requestRateLimit ?? 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  );

  app.use(apiPrefix, createApiRouter(options.database, options.consultationRateLimit, options.contactRateLimit, options.notifier, options.loginRateLimit));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

export const app = createApp();
