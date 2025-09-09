/*
  Warnings:

  - You are about to drop the column `organizationDefaultEscalationPolicyId` on the `EscalationStep` table. All the data in the column will be lost.
  - You are about to drop the `OrganizationDefaultEscalationPolicy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrganizationDefaultEscalationPolicyTowebsite` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "EscalationStep" DROP CONSTRAINT "EscalationStep_organizationDefaultEscalationPolicyId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationDefaultEscalationPolicy" DROP CONSTRAINT "OrganizationDefaultEscalationPolicy_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationDefaultEscalationPolicyTowebsite" DROP CONSTRAINT "_OrganizationDefaultEscalationPolicyTowebsite_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrganizationDefaultEscalationPolicyTowebsite" DROP CONSTRAINT "_OrganizationDefaultEscalationPolicyTowebsite_B_fkey";

-- AlterTable
ALTER TABLE "EscalationStep" DROP COLUMN "organizationDefaultEscalationPolicyId";

-- DropTable
DROP TABLE "OrganizationDefaultEscalationPolicy";

-- DropTable
DROP TABLE "_OrganizationDefaultEscalationPolicyTowebsite";

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");
