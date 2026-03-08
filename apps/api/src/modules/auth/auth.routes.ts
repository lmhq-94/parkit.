import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../shared/middleware/validateRequest";
import { AcceptInvitationSchema, LoginSchema } from "../../shared/validators";

const router = Router();

router.post("/register", validateRequest(LoginSchema), AuthController.register);
router.post("/login", validateRequest(LoginSchema), AuthController.login);
router.post(
  "/invitations/accept",
  validateRequest(AcceptInvitationSchema),
  AuthController.acceptInvitation
);

export default router;
