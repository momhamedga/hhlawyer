import { Filter, Search } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import type { Locale } from "@/i18n/locale";
import type { AdminServicesFilters } from "@/lib/api/admin-services";
import { servicesContent } from "./services-content";
import styles from "./Services.module.css";

export function ServicesToolbar({ activeCount, filters, locale, onChange, onClear, onSearch, search }: {
  activeCount: number;
  filters: AdminServicesFilters;
  locale: Locale;
  onChange: (value: Partial<AdminServicesFilters>) => void;
  onClear: () => void;
  onSearch: (value: string) => void;
  search: string;
}) {
  const copy = servicesContent[locale];
  return <section aria-label={copy.filters} className={styles.toolbar}>
    <label><span>{copy.search}</span><span className={styles.searchControl}><Search aria-hidden="true" size={17} /><input data-testid="services-search" autoComplete="off" type="search" value={search} onChange={(event) => onSearch(event.target.value)} /></span></label>
    <div className={styles.filters}>
      <label><span>{copy.status}</span><Select value={filters.isActive === undefined ? "" : String(filters.isActive)} onValueChange={(value) => onChange({ isActive: value === "" ? undefined : value === "true" })}><SelectTrigger aria-label={copy.status} data-testid="services-status-filter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="">{copy.all}</SelectItem><SelectItem value="true">{copy.active}</SelectItem><SelectItem value="false">{copy.inactive}</SelectItem></SelectContent></Select></label>
      <label><span>{copy.sort}</span><Select value={`${filters.sortBy}:${filters.sortOrder}`} onValueChange={(value) => { const [sortBy, sortOrder] = value.split(":") as [AdminServicesFilters["sortBy"], AdminServicesFilters["sortOrder"]]; onChange({ sortBy, sortOrder }); }}><SelectTrigger aria-label={copy.sort} data-testid="services-sort"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="createdAt:desc">{copy.newest}</SelectItem><SelectItem value="createdAt:asc">{copy.oldest}</SelectItem><SelectItem value="name:asc">{copy.nameAsc}</SelectItem><SelectItem value="name:desc">{copy.nameDesc}</SelectItem><SelectItem value="sortOrder:asc">{copy.orderAsc}</SelectItem><SelectItem value="slug:asc">{copy.slugAsc}</SelectItem></SelectContent></Select></label>
      <label><span>{copy.pageSize}</span><Select value={String(filters.limit)} onValueChange={(value) => onChange({ limit: Number(value) })}><SelectTrigger aria-label={copy.pageSize} data-testid="services-page-size"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="20">20</SelectItem><SelectItem value="50">50</SelectItem></SelectContent></Select></label>
    </div>
    {activeCount ? <div className={styles.activeFilters}><span><Filter aria-hidden="true" size={15} />{activeCount}</span><button type="button" onClick={onClear}>{copy.clear}</button></div> : null}
  </section>;
}
