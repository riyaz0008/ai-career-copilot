import express from "express";

import {
    startInterview,
    submitInterview
} from "../controllers/interviewController.js";

import {
    addInterviewQuestion,
    updateInterviewQuestion,
    deleteInterviewQuestion,
    toggleInterviewQuestionStatus
} from "../controllers/interviewAdminController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Start Mock Interview
router.get(
    "/api/interview/questions",
    authMiddleware,
    startInterview
);

// Submit Answers and Get Result
router.post(
    "/api/interview/submit",
    authMiddleware,
    submitInterview
);

// Admin: Add Interview Question
router.post(
    "/api/interview/admin/questions",
    authMiddleware,
    adminMiddleware,
    addInterviewQuestion
);

// Admin: Update Interview Question
router.put(
    "/api/interview/admin/questions/:id",
    authMiddleware,
    adminMiddleware,
    updateInterviewQuestion
);

// Admin: Delete Interview Question
router.delete(
    "/api/interview/admin/questions/:id",
    authMiddleware,
    adminMiddleware,
    deleteInterviewQuestion
);

// Admin: Activate / Deactivate Question
router.patch(
    "/api/interview/admin/questions/:id/status",
    authMiddleware,
    adminMiddleware,
    toggleInterviewQuestionStatus
);

export default router;