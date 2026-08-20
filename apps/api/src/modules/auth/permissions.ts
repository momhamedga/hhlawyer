import type { UserRole } from "@prisma/client";

export const permissions = ["ADMIN_ACCESS", "CONSULTATION_READ", "CONSULTATION_MANAGE", "CONTACT_READ", "CONTACT_MANAGE", "USER_MANAGE", "SERVICE_READ", "SERVICE_MANAGE", "DASHBOARD_READ"] as const;
export type Permission = typeof permissions[number];
const all = new Set<Permission>(permissions);
const rolePermissions: Record<UserRole, ReadonlySet<Permission>> = { ADMIN: all, LAWYER: new Set(["ADMIN_ACCESS", "CONSULTATION_READ", "CONSULTATION_MANAGE", "CONTACT_READ"]), STAFF: new Set(["ADMIN_ACCESS", "CONSULTATION_READ", "CONTACT_READ", "CONTACT_MANAGE"]) };
export function hasPermission(role: UserRole, permission: Permission) { return rolePermissions[role].has(permission); }
