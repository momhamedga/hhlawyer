import type { RequestHandler } from "express";
import { isAllowedWebOrigin } from "../config/env.js";
import { AppError } from "./error-handler.js";

export const requireApprovedOrigin: RequestHandler = (request, _response, next) => {
  const origin = request.get("origin");

  if (origin && !isAllowedWebOrigin(origin)) {
    next(new AppError(403, "CSRF_ORIGIN_DENIED", "Request origin is not allowed."));
    return;
  }

  next();
};
