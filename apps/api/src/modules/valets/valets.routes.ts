import { Router } from "express";
import { ValetsController } from "./valets.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { CreateUserSchema, UpdateUserSchema } from "../../shared/validators";

const router = Router();

router.post("/", validateRequest(CreateUserSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ValetsController.create);
router.get("/", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ValetsController.list);
router.get("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ValetsController.getById);
router.patch("/:id", validateRequest(UpdateUserSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ValetsController.update);
router.patch("/:id/status", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ValetsController.updateStatus);
router.delete("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ValetsController.deactivate);

export default router;
