import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";

const router = Router();

router.get("/stats", requireAuth, DashboardController.getStats);

export default router;
