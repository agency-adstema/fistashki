-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('SCHEDULED', 'DIALING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CallOutcome" AS ENUM ('CONFIRMED', 'CANCELLED', 'CALLBACK', 'UPSELL', 'NO_ANSWER', 'FAILED');

-- CreateTable
CREATE TABLE "call_jobs" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL DEFAULT 'SCHEDULED',
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_logs" (
    "id" TEXT NOT NULL,
    "callJobId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "duration" INTEGER,
    "outcome" "CallOutcome",
    "transcript" JSONB,
    "summary" TEXT,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "call_jobs_orderId_idx" ON "call_jobs"("orderId");

-- CreateIndex
CREATE INDEX "call_jobs_status_idx" ON "call_jobs"("status");

-- CreateIndex
CREATE INDEX "call_jobs_scheduledAt_idx" ON "call_jobs"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "call_logs_callJobId_key" ON "call_logs"("callJobId");

-- CreateIndex
CREATE INDEX "call_logs_callJobId_idx" ON "call_logs"("callJobId");

-- CreateIndex
CREATE INDEX "call_logs_orderId_idx" ON "call_logs"("orderId");

-- CreateIndex
CREATE INDEX "call_logs_customerId_idx" ON "call_logs"("customerId");

-- CreateIndex
CREATE INDEX "call_logs_outcome_idx" ON "call_logs"("outcome");

-- CreateIndex
CREATE INDEX "call_logs_createdAt_idx" ON "call_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "call_jobs" ADD CONSTRAINT "call_jobs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_callJobId_fkey" FOREIGN KEY ("callJobId") REFERENCES "call_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
