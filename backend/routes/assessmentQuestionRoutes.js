import express from "express";
import {
    addAssessmentQuestion,
    getAssessmentQuestions,
    updateAssessmentQuestion,
    deleteAssessmentQuestion,
    getActiveAssessmentQuestions
} from "../controllers/assessmentQuestionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/api/admin/assessment-question", authMiddleware, addAssessmentQuestion);

router.get("/api/admin/assessment-question", authMiddleware, getAssessmentQuestions);

router.put("/api/admin/assessment-question/:qid", authMiddleware, updateAssessmentQuestion);

router.delete("/api/admin/assessment-question/:qid", authMiddleware, deleteAssessmentQuestion);

router.get("/api/assessment-questions", authMiddleware, getActiveAssessmentQuestions);

export default router;