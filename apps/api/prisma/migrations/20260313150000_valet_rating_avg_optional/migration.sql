-- Remove fake default value; average should only exist when real ratings are present.
ALTER TABLE "Valet" ALTER COLUMN "ratingAvg" DROP DEFAULT;
ALTER TABLE "Valet" ALTER COLUMN "ratingAvg" DROP NOT NULL;
UPDATE "Valet" SET "ratingAvg" = NULL;
