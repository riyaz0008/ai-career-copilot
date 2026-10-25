import express from "express";

import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addNotification
} from "../controllers/notificationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/api/notifications/:uid", authMiddleware, getNotifications);

router.get("/api/notifications/unread-count/:uid", authMiddleware, getUnreadNotificationCount);

router.put("/api/notifications/read/:nid", authMiddleware, markNotificationAsRead);

router.put("/api/notifications/read-all/:uid", authMiddleware, markAllNotificationsAsRead);

router.post("/api/notifications", authMiddleware, addNotification);

export default router;