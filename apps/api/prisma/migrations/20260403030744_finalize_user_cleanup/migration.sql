/*
  Warnings:

  - You are about to drop the column `invitationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `invitationTokenExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pushToken` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- DropIndex
DROP INDEX "User_invitationToken_key";

-- DropIndex
DROP INDEX "User_passwordResetToken_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "invitationToken",
DROP COLUMN "invitationTokenExpiresAt",
DROP COLUMN "passwordResetExpiresAt",
DROP COLUMN "passwordResetToken",
DROP COLUMN "pushToken";

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" "SystemRole" NOT NULL DEFAULT 'CUSTOMER',
    "token" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invitedByUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE INDEX "Invitation_email_companyId_idx" ON "Invitation"("email", "companyId");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
