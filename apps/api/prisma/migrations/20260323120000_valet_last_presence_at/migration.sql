-- AlterTable
ALTER TABLE "Valet" ADD COLUMN "lastPresenceAt" TIMESTAMP(3);

-- Fila existente: usar updatedAt como presencia inicial hasta el primer ping real
UPDATE "Valet" SET "lastPresenceAt" = "updatedAt" WHERE "lastPresenceAt" IS NULL;
