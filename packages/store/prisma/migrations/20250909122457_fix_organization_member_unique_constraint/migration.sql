/*
  Warnings:

  - A unique constraint covering the columns `[email,organizationId]` on the table `OrganizationMember` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "OrganizationMember_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_email_organizationId_key" ON "OrganizationMember"("email", "organizationId");
