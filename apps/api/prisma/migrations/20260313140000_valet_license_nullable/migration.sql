-- AlterTable: licencia opcional (registro mobile-valet sin licencia).
ALTER TABLE "Valet" ALTER COLUMN "licenseNumber" DROP NOT NULL;
ALTER TABLE "Valet" ALTER COLUMN "licenseExpiry" DROP NOT NULL;
