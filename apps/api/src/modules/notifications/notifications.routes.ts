import { Router } from "express";
import { NotificationsController } from "./notifications.controller";
import { requireAuth } from "../../shared/middleware/requireAuth";

const router = Router();

router.use(requireAuth);

router.get("/user/:userId/unread-count", NotificationsController.unreadCount);
router.get("/user/:userId", NotificationsController.listByUser);
router.patch("/:id/read", NotificationsController.markAsRead);
router.patch("/user/:userId/read-all", NotificationsController.markAllAsRead);
router.delete("/:id", NotificationsController.delete);

export default router;
