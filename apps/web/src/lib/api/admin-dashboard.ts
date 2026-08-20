import type { AdminDashboardOverview, DashboardRange } from "@hhlawyer/types";
import { apiFetch } from "./client";

export const adminDashboardKeys = {
  all: ["admin", "dashboard"] as const,
  overview: (range: DashboardRange) => [...adminDashboardKeys.all, "overview", range] as const,
};

export function getAdminDashboardOverview(range: DashboardRange) {
  return apiFetch<AdminDashboardOverview>(`/admin/overview?range=${range}`, { credentials: "include" });
}
