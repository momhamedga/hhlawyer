-- CreateTable
CREATE TABLE "ConsultationCounter" (
    "year" INTEGER NOT NULL,
    "lastValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationCounter_pkey" PRIMARY KEY ("year")
);
