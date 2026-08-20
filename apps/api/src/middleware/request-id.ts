import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const requestIdPattern = /^[A-Za-z0-9._-]{8,128}$/;

export function requestId(request: Request, response: Response, next: NextFunction) {
  const incomingRequestId = request.get("x-request-id");
  const id = incomingRequestId && requestIdPattern.test(incomingRequestId)
    ? incomingRequestId
    : randomUUID();

  request.requestId = id;
  response.setHeader("X-Request-ID", id);
  next();
}
