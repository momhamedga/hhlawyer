import { PrismaClient } from "@prisma/client";
import { requireDatabaseUrl, requireIsolatedTestDatabaseUrl, requireTestDatabaseUrl } from "../config/env.js";

export class TestDatabaseIsolationError extends Error {
  constructor() {
    super("TEST_DATABASE_IS_NOT_ISOLATED");
    this.name = "TestDatabaseIsolationError";
  }
}

function targetIdentity(databaseUrl: string) {
  const parsed = new URL(databaseUrl);
  return {
    host: parsed.hostname.toLowerCase(),
    database: parsed.pathname.replace(/^\//, "").toLowerCase(),
  };
}

export function assertTestDatabaseIsIsolated() {
  const main = targetIdentity(requireDatabaseUrl());
  const test = targetIdentity(requireTestDatabaseUrl());

  if (main.host === test.host && main.database === test.database) {
    throw new TestDatabaseIsolationError();
  }
}

export function createTestPrismaClient() {
  assertTestDatabaseIsIsolated();

  return new PrismaClient({
    datasources: {
      db: {
        url: requireTestDatabaseUrl(),
      },
    },
  });
}

export function createIsolatedTestPrismaClient() {
  const main = targetIdentity(requireDatabaseUrl());
  const shared = targetIdentity(requireTestDatabaseUrl());
  const isolatedUrl = requireIsolatedTestDatabaseUrl();
  const isolated = targetIdentity(isolatedUrl);
  if ((isolated.host === main.host && isolated.database === main.database) || (isolated.host === shared.host && isolated.database === shared.database)) throw new TestDatabaseIsolationError();
  return new PrismaClient({ datasources: { db: { url: isolatedUrl } } });
}
