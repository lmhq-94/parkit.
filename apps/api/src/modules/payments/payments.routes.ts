import { Router } from "express";
import { PaymentsController } from "./payments.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";

const router = Router();

router.post(
  "/card-verification/session",
  requireAuth,
  requireCompany,
  requireRole("ADMIN", "STAFF"),
  PaymentsController.createCardVerificationSession
);

export default router;
