import { createTestPrismaClient, TestDatabaseIsolationError } from "../lib/test-database.js";

const checkTestDatabase = process.argv.includes("--test");
const verifySchema = process.argv.includes("--schema");
const verifyServices = process.argv.includes("--services");

async function getClient() {
  if (checkTestDatabase) {
    return createTestPrismaClient();
  }

  const { prisma } = await import("../lib/prisma.js");
  return prisma;
}

async function verifyExpectedSchema(client: Awaited<ReturnType<typeof getClient>>) {
  const [tables, enums, migrations, indexes, foreignKeys] = await Promise.all([
    client.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `,
    client.$queryRaw<Array<{ typname: string }>>`
      SELECT typname
      FROM pg_type
      WHERE typname IN ('UserRole', 'ConsultationStatus', 'ContactMessageStatus')
    `,
    client.$queryRaw<Array<{ migration_name: string }>>`
      SELECT migration_name
      FROM "_prisma_migrations"
      WHERE finished_at IS NOT NULL
    `,
    client.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
    `,
    client.$queryRaw<Array<{ constraint_name: string }>>`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY'
    `,
  ]);

  const expectedTables = ["User", "Session", "Service", "Consultation", "ConsultationCounter", "ContactMessage", "AuditLog"];
  const expectedEnums = ["UserRole", "ConsultationStatus", "ContactMessageStatus"];
  const expectedIndexes = [
    "User_email_key",
    "Service_slug_key",
    "Consultation_referenceNumber_key",
    "Consultation_serviceId_idx",
    "Consultation_status_idx",
    "Consultation_createdAt_idx",
    "ContactMessage_status_idx",
    "ContactMessage_createdAt_idx",
    "AuditLog_userId_idx",
    "AuditLog_createdAt_idx",
  ];
  const expectedForeignKeys = ["Consultation_serviceId_fkey", "AuditLog_userId_fkey"];
  const hasExpectedTables = expectedTables.every((name) => tables.some((table) => table.table_name === name));
  const hasExpectedEnums = expectedEnums.every((name) => enums.some((entry) => entry.typname === name));
  const hasInitialMigration = migrations.some((migration) => migration.migration_name.endsWith("_initial_foundation"));
  const hasCounterMigration = migrations.some((migration) => migration.migration_name.endsWith("_consultation_reference_counter"));
  const hasAuthMigration = migrations.some((migration) => migration.migration_name.endsWith("_auth_sessions"));
  const hasExpectedIndexes = expectedIndexes.every((name) => indexes.some((index) => index.indexname === name));
  const hasExpectedForeignKeys = expectedForeignKeys.every((name) => foreignKeys.some((key) => key.constraint_name === name));

  if (!hasExpectedTables || !hasExpectedEnums || !hasInitialMigration || !hasCounterMigration || !hasAuthMigration || !hasExpectedIndexes || !hasExpectedForeignKeys) {
    throw new Error("DATABASE_SCHEMA_VERIFICATION_FAILED");
  }
}

async function verifyServiceCatalogue(client: Awaited<ReturnType<typeof getClient>>) {
  const services = await client.$queryRaw<Array<{ slug: string }>>`
    SELECT slug
    FROM "Service"
    ORDER BY slug
  `;
  const expectedSlugs = ["civil", "commercial", "criminal", "notary", "taxes"];
  const actualSlugs = services.map((service) => service.slug);

  if (actualSlugs.length !== expectedSlugs.length || actualSlugs.some((slug, index) => slug !== expectedSlugs[index])) {
    throw new Error("SERVICE_CATALOGUE_VERIFICATION_FAILED");
  }
}

async function main() {
  const client = await getClient();
  await client.$queryRaw`SELECT 1`;
  if (verifySchema) {
    await verifyExpectedSchema(client);
  }
  if (verifyServices) {
    await verifyServiceCatalogue(client);
  }
  console.info(checkTestDatabase ? "Test database connectivity verified." : "Main database connectivity verified.");

  return client;
}

main()
  .then((client) => client.$disconnect())
  .catch((error: unknown) => {
    const code = error instanceof TestDatabaseIsolationError
      ? error.message
      : "DATABASE_CONNECTIVITY_FAILED";
    console.error(`Database connectivity check failed: ${code}`);
    process.exitCode = 1;
  });
