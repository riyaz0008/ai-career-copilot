import express from "express";
import {
    addLearningContent,
    getAllLearningContent,
    getActiveLearningContent,
    updateLearningContent,
    deleteLearningContent
} from "../controllers/learningContentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/api/admin/learning-content", authMiddleware, addLearningContent);

router.get("/api/admin/learning-content", authMiddleware, getAllLearningContent);

router.put("/api/admin/learning-content/:id", authMiddleware, updateLearningContent);

router.delete("/api/admin/learning-content/:id", authMiddleware, deleteLearningContent);

router.get("/api/learning-content", authMiddleware, getActiveLearningContent);

export default router;