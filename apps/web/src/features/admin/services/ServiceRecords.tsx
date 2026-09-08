import type { AdminServiceListItem } from "@hhlawyer/types";
import { ChevronRight, LibraryBig } from "lucide-react";
import Link from "next/link";
import { AdminTechnicalValue } from "@/components/admin/foundation";
import { localizePath } from "@/components/providers/LocaleProvider";
import { formatLocaleDate } from "@/i18n/format";
import type { Locale } from "@/i18n/locale";
import { AvailabilityBadge, LocalizationBadge } from "./ServiceBadges";
import { serviceLocalization } from "./services-model";
import { servicesContent } from "./services-content";
import styles from "./Services.module.css";

function ManageLink({id,locale,mobile=false,name}:{id:string;locale:Locale;mobile?:boolean;name:string}){const c=servicesContent[locale];return <Link aria-label={`${c.manage}: ${name}`} data-testid={`${mobile?"service-mobile-view":"service-view"}-${id}`} href={localizePath(`/admin/services/${id}`,locale)}>{c.manage}<ChevronRight aria-hidden="true" size={15}/></Link>;}

export function ServiceRecords({items,locale}:{items:AdminServiceListItem[];locale:Locale}){const c=servicesContent[locale];return <>
<div className={styles.desktopTable} data-testid="admin-services-desktop-list"><table><caption className={styles.srOnly}>{c.title}</caption><thead><tr><th scope="col">{c.canonicalName}</th><th scope="col">{c.availability}</th><th scope="col">{c.localization}</th><th scope="col">{c.order}</th><th scope="col">{c.created}</th><th scope="col"><span className={styles.srOnly}>{c.manage}</span></th></tr></thead><tbody>{items.map(item=>{const localized=serviceLocalization(item.slug);return <tr key={item.id} data-testid={`service-row-${item.id}`}><td><strong>{item.name}</strong><AdminTechnicalValue>{item.slug}</AdminTechnicalValue></td><td><AvailabilityBadge active={item.isActive} locale={locale}/></td><td><LocalizationBadge locale={locale} mapped={localized.mapped}/></td><td><AdminTechnicalValue>{item.sortOrder}</AdminTechnicalValue></td><td>{formatLocaleDate(item.createdAt,locale)}</td><td><ManageLink id={item.id} locale={locale} name={item.name}/></td></tr>;})}</tbody></table></div>
<ul className={styles.mobileList} data-testid="admin-services-mobile-list">{items.map(item=>{const localized=serviceLocalization(item.slug);return <li key={item.id}><article data-testid={`service-card-${item.id}`}><div className={styles.cardHeader}><span className={styles.catalogueIcon}><LibraryBig aria-hidden="true" size={18}/></span><div><strong>{item.name}</strong><AdminTechnicalValue>{item.slug}</AdminTechnicalValue></div></div><div className={styles.cardBadges}><AvailabilityBadge active={item.isActive} locale={locale}/><LocalizationBadge locale={locale} mapped={localized.mapped}/></div><dl><div><dt>{c.order}</dt><dd>{item.sortOrder}</dd></div><div><dt>{c.created}</dt><dd>{formatLocaleDate(item.createdAt,locale)}</dd></div></dl><ManageLink id={item.id} locale={locale} mobile name={item.name}/></article></li>;})}</ul>
</>;}
