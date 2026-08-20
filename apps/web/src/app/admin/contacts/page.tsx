"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { currentUser } from "@/lib/api/auth";
import { adminContactsKeys, getAdminContacts, type ContactFilters } from "@/lib/api/admin-contacts";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { displayEnum } from "@/i18n/format";

export default function ContactsPage() {
  const locale = useLocale();
  const en = locale === "en";
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ContactFilters>({ page: 1, limit: 20, sortBy: "createdAt", sortOrder: "desc" });
  const user = useQuery({ queryKey: ["auth", "me"], queryFn: currentUser, retry: false });
  const contacts = useQuery({ queryKey: adminContactsKeys.list({ ...filters, search }), queryFn: () => getAdminContacts({ ...filters, search }), enabled: !!user.data });

  if (user.isLoading) return <p className="p-8">{en ? "Checking session..." : "جارٍ التحقق..."}</p>;
  if (!user.data) return null;
  const statuses = ["UNREAD", "READ", "REPLIED", "ARCHIVED"] as const;
  return <section className="mx-auto max-w-7xl space-y-5 p-8"><h1 className="text-3xl font-bold">{en ? "Contact messages" : "رسائل التواصل"}</h1><label className="block">{en ? "Search" : "بحث"}<input data-testid="contact-search" aria-label={en ? "Search" : "بحث"} value={search} onChange={(event) => setSearch(event.target.value)} className="ms-2 rounded border p-2 text-black" /></label><select data-testid="contact-status-filter" aria-label={en ? "Status" : "الحالة"} value={filters.status ?? ""} onChange={(event) => setFilters({ ...filters, page: 1, status: (event.target.value || undefined) as ContactFilters["status"] })} className="rounded p-2 text-black"><option value="">{en ? "All" : "الكل"}</option>{statuses.map((status) => <option key={status} value={status}>{displayEnum(locale, status)}</option>)}</select>{contacts.isLoading ? <p aria-busy="true">{en ? "Loading messages..." : "جارٍ تحميل الرسائل..."}</p> : contacts.isError ? <p role="alert">{en ? "Contact messages could not be loaded." : "تعذر تحميل رسائل التواصل."}</p> : !contacts.data?.items.length ? <p>{en ? "No matching contact messages." : "لا توجد رسائل تواصل مطابقة."}</p> : <div className="overflow-x-auto"><table className="min-w-[700px] w-full"><caption className="sr-only">{en ? "Contact messages" : "رسائل التواصل"}</caption><thead><tr><th>{en ? "Sender" : "المرسل"}</th><th>{en ? "Email" : "البريد الإلكتروني"}</th><th>{en ? "Subject" : "الموضوع"}</th><th>{en ? "Status" : "الحالة"}</th><th>{en ? "Action" : "الإجراء"}</th></tr></thead><tbody>{contacts.data.items.map((item) => <tr key={item.id} data-contact-id={item.id}><td>{item.name}</td><td dir="ltr"><bdi>{item.email}</bdi></td><td>{item.subject}</td><td>{displayEnum(locale, item.status)}</td><td><Link data-testid="contact-view" href={localizePath(`/admin/contacts/${item.id}`, locale)}>{en ? "View message" : "عرض الرسالة"}</Link></td></tr>)}</tbody></table></div>}</section>;
}
