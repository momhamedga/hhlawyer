import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../modules/auth/auth.service.js";
const { ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_NAME || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) { console.error("ADMIN_CREATION_INPUT_REQUIRED"); process.exitCode = 1; } else { const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL.toLowerCase() } }); if (existing) { console.error("ADMIN_ALREADY_EXISTS"); process.exitCode = 1; } else { await prisma.user.create({ data: { email: ADMIN_EMAIL.toLowerCase(), name: ADMIN_NAME.trim(), passwordHash: await hashPassword(ADMIN_PASSWORD), role: "ADMIN" } }); console.info("ADMIN_CREATED"); } await prisma.$disconnect(); }
