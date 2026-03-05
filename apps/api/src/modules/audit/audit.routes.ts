import { Router } from "express";
import { AuditController } from "./audit.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";
import { requireCompany } from "../../shared/middleware/requireCompany";
import { requireRole } from "../../shared/middleware/requireRole";

const router = Router();

router.use(requireAuth);
router.use(requireCompany);
router.use(requireRole("ADMIN", "STAFF"));

router.get("/", AuditController.list);
router.get("/ticket/:ticketId", AuditController.getByTicket);
router.get("/user/:userId", AuditController.getByUser);

export default router;
