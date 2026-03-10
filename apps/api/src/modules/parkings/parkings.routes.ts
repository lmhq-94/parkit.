import { Router } from "express";
import { ParkingsController } from "./parkings.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { CreateParkingSchema, UpdateParkingSchema } from "../../shared/validators";

const router = Router();

router.get("/has-bookable", requireAuth, requireCompany, ParkingsController.hasAnyRequiringBooking);
router.post("/", validateRequest(CreateParkingSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.create);
router.get("/", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.list);
router.get("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.getById);
router.patch("/:id", validateRequest(UpdateParkingSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.update);
router.delete("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.delete);
router.get("/:id/slots", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.getSlots);
router.get("/:id/slots/available", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.getAvailableSlots);

export default router;
