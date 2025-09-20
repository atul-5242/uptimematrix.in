-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "currentEscalationStepId" TEXT,
ADD COLUMN     "nextEscalationTime" TIMESTAMP(3);
