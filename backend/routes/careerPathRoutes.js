import express from "express";
import {
    addCareerPath,
    getCareerPaths,
    updateCareerPath,
    deleteCareerPath,
    getCareerPathById,
    getCareerRecommendations
} from "../controllers/careerPathController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/api/admin/career-path", authMiddleware, addCareerPath);

router.get("/api/admin/career-path", authMiddleware, getCareerPaths);

router.put("/api/admin/career-path/:cid", authMiddleware, updateCareerPath);

router.delete("/api/admin/career-path/:cid", authMiddleware, deleteCareerPath);

router.get("/api/career-path/:cid", authMiddleware, getCareerPathById);

router.get("/api/career-recommendations/:uid", authMiddleware, getCareerRecommendations);

export default router;