"use client";

import type { ConsultationStatus, PublicService } from "@hhlawyer/types";
import type { AdminConsultationFilters } from "@/lib/api/admin-consultations";
import { useLocale } from "@/components/providers/LocaleProvider";
import { messages } from "@/i18n/messages";
import { displayEnum } from "@/i18n/format";

type UrlFilters = Omit<AdminConsultationFilters, "page" | "limit" | "search">;

interface Props {
  filters: UrlFilters;
  services: PublicService[];
  search: string;
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: Partial<UrlFilters>) => void;
  onReset: () => void;
}

export function ConsultationFilters({ filters, services, search, onSearchChange, onFiltersChange, onReset }: Props) {
  const locale = useLocale();
  const t = messages[locale].admin.consultation;
  const common = messages[locale].common;
  const update = (key: keyof UrlFilters, value: string) => onFiltersChange({ [key]: value || undefined } as Partial<UrlFilters>);
  return (
    <fieldset className="glass-card rounded-xl p-4" aria-label={t.filtersLabel}>
      <legend className="px-2 text-sm font-bold text-gold-light">{messages[locale].admin.filters}</legend>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm">{common.search}
          <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={t.searchPlaceholder} className="mt-1 w-full rounded border border-white/20 bg-black/25 p-2 text-sm" />
        </label>
        <label className="text-sm">{common.status}
          <select value={filters.status ?? ""} onChange={(event) => update("status", event.target.value)} className="mt-1 w-full rounded border border-white/20 bg-[#162032] p-2 text-sm">
            <option value="">{common.all}</option>
            {(["PENDING", "CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED"] as ConsultationStatus[]).map((status) => <option key={status} value={status}>{displayEnum(locale, status)}</option>)}
          </select>
        </label>
        <label className="text-sm">{t.service}
          <select value={filters.serviceId ?? ""} onChange={(event) => update("serviceId", event.target.value)} className="mt-1 w-full rounded border border-white/20 bg-[#162032] p-2 text-sm">
            <option value="">{t.allServices}</option>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </select>
        </label>
        <label className="text-sm">{messages[locale].admin.sort}
          <select value={`${filters.sortBy}:${filters.sortOrder}`} onChange={(event) => { const [sortBy, sortOrder] = event.target.value.split(":") as [UrlFilters["sortBy"], UrlFilters["sortOrder"]]; onFiltersChange({ sortBy, sortOrder }); }} className="mt-1 w-full rounded border border-white/20 bg-[#162032] p-2 text-sm">
            <option value="createdAt:desc">{t.newest}</option><option value="createdAt:asc">{t.oldest}</option><option value="preferredDate:asc">{t.preferredDate}</option><option value="status:asc">{common.status}</option>
          </select>
        </label>
        <label className="text-sm">{t.fromDate}
          <input type="date" value={filters.dateFrom ?? ""} max={filters.dateTo} onChange={(event) => update("dateFrom", event.target.value)} className="mt-1 w-full rounded border border-white/20 bg-[#162032] p-2 text-sm" />
        </label>
        <label className="text-sm">{t.toDate}
          <input type="date" value={filters.dateTo ?? ""} min={filters.dateFrom} onChange={(event) => update("dateTo", event.target.value)} className="mt-1 w-full rounded border border-white/20 bg-[#162032] p-2 text-sm" />
        </label>
        <div className="flex items-end"><button type="button" onClick={onReset} className="rounded border border-gold/60 px-4 py-2 text-sm text-gold-light">{t.reset}</button></div>
      </div>
    </fieldset>
  );
}
