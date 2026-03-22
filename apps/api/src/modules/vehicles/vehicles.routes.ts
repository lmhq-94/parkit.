import { Router } from "express";
import { VehiclesController } from "./vehicles.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { CreateVehicleSchema, UpdateVehicleSchema } from "../../shared/validators";

const router = Router();

router.post("/", validateRequest(CreateVehicleSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), VehiclesController.create);
router.get("/", requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), VehiclesController.list);
router.get(
  "/valet/by-plate",
  requireAuth,
  requireRole("STAFF"),
  VehiclesController.getByPlateValet
);
router.get("/by-plate", requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), VehiclesController.getByPlate);
router.get("/catalog/makes", requireAuth, VehiclesController.catalogMakes);
router.get("/catalog/models", requireAuth, VehiclesController.catalogModels);
router.get("/catalog/dimensions", requireAuth, VehiclesController.catalogDimensions);
router.get("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), VehiclesController.getById);
router.patch("/:id", validateRequest(UpdateVehicleSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), VehiclesController.update);
router.delete("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF", "CUSTOMER"), VehiclesController.delete);

export default router;
