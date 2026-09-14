-- CreateEnum
CREATE TYPE "PublicSubmissionScope" AS ENUM ('CONTACT', 'CONSULTATION');

-- CreateEnum
CREATE TYPE "IdempotencyState" AS ENUM ('PROCESSING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationAttemptState" AS ENUM ('PENDING', 'ATTEMPTING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "PublicSubmissionIdempotency" (
    "id" TEXT NOT NULL,
    "scope" "PublicSubmissionScope" NOT NULL,
    "keyHash" TEXT NOT NULL,
    "payloadHmac" TEXT NOT NULL,
    "state" "IdempotencyState" NOT NULL DEFAULT 'PROCESSING',
    "businessId" TEXT,
    "responseReferenceNumber" TEXT,
    "responseCreatedAt" TIMESTAMP(3),
    "notificationState" "NotificationAttemptState" NOT NULL DEFAULT 'PENDING',
    "notificationAttemptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSubmissionIdempotency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicSubmissionIdempotency_scope_keyHash_key" ON "PublicSubmissionIdempotency"("scope", "keyHash");

-- CreateIndex
CREATE INDEX "PublicSubmissionIdempotency_expiresAt_idx" ON "PublicSubmissionIdempotency"("expiresAt");
