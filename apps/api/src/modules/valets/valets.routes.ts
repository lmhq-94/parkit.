import { Router } from "express";
import { ValetsController } from "./valets.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";
import { validateRequest } from "../../shared/middleware/validateRequest";
import {
  CreateValetSchema,
  UpdateValetSchema,
  UpdateValetMeSchema,
  ValetMePresenceSchema,
} from "../../shared/validators";

const router = Router();

// Current valet: profile and assignments (mobile-valet). Register /me before /:id.
router.get("/me", requireAuth, ValetsController.getMe);
router.patch("/me", validateRequest(UpdateValetMeSchema), requireAuth, ValetsController.patchMe);
router.post(
  "/me/presence",
  validateRequest(ValetMePresenceSchema),
  requireAuth,
  ValetsController.postMyPresence
);
router.post("/me/ping", requireAuth, ValetsController.postMyPing);
router.post("/me/wizard/start", requireAuth, ValetsController.postMyWizardStart);
router.post("/me/wizard/end", requireAuth, ValetsController.postMyWizardEnd);
router.get("/me/assignments", requireAuth, ValetsController.getMyAssignments);

router.get(
  "/available-drivers/:parkingId",
  requireAuth,
  requireCompany,
  requireRole("ADMIN", "STAFF"),
  ValetsController.listAvailableDriversAtParking
);
router.get(
  "/dispatch-drivers/:parkingId",
  requireAuth,
  requireCompany,
  requireRole("ADMIN", "STAFF"),
  ValetsController.listDispatchDriversAtParking
);

router.get("/for-company", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ValetsController.listForCompany);
router.get("/for-parking/:parkingId", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ValetsController.listForParking);
router.get("/workflow/status", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), ValetsController.getWorkflowStatus);

// SUPER_ADMIN only: valets are subcontracted and rotate across companies; global list without company scope.
router.post("/", validateRequest(CreateValetSchema), requireAuth, requireRole("SUPER_ADMIN"), ValetsController.create);
router.get("/", requireAuth, requireRole("SUPER_ADMIN"), ValetsController.list);
router.get("/:id", requireAuth, requireRole("SUPER_ADMIN"), ValetsController.getById);
router.patch("/:id", validateRequest(UpdateValetSchema), requireAuth, requireRole("SUPER_ADMIN"), ValetsController.update);
router.patch("/:id/status", requireAuth, requireRole("SUPER_ADMIN"), ValetsController.updateStatus);
router.delete("/:id", requireAuth, requireRole("SUPER_ADMIN"), ValetsController.deactivate);

export default router;
