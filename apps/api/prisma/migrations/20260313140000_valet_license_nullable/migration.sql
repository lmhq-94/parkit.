-- AlterTable: optional license (mobile-valet registration without license).
ALTER TABLE "Valet" ALTER COLUMN "licenseNumber" DROP NOT NULL;
ALTER TABLE "Valet" ALTER COLUMN "licenseExpiry" DROP NOT NULL;
