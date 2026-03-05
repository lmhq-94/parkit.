import { Router } from "express";
import { ClientsController } from "./clients.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { CreateClientSchema, UpdateClientSchema } from "../../shared/validators";

const router = Router();

router.post("/", validateRequest(CreateClientSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ClientsController.create);
router.get("/", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ClientsController.list);
router.get("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ClientsController.getById);
router.patch("/:id", validateRequest(UpdateClientSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ClientsController.update);
router.get("/:id/vehicles", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ClientsController.getVehicles);
router.post("/:id/vehicles", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ClientsController.addVehicle);

export default router;
