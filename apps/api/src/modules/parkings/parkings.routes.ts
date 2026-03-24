import { Router } from "express";
import { ParkingsController } from "./parkings.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { CreateParkingSchema, UpdateParkingSchema, UpdateParkingSlotSchema } from "../../shared/validators";

const router = Router();

router.get("/has-bookable", requireAuth, requireCompany, ParkingsController.hasAnyRequiringBooking);
/** Antes de /:id — valets (STAFF) sin empresa fija: todos los parqueos con coordenadas. */
router.get(
  "/valet/all-locations",
  requireAuth,
  requireRole("STAFF"),
  ParkingsController.listAllLocationsForValet
);
router.patch(
  "/slots/:slotId",
  validateRequest(UpdateParkingSlotSchema),
  requireAuth,
  requireCompany,
  requireRole("ADMIN", "STAFF"),
  ParkingsController.updateSlotAvailability
);
router.post("/", validateRequest(CreateParkingSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.create);
router.get("/", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.list);
router.get("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.getById);
router.patch("/:id", validateRequest(UpdateParkingSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.update);
router.delete("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.delete);
router.get("/:id/slots", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.getSlots);
router.get("/:id/slots/available", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.getAvailableSlots);
router.post("/:id/slots", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ParkingsController.createSlots);

export default router;
