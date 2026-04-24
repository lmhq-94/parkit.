-- CreateEnum
CREATE TYPE "WizardType" AS ENUM ('RECEIVE', 'PARK', 'RETURN');

-- AlterTable
ALTER TABLE "Valet" ADD COLUMN "isInWizard" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "wizardType" "WizardType",
ADD COLUMN "wizardStartedAt" TIMESTAMP(3);
