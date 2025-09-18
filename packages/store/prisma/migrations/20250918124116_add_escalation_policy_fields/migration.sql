-- AlterTable
ALTER TABLE "EscalationPolicy" ADD COLUMN     "domainExpiry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "domainExpiryDays" INTEGER DEFAULT 30,
ADD COLUMN     "heartbeatMissed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "heartbeatMissedCount" INTEGER DEFAULT 3,
ADD COLUMN     "repeatLastStepIntervalMinutes" INTEGER DEFAULT 30,
ADD COLUMN     "responseTimeThreshold" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "responseTimeValue" INTEGER DEFAULT 5000,
ADD COLUMN     "sslExpiry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sslExpiryDays" INTEGER DEFAULT 30,
ADD COLUMN     "statusCodeErrors" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "statusCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "terminationCondition" TEXT DEFAULT 'stop_after_last_step';

-- AlterTable
ALTER TABLE "EscalationStep" ADD COLUMN     "repeatCount" INTEGER NOT NULL DEFAULT 1;
