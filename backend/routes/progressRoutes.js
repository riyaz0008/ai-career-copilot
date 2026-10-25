import express from "express";
import { getUserProgress } from "../controllers/progressController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/api/progress/:uid", authMiddleware, getUserProgress);

export default router;