-- AlterTable
ALTER TABLE "Parking" ADD COLUMN "freeBenefitHours" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Parking" ADD COLUMN "pricePerExtraHour" DECIMAL(12,2);
