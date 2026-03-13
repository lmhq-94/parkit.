import { Router } from "express";
import { ValetsController } from "./valets.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { CreateValetSchema, UpdateValetSchema } from "../../shared/validators";

const router = Router();

// Valet actual: sus asignaciones (mobile-valet); solo requireAuth.
router.get("/me/assignments", requireAuth, ValetsController.getMyAssignments);

router.get("/for-company", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ValetsController.listForCompany);

// Solo SUPER_ADMIN: valets son subcontratados y rotan entre empresas; lista global sin company.
router.post("/", validateRequest(CreateValetSchema), requireAuth, requireRole("SUPER_ADMIN"), ValetsController.create);
router.get("/", requireAuth, requireRole("SUPER_ADMIN"), ValetsController.list);
router.get("/:id", requireAuth, requireRole("SUPER_ADMIN"), ValetsController.getById);
router.patch("/:id", validateRequest(UpdateValetSchema), requireAuth, requireRole("SUPER_ADMIN"), ValetsController.update);
router.patch("/:id/status", requireAuth, requireRole("SUPER_ADMIN"), ValetsController.updateStatus);
router.delete("/:id", requireAuth, requireRole("SUPER_ADMIN"), ValetsController.deactivate);

export default router;
