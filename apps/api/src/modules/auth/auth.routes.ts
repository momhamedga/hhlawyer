import { Router } from "express";
import type { Router as ExpressRouter, RequestHandler, Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import rateLimit from "express-rate-limit";
import { loginSchema } from "@hhlawyer/validation";
import type { ApiSuccess, AuthUser } from "@hhlawyer/types";
import { isAllowedWebOrigin } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { audit, login, revoke, rotate, toSafeUser, verifyAccessToken } from "./auth.service.js";
import { hasPermission, type Permission } from "./permissions.js";

const accessCookie = "hh_access"; const refreshCookie = "hh_refresh";
function cookies(request: Request) { return Object.fromEntries((request.headers.cookie ?? "").split(";").filter(Boolean).map((part) => { const [key, ...value] = part.trim().split("="); return [key, decodeURIComponent(value.join("="))]; })); }
function cookieOptions(production: boolean, path: string, maxAge: number) { return { httpOnly: true, secure: production, sameSite: "lax" as const, path, maxAge }; }
function metadata(request: Request) { return { ip: request.ip, userAgent: request.get("user-agent") }; }
function setCookies(response: Response, access: string, refresh: string) { const production = process.env.NODE_ENV === "production"; response.cookie(accessCookie, access, cookieOptions(production, "/api/v1", 15 * 60_000)); response.cookie(refreshCookie, refresh, cookieOptions(production, "/api/v1/auth", 14 * 86_400_000)); }
function clearCookies(response: Response) { const production = process.env.NODE_ENV === "production"; response.clearCookie(accessCookie, cookieOptions(production, "/api/v1", 0)); response.clearCookie(refreshCookie, cookieOptions(production, "/api/v1/auth", 0)); }
export interface AuthRequest extends Request { auth?: AuthUser; }
export function requireAuth(database?: PrismaClient): RequestHandler { return async (request: AuthRequest, _response, next) => { try { const token = cookies(request)[accessCookie]; if (!token) throw new AppError(401,"UNAUTHORIZED","Authentication is required."); const payload=await verifyAccessToken(token); const user=await (database ?? (await import("../../lib/prisma.js")).prisma).user.findUnique({where:{id:payload.userId},select:{id:true,name:true,email:true,role:true,isActive:true}}); if(!user||!user.isActive) throw new AppError(401,"UNAUTHORIZED","Authentication is required."); request.auth=toSafeUser(user); next(); } catch { next(new AppError(401,"UNAUTHORIZED","Authentication is required.")); } }; }
export function requirePermission(permission: Permission): RequestHandler { return (request: AuthRequest,_response,next)=> { if(!request.auth || !hasPermission(request.auth.role,permission)) { next(new AppError(403,"FORBIDDEN","You do not have permission to access this resource.")); return; } next(); }; }
const csrf: RequestHandler = (request, _response, next) => { const origin=request.get("origin"); if(origin && !isAllowedWebOrigin(origin)) { next(new AppError(403,"CSRF_REJECTED","Request origin is not allowed.")); return; } next(); };
export function createAuthRouter(database?: PrismaClient, loginLimit=10): ExpressRouter { const router: ExpressRouter=Router(); const db=database; const loginRate=rateLimit({windowMs:15*60_000,limit:loginLimit,standardHeaders:"draft-8",legacyHeaders:false,handler:(req,res)=>res.status(429).json({success:false,error:{code:"RATE_LIMITED",message:"Too many login attempts.",requestId:req.requestId}})});
  router.post("/auth/login", csrf, loginRate, async (request,response,next)=>{const parsed=loginSchema.safeParse(request.body);if(!parsed.success){next(new AppError(400,"VALIDATION_ERROR","Invalid credentials."));return;}try{const result=await login(parsed.data.email,parsed.data.password,metadata(request),db);setCookies(response,result.access,result.refresh);const body:ApiSuccess<{user:AuthUser}>={success:true,data:{user:result.user}};response.status(200).json(body);}catch(error){next(error);}});
  router.post("/auth/refresh",csrf,async(request,response,next)=>{try{const result=await rotate(cookies(request)[refreshCookie],metadata(request),db);setCookies(response,result.access,result.refresh);response.status(200).json({success:true,data:{user:result.user}});}catch(error){clearCookies(response);next(error);}});
  router.post("/auth/logout",csrf,async(request,response,next)=>{try{await revoke(cookies(request)[refreshCookie],metadata(request),db);clearCookies(response);response.status(200).json({success:true,data:{loggedOut:true}});}catch(error){next(error);}});
  router.get("/auth/me",requireAuth(db),(request:AuthRequest,response)=>response.status(200).json({success:true,data:{user:request.auth}}));
  return router; }
