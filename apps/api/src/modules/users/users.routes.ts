import { Router } from "express";
import { UsersController } from "./users.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { CreateUserSchema, UpdateUserSchema } from "../../shared/validators";

const router = Router();

router.post("/", validateRequest(CreateUserSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), UsersController.create);
router.get("/", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), UsersController.list);
router.get("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), UsersController.get);
router.patch("/:id", validateRequest(UpdateUserSchema), requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), UsersController.update);
router.delete("/:id", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), UsersController.deactivate);
router.post("/:id/resend-invitation", requireAuth, requireCompany, requireRole("ADMIN", "STAFF"), UsersController.resendInvitation);

export default router;
