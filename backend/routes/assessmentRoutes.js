import express from "express";
import {
    getAssessments,
    getAssessmentById
} from "../controllers/assessmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/api/admin/assessments",
    authMiddleware,
    getAssessments
);

router.get(
    "/api/admin/assessments/:aid",
    authMiddleware,
    getAssessmentById
);

export default router;