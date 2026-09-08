"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminPage, AdminPageHeader } from "@/components/admin/foundation";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { formatLocaleNumber } from "@/i18n/format";
import { adminConsultationsKeys, getAdminConsultations, type AdminConsultationFilters } from "@/lib/api/admin-consultations";
import { currentUser } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { getActiveServices } from "@/lib/api/consultations";
import { consultationsContent } from "./consultations-content";
import { filterCount, filtersFromSearchParams, filtersToSearchParams } from "./consultations-model";
import { ConsultationPagination } from "./ConsultationPagination";
import { ConsultationRecords } from "./ConsultationRecords";
import { ConsultationEmpty, ConsultationError, ConsultationListSkeleton } from "./ConsultationStates";
import { ConsultationToolbar } from "./ConsultationToolbar";
import styles from "./Consultations.module.css";

export function ConsultationListPage() {
  const locale = useLocale();
  const copy = consultationsContent[locale];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlFilters = useMemo(() => filtersFromSearchParams(new URLSearchParams(searchParams.toString())), [searchParams]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const user = useQuery({ queryKey: ["auth", "me"], queryFn: currentUser, retry: false });
  const services = useQuery({ queryKey: ["services", "active"], queryFn: ({ signal }) => getActiveServices(signal), staleTime: 60_000 });
  const filters = useMemo(() => ({ ...urlFilters, ...(search ? { search } : {}) }), [search, urlFilters]);
  const consultations = useQuery({ enabled: Boolean(user.data), queryKey: adminConsultationsKeys.list(filters), queryFn: ({ signal }) => getAdminConsultations(filters, signal), retry: 1 });

  useEffect(() => { const timeout = window.setTimeout(() => setSearch(searchInput.trim()), 400); return () => window.clearTimeout(timeout); }, [searchInput]);
  useEffect(() => { if (user.isError || (user.isSuccess && !user.data)) router.replace(localizePath("/admin/login", locale)); }, [locale, router, user.data, user.isError, user.isSuccess]);

  const navigate = (next: AdminConsultationFilters) => {
    const params = filtersToSearchParams(next);
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  };
  const updateFilters = (changes: Partial<Omit<AdminConsultationFilters, "search">>) => navigate({ ...urlFilters, ...changes, page: changes.page ?? 1 });
  const onSearchChange = (value: string) => { setSearchInput(value); if (urlFilters.page !== 1) updateFilters({ page: 1 }); };
  const clear = () => { setSearchInput(""); setSearch(""); navigate({ page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" }); };
  const activeCount = filterCount(urlFilters, searchInput.trim());

  if (user.isLoading) return <ConsultationListSkeleton locale={locale} />;
  if (!user.data) return null;
  const errorCode = consultations.error instanceof ApiClientError ? consultations.error.error.code : "";
  const pagination = consultations.data?.pagination;
  const from = pagination && pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return <AdminPage className={styles.page} data-testid="admin-consultations-list">
    <AdminPageHeader description={copy.description} title={copy.title} />
    <ConsultationToolbar activeCount={activeCount} filters={urlFilters} locale={locale} onChange={updateFilters} onClear={clear} onSearchChange={onSearchChange} search={searchInput} services={services.data ?? []} />
    {consultations.isLoading ? <ConsultationListSkeleton locale={locale} /> : consultations.isError ? <ConsultationError forbidden={errorCode === "FORBIDDEN"} locale={locale} onRetry={() => void consultations.refetch()} /> : consultations.data ? <section aria-labelledby="consultation-results-heading" className={styles.resultsSection}><div className={styles.resultsHeader}><h2 id="consultation-results-heading">{copy.listCaption}</h2><p>{copy.resultsSummary(formatLocaleNumber(from, locale), formatLocaleNumber(to, locale), formatLocaleNumber(consultations.data.pagination.total, locale))}</p></div>{consultations.data.items.length ? <><ConsultationRecords items={consultations.data.items} locale={locale} /><ConsultationPagination locale={locale} onPageChange={(page) => updateFilters({ page })} page={consultations.data.pagination.page} totalPages={consultations.data.pagination.totalPages} /></> : <ConsultationEmpty filtered={activeCount > 0 || consultations.data.pagination.total > 0} locale={locale} onClear={clear} />}</section> : null}
  </AdminPage>;
}
