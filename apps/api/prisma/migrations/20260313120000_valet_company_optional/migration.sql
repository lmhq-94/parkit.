-- AlterTable: Valet.companyId optional (valets are subcontracted, rotate between companies)
ALTER TABLE "Valet" ALTER COLUMN "companyId" DROP NOT NULL;
