-- Rename column from hours to minutes
ALTER TABLE "Parking" RENAME COLUMN "freeBenefitHours" TO "freeBenefitMinutes";

-- Convert stored hours to minutes
UPDATE "Parking" SET "freeBenefitMinutes" = "freeBenefitMinutes" * 60;
