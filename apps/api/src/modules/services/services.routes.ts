import type { ApiSuccess, PublicService } from "@hhlawyer/types";
import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { prisma } from "../../lib/prisma.js";
import type { PrismaClient } from "@prisma/client";

export function createServicesRouter(database: PrismaClient = prisma): ExpressRouter {
  const router: ExpressRouter = Router();
  router.get("/services", async (_request, response, next) => {
  try {
    const services = await database.service.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, name: true, description: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
    });
    const body: ApiSuccess<PublicService[]> = { success: true, data: services };
    response.status(200).json(body);
  } catch (error) {
    next(error);
  }
  });
  return router;
}
