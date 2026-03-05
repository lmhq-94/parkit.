-- AlterEnum: add SUPER_ADMIN to SystemRole
ALTER TYPE "SystemRole" ADD VALUE 'SUPER_ADMIN';

-- Make User.companyId optional (SUPER_ADMIN has no company)
ALTER TABLE "User" ALTER COLUMN "companyId" DROP NOT NULL;
