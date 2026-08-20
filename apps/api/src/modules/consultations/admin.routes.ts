import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import type { PrismaClient } from "@prisma/client";
import {
  adminConsultationListSchema,
  consultationStatusUpdateSchema,
} from "@hhlawyer/validation";
import { AppError } from "../../middleware/error-handler.js";
import { requireApprovedOrigin } from "../../middleware/origin.js";
import {
  requireAuth,
  requirePermission,
  type AuthRequest,
} from "../auth/auth.routes.js";

const consultationStatusTransitions = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["RESCHEDULED", "COMPLETED", "CANCELLED"],
  RESCHEDULED: ["CONFIRMED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
} as const;

const listSelect = {
  id: true,
  referenceNumber: true,
  name: true,
  email: true,
  phone: true,
  preferredDate: true,
  preferredTime: true,
  status: true,
  createdAt: true,
  service: {
    select: {
      id: true,
      slug: true,
      name: true,
    },
  },
} as const;

const detailSelect = {
  ...listSelect,
  message: true,
  updatedAt: true,
} as const;

function toDateBoundary(value: string, boundary: "start" | "end") {
  return new Date(`${value}T${boundary === "start" ? "00:00:00.000" : "23:59:59.999"}Z`);
}

function routeId(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export function createAdminConsultationRouter(database: PrismaClient): ExpressRouter {
  const router = Router();

  router.use("/admin", requireAuth(database));

  router.get(
    "/admin/consultations",
    requirePermission("CONSULTATION_READ"),
    async (request, response, next) => {
      const parsed = adminConsultationListSchema.safeParse(request.query);

      if (!parsed.success) {
        next(new AppError(400, "VALIDATION_ERROR", "Invalid consultation query."));
        return;
      }

      const { data } = parsed;
      const where = {
        ...(data.status ? { status: data.status } : {}),
        ...(data.serviceId ? { serviceId: data.serviceId } : {}),
        ...(data.dateFrom || data.dateTo
          ? {
              preferredDate: {
                ...(data.dateFrom ? { gte: toDateBoundary(data.dateFrom, "start") } : {}),
                ...(data.dateTo ? { lte: toDateBoundary(data.dateTo, "end") } : {}),
              },
            }
          : {}),
        ...(data.search
          ? {
              OR: ["referenceNumber", "name", "email", "phone"].map((field) => ({
                [field]: { contains: data.search, mode: "insensitive" as const },
              })),
            }
          : {}),
      };

      try {
        const [items, total] = await Promise.all([
          database.consultation.findMany({
            where,
            skip: (data.page - 1) * data.limit,
            take: data.limit,
            orderBy: { [data.sortBy]: data.sortOrder },
            select: listSelect,
          }),
          database.consultation.count({ where }),
        ]);

        response.json({
          success: true,
          data: {
            items,
            pagination: {
              page: data.page,
              limit: data.limit,
              total,
              totalPages: Math.ceil(total / data.limit),
            },
          },
        });
      } catch {
        next(new AppError(500, "DATABASE_ERROR", "Unable to load consultations."));
      }
    },
  );

  router.get(
    "/admin/consultations/:id",
    requirePermission("CONSULTATION_READ"),
    async (request, response, next) => {
      try {
        const consultation = await database.consultation.findUnique({
          where: { id: routeId(request.params.id) },
          select: detailSelect,
        });

        if (!consultation) {
          next(new AppError(404, "CONSULTATION_NOT_FOUND", "Consultation was not found."));
          return;
        }

        response.json({ success: true, data: consultation });
      } catch {
        next(new AppError(500, "DATABASE_ERROR", "Unable to load consultation."));
      }
    },
  );

  router.patch(
    "/admin/consultations/:id/status",
    requireApprovedOrigin,
    requirePermission("CONSULTATION_MANAGE"),
    async (request: AuthRequest, response, next) => {
      const parsed = consultationStatusUpdateSchema.safeParse(request.body);

      if (!parsed.success) {
        next(new AppError(400, "VALIDATION_ERROR", "Invalid consultation status."));
        return;
      }

      try {
        const consultation = await database.$transaction(async (transaction) => {
          const existing = await transaction.consultation.findUnique({
            where: { id: routeId(request.params.id) },
          });

          if (!existing) {
            throw new AppError(404, "CONSULTATION_NOT_FOUND", "Consultation was not found.");
          }

          if (existing.status === parsed.data.status) {
            return existing;
          }

          if (
            !consultationStatusTransitions[existing.status].includes(
              parsed.data.status as never,
            )
          ) {
            throw new AppError(
              409,
              "INVALID_STATUS_TRANSITION",
              "This consultation status transition is not allowed.",
            );
          }

          const updated = await transaction.consultation.update({
            where: { id: existing.id },
            data: { status: parsed.data.status },
          });

          await transaction.auditLog.create({
            data: {
              userId: request.auth!.id,
              action: "CONSULTATION_STATUS_CHANGED",
              entity: "Consultation",
              entityId: existing.id,
              metadata: {
                oldStatus: existing.status,
                newStatus: parsed.data.status,
              },
            },
          });

          return updated;
        });

        response.json({
          success: true,
          data: { id: consultation.id, status: consultation.status },
        });
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
