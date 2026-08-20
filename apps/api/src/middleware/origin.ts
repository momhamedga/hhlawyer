import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { AppError } from "./error-handler.js";

export const requireApprovedOrigin: RequestHandler = (request, _response, next) => {
  const origin = request.get("origin");

  if (origin && origin !== env.WEB_ORIGIN) {
    next(new AppError(403, "CSRF_ORIGIN_DENIED", "Request origin is not allowed."));
    return;
  }

  next();
};
