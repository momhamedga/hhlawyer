import { Prisma } from "@prisma/client";

export type DatabaseErrorType =
  | "PrismaKnownRequest"
  | "PrismaInitialization"
  | "PrismaUnknownRequest"
  | "PrismaRustPanic"
  | "DatabaseUnknown";

export type DatabaseOperation = "consultation.create";

export interface DatabaseErrorDiagnostic {
  errorType: DatabaseErrorType;
  prismaCode: string | null;
  operation: DatabaseOperation;
}

const prismaCodePattern = /^P\d{4}$/;

function safePrismaCode(code: unknown) {
  return typeof code === "string" && prismaCodePattern.test(code) ? code : null;
}

export function classifyDatabaseError(error: unknown): Omit<DatabaseErrorDiagnostic, "operation"> {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return { errorType: "PrismaKnownRequest", prismaCode: safePrismaCode(error.code) };
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return { errorType: "PrismaInitialization", prismaCode: safePrismaCode(error.errorCode) };
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return { errorType: "PrismaUnknownRequest", prismaCode: null };
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return { errorType: "PrismaRustPanic", prismaCode: null };
  }

  return { errorType: "DatabaseUnknown", prismaCode: null };
}

export function createDatabaseErrorDiagnostic(error: unknown, operation: DatabaseOperation): DatabaseErrorDiagnostic {
  return { ...classifyDatabaseError(error), operation };
}
