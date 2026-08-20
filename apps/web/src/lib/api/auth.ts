import type { AuthUser } from "@hhlawyer/types";
import { apiFetch } from "./client";
export function login(email:string,password:string){return apiFetch<{user:AuthUser}>("/auth/login",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});}
export function currentUser(){return apiFetch<{user:AuthUser}>("/auth/me",{credentials:"include"});}
export function logout(){return apiFetch<{loggedOut:true}>("/auth/logout",{method:"POST",credentials:"include"});}
