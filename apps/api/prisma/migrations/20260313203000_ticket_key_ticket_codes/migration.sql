-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN "keyCode" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "ticketCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_keyCode_key" ON "Ticket"("keyCode");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketCode_key" ON "Ticket"("ticketCode");
