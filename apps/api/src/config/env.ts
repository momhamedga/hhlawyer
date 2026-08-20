import "dotenv/config";
import { z } from "zod";

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
    WEB_ORIGIN: z.url().default("http://localhost:3000"),
    TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(0),
    EMAIL_ENABLED: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
    EMAIL_PROVIDER: z.enum(["resend"]).optional(),
    EMAIL_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().email().optional(),
    CONTACT_NOTIFICATION_TO: z.string().email().optional(),
    AUTH_SECRET: z.string().min(32).default("development-only-auth-secret-change-before-production"),
    ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().min(1).max(60).default(15),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(14),
    BUSINESS_TIME_ZONE: z.string().default("Asia/Dubai").refine((value) => {
      try {
        Intl.DateTimeFormat("en-US", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "BUSINESS_TIME_ZONE must be a valid IANA timezone."),
    DATABASE_URL: z.url().optional(),
    DATABASE_URL_TEST: z.url().optional(),
    DATABASE_URL_TEST_ISOLATED: z.url().optional(),
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV === "production" && !process.env.WEB_ORIGIN) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["WEB_ORIGIN"],
        message: "WEB_ORIGIN must be explicitly configured in production.",
      });
    }
    if (value.NODE_ENV === "production" && !process.env.AUTH_SECRET) context.addIssue({ code: z.ZodIssueCode.custom, path: ["AUTH_SECRET"], message: "AUTH_SECRET must be explicitly configured in production." });
    if (value.EMAIL_ENABLED && (!value.EMAIL_PROVIDER || !value.EMAIL_API_KEY || !value.EMAIL_FROM || !value.CONTACT_NOTIFICATION_TO)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["EMAIL_ENABLED"], message: "Enabled email requires provider configuration." });
    }
  });

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error("Invalid API environment configuration.");
  throw new Error("Invalid API environment configuration.");
}

export const env = parsedEnvironment.data;

export function requireDatabaseUrl() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_CONFIGURATION_REQUIRED");
  }

  return env.DATABASE_URL;
}

export function requireTestDatabaseUrl() {
  if (!env.DATABASE_URL_TEST) {
    throw new Error("TEST_DATABASE_CONFIGURATION_REQUIRED");
  }

  return env.DATABASE_URL_TEST;
}

export function requireIsolatedTestDatabaseUrl() {
  if (!env.DATABASE_URL_TEST_ISOLATED) throw new Error("ISOLATED_TEST_DATABASE_CONFIGURATION_REQUIRED");
  return env.DATABASE_URL_TEST_ISOLATED;
}
