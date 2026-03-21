-- CreateEnum
CREATE TYPE "ValetStaffRole" AS ENUM ('RECEPTIONIST', 'DRIVER');

-- AlterTable
ALTER TABLE "Valet" ADD COLUMN "staffRole" "ValetStaffRole";
