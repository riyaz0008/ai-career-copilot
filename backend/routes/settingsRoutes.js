import express from "express";
import {
    getSettings,
    updateSettings,
    changePassword
} from "../controllers/settingsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/api/settings/:uid", authMiddleware, getSettings);

router.put("/api/settings/:uid", authMiddleware, updateSettings);

router.put("/api/settings/password/:uid", authMiddleware, changePassword);

export default router;