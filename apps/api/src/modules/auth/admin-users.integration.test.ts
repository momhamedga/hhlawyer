import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "../../app.js";
import { createTestPrismaClient } from "../../lib/test-database.js";
import { hashPassword } from "./auth.service.js";

const marker=`phase6c1_${Date.now()}`, password="phase6c1 secure password";
const db=createTestPrismaClient(), app=createApp({database:db});
const ids:string[]=[]; const agents={} as Record<"ADMIN"|"LAWYER"|"STAFF",ReturnType<typeof request.agent>>; let adminId="",staffId="";
beforeAll(async()=>{for(const role of ["ADMIN","LAWYER","STAFF"] as const){const user=await db.user.create({data:{email:`${marker}.${role.toLowerCase()}@example.test`,name:`${marker} ${role}`,role,passwordHash:await hashPassword(password)}});ids.push(user.id);if(role==="ADMIN")adminId=user.id;if(role==="STAFF")staffId=user.id;const agent=request.agent(app);expect((await agent.post("/api/v1/auth/login").send({email:user.email,password})).status).toBe(200);agents[role]=agent;}},30_000);
afterAll(async()=>{await db.auditLog.deleteMany({where:{entityId:{in:ids}}});await db.session.deleteMany({where:{userId:{in:ids}}});await db.user.deleteMany({where:{id:{in:ids}}});await db.$disconnect();});
describe("admin users API",()=>{
 it("is ADMIN-only, lists safe DTOs, and creates normalized users",async()=>{expect((await request(app).get("/api/v1/admin/users")).status).toBe(401);expect((await agents.LAWYER.get("/api/v1/admin/users")).status).toBe(403);expect((await agents.STAFF.get("/api/v1/admin/users")).status).toBe(403);const list=await agents.ADMIN.get(`/api/v1/admin/users?search=${marker}&role=STAFF&sortBy=email&sortOrder=asc`);expect(list.status).toBe(200);expect(list.body.data.items[0]).not.toHaveProperty("passwordHash");const created=await agents.ADMIN.post("/api/v1/admin/users").set("Origin","http://localhost:3000").send({name:"Created User",email:`${marker}.CREATED@EXAMPLE.TEST`,password,role:"STAFF"});expect(created.status).toBe(201);ids.push(created.body.data.id);expect(created.body.data.email).toBe(`${marker}.created@example.test`);expect(await bcrypt.compare(password,(await db.user.findUnique({where:{id:created.body.data.id}}))!.passwordHash)).toBe(true);});
 it("protects self-disable while revoking sessions on disable/reset",async()=>{expect((await agents.ADMIN.patch(`/api/v1/admin/users/${adminId}/status`).set("Origin","http://localhost:3000").send({isActive:false})).body.error.code).toBe("CANNOT_DISABLE_SELF");const disabled=await agents.ADMIN.patch(`/api/v1/admin/users/${staffId}/status`).set("Origin","http://localhost:3000").send({isActive:false});expect(disabled.status).toBe(200);expect(await db.session.count({where:{userId:staffId,revokedAt:null}})).toBe(0);expect((await agents.ADMIN.post(`/api/v1/admin/users/${staffId}/reset-password`).set("Origin","http://localhost:3000").send({newPassword:"another phase6c1 password"})).status).toBe(200);expect((await db.auditLog.findFirst({where:{entityId:staffId,action:"USER_PASSWORD_RESET"}}))?.metadata).toBeNull();});
});
