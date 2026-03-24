-- Update TicketStatus enum to split REQUESTED into REQUEST_PARKING / REQUEST_DELIVERY
-- and set the default to REQUEST_PARKING.

ALTER TABLE "Ticket" ALTER COLUMN "status" DROP DEFAULT;

CREATE TYPE "TicketStatus_new" AS ENUM (
  'REQUEST_PARKING',
  'PARKED',
  'REQUEST_DELIVERY',
  'DELIVERED',
  'CANCELLED'
);

ALTER TABLE "Ticket"
ALTER COLUMN "status" TYPE "TicketStatus_new"
USING (
  CASE
    WHEN "status" = 'REQUESTED' THEN 'REQUEST_PARKING'
    ELSE "status"::text
  END
)::"TicketStatus_new";

DROP TYPE "TicketStatus";

ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";

ALTER TABLE "Ticket" ALTER COLUMN "status" SET DEFAULT 'REQUEST_PARKING';
