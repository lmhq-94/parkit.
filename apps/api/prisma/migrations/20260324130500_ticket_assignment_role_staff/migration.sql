-- Store ValetStaffRole directly on TicketAssignment.role.
-- role already exists; convert type and values.

ALTER TABLE "TicketAssignment" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "TicketAssignment"
ALTER COLUMN "role" TYPE "ValetStaffRole"
USING (
  CASE "role"
    WHEN 'RECEPTOR' THEN 'RECEPTIONIST'
    WHEN 'DELIVERER' THEN 'DRIVER'
    WHEN 'DRIVER' THEN 'DRIVER'
    ELSE 'DRIVER'
  END
)::"ValetStaffRole";

ALTER TABLE "TicketAssignment" ALTER COLUMN "role" SET DEFAULT 'DRIVER';

DROP TYPE IF EXISTS "AssignmentRole";
