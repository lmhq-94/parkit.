import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../shared/middleware/validateRequest";
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  RegisterValetSchema,
  RequestOtpSchema,
  ResetPasswordSchema,
  VerifyOtpSchema,
  RegisterInvitedSchema,
} from "../../shared/validators";

const router = Router();

router.post("/register", validateRequest(RegisterSchema), AuthController.register);
router.post("/register-valet", validateRequest(RegisterValetSchema), AuthController.registerValet);
router.post("/login", validateRequest(LoginSchema), AuthController.login);
router.post("/forgot-password", validateRequest(ForgotPasswordSchema), AuthController.forgotPassword);
router.post(
  "/reset-password",
  validateRequest(ResetPasswordSchema),
  AuthController.resetPassword
);
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
  "/register-invited",
  validateRequest(RegisterInvitedSchema),
  AuthController.registerInvited
);

export default router;
