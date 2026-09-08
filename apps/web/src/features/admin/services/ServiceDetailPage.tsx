"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminServiceUpdateInput } from "@hhlawyer/types";
import { AdminBreadcrumbs, AdminDataState, AdminPage, AdminPageHeader, AdminTechnicalValue } from "@/components/admin/foundation";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { adminDashboardKeys } from "@/lib/api/admin-dashboard";
import { adminServicesKeys, getAdminService, updateAdminService, updateAdminServiceStatus } from "@/lib/api/admin-services";
import { currentUser } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { AvailabilityBadge, LocalizationBadge } from "./ServiceBadges";
import { ServiceDetailSections } from "./ServiceDetailSections";
import { serviceError, serviceLocalization } from "./services-model";
import { servicesContent } from "./services-content";
import styles from "./Services.module.css";

type Pending="metadata"|"status"|null;
export function ServiceDetailPage(){const locale=useLocale();const c=servicesContent[locale];const {id}=useParams<{id:string}>();const router=useRouter();const client=useQueryClient();const [pending,setPending]=useState<Pending>(null);const [feedback,setFeedback]=useState("");const [error,setError]=useState("");const me=useQuery({queryKey:["auth","me"],queryFn:currentUser,retry:false});const service=useQuery({enabled:me.data?.user.role==="ADMIN"&&Boolean(id),queryKey:adminServicesKeys.detail(id),queryFn:({signal})=>getAdminService(id,signal),retry:1});useEffect(()=>{if(me.isError||(me.isSuccess&&!me.data))router.replace(localizePath("/admin/login",locale));},[locale,me.data,me.isError,me.isSuccess,router]);const fail=(value:unknown)=>{setPending(null);setError(serviceError(value instanceof ApiClientError?value.error.code:undefined,c));};const refresh=async()=>{await Promise.all([client.invalidateQueries({queryKey:adminServicesKeys.all}),client.invalidateQueries({queryKey:adminDashboardKeys.all}),client.invalidateQueries({queryKey:["services","active"]}),client.invalidateQueries({queryKey:["active-services"]})]);};const metadata=useMutation({mutationFn:(value:AdminServiceUpdateInput)=>updateAdminService(id,value),retry:false,onSuccess:async()=>{setFeedback(c.saved);setError("");setPending(null);await refresh();},onError:fail});const status=useMutation({mutationFn:(value:boolean)=>updateAdminServiceStatus(id,{isActive:value}),retry:false,onSuccess:async()=>{setFeedback(c.statusChanged);setError("");setPending(null);await refresh();},onError:fail});
if(me.isLoading||service.isLoading)return <AdminPage><div aria-busy="true" className={styles.skeleton} data-testid="admin-service-detail-loading"><span/><span/><span/><span/></div></AdminPage>;if(!me.data)return null;if(me.data.user.role!=="ADMIN")return <AdminPage><AdminDataState description={c.unauthorized} title={c.forbidden} tone="error"/></AdminPage>;if(service.isError){const code=service.error instanceof ApiClientError?service.error.error.code:undefined;return <AdminPage><AdminDataState description={serviceError(code,c)} title={code==="SERVICE_NOT_FOUND"?c.notFound:c.loadError} tone="error"/><button onClick={()=>void service.refetch()}>{c.retry}</button></AdminPage>;}const item=service.data;if(!item)return null;const localized=serviceLocalization(item.slug);
return <AdminPage className={styles.page} data-testid="admin-service-detail"><AdminBreadcrumbs label={c.details} items={[{href:localizePath("/admin/services",locale),label:c.back},{label:item.name}]}/><AdminPageHeader actions={<div className={styles.headerBadges}><AvailabilityBadge active={item.isActive} locale={locale}/><LocalizationBadge locale={locale} mapped={localized.mapped}/></div>} className={styles.detailHeader} description={<AdminTechnicalValue>{item.slug}</AdminTechnicalValue>} title={item.name}/>{feedback?<p className={styles.successFeedback} role="status">{feedback}</p>:null}<ServiceDetailSections error={error} item={item} locale={locale} onMetadata={value=>{setPending("metadata");setFeedback("");setError("");metadata.mutate(value);}} onStatus={async value=>{setPending("status");setFeedback("");setError("");try{await status.mutateAsync(value);return true;}catch{return false;}}} pending={pending}/><Link className={styles.backLink} href={localizePath("/admin/services",locale)}><ArrowLeft aria-hidden="true" size={16}/>{c.back}</Link></AdminPage>;}
