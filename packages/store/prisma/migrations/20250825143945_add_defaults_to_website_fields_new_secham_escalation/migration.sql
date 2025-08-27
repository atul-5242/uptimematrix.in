-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('critical', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "MonitorType" AS ENUM ('https', 'http');

-- CreateEnum
CREATE TYPE "Method" AS ENUM ('GET', 'POST', 'PUT', 'DELETE', 'HEAD');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('critical', 'high', 'medium', 'low');

-- AlterTable
ALTER TABLE "website" ADD COLUMN     "alertTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "checkInterval" INTEGER NOT NULL DEFAULT 60000,
ADD COLUMN     "currently_upForIndays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "escalationPolicyId" TEXT,
ADD COLUMN     "incidents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "method" "Method" NOT NULL DEFAULT 'GET',
ADD COLUMN     "monitorType" "MonitorType" NOT NULL DEFAULT 'https',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Unnamed Monitor',
ADD COLUMN     "regions" TEXT[] DEFAULT ARRAY['India']::TEXT[],
ADD COLUMN     "severity" "Severity" NOT NULL DEFAULT 'low',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "EscalationPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priorityLevel" "Priority" NOT NULL DEFAULT 'low',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "monitorsDown" BOOLEAN NOT NULL DEFAULT true,
    "responseTimeThreshold" BOOLEAN NOT NULL DEFAULT false,
    "responseTimeValue" INTEGER DEFAULT 5000,
    "sslExpiry" BOOLEAN NOT NULL DEFAULT false,
    "sslExpiryDays" INTEGER DEFAULT 30,
    "domainExpiry" BOOLEAN NOT NULL DEFAULT false,
    "domainExpiryDays" INTEGER DEFAULT 30,
    "statusCodeErrors" BOOLEAN NOT NULL DEFAULT false,
    "statusCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "heartbeatMissed" BOOLEAN NOT NULL DEFAULT false,
    "heartbeatMissedCount" INTEGER DEFAULT 3,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscalationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscalationStep" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "primaryMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recipients" TEXT[],
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "escalateAfter" INTEGER NOT NULL DEFAULT 5,
    "customMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscalationStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isOnCall" BOOLEAN NOT NULL DEFAULT false,
    "isTeamLead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isIntegrated" BOOLEAN NOT NULL DEFAULT false,
    "configuration" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EscalationStep_policyId_stepOrder_key" ON "EscalationStep"("policyId", "stepOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_email_key" ON "TeamMember"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_userId_type_key" ON "Integration"("userId", "type");

-- AddForeignKey
ALTER TABLE "website" ADD CONSTRAINT "website_escalationPolicyId_fkey" FOREIGN KEY ("escalationPolicyId") REFERENCES "EscalationPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationPolicy" ADD CONSTRAINT "EscalationPolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationStep" ADD CONSTRAINT "EscalationStep_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "EscalationPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
