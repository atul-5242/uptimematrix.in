-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "currentRepeatCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "escalationStepStartTime" TIMESTAMP(3),
ADD COLUMN     "stepDelayCompleted" BOOLEAN NOT NULL DEFAULT false;
