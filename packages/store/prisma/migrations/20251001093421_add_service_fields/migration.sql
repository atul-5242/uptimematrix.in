-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "description" TEXT,
ADD COLUMN     "lastCheck" TIMESTAMP(3),
ADD COLUMN     "responseTime" INTEGER;
