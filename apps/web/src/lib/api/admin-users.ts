import type { AdminUserCreateInput, AdminUserDetail, AdminUserRoleInput, AdminUsersListResponse, AdminUserStatusInput, AdminUserUpdateInput, UserRole } from "@hhlawyer/types";
import { apiFetch } from "./client";

export type AdminUsersFilters={page:number;limit:number;search?:string;role?:UserRole;isActive?:boolean;sortBy:"createdAt"|"name"|"email"|"role";sortOrder:"asc"|"desc"};
export const adminUsersKeys={all:["admin","users"] as const,list:(filters:AdminUsersFilters)=>[...adminUsersKeys.all,"list",filters] as const,detail:(id:string)=>[...adminUsersKeys.all,"detail",id] as const};
const qs=(filters:AdminUsersFilters)=>{const p=new URLSearchParams();for(const [k,v] of Object.entries(filters))if(v!==undefined&&v!=="")p.set(k,String(v));return p;};
export const getAdminUsers=(filters:AdminUsersFilters,signal?:AbortSignal)=>apiFetch<AdminUsersListResponse>(`/admin/users?${qs(filters)}`,{credentials:"include",signal});
export const getAdminUser=(id:string,signal?:AbortSignal)=>apiFetch<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`,{credentials:"include",signal});
export const createAdminUser=(input:AdminUserCreateInput)=>apiFetch<AdminUserDetail>("/admin/users",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)});
export const updateAdminUser=(id:string,input:AdminUserUpdateInput)=>apiFetch<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`,{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)});
export const changeAdminUserRole=(id:string,input:AdminUserRoleInput)=>apiFetch<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}/role`,{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)});
export const changeAdminUserStatus=(id:string,input:AdminUserStatusInput)=>apiFetch<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}/status`,{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)});
export const resetAdminUserPassword=(id:string,newPassword:string)=>apiFetch<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}/reset-password`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({newPassword})});
