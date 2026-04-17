import { Router } from "express";
import { CustomersController } from "./customers.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { CreateCustomerSchema, UpdateCustomerSchema } from "../../shared/validators";

const router = Router();

router.post("/", validateRequest(CreateCustomerSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), CustomersController.create);
router.get("/", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), CustomersController.list);
router.get("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), CustomersController.getById);
router.patch("/:id", validateRequest(UpdateCustomerSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), CustomersController.update);
router.get("/:id/vehicles", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), CustomersController.getVehicles);
router.post("/:id/vehicles", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), CustomersController.addVehicle);

export default router;
