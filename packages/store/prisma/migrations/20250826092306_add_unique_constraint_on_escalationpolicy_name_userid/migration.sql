/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `EscalationPolicy` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EscalationPolicy_name_userId_key" ON "EscalationPolicy"("name", "userId");
