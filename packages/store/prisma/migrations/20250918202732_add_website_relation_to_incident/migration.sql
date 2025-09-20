-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "websiteId" TEXT;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "website"("id") ON DELETE SET NULL ON UPDATE CASCADE;
