"use client";

import type { ConsultationStatus, PublicService } from "@hhlawyer/types";
import { Filter, Search } from "lucide-react";
import { useState } from "react";
import { AdminDialogContent, AdminToolbar } from "@/components/admin/foundation";
import { Button, Dialog, DialogDescription, DialogTitle, DialogTrigger, Input, Select } from "@/components/ui";
import { displayEnum, localizeServiceTitle } from "@/i18n/format";
import type { Locale } from "@/i18n/locale";
import type { AdminConsultationFilters } from "@/lib/api/admin-consultations";
import { consultationsContent } from "./consultations-content";
import { consultationStatuses } from "./consultations-model";
import styles from "./Consultations.module.css";

type FilterChanges = Partial<Omit<AdminConsultationFilters, "search">>;

function FilterFields({ filters, locale, services, onChange }: { filters: AdminConsultationFilters; locale: Locale; services: PublicService[]; onChange: (changes: FilterChanges) => void }) {
  const copy = consultationsContent[locale];
  const set = (key: keyof FilterChanges, value: string | number | undefined) => onChange({ [key]: value || undefined });
  return <>
    <label><span>{copy.status}</span><Select data-testid="consultation-status-filter" value={filters.status ?? ""} onChange={(event) => set("status", event.target.value as ConsultationStatus)}><option value="">{copy.allStatuses}</option>{consultationStatuses.map((status) => <option key={status} value={status}>{displayEnum(locale, status)}</option>)}</Select></label>
    <label><span>{copy.service}</span><Select data-testid="consultation-service-filter" value={filters.serviceId ?? ""} onChange={(event) => set("serviceId", event.target.value)}><option value="">{copy.allServices}</option>{services.map((service) => <option key={service.id} value={service.id}>{localizeServiceTitle(locale, service)}</option>)}</Select></label>
    <label><span>{copy.fromDate}</span><Input data-testid="consultation-date-from" max={filters.dateTo} type="date" value={filters.dateFrom ?? ""} onChange={(event) => set("dateFrom", event.target.value)} /></label>
    <label><span>{copy.toDate}</span><Input data-testid="consultation-date-to" min={filters.dateFrom} type="date" value={filters.dateTo ?? ""} onChange={(event) => set("dateTo", event.target.value)} /></label>
    <label><span>{copy.sort}</span><Select data-testid="consultation-sort" value={`${filters.sortBy}:${filters.sortOrder}`} onChange={(event) => { const [sortBy, sortOrder] = event.target.value.split(":") as [AdminConsultationFilters["sortBy"], AdminConsultationFilters["sortOrder"]]; onChange({ sortBy, sortOrder }); }}><option value="createdAt:desc">{copy.newest}</option><option value="createdAt:asc">{copy.oldest}</option><option value="preferredDate:asc">{copy.appointmentSoonest}</option><option value="preferredDate:desc">{copy.appointmentLatest}</option><option value="status:asc">{copy.statusAscending}</option></Select></label>
    <label><span>{copy.pageSize}</span><Select data-testid="consultation-page-size" value={filters.limit} onChange={(event) => set("limit", Number(event.target.value))}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></Select></label>
  </>;
}

export function ConsultationToolbar({ activeCount, filters, locale, search, services, onChange, onClear, onSearchChange }: { activeCount: number; filters: AdminConsultationFilters; locale: Locale; search: string; services: PublicService[]; onChange: (changes: FilterChanges) => void; onClear: () => void; onSearchChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const copy = consultationsContent[locale];
  return (
    <div className={styles.toolbarSurface} data-testid="consultation-toolbar">
      <AdminToolbar className={styles.searchRow}>
        <label className={styles.searchField}><span>{copy.searchLabel}</span><span className={styles.searchControl}><Search aria-hidden="true" size={17} /><Input autoComplete="off" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={copy.searchPlaceholder} type="search" /></span></label>
        <Dialog onOpenChange={setOpen} open={open}><DialogTrigger asChild><Button className={styles.mobileFilterTrigger} variant="outline"><Filter aria-hidden="true" size={17} />{copy.filterButton}{activeCount ? <span className={styles.filterCount}>{activeCount}</span> : null}</Button></DialogTrigger><AdminDialogContent closeLabel={copy.closeFilters}><DialogTitle>{copy.filterTitle}</DialogTitle><DialogDescription>{copy.filterDescription}</DialogDescription><div className={styles.mobileFilterFields}><FilterFields filters={filters} locale={locale} onChange={onChange} services={services} /></div><div className={styles.dialogFooter}>{activeCount ? <Button onClick={onClear} variant="ghost">{copy.clearFilters}</Button> : null}<Button onClick={() => setOpen(false)}>{copy.closeFilters}</Button></div></AdminDialogContent></Dialog>
      </AdminToolbar>
      <div className={styles.desktopFilterFields}><FilterFields filters={filters} locale={locale} onChange={onChange} services={services} /></div>
      {activeCount ? <div className={styles.activeFilterBar}><span>{copy.activeFilters(activeCount)}</span><button onClick={onClear} type="button">{copy.clearFilters}</button></div> : null}
    </div>
  );
}
