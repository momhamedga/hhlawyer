import type { AdminContactDetail, AdminContactListResponse, ContactMessageStatus } from "@hhlawyer/types";
import { apiFetch } from "./client";
export type ContactFilters={page:number;limit:number;search?:string;status?:ContactMessageStatus;sortBy:"createdAt"|"status";sortOrder:"asc"|"desc"};
export const adminContactsKeys={all:["admin","contacts"] as const,list:(f:ContactFilters)=>[...adminContactsKeys.all,"list",f] as const,detail:(id:string)=>[...adminContactsKeys.all,"detail",id] as const};
export function getAdminContacts(f:ContactFilters){const p=new URLSearchParams();Object.entries(f).forEach(([k,v])=>{if(v)p.set(k,String(v));});return apiFetch<AdminContactListResponse>(`/admin/contacts?${p}`,{credentials:"include"});}
export function getAdminContact(id:string){return apiFetch<AdminContactDetail>(`/admin/contacts/${id}`,{credentials:"include"});}
export function updateAdminContactStatus(id:string,status:ContactMessageStatus){return apiFetch<{id:string;status:ContactMessageStatus}>(`/admin/contacts/${id}/status`,{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});}
