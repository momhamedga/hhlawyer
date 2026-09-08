"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AdminPage, AdminPageHeader } from "@/components/admin/foundation";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { formatLocaleNumber } from "@/i18n/format";
import { adminContactsKeys, getAdminContacts, type ContactFilters } from "@/lib/api/admin-contacts";
import { currentUser } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { MessageRecords } from "./MessageRecords";
import { MessagesPagination } from "./MessagesPagination";
import { MessagesEmpty, MessagesError, MessagesListSkeleton } from "./MessagesStates";
import { MessagesToolbar } from "./MessagesToolbar";
import { messagesContent } from "./messages-content";
import { defaultMessageFilters, filtersFromSearchParams, filtersToSearchParams } from "./messages-model";
import styles from "./Messages.module.css";

export function MessagesListPage() {
  const locale = useLocale();
  const copy = messagesContent[locale];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlFilters = useMemo(() => filtersFromSearchParams(new URLSearchParams(searchParams.toString())), [searchParams]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const user = useQuery({ queryKey: ["auth", "me"], queryFn: currentUser, retry: false });
  const filters = useMemo(() => ({ ...urlFilters, ...(search ? { search } : {}) }), [search, urlFilters]);
  const messages = useQuery({ enabled: Boolean(user.data), queryKey: adminContactsKeys.list(filters), queryFn: ({ signal }) => getAdminContacts(filters, signal), retry: 1 });

  useEffect(() => { const timeout = window.setTimeout(() => setSearch(searchInput.trim()), 400); return () => window.clearTimeout(timeout); }, [searchInput]);
  useEffect(() => { if (user.isError || (user.isSuccess && !user.data)) router.replace(localizePath("/admin/login", locale)); }, [locale, router, user.data, user.isError, user.isSuccess]);

  const navigate = (next: ContactFilters) => {
    const params = filtersToSearchParams(next);
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  };
  const updateFilters = (changes: Partial<Omit<ContactFilters, "search">>) => navigate({ ...urlFilters, ...changes, page: changes.page ?? 1 });
  const onSearchChange = (value: string) => { setSearchInput(value); if (urlFilters.page !== 1) updateFilters({ page: 1 }); };
  const clear = () => { setSearchInput(""); setSearch(""); navigate(defaultMessageFilters); };
  const activeCount = Number(Boolean(searchInput.trim())) + Number(Boolean(urlFilters.status));

  if (user.isLoading) return <MessagesListSkeleton locale={locale} />;
  if (!user.data) return null;
  const errorCode = messages.error instanceof ApiClientError ? messages.error.error.code : "";
  const pagination = messages.data?.pagination;
  const from = pagination && pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return <AdminPage className={styles.page} data-testid="admin-messages-list">
    <AdminPageHeader description={copy.description} title={copy.title} />
    <MessagesToolbar activeCount={activeCount} filters={urlFilters} locale={locale} onChange={updateFilters} onClear={clear} onSearchChange={onSearchChange} search={searchInput} />
    {messages.isLoading ? <MessagesListSkeleton locale={locale} /> : messages.isError ? <MessagesError forbidden={errorCode === "FORBIDDEN"} locale={locale} onRetry={() => void messages.refetch()} /> : messages.data ? <section aria-labelledby="message-results-heading" className={styles.resultsSection}><div className={styles.resultsHeader}><h2 id="message-results-heading">{copy.listCaption}</h2><p>{copy.resultsSummary(formatLocaleNumber(from, locale), formatLocaleNumber(to, locale), formatLocaleNumber(messages.data.pagination.total, locale))}</p></div>{messages.data.items.length ? <><MessageRecords items={messages.data.items} locale={locale} /><MessagesPagination locale={locale} onPageChange={(page) => updateFilters({ page })} page={messages.data.pagination.page} totalPages={messages.data.pagination.totalPages} /></> : <MessagesEmpty filtered={activeCount > 0 || messages.data.pagination.total > 0} locale={locale} onClear={clear} />}</section> : null}
  </AdminPage>;
}
