import { createApp } from "../app.js";
import { createTestPrismaClient } from "../lib/test-database.js";
import { hashPassword } from "../modules/auth/auth.service.js";

const database = createTestPrismaClient();
const testAdminEmail = "phase5.e2e.admin@example.test";
const testStaffEmail = "phase6a2.e2e.staff@example.test";
await database.user.upsert({ where: { email: testAdminEmail }, update: { passwordHash: await hashPassword("phase5 browser password"), isActive: true, role: "ADMIN" }, create: { email: testAdminEmail, name: "PHASE5_E2E_ADMIN", passwordHash: await hashPassword("phase5 browser password"), role: "ADMIN" } });
await database.user.upsert({ where: { email: testStaffEmail }, update: { passwordHash: await hashPassword("phase6a2 staff password"), isActive: true, role: "STAFF" }, create: { email: testStaffEmail, name: "PHASE6A2_E2E_STAFF", passwordHash: await hashPassword("phase6a2 staff password"), role: "STAFF" } });
const service = await database.service.findFirst({ where: { isActive: true }, orderBy: { slug: "asc" } });
if (!service) throw new Error("TEST_SERVICE_NOT_FOUND");
await database.consultation.upsert({
  where: { referenceNumber: "PHASE6A2-E2E-000001" },
  update: { status: "PENDING", name: "PHASE6A2 E2E Client", email: "phase6a2.e2e@example.test", phone: "+971501234567", serviceId: service.id, preferredDate: new Date("2099-12-31T12:00:00.000Z"), preferredTime: "10:00 AM", message: "Controlled browser smoke fixture." },
  create: { referenceNumber: "PHASE6A2-E2E-000001", serviceId: service.id, name: "PHASE6A2 E2E Client", email: "phase6a2.e2e@example.test", phone: "+971501234567", preferredDate: new Date("2099-12-31T12:00:00.000Z"), preferredTime: "10:00 AM", message: "Controlled browser smoke fixture." },
});
const server = createApp({ database, loginRateLimit: 100, requestRateLimit: 1_000 }).listen(4000);

async function shutdown() {
  await database.$disconnect();
  server.close();
}

process.on("SIGINT", () => { void shutdown(); });
process.on("SIGTERM", () => { void shutdown(); });
