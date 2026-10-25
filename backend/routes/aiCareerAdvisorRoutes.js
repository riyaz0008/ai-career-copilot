import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    chatWithAICareerAdvisor,
    getAICareerChats,
    getAICareerChatById,
    renameAICareerChat,
    deleteAICareerChat
} from "../controllers/aiCareerAdvisorController.js";

const router = express.Router();

// Get all conversations for the logged-in user
router.get(
    "/api/ai-career-advisor/chats",
    authMiddleware,
    getAICareerChats
);

// Open a saved conversation
router.get(
    "/api/ai-career-advisor/chats/:chatId",
    authMiddleware,
    getAICareerChatById
);

// Rename a saved conversation
router.patch(
    "/api/ai-career-advisor/chats/:chatId",
    authMiddleware,
    renameAICareerChat
);

// Delete a saved conversation
router.delete(
    "/api/ai-career-advisor/chats/:chatId",
    authMiddleware,
    deleteAICareerChat
);

// Send a message or continue a conversation
router.post(
    "/api/ai-career-advisor/chat",
    authMiddleware,
    chatWithAICareerAdvisor
);

export default router;