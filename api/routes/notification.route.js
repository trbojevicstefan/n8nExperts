import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.get("/unread-count", verifyToken, getUnreadNotificationCount);
router.patch("/read-all", verifyToken, markAllNotificationsRead);
router.patch("/:notificationId/read", verifyToken, markNotificationRead);

export default router;
