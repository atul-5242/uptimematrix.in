/*
  Warnings:

  - The values [POST,PUT,DELETE,HEAD] on the enum `Method` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ReportServiceStatus" AS ENUM ('OPERATIONAL', 'DOWN', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('RESOLVED', 'INVESTIGATING', 'MONITORING', 'OPERATIONAL', 'DOWN', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('CRITICAL', 'MAJOR', 'MINOR', 'MAINTENANCE', 'NONE');

-- CreateEnum
CREATE TYPE "StatusPageStatus" AS ENUM ('OPERATIONAL');

-- CreateEnum
CREATE TYPE "StatusPageVisibility" AS ENUM ('PUBLIC');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('OPERATIONAL');

-- CreateEnum
CREATE TYPE "UptimeTrend" AS ENUM ('ONLINE', 'OFFLINE');

-- AlterEnum
BEGIN;
CREATE TYPE "Method_new" AS ENUM ('GET');
ALTER TABLE "website" ALTER COLUMN "method" DROP DEFAULT;
ALTER TABLE "website" ALTER COLUMN "method" TYPE "Method_new" USING ("method"::text::"Method_new");
ALTER TYPE "Method" RENAME TO "Method_old";
ALTER TYPE "Method_new" RENAME TO "Method";
DROP TYPE "Method_old";
ALTER TABLE "website" ALTER COLUMN "method" SET DEFAULT 'GET';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MonitorType" ADD VALUE 'ping';
ALTER TYPE "MonitorType" ADD VALUE 'tcp';
ALTER TYPE "MonitorType" ADD VALUE 'dns';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WebsiteStatus" ADD VALUE 'Paused';
ALTER TYPE "WebsiteStatus" ADD VALUE 'Maintenance';

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "username",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "company" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobTitle" TEXT,
ADD COLUMN     "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "website" ADD COLUMN     "avgResponseTime24h" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "downtimeToday" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "responseTimeMs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uptime" DOUBLE PRECISION NOT NULL DEFAULT 100,
ADD COLUMN     "uptimeTrend" "UptimeTrend" NOT NULL DEFAULT 'ONLINE';

-- CreateTable
CREATE TABLE "StatusPage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "customDomain" TEXT,
    "description" TEXT NOT NULL,
    "status" "StatusPageStatus" NOT NULL,
    "visibility" "StatusPageVisibility" NOT NULL,
    "password" TEXT,
    "incidents" INTEGER NOT NULL DEFAULT 0,
    "uptime" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "theme" TEXT NOT NULL,
    "logo" TEXT,
    "primaryColor" TEXT NOT NULL,
    "headerBg" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT false,
    "slackNotifications" BOOLEAN NOT NULL DEFAULT false,
    "webhookNotifications" BOOLEAN NOT NULL DEFAULT false,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "showUptime" BOOLEAN NOT NULL DEFAULT true,
    "showIncidents" BOOLEAN NOT NULL DEFAULT true,
    "showMetrics" BOOLEAN NOT NULL DEFAULT true,
    "customCSS" TEXT,
    "customHTML" TEXT,

    CONSTRAINT "StatusPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ServiceStatus" NOT NULL,
    "statusPageId" TEXT NOT NULL,

    CONSTRAINT "ServiceGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ServiceStatus" NOT NULL,
    "uptime" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "monitorId" TEXT,
    "serviceGroupId" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "industry" TEXT,
    "location" TEXT,
    "memberSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "foundedYear" INTEGER,
    "about" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "ReportServiceStatus" NOT NULL,
    "uptime" DOUBLE PRECISION NOT NULL,
    "avgResponse" INTEGER NOT NULL,
    "incidents" INTEGER NOT NULL,
    "lastChecked" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "status" "IncidentStatus" NOT NULL,
    "severity" "IncidentSeverity" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "serviceId" TEXT,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StatusPage_subdomain_key" ON "StatusPage"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_email_key" ON "OrganizationMember"("email");

-- AddForeignKey
ALTER TABLE "ServiceGroup" ADD CONSTRAINT "ServiceGroup_statusPageId_fkey" FOREIGN KEY ("statusPageId") REFERENCES "StatusPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_serviceGroupId_fkey" FOREIGN KEY ("serviceGroupId") REFERENCES "ServiceGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ReportService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
