import type { ConsultationStatus, UserRole } from "@hhlawyer/types";
import type { AdminConsultationFilters } from "@/lib/api/admin-consultations";

export const consultationStatuses = ["PENDING", "CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED"] as const satisfies readonly ConsultationStatus[];

export const consultationTransitions: Record<ConsultationStatus, readonly ConsultationStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["RESCHEDULED", "COMPLETED", "CANCELLED"],
  RESCHEDULED: ["CONFIRMED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const defaultConsultationFilters: AdminConsultationFilters = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const pageSizes = new Set([10, 20, 50]);
const sortByValues = new Set<AdminConsultationFilters["sortBy"]>(["createdAt", "preferredDate", "status"]);
const sortOrderValues = new Set<AdminConsultationFilters["sortOrder"]>(["asc", "desc"]);

export function filtersFromSearchParams(params: URLSearchParams): AdminConsultationFilters {
  const page = Number(params.get("page"));
  const limit = Number(params.get("limit"));
  const status = params.get("status") as ConsultationStatus | null;
  const sortBy = params.get("sortBy") as AdminConsultationFilters["sortBy"] | null;
  const sortOrder = params.get("sortOrder") as AdminConsultationFilters["sortOrder"] | null;
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: pageSizes.has(limit) ? limit : 20,
    ...(status && consultationStatuses.includes(status) ? { status } : {}),
    ...(params.get("serviceId") ? { serviceId: params.get("serviceId")! } : {}),
    ...(params.get("dateFrom") ? { dateFrom: params.get("dateFrom")! } : {}),
    ...(params.get("dateTo") ? { dateTo: params.get("dateTo")! } : {}),
    sortBy: sortBy && sortByValues.has(sortBy) ? sortBy : "createdAt",
    sortOrder: sortOrder && sortOrderValues.has(sortOrder) ? sortOrder : "desc",
  };
}

export function filtersToSearchParams(filters: AdminConsultationFilters) {
  const params = new URLSearchParams();
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.limit !== 20) params.set("limit", String(filters.limit));
  if (filters.status) params.set("status", filters.status);
  if (filters.serviceId) params.set("serviceId", filters.serviceId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.sortBy !== "createdAt") params.set("sortBy", filters.sortBy);
  if (filters.sortOrder !== "desc") params.set("sortOrder", filters.sortOrder);
  return params;
}

export function filterCount(filters: AdminConsultationFilters, search: string) {
  return [search, filters.status, filters.serviceId, filters.dateFrom, filters.dateTo].filter(Boolean).length;
}

export function canManageConsultations(role: UserRole) {
  return role === "ADMIN" || role === "LAWYER";
}

export function statusTone(status: ConsultationStatus) {
  if (status === "PENDING" || status === "RESCHEDULED") return "attention" as const;
  if (status === "COMPLETED") return "success" as const;
  if (status === "CANCELLED") return "danger" as const;
  return "info" as const;
}
