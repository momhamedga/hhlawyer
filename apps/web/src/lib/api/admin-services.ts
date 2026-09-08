import type { AdminServiceCreateInput, AdminServiceDetail, AdminServicesListResponse, AdminServiceStatusInput, AdminServiceUpdateInput } from "@hhlawyer/types";
import { apiFetch } from "./client";

export type AdminServicesFilters={page:number;limit:number;search?:string;isActive?:boolean;sortBy:"createdAt"|"name"|"slug"|"sortOrder";sortOrder:"asc"|"desc"};
export const adminServicesKeys={all:["admin","services"] as const,lists:()=>[...adminServicesKeys.all,"list"] as const,list:(filters:AdminServicesFilters)=>[...adminServicesKeys.lists(),filters] as const,details:()=>[...adminServicesKeys.all,"detail"] as const,detail:(id:string)=>[...adminServicesKeys.details(),id] as const};
const queryString=(filters:AdminServicesFilters)=>{const params=new URLSearchParams();for(const [key,value] of Object.entries(filters))if(value!==undefined&&value!=="")params.set(key,String(value));return params.toString();};
export const getAdminServices=(filters:AdminServicesFilters,signal?:AbortSignal)=>apiFetch<AdminServicesListResponse>(`/admin/services?${queryString(filters)}`,{credentials:"include",signal});
export const getAdminService=(id:string,signal?:AbortSignal)=>apiFetch<AdminServiceDetail>(`/admin/services/${encodeURIComponent(id)}`,{credentials:"include",signal});
export const createAdminService=(input:AdminServiceCreateInput)=>apiFetch<AdminServiceDetail>("/admin/services",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)});
export const updateAdminService=(id:string,input:AdminServiceUpdateInput)=>apiFetch<AdminServiceDetail>(`/admin/services/${encodeURIComponent(id)}`,{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)});
export const updateAdminServiceStatus=(id:string,input:AdminServiceStatusInput)=>apiFetch<AdminServiceDetail>(`/admin/services/${encodeURIComponent(id)}/status`,{method:"PATCH",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)});
