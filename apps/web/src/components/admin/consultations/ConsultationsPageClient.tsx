"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { currentUser } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { getActiveServices } from "@/lib/api/consultations";
import { adminConsultationsKeys, getAdminConsultations, type AdminConsultationFilters } from "@/lib/api/admin-consultations";
import { ConsultationFilters } from "./ConsultationFilters";
import { ConsultationPagination } from "./ConsultationPagination";
import { ConsultationTable } from "./ConsultationTable";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { messages } from "@/i18n/messages";

const defaults: Omit<AdminConsultationFilters, "search"> = { page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" };
const statuses = new Set(["PENDING", "CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED"]);
const sortByValues = new Set(["createdAt", "preferredDate", "status"]);
const sortOrderValues = new Set(["asc", "desc"]);

function filtersFromParams(params: URLSearchParams): Omit<AdminConsultationFilters, "search"> {
  const number = Number(params.get("page"));
  const status = params.get("status");
  const sortBy = params.get("sortBy");
  const sortOrder = params.get("sortOrder");
  return {
    ...defaults,
    page: Number.isInteger(number) && number > 0 ? number : 1,
    ...(status && statuses.has(status) ? { status: status as AdminConsultationFilters["status"] } : {}),
    ...(params.get("serviceId") ? { serviceId: params.get("serviceId")! } : {}),
    ...(params.get("dateFrom") ? { dateFrom: params.get("dateFrom")! } : {}),
    ...(params.get("dateTo") ? { dateTo: params.get("dateTo")! } : {}),
    sortBy: sortBy && sortByValues.has(sortBy) ? sortBy as AdminConsultationFilters["sortBy"] : "createdAt",
    sortOrder: sortOrder && sortOrderValues.has(sortOrder) ? sortOrder as AdminConsultationFilters["sortOrder"] : "desc",
  };
}

export function ConsultationsPageClient() {
  const router = useRouter();
  const locale = useLocale();
  const t = messages[locale].admin.consultation;
  const pathname = usePathname();
  const params = useSearchParams();
  const urlFilters = useMemo(() => filtersFromParams(new URLSearchParams(params.toString())), [params]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const user = useQuery({ queryKey: ["auth", "me"], queryFn: currentUser, retry: false });
  const services = useQuery({ queryKey: ["services", "active"], queryFn: ({ signal }) => getActiveServices(signal) });
  const filters = useMemo(() => ({ ...urlFilters, ...(search ? { search } : {}) }), [urlFilters, search]);
  const consultations = useQuery({ queryKey: adminConsultationsKeys.list(filters), queryFn: ({ signal }) => getAdminConsultations(filters, signal), enabled: !!user.data });

  useEffect(() => { const timeout = window.setTimeout(() => setSearch(searchInput.trim()), 400); return () => window.clearTimeout(timeout); }, [searchInput]);
  useEffect(() => { if (user.isError || (user.isSuccess && !user.data)) router.replace(localizePath("/admin/login", locale)); }, [locale, router, user.data, user.isError, user.isSuccess]);

  const updateUrl = (changes: Partial<Omit<AdminConsultationFilters, "search" | "limit">>) => {
    const next = { ...urlFilters, ...changes, page: changes.page ?? 1 };
    const query = new URLSearchParams();
    if (next.page > 1) query.set("page", String(next.page));
    if (next.status) query.set("status", next.status);
    if (next.serviceId) query.set("serviceId", next.serviceId);
    if (next.dateFrom) query.set("dateFrom", next.dateFrom);
    if (next.dateTo) query.set("dateTo", next.dateTo);
    if (next.sortBy !== "createdAt") query.set("sortBy", next.sortBy);
    if (next.sortOrder !== "desc") query.set("sortOrder", next.sortOrder);
    router.replace(query.size ? `${pathname}?${query}` : pathname);
  };
  const reset = () => { setSearchInput(""); setSearch(""); router.replace(pathname); };

  if (user.isLoading) return <ListSkeleton />;
  if (!user.data) return null;
  const errorCode = consultations.error instanceof ApiClientError ? consultations.error.error.code : "";
  return <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-8"><header><p className="text-sm text-gold-light">{t.trail}</p><h1 className="mt-2 text-3xl font-extrabold">{t.listTitle}</h1><p className="mt-2 text-white/65">{t.listDescription}{consultations.data ? ` (${consultations.data.pagination.total})` : ""}</p></header><ConsultationFilters filters={urlFilters} services={services.data ?? []} search={searchInput} onSearchChange={setSearchInput} onFiltersChange={updateUrl} onReset={reset} />{consultations.isLoading ? <ListSkeleton /> : consultations.isError ? <div role="alert" className="rounded border border-rose-300/40 bg-rose-950/30 p-5">{errorCode === "FORBIDDEN" ? t.loadForbidden : t.loadError}</div> : consultations.data?.items.length ? <><ConsultationTable items={consultations.data.items} /><ConsultationPagination page={consultations.data.pagination.page} totalPages={consultations.data.pagination.totalPages} onPageChange={(page) => updateUrl({ page })} /></> : <div className="rounded border border-white/15 p-8 text-center"><p>{t.noResults}</p><button type="button" onClick={reset} className="mt-4 text-sm text-gold-light underline">{t.reset}</button></div>}</section>;
}

function ListSkeleton() { const locale = useLocale(); return <section aria-busy="true" aria-label={messages[locale].admin.consultation.loading} className="mx-auto max-w-7xl space-y-4 px-4 py-8"><div className="h-10 w-56 animate-pulse rounded bg-white/10" />{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded bg-white/5" />)}</section>; }
