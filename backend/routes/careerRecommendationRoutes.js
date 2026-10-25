import express from "express";
import { getCareerRecommendations } from "../controllers/careerRecommendationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/api/career-recommendations/:uid", authMiddleware, getCareerRecommendations);

export default router;