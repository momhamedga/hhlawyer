"use client";

import type { ContactMessageStatus } from "@hhlawyer/types";
import { Filter, Search } from "lucide-react";
import { useState } from "react";
import { AdminDialogContent, AdminToolbar } from "@/components/admin/foundation";
import { Button, Dialog, DialogDescription, DialogTitle, DialogTrigger, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { displayEnum } from "@/i18n/format";
import type { Locale } from "@/i18n/locale";
import type { ContactFilters } from "@/lib/api/admin-contacts";
import { messagesContent } from "./messages-content";
import { messageStatuses } from "./messages-model";
import styles from "./Messages.module.css";

type FilterChanges = Partial<Omit<ContactFilters, "search">>;

function FilterFields({ filters, locale, onChange }: { filters: ContactFilters; locale: Locale; onChange: (changes: FilterChanges) => void }) {
  const copy = messagesContent[locale];
  return <>
    <label><span>{copy.status}</span><Select value={filters.status ?? ""} onValueChange={(value) => onChange({ status: (value || undefined) as ContactMessageStatus | undefined })}><SelectTrigger aria-label={copy.status} data-testid="message-status-filter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="">{copy.allStatuses}</SelectItem>{messageStatuses.map((status) => <SelectItem key={status} value={status}>{displayEnum(locale, status)}</SelectItem>)}</SelectContent></Select></label>
    <label><span>{copy.sort}</span><Select value={`${filters.sortBy}:${filters.sortOrder}`} onValueChange={(value) => { const [sortBy, sortOrder] = value.split(":") as [ContactFilters["sortBy"], ContactFilters["sortOrder"]]; onChange({ sortBy, sortOrder }); }}><SelectTrigger aria-label={copy.sort} data-testid="message-sort"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="createdAt:desc">{copy.newest}</SelectItem><SelectItem value="createdAt:asc">{copy.oldest}</SelectItem><SelectItem value="status:asc">{copy.statusAscending}</SelectItem></SelectContent></Select></label>
    <label><span>{copy.pageSize}</span><Select value={String(filters.limit)} onValueChange={(value) => onChange({ limit: Number(value) })}><SelectTrigger aria-label={copy.pageSize} data-testid="message-page-size"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="20">20</SelectItem><SelectItem value="50">50</SelectItem></SelectContent></Select></label>
  </>;
}

export function MessagesToolbar({ activeCount, filters, locale, search, onChange, onClear, onSearchChange }: { activeCount: number; filters: ContactFilters; locale: Locale; search: string; onChange: (changes: FilterChanges) => void; onClear: () => void; onSearchChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const copy = messagesContent[locale];
  return <div className={styles.toolbarSurface} data-testid="messages-toolbar">
    <AdminToolbar className={styles.searchRow}>
      <label className={styles.searchField}><span>{copy.searchLabel}</span><span className={styles.searchControl}><Search aria-hidden="true" size={17} /><Input autoComplete="off" data-testid="contact-search" placeholder={copy.searchPlaceholder} type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} /></span></label>
      <Dialog onOpenChange={setOpen} open={open}><DialogTrigger asChild><Button className={styles.mobileFilterTrigger} variant="outline"><Filter aria-hidden="true" size={17} />{copy.filterButton}{activeCount ? <span className={styles.filterCount}>{activeCount}</span> : null}</Button></DialogTrigger><AdminDialogContent closeLabel={copy.closeFilters}><DialogTitle>{copy.filterTitle}</DialogTitle><DialogDescription>{copy.filterDescription}</DialogDescription><div className={styles.mobileFilterFields}><FilterFields filters={filters} locale={locale} onChange={onChange} /></div><div className={styles.dialogFooter}>{activeCount ? <Button onClick={onClear} variant="ghost">{copy.clearFilters}</Button> : null}<Button onClick={() => setOpen(false)}>{copy.closeFilters}</Button></div></AdminDialogContent></Dialog>
    </AdminToolbar>
    <div className={styles.desktopFilterFields}><FilterFields filters={filters} locale={locale} onChange={onChange} /></div>
    {activeCount ? <div className={styles.activeFilterBar}><span>{copy.activeFilters(activeCount)}</span><button onClick={onClear} type="button">{copy.clearFilters}</button></div> : null}
  </div>;
}
