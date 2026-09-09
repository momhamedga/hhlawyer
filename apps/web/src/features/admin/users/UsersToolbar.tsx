import { Filter, Search } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import type { Locale } from "@/i18n/locale";
import type { AdminUsersFilters } from "@/lib/api/admin-users";
import { usersContent } from "./users-content";
import { roles } from "./users-model";
import styles from "./Users.module.css";

export function UsersToolbar({ activeCount, filters, locale, onChange, onClear, onSearch, search }: {
  activeCount: number;
  filters: AdminUsersFilters;
  locale: Locale;
  onChange: (value: Partial<AdminUsersFilters>) => void;
  onClear: () => void;
  onSearch: (value: string) => void;
  search: string;
}) {
  const copy = usersContent[locale];
  return <section aria-label={copy.filters} className={styles.toolbar}>
    <label className={styles.searchField}><span>{copy.search}</span><span className={styles.searchControl}><Search aria-hidden="true" size={17} /><input data-testid="admin-users-search" type="search" autoComplete="off" value={search} onChange={(event) => onSearch(event.target.value)} /></span></label>
    <div className={styles.filters}>
      <label><span>{copy.role}</span><Select value={filters.role ?? ""} onValueChange={(value) => onChange({ role: (value || undefined) as AdminUsersFilters["role"] })}><SelectTrigger aria-label={copy.role} data-testid="admin-users-role-filter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="">{copy.all}</SelectItem>{roles.map((role) => <SelectItem key={role} value={role}>{copy.roles[role]}</SelectItem>)}</SelectContent></Select></label>
      <label><span>{copy.status}</span><Select value={filters.isActive === undefined ? "" : String(filters.isActive)} onValueChange={(value) => onChange({ isActive: value === "" ? undefined : value === "true" })}><SelectTrigger aria-label={copy.status} data-testid="admin-users-status-filter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="">{copy.all}</SelectItem><SelectItem value="true">{copy.active}</SelectItem><SelectItem value="false">{copy.inactive}</SelectItem></SelectContent></Select></label>
      <label><span>{copy.sort}</span><Select value={`${filters.sortBy}:${filters.sortOrder}`} onValueChange={(value) => { const [sortBy, sortOrder] = value.split(":") as [AdminUsersFilters["sortBy"], AdminUsersFilters["sortOrder"]]; onChange({ sortBy, sortOrder }); }}><SelectTrigger aria-label={copy.sort} data-testid="admin-users-sort"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="createdAt:desc">{copy.newest}</SelectItem><SelectItem value="name:asc">{copy.nameAsc}</SelectItem><SelectItem value="email:asc">{copy.emailAsc}</SelectItem><SelectItem value="role:asc">{copy.roleAsc}</SelectItem></SelectContent></Select></label>
      <label><span>{copy.pageSize}</span><Select value={String(filters.limit)} onValueChange={(value) => onChange({ limit: Number(value) })}><SelectTrigger aria-label={copy.pageSize} data-testid="admin-users-page-size"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10</SelectItem><SelectItem value="20">20</SelectItem><SelectItem value="50">50</SelectItem></SelectContent></Select></label>
    </div>
    {activeCount ? <div className={styles.activeFilters}><span><Filter aria-hidden="true" size={15} />{activeCount}</span><button type="button" onClick={onClear}>{copy.clear}</button></div> : null}
  </section>;
}
