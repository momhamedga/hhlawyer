import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import { createTestPrismaClient } from "../../lib/test-database.js";
import { hashPassword } from "./auth.service.js";

const marker=`phase5-${Date.now()}`; const database=createTestPrismaClient(); const app=createApp({database});
const password="a securely long test password"; let adminId="";
beforeAll(async()=>{const user=await database.user.create({data:{email:`${marker}@example.test`,name:marker,passwordHash:await hashPassword(password),role:"ADMIN"}});adminId=user.id;});
afterAll(async()=>{await database.auditLog.deleteMany({where:{userId:adminId}});await database.session.deleteMany({where:{userId:adminId}});await database.user.delete({where:{id:adminId}});await database.$disconnect();});
describe("authentication",()=>{
 it("logs in with HttpOnly cookies and accesses protected routes",async()=>{const agent=request.agent(app);const response=await agent.post("/api/v1/auth/login").send({email:`${marker}@example.test`,password});expect(response.status).toBe(200);expect(response.body.data.user).not.toHaveProperty("passwordHash");expect(String(response.headers["set-cookie"])).toContain("HttpOnly");expect((await agent.get("/api/v1/auth/me")).status).toBe(200);expect((await agent.get("/api/v1/admin/overview")).status).toBe(200);});
 it("uses generic failures and locks an account after five failures",async()=>{for(let i=0;i<5;i+=1)expect((await request(app).post("/api/v1/auth/login").send({email:`${marker}@example.test`,password:"wrong"})).status).toBe(401);const user=await database.user.findUnique({where:{id:adminId}});expect(user?.lockedUntil).not.toBeNull();});
 it("rotates refresh and rejects old refresh reuse",async()=>{await database.user.update({where:{id:adminId},data:{failedLoginAttempts:0,lockedUntil:null}});const agent=request.agent(app);const login=await agent.post("/api/v1/auth/login").send({email:`${marker}@example.test`,password});const oldRefresh=String(login.headers["set-cookie"]).split(",").find((value)=>value.startsWith("hh_refresh="));expect((await agent.post("/api/v1/auth/refresh")).status).toBe(200);expect((await request(app).post("/api/v1/auth/refresh").set("Cookie",oldRefresh ?? "")).status).toBe(401);});
 it("logs out idempotently",async()=>{const agent=request.agent(app);await agent.post("/api/v1/auth/login").send({email:`${marker}@example.test`,password});expect((await agent.post("/api/v1/auth/logout")).status).toBe(200);expect((await agent.get("/api/v1/auth/me")).status).toBe(401);});
});
