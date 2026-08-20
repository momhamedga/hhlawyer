import type { ErrorRequestHandler } from "express";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  const malformedJson = typeof error === "object" && error !== null && "type" in error
    && error.type === "entity.parse.failed";
  const appError = error instanceof AppError
    ? error
    : malformedJson
      ? new AppError(400, "MALFORMED_JSON", "The request body must be valid JSON.")
      : undefined;
  const statusCode = appError?.statusCode ?? 500;
  const code = appError?.code ?? "INTERNAL_SERVER_ERROR";
  const message = appError?.message ?? "An unexpected error occurred.";

  if (statusCode >= 500) {
    console.error({ requestId: request.requestId, code });
  }

  response.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(appError?.fields ? { fields: appError.fields } : {}),
      requestId: request.requestId,
    },
  });
};
