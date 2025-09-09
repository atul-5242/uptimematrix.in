/*
  Warnings:

  - The values [ping,tcp,dns] on the enum `MonitorType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `domainExpiry` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `domainExpiryDays` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `heartbeatMissed` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `heartbeatMissedCount` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `sslExpiry` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `sslExpiryDays` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `statusCodeErrors` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `statusCodes` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `initials` on the `OrganizationMember` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `OrganizationMember` table. All the data in the column will be lost.
  - You are about to drop the column `emailNotifications` on the `StatusPage` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `StatusPage` table. All the data in the column will be lost.
  - You are about to drop the column `showIncidents` on the `StatusPage` table. All the data in the column will be lost.
  - You are about to drop the column `showMetrics` on the `StatusPage` table. All the data in the column will be lost.
  - You are about to drop the column `showUptime` on the `StatusPage` table. All the data in the column will be lost.
  - You are about to drop the column `slackNotifications` on the `StatusPage` table. All the data in the column will be lost.
  - You are about to drop the column `smsNotifications` on the `StatusPage` table. All the data in the column will be lost.
  - You are about to drop the column `webhookNotifications` on the `StatusPage` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `isOnCall` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `website` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,organizationId]` on the table `EscalationPolicy` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `EscalationPolicy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `EscalationPolicy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Incident` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Integration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Integration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `OrganizationMember` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `OrganizationMember` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `createdById` to the `ReportService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `ReportService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `StatusPage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `StatusPage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `TeamMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `TeamMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `website` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `website` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MonitorType_new" AS ENUM ('https', 'http');
ALTER TABLE "website" ALTER COLUMN "monitorType" DROP DEFAULT;
ALTER TABLE "website" ALTER COLUMN "monitorType" TYPE "MonitorType_new" USING ("monitorType"::text::"MonitorType_new");
ALTER TYPE "MonitorType" RENAME TO "MonitorType_old";
ALTER TYPE "MonitorType_new" RENAME TO "MonitorType";
DROP TYPE "MonitorType_old";
ALTER TABLE "website" ALTER COLUMN "monitorType" SET DEFAULT 'https';
COMMIT;

-- AlterEnum
ALTER TYPE "ServiceStatus" ADD VALUE 'DOWN';

-- DropForeignKey
ALTER TABLE "EscalationPolicy" DROP CONSTRAINT "EscalationPolicy_userId_fkey";

-- DropForeignKey
ALTER TABLE "Integration" DROP CONSTRAINT "Integration_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMember" DROP CONSTRAINT "OrganizationMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "website" DROP CONSTRAINT "website_user_id_fkey";

-- DropIndex
DROP INDEX "EscalationPolicy_name_userId_key";

-- DropIndex
DROP INDEX "Integration_userId_type_key";

-- DropIndex
DROP INDEX "TeamMember_email_key";

-- AlterTable
ALTER TABLE "EscalationPolicy" DROP COLUMN "domainExpiry",
DROP COLUMN "domainExpiryDays",
DROP COLUMN "heartbeatMissed",
DROP COLUMN "heartbeatMissedCount",
DROP COLUMN "sslExpiry",
DROP COLUMN "sslExpiryDays",
DROP COLUMN "statusCodeErrors",
DROP COLUMN "statusCodes",
DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "Acknowledged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "Resolved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acknowledgedById" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "resolvedById" TEXT;

-- AlterTable
ALTER TABLE "Integration" DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "memberSince" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrganizationMember" DROP COLUMN "initials",
DROP COLUMN "role",
ADD COLUMN     "invitedById" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roleId" TEXT NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ReportService" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StatusPage" DROP COLUMN "emailNotifications",
DROP COLUMN "password",
DROP COLUMN "showIncidents",
DROP COLUMN "showMetrics",
DROP COLUMN "showUptime",
DROP COLUMN "slackNotifications",
DROP COLUMN "smsNotifications",
DROP COLUMN "webhookNotifications",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TeamMember" DROP COLUMN "email",
DROP COLUMN "isActive",
DROP COLUMN "isOnCall",
DROP COLUMN "name",
DROP COLUMN "phone",
DROP COLUMN "role",
ADD COLUMN     "roleId" TEXT NOT NULL,
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationExpires" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" TEXT;

-- AlterTable
ALTER TABLE "website" DROP COLUMN "user_id",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RolePermissions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RolePermissions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "_RolePermissions_B_index" ON "_RolePermissions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "EscalationPolicy_name_organizationId_key" ON "EscalationPolicy"("name", "organizationId");

-- AddForeignKey
ALTER TABLE "website" ADD CONSTRAINT "website_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website" ADD CONSTRAINT "website_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationPolicy" ADD CONSTRAINT "EscalationPolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationPolicy" ADD CONSTRAINT "EscalationPolicy_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusPage" ADD CONSTRAINT "StatusPage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusPage" ADD CONSTRAINT "StatusPage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportService" ADD CONSTRAINT "ReportService_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportService" ADD CONSTRAINT "ReportService_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolePermissions" ADD CONSTRAINT "_RolePermissions_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RolePermissions" ADD CONSTRAINT "_RolePermissions_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
