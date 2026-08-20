import type { Request, Response } from "express";

export function notFound(request: Request, response: Response) {
  response.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "The requested resource was not found.",
      requestId: request.requestId,
    },
  });
}
