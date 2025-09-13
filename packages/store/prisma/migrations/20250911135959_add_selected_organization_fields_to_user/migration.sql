-- AlterTable
ALTER TABLE "User" ADD COLUMN     "selectedOrganizationId" TEXT,
ADD COLUMN     "selectedOrganizationPermissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "selectedOrganizationRole" TEXT;
