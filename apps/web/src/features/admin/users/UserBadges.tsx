import type { UserRole } from "@hhlawyer/types";
import { AdminStatusBadge } from "@/components/admin/foundation";
import type { Locale } from "@/i18n/locale";
import { usersContent } from "./users-content";
import styles from "./Users.module.css";

export function RoleBadge({locale,role}:{locale:Locale;role:UserRole}){return <AdminStatusBadge className={styles.roleBadge} tone={role==="ADMIN"?"attention":role==="LAWYER"?"info":"success"}>{usersContent[locale].roles[role]}</AdminStatusBadge>;}
export function AccountBadge({active,locale}:{active:boolean;locale:Locale}){const copy=usersContent[locale];return <AdminStatusBadge tone={active?"success":"danger"}>{active?copy.active:copy.inactive}</AdminStatusBadge>;}
