
import express from "express";
import multer from "multer";
import path from "path";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    chatWithAICareerAdvisor,
    getAICareerChats,
    getAICareerChatById,
    renameAICareerChat,
    deleteAICareerChat
} from "../controllers/aiCareerAdvisorController.js";

const router = express.Router();

// File memory mein rahegi; server par permanently save nahi hogi.
const storage = multer.memoryStorage();

const allowedExtensions = [
    ".pdf",
    ".docx",
    ".txt"
];
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Maximum 10 MB
    },
    fileFilter: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            return callback(
                new Error(
                    "Only PDF, DOC, DOCX, TXT and RTF files are allowed."
                )
            );
        }

        callback(null, true);
    }
});

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

// Rename a conversation
router.patch(
    "/api/ai-career-advisor/chats/:chatId",
    authMiddleware,
    renameAICareerChat
);

// Delete a conversation
router.delete(
    "/api/ai-career-advisor/chats/:chatId",
    authMiddleware,
    deleteAICareerChat
);

// Send a message, optionally with an attached file
router.post(
    "/api/ai-career-advisor/chat",
    authMiddleware,
    upload.single("file"),
    chatWithAICareerAdvisor
);

export default router;
