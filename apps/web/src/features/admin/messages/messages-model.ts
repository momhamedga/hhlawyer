import type { ContactMessageStatus, UserRole } from "@hhlawyer/types";
import type { ContactFilters } from "@/lib/api/admin-contacts";

export const messageStatuses = ["UNREAD", "READ", "REPLIED", "ARCHIVED"] as const satisfies readonly ContactMessageStatus[];

export const messageTransitions: Record<ContactMessageStatus, readonly ContactMessageStatus[]> = {
  UNREAD: ["READ", "ARCHIVED"],
  READ: ["UNREAD", "REPLIED", "ARCHIVED"],
  REPLIED: ["ARCHIVED"],
  ARCHIVED: [],
};

export const defaultMessageFilters: ContactFilters = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const pageSizes = new Set([10, 20, 50]);
const sortByValues = new Set<ContactFilters["sortBy"]>(["createdAt", "status"]);
const sortOrderValues = new Set<ContactFilters["sortOrder"]>(["asc", "desc"]);

export function filtersFromSearchParams(params: URLSearchParams): ContactFilters {
  const page = Number(params.get("page"));
  const limit = Number(params.get("limit"));
  const status = params.get("status") as ContactMessageStatus | null;
  const sortBy = params.get("sortBy") as ContactFilters["sortBy"] | null;
  const sortOrder = params.get("sortOrder") as ContactFilters["sortOrder"] | null;

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: pageSizes.has(limit) ? limit : 20,
    ...(status && messageStatuses.includes(status) ? { status } : {}),
    sortBy: sortBy && sortByValues.has(sortBy) ? sortBy : "createdAt",
    sortOrder: sortOrder && sortOrderValues.has(sortOrder) ? sortOrder : "desc",
  };
}
export function filtersToSearchParams(filters: ContactFilters) {
  const params = new URLSearchParams();
  if (filters.page > 1) params.set("page", String(filters.page));
  if (filters.limit !== 20) params.set("limit", String(filters.limit));
  if (filters.status) params.set("status", filters.status);
  if (filters.sortBy !== "createdAt") params.set("sortBy", filters.sortBy);
  if (filters.sortOrder !== "desc") params.set("sortOrder", filters.sortOrder);
  return params;
}

export function canManageMessages(role: UserRole) {
  return role === "ADMIN" || role === "STAFF";
}

export function messageStatusTone(status: ContactMessageStatus) {
  if (status === "UNREAD") return "attention" as const;
  if (status === "REPLIED") return "success" as const;
  return "info" as const;
}
