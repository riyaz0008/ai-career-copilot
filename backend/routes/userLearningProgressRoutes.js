import express from "express";
import { startLearning, completeLearning, getUserLearningProgress } from "../controllers/userLearningProgressController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/api/learning-progress/start", authMiddleware, startLearning);

router.post("/api/learning-progress/complete", authMiddleware, completeLearning);

router.get("/api/learning-progress/:userId", authMiddleware, getUserLearningProgress);

export default router;