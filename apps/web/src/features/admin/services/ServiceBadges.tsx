import { AdminStatusBadge } from "@/components/admin/foundation";
import type { Locale } from "@/i18n/locale";
import { servicesContent } from "./services-content";

export function AvailabilityBadge({active,locale}:{active:boolean;locale:Locale}){const c=servicesContent[locale];return <AdminStatusBadge tone={active?"success":"attention"}>{active?c.active:c.inactive}</AdminStatusBadge>;}
export function LocalizationBadge({mapped,locale}:{mapped:boolean;locale:Locale}){const c=servicesContent[locale];return <AdminStatusBadge tone={mapped?"info":"attention"}>{mapped?c.mapped:c.missing}</AdminStatusBadge>;}
