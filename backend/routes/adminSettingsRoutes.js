import express from "express";
import {
    getAdminSettings,
    updateAdminSettings,
    changeAdminPassword
} from "../controllers/adminSettingsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/api/admin/settings/:uid",
    authMiddleware,
    getAdminSettings
);

router.put(
    "/api/admin/settings/:uid",
    authMiddleware,
    updateAdminSettings
);

router.put(
    "/api/admin/settings/password/:uid",
    authMiddleware,
    changeAdminPassword
);

export default router;