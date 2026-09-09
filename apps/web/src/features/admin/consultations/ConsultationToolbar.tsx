"use client";

import type { ConsultationStatus, PublicService } from "@hhlawyer/types";
import { Filter, Search } from "lucide-react";
import { useState } from "react";
import { AdminDialogContent, AdminToolbar } from "@/components/admin/foundation";
import { Button, Dialog, DialogDescription, DialogTitle, DialogTrigger, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
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
    <label><span>{copy.status}</span><Select value={filters.status ?? ""} onValueChange={(value) => set("status", value as ConsultationStatus)}><SelectTrigger aria-label={copy.status} data-testid="consultation-status-filter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="">{copy.allStatuses}</SelectItem>{consultationStatuses.map((status) => <SelectItem key={status} value={status}>{displayEnum(locale, status)}</SelectItem>)}</SelectContent></Select></label>
    <label><span>{copy.service}</span><Select value={filters.serviceId ?? ""} onValueChange={(value) => set("serviceId", value)}><SelectTrigger aria-label={copy.service} data-testid="consultation-service-filter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="">{copy.allServices}</SelectItem>{services.map((service) => <SelectItem key={service.id} value={service.id}>{localizeServiceTitle(locale, service)}</SelectItem>)}</SelectContent></Select></label>
    <label><span>{copy.fromDate}</span><Input data-testid="consultation-date-from" max={filters.dateTo} type="date" value={filters.dateFrom ?? ""} onChange={(event) => set("dateFrom", event.target.value)} /></label>
    <label><span>{copy.toDate}</span><Input data-testid="consultation-date-to" min={filters.dateFrom} type="date" value={filters.dateTo ?? ""} onChange={(event) => set("dateTo", event.target.value)} /></label>
    <label><span>{copy.sort}</span><Select value={`${filters.sortBy}:${filters.sortOrder}`} onValueChange={(value) => { const [sortBy, sortOrder] = value.split(":") as [AdminConsultationFilters["sortBy"], AdminConsultationFilters["sortOrder"]]; onChange({ sortBy, sortOrder }); }}><SelectTrigger aria-label={copy.sort} data-testid="consultation-sort"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="createdAt:desc">{copy.newest}</SelectItem><SelectItem value="createdAt:asc">{copy.oldest}</SelectItem><SelectItem value="preferredDate:asc">{copy.appointmentSoonest}</SelectItem><SelectItem value="preferredDate:desc">{copy.appointmentLatest}</SelectItem><SelectItem value="status:asc">{copy.statusAscending}</SelectItem></SelectContent></Select></label>
    <label><span>{copy.pageSize}</span><Select value={String(filters.limit)} onValueChange={(value) => set("limit", Number(value))}><SelectTrigger aria-label={copy.pageSize} data-testid="consultation-page-size"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="20">20</SelectItem><SelectItem value="50">50</SelectItem></SelectContent></Select></label>
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
