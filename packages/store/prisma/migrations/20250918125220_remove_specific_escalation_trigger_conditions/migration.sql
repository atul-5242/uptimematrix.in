/*
  Warnings:

  - You are about to drop the column `domainExpiry` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `domainExpiryDays` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `heartbeatMissed` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `heartbeatMissedCount` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `responseTimeThreshold` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `responseTimeValue` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `sslExpiry` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `sslExpiryDays` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `statusCodeErrors` on the `EscalationPolicy` table. All the data in the column will be lost.
  - You are about to drop the column `statusCodes` on the `EscalationPolicy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EscalationPolicy" DROP COLUMN "domainExpiry",
DROP COLUMN "domainExpiryDays",
DROP COLUMN "heartbeatMissed",
DROP COLUMN "heartbeatMissedCount",
DROP COLUMN "responseTimeThreshold",
DROP COLUMN "responseTimeValue",
DROP COLUMN "sslExpiry",
DROP COLUMN "sslExpiryDays",
DROP COLUMN "statusCodeErrors",
DROP COLUMN "statusCodes";
