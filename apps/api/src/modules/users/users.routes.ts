import { Router } from "express";
import { UsersController } from "./users.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { CreateUserSchema, CreateSuperAdminSchema, UpdateUserSchema, UpdateProfileSchema } from "../../shared/validators";

const router = Router();

router.get("/me", requireAuth, UsersController.getProfile);
router.patch("/me", validateRequest(UpdateProfileSchema), requireAuth, UsersController.updateProfile);
router.post("/super-admin", validateRequest(CreateSuperAdminSchema), requireAuth, requireRole("SUPER_ADMIN"), UsersController.createSuperAdmin);

router.post("/", validateRequest(CreateUserSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), UsersController.create);
router.get("/", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), UsersController.list);
router.get("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), UsersController.get);
router.patch("/:id", validateRequest(UpdateUserSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), UsersController.update);
router.delete("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), UsersController.deactivate);
router.post("/:id/resend-invitation", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), UsersController.resendInvitation);

export default router;
