import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../shared/middleware/validateRequest";
import {
  AcceptInvitationSchema,
  LoginSchema,
  RegisterSchema,
  RegisterValetSchema,
  RequestOtpSchema,
  VerifyOtpSchema,
} from "../../shared/validators";

const router = Router();

router.post("/register", validateRequest(RegisterSchema), AuthController.register);
router.post("/register-valet", validateRequest(RegisterValetSchema), AuthController.registerValet);
router.post("/login", validateRequest(LoginSchema), AuthController.login);
router.post(
  "/request-otp",
  validateRequest(RequestOtpSchema),
  AuthController.requestOtp
);
router.post(
  "/verify-otp",
  validateRequest(VerifyOtpSchema),
  AuthController.verifyOtp
);
router.post(
  "/invitations/accept",
  validateRequest(AcceptInvitationSchema),
  AuthController.acceptInvitation
);

export default router;
