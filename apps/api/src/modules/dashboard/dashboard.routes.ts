import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import type { ContactMessageStatus, ConsultationStatus, PrismaClient, UserRole } from "@prisma/client";
import type { AdminDashboardOverview, DashboardRange } from "@hhlawyer/types";
import { adminDashboardQuerySchema } from "@hhlawyer/validation";
import { AppError } from "../../middleware/error-handler.js";
import { requireAuth, requirePermission } from "../auth/auth.routes.js";

const ranges: Record<DashboardRange, number> = { "7d": 7, "30d": 30, "90d": 90 };
const consultationStatuses: ConsultationStatus[] = ["PENDING", "CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED"];
const contactStatuses: ContactMessageStatus[] = ["UNREAD", "READ", "REPLIED", "ARCHIVED"];
const roles: UserRole[] = ["ADMIN", "LAWYER", "STAFF"];

function bucket<T extends string>(keys: readonly T[], rows: Array<{ _count: { _all: number }; [key: string]: unknown }>, key: string): Record<T, number> {
  const values = Object.fromEntries(keys.map((item) => [item, 0])) as Record<T, number>;
  for (const row of rows) { const item = row[key]; if (typeof item === "string" && item in values) values[item as T] = row._count._all; }
  return values;
}

function dateWindow(range: DashboardRange) {
  const endsAt = new Date(); const startsAt = new Date(endsAt);
  startsAt.setUTCDate(startsAt.getUTCDate() - ranges[range]);
  return { startsAt, endsAt };
}

export function createDashboardRouter(database: PrismaClient): ExpressRouter {
  const router = Router();
  router.get("/admin/overview", requireAuth(database), requirePermission("DASHBOARD_READ"), async (request, response, next) => {
    const parsed = adminDashboardQuerySchema.safeParse(request.query);
    if (!parsed.success) return next(new AppError(400, "VALIDATION_ERROR", "Invalid dashboard range."));
    const range = parsed.data.range; const window = dateWindow(range);
    try {
      const [consultationTotal, consultationPeriod, consultationGroups, contactTotal, contactPeriod, contactGroups, serviceTotal, serviceActive, userTotal, userActive, userRoles, consultations, contacts, activity] = await Promise.all([
        database.consultation.count(), database.consultation.count({ where: { createdAt: { gte: window.startsAt } } }), database.consultation.groupBy({ by: ["status"], _count: { _all: true } }),
        database.contactMessage.count(), database.contactMessage.count({ where: { createdAt: { gte: window.startsAt } } }), database.contactMessage.groupBy({ by: ["status"], _count: { _all: true } }),
        database.service.count(), database.service.count({ where: { isActive: true } }), database.user.count(), database.user.count({ where: { isActive: true } }), database.user.groupBy({ by: ["role"], _count: { _all: true } }),
        database.consultation.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, referenceNumber: true, status: true, preferredDate: true, createdAt: true, service: { select: { id: true, slug: true, name: true } } } }),
        database.contactMessage.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, subject: true, status: true, createdAt: true } }),
        database.auditLog.findMany({ take: 10, orderBy: { createdAt: "desc" }, select: { id: true, action: true, entity: true, entityId: true, createdAt: true, user: { select: { id: true, name: true, role: true } } } }),
      ]);
      const consultationByStatus = bucket(consultationStatuses, consultationGroups, "status");
      const contactByStatus = bucket(contactStatuses, contactGroups, "status");
      const usersByRole = bucket(roles, userRoles, "role");
      const body: AdminDashboardOverview = {
        authenticated: true, period: { range, startsAt: window.startsAt.toISOString(), endsAt: window.endsAt.toISOString() },
        consultations: { total: consultationTotal, periodTotal: consultationPeriod, byStatus: consultationByStatus },
        contacts: { total: contactTotal, periodTotal: contactPeriod, unread: contactByStatus.UNREAD, byStatus: contactByStatus },
        services: { total: serviceTotal, active: serviceActive, inactive: serviceTotal - serviceActive },
        users: { total: userTotal, active: userActive, inactive: userTotal - userActive, byRole: usersByRole },
        recentConsultations: consultations.map((item) => ({ ...item, preferredDate: item.preferredDate.toISOString(), createdAt: item.createdAt.toISOString() })),
        recentContacts: contacts.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
        recentActivity: activity.map((item) => ({ id: item.id, action: item.action, entity: item.entity, entityId: item.entityId, createdAt: item.createdAt.toISOString(), actor: item.user })),
      };
      response.set("Cache-Control", "private, no-store").json({ success: true, data: body });
    } catch { next(new AppError(500, "DATABASE_ERROR", "Unable to load dashboard overview.")); }
  });
  return router;
}
