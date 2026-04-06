import { Router } from "express";
import { AuthController } from "./auth.controller";
import { OAuthController } from "./oauth.controller";
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

// Standard auth routes
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

// OAuth Web Routes (redirect flow for browser)
router.get("/google", OAuthController.initiateGoogleAuth);
router.get("/google/callback", OAuthController.handleGoogleCallback);
router.get("/microsoft", OAuthController.initiateMicrosoftAuth);
router.get("/microsoft/callback", OAuthController.handleMicrosoftCallback);
router.get("/facebook", OAuthController.initiateFacebookAuth);
router.get("/facebook/callback", OAuthController.handleFacebookCallback);
router.post("/apple/callback", OAuthController.handleAppleCallback);

// OAuth Mobile Routes (token verification from mobile apps)
router.post("/oauth/google", OAuthController.handleMobileGoogleAuth);
router.post("/oauth/apple", OAuthController.handleMobileAppleAuth);
router.post("/oauth/microsoft", OAuthController.handleMobileMicrosoftAuth);

export default router;
