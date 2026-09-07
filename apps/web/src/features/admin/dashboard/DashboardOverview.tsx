"use client";

import type { DashboardRange } from "@hhlawyer/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPage, AdminPageHeader } from "@/components/admin/foundation";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { Select } from "@/components/ui";
import { formatLocaleDate } from "@/i18n/format";
import { currentUser } from "@/lib/api/auth";
import { adminDashboardKeys, getAdminDashboardOverview } from "@/lib/api/admin-dashboard";
import { ApiClientError } from "@/lib/api/client";
import { dashboardContent } from "./dashboard-content";
import { DashboardActivity } from "./DashboardActivity";
import { DashboardConsultations } from "./DashboardConsultations";
import { DashboardMessages } from "./DashboardMessages";
import { DashboardQuickActions } from "./DashboardQuickActions";
import { DashboardError, DashboardSkeleton } from "./DashboardStates";
import { DashboardSummary } from "./DashboardSummary";
import styles from "./Dashboard.module.css";

export function DashboardOverview() {
  const locale = useLocale();
  const copy = dashboardContent[locale];
  const router = useRouter();
  const [range, setRange] = useState<DashboardRange>("30d");
  const user = useQuery({ queryKey: ["auth", "me"], queryFn: currentUser, retry: false });
  const isAdmin = user.data?.user.role === "ADMIN";
  const dashboard = useQuery({
    enabled: isAdmin,
    queryFn: () => getAdminDashboardOverview(range),
    queryKey: adminDashboardKeys.overview(range),
    retry: (count, error) => !(error instanceof ApiClientError && [401, 403].includes(error.status)) && count < 1,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (user.isError || (user.isSuccess && !user.data)) router.replace(localizePath("/admin/login", locale));
  }, [locale, router, user.data, user.isError, user.isSuccess]);
  useEffect(() => {
    if (dashboard.error instanceof ApiClientError && dashboard.error.status === 401) router.replace(localizePath("/admin/login", locale));
  }, [dashboard.error, locale, router]);

  if (user.isLoading || !user.data || !isAdmin) return null;
  const data = dashboard.data;
  const rangeControl = <label className={styles.rangeControl}><span>{copy.rangeLabel}</span><Select data-testid="dashboard-range" value={range} onChange={(event) => setRange(event.target.value as DashboardRange)}>{(Object.keys(copy.ranges) as DashboardRange[]).map((value) => <option key={value} value={value}>{copy.ranges[value]}</option>)}</Select></label>;

  return (
    <AdminPage className={styles.dashboard} data-testid="admin-dashboard">
      <AdminPageHeader actions={rangeControl} description={copy.description} title={copy.title} />
      {dashboard.isLoading ? <DashboardSkeleton label={copy.loading} /> : dashboard.isError ? <DashboardError copy={copy} onRetry={() => void dashboard.refetch()} /> : data ? (
        <div className={styles.dashboardBody}>
          <p className={styles.periodContext}>{copy.periodContext(formatLocaleDate(data.period.startsAt, locale), formatLocaleDate(data.period.endsAt, locale))}</p>
          <DashboardSummary copy={copy} data={data} locale={locale} />
          <div className={styles.contentGrid}>
            <DashboardConsultations copy={copy} items={data.recentConsultations} locale={locale} />
            <DashboardMessages copy={copy} items={data.recentContacts} locale={locale} />
            <DashboardActivity copy={copy} items={data.recentActivity} locale={locale} />
            <DashboardQuickActions copy={copy} locale={locale} />
          </div>
        </div>
      ) : null}
    </AdminPage>
  );
}
