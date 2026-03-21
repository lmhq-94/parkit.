-- Quitar valor por defecto ficticio; la media solo tendrá valor cuando haya valoraciones reales.
ALTER TABLE "Valet" ALTER COLUMN "ratingAvg" DROP DEFAULT;
ALTER TABLE "Valet" ALTER COLUMN "ratingAvg" DROP NOT NULL;
UPDATE "Valet" SET "ratingAvg" = NULL;
