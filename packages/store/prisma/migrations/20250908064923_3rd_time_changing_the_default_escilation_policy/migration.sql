/*
  Warnings:

  - You are about to drop the column `responseTimeThreshold` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `responseTimeValue` on the `EscalationPolicy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EscalationPolicy" DROP COLUMN "responseTimeThreshold",
DROP COLUMN "responseTimeValue";

-- AlterTable
ALTER TABLE "EscalationStep" ADD COLUMN     "organizationDefaultEscalationPolicyId" TEXT;

-- CreateTable
CREATE TABLE "OrganizationDefaultEscalationPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priorityLevel" "Priority" NOT NULL DEFAULT 'low',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "monitorsDown" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationDefaultEscalationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OrganizationDefaultEscalationPolicyTowebsite" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrganizationDefaultEscalationPolicyTowebsite_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationDefaultEscalationPolicy_name_organizationId_key" ON "OrganizationDefaultEscalationPolicy"("name", "organizationId");

-- CreateIndex
CREATE INDEX "_OrganizationDefaultEscalationPolicyTowebsite_B_index" ON "_OrganizationDefaultEscalationPolicyTowebsite"("B");

-- AddForeignKey
ALTER TABLE "OrganizationDefaultEscalationPolicy" ADD CONSTRAINT "OrganizationDefaultEscalationPolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationStep" ADD CONSTRAINT "EscalationStep_organizationDefaultEscalationPolicyId_fkey" FOREIGN KEY ("organizationDefaultEscalationPolicyId") REFERENCES "OrganizationDefaultEscalationPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationDefaultEscalationPolicyTowebsite" ADD CONSTRAINT "_OrganizationDefaultEscalationPolicyTowebsite_A_fkey" FOREIGN KEY ("A") REFERENCES "OrganizationDefaultEscalationPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrganizationDefaultEscalationPolicyTowebsite" ADD CONSTRAINT "_OrganizationDefaultEscalationPolicyTowebsite_B_fkey" FOREIGN KEY ("B") REFERENCES "website"("id") ON DELETE CASCADE ON UPDATE CASCADE;
