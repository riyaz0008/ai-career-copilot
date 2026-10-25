
import express from "express";
import multer from "multer";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    getMyResume,
    saveBuilderResume,
    uploadMyResume,
    downloadMyResume,
    deleteMyResume
} from "../controllers/resumeController.js";

const router = express.Router();

// Keep uploaded PDF in memory before sending it to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, callback) => {
        if (
            file.mimetype !== "application/pdf" ||
            !file.originalname.toLowerCase().endsWith(".pdf")
        ) {
            return callback(
                new Error("Only PDF files are allowed.")
            );
        }

        callback(null, true);
    }
});

const handleResumeUpload = (req, res, next) => {
    upload.single("resume")(req, res, (error) => {
        if (error) {
            const message =
                error.code === "LIMIT_FILE_SIZE"
                    ? "Resume must be 5 MB or smaller."
                    : error.message || "Resume upload failed.";

            return res.status(400).json({
                status: 0,
                message
            });
        }

        next();
    });
};

router.get("/api/resume", authMiddleware, getMyResume);

router.post(
    "/api/resume",
    authMiddleware,
    handleResumeUpload,
    uploadMyResume
);

router.get(
    "/api/resume/download",
    authMiddleware,
    downloadMyResume
);

router.put(
    "/api/resume/builder",
    authMiddleware,
    saveBuilderResume
);

router.delete(
    "/api/resume",
    authMiddleware,
    deleteMyResume
);

export default router;
