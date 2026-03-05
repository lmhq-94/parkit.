import { Router } from "express";
import { TicketsController } from "./tickets.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { CreateTicketSchema, UpdateTicketSchema } from "../../shared/validators";

const router = Router();

router.post("/", validateRequest(CreateTicketSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), TicketsController.create);
router.get("/", requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), TicketsController.list);
router.get("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), TicketsController.getById);
router.patch("/:id", validateRequest(UpdateTicketSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), TicketsController.update);
router.post("/:id/assign-valet", requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), TicketsController.assignValet);
router.post("/:id/damage-report", requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), TicketsController.reportDamage);
router.post("/:id/review", requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), TicketsController.addReview);
router.patch("/:id/checkout", requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), TicketsController.checkout);

export default router;
