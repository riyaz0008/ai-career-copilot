
import express from "express";

import {
    createJob,
    getCompanyJobs,
    updateJob,
    deleteJob,
    getActiveJobs,
    getJobsForAdmin,
    updateJobApproval
} from "../controllers/jobController.js";

import {
    applyForJob,
    uploadResume,
    getMyApplications,
    getCompanyApplications,
    updateApplicationStatus,
    downloadApplicationResume
} from "../controllers/jobApplicationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply for a job with PDF resume
router.post(
    "/api/jobs/:jobId/apply",
    authMiddleware,
    (req, res, next) => {
        uploadResume(req, res, (error) => {
            if (error) {
                const message =
                    error.code === "LIMIT_FILE_SIZE"
                        ? "Resume size must be 5 MB or less."
                        : error.message || "Resume upload failed.";

                return res.status(400).json({
                    message,
                    status: 0
                });
            }

            next();
        });
    },
    applyForJob
);

// Applicant: view own applications
router.get(
    "/api/my-applications",
    authMiddleware,
    getMyApplications
);

// Public: show approved and active jobs
router.get("/api/jobs", getActiveJobs);     

// Company: manage job postings
router.post(
    "/api/company/jobs",
    authMiddleware,
    createJob
);

router.get(
    "/api/company/jobs",
    authMiddleware,
    getCompanyJobs
);

router.put(
    "/api/company/jobs/:id",
    authMiddleware,
    updateJob
);

router.delete(
    "/api/company/jobs/:id",
    authMiddleware,
    deleteJob
);

// Company: view applicants
router.get(
    "/api/company/applications",
    authMiddleware,
    getCompanyApplications
);

// Company: update application status
router.put(
    "/api/company/applications/:id/status",
    authMiddleware,
    updateApplicationStatus
);

// Company: download applicant resume
router.get(
    "/api/company/applications/:id/resume",
    authMiddleware,
    downloadApplicationResume
);

// Admin: review and approve/reject job postings
router.get(
    "/api/admin/jobs",
    authMiddleware,
    getJobsForAdmin
);

router.put(
    "/api/admin/jobs/:id/approval",
    authMiddleware,
    updateJobApproval
);

export default router;
