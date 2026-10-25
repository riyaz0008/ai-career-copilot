import express from "express";
import { getCareerRoadmap } from "../controllers/careerRoadmapController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/api/career-roadmap/:uid", authMiddleware, getCareerRoadmap);

export default router;