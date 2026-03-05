import { Router } from "express";
import { BookingsController } from "./bookings.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { CreateBookingSchema, UpdateBookingSchema } from "../../shared/validators";

const router = Router();

router.post("/", validateRequest(CreateBookingSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), BookingsController.create);
router.get("/", requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), BookingsController.list);
router.get("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), BookingsController.getById);
router.patch("/:id", validateRequest(UpdateBookingSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), BookingsController.update);
router.patch("/:id/cancel", requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), BookingsController.cancel);

export default router;
