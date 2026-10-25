import express from "express";
import {
    getNotificationPreferences,
    updateNotificationPreferences
} from "../controllers/notificationPreferenceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/api/notification-preferences/:uid",
    authMiddleware,
    getNotificationPreferences
);

router.put(
    "/api/notification-preferences/:uid",
    authMiddleware,
    updateNotificationPreferences
);

export default router;