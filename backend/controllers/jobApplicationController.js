
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import Company from "../models/Company.js";
import Notification from "../models/Notification.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(
    __dirname,
    "../uploads/job-applications"
);

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;

        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfExtension =
        path.extname(file.originalname).toLowerCase() === ".pdf";

    if (isPdfMime && isPdfExtension) {
        return cb(null, true);
    }

    cb(new Error("Please upload a PDF resume only."));
};

export const uploadResume = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
}).single("resume");

// Verify that the logged-in account is an approved company
const getLoggedInCompany = async (req) => {
    if (
        req.user?.role !== "recruiter" ||
        !req.user?.id ||
        !mongoose.isValidObjectId(req.user.id)
    ) {
        return null;
    }

    const company = await Company.findOne({
        _id: req.user.id,
        verificationStatus: "approved"
    });

    return company;
};

// Apply for an approved, active job
export const applyForJob = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { jobId } = req.params;
        const coverLetter = String(
            req.body?.coverLetter || ""
        ).trim();

        if (!userId || req.user?.role === "recruiter") {
            if (req.file) fs.unlink(req.file.path, () => {});

            return res.status(403).json({
                message: "Please log in with an applicant account to apply.",
                status: 0
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload your resume in PDF format.",
                status: 0
            });
        }

        if (!mongoose.isValidObjectId(jobId)) {
            fs.unlink(req.file.path, () => {});

            return res.status(400).json({
                message: "Invalid job ID.",
                status: 0
            });
        }

        const job = await Job.findOne({
            _id: jobId,
            approvalStatus: "Approved",
            status: "Active",
            applicationDeadline: { $gt: new Date() }
        });

        if (!job) {
            fs.unlink(req.file.path, () => {});

            return res.status(404).json({
                message: "This job is unavailable or no longer accepting applications.",
                status: 0
            });
        }

        const existingApplication = await JobApplication.findOne({
            jobId: job._id,
            userId
        });

        if (existingApplication) {
            fs.unlink(req.file.path, () => {});

            return res.status(409).json({
                message: "You have already applied for this job.",
                status: 0
            });
        }

        const application = await JobApplication.create({
            jobId: job._id,
            userId,
            companyId: job.companyId,
            resume: {
                fileName: req.file.originalname,
                filePath: path.relative(
                    path.join(__dirname, ".."),
                    req.file.path
                ).replace(/\\/g, "/"),
                fileSize: req.file.size
            },
            coverLetter
        });
        await Notification.create({
    userId,
    title: "Application Submitted",
    message: `Your application for "${job.title}" has been submitted successfully.`,
    type: "job"
});

        return res.status(201).json({
            message: "Your application was submitted successfully.",
            status: 1,
            data: application
        });
    } catch (error) {
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "You have already applied for this job.",
                status: 0
            });
        }

        console.error("Apply For Job Error:", error);

        return res.status(500).json({
            message: "Failed to submit application. Please try again.",
            status: 0
        });
    }
};

// Applicant: view their own applications
export const getMyApplications = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId || req.user?.role === "recruiter") {
            return res.status(403).json({
                message: "Please log in with an applicant account.",
                status: 0
            });
        }

        const applications = await JobApplication.find({ userId })
            .populate({
                path: "jobId",
                select: "title jobType workMode location"
            })
            .populate({
                path: "companyId",
                select: "companyName"
            })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            message: "Your applications fetched successfully.",
            status: 1,
            data: applications
        });
    } catch (error) {
        console.error("Get My Applications Error:", error);

        return res.status(500).json({
            message: "Failed to fetch your applications.",
            status: 0
        });
    }
};

// Company: view applicants for its own jobs
export const getCompanyApplications = async (req, res) => {
    try {
        const company = await getLoggedInCompany(req);

        if (!company) {
            return res.status(403).json({
                message: "Only approved company accounts can view applicants.",
                status: 0
            });
        }

        const applications = await JobApplication.find({
            companyId: company._id
        })
            .populate({
                path: "jobId",
                select: "title jobType workMode location"
            })
            .populate({
                path: "userId",
                select: "firstname lastname email education"
            })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            message: "Company applications fetched successfully.",
            status: 1,
            data: applications
        });
    } catch (error) {
        console.error("Get Company Applications Error:", error);

        return res.status(500).json({
            message: "Failed to fetch company applications.",
            status: 0
        });
    }
};

// Company: update status only for its own applications

export const updateApplicationStatus = async (req, res) => {
    try {
        const company = await getLoggedInCompany(req);

        if (!company) {
            return res.status(403).json({
                message: "Only approved company accounts can update application status.",
                status: 0
            });
        }

        const { status, interview } = req.body;

        const validStatuses = [
            "Pending",
            "Under Review",
            "Shortlisted",
            "Interview Scheduled",
            "Interview Completed",
            "Accepted",
            "Rejected"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid application status.",
                status: 0
            });
        }

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid application ID.",
                status: 0
            });
        }

        const application = await JobApplication.findOne({
            _id: req.params.id,
            companyId: company._id
        });

        if (!application) {
            return res.status(404).json({
                message: "Application not found for your company.",
                status: 0
            });
        }

        const currentStatus = application.status;

        if (
            currentStatus === "Accepted" ||
            currentStatus === "Rejected"
        ) {
            return res.status(400).json({
                message: "This application has already reached a final status.",
                status: 0
            });
        }

        const allowedTransitions = {
            "Pending": [
                "Under Review",
                "Shortlisted",
                "Rejected"
            ],
            "Under Review": [
                "Shortlisted",
                "Rejected"
            ],
            "Shortlisted": [
                "Interview Scheduled",
                "Rejected"
            ],
            "Interview Scheduled": [
                "Interview Completed",
                "Rejected"
            ],
            "Interview Completed": [
                "Accepted",
                "Rejected"
            ]
        };

        if (!allowedTransitions[currentStatus]?.includes(status)) {
            return res.status(400).json({
                message: `Cannot change status from ${currentStatus} to ${status}.`,
                status: 0
            });
        }

        if (status === "Interview Scheduled") {
            if (
                !interview?.date ||
                !interview?.time ||
                !interview?.mode ||
                !interview?.details?.trim()
            ) {
                return res.status(400).json({
                    message: "Interview date, time, mode and details are required.",
                    status: 0
                });
            }

            const interviewDate = new Date(interview.date);

            if (
                Number.isNaN(interviewDate.getTime()) ||
                interviewDate <= new Date()
            ) {
                return res.status(400).json({
                    message: "Interview date and time must be in the future.",
                    status: 0
                });
            }

            if (
                !["Online", "Phone", "In-person"].includes(interview.mode)
            ) {
                return res.status(400).json({
                    message: "Invalid interview mode.",
                    status: 0
                });
            }

            if (
                interview.mode === "Online" &&
                !interview.meetingLink?.trim()
            ) {
                return res.status(400).json({
                    message: "Meeting link is required for an online interview.",
                    status: 0
                });
            }

            if (
                interview.mode === "In-person" &&
                !interview.location?.trim()
            ) {
                return res.status(400).json({
                    message: "Interview location is required for an in-person interview.",
                    status: 0
                });
            }

            application.interview = {
                date: interviewDate,
                time: interview.time,
                mode: interview.mode,
                details: interview.details.trim(),
                meetingLink: interview.meetingLink?.trim() || "",
                location: interview.location?.trim() || "",
                scheduledAt: new Date(),
                completedAt: null
            };
        }

        if (status === "Interview Completed") {
            application.interview.completedAt = new Date();
        }

       application.status = status;

await application.save();

// Send a notification to the applicant
const job = await Job.findById(application.jobId).select("title");

const statusMessages = {
    "Under Review": "Your application is now under review.",
    "Shortlisted": "Congratulations! Your application has been shortlisted.",
    "Interview Scheduled": "Your interview has been scheduled. Please check your application details.",
    "Interview Completed": "Your interview has been marked as completed.",
    "Accepted": "Congratulations! Your application has been accepted.",
    "Rejected": "Your application was not selected for this position."
};

await Notification.create({
    userId: application.userId,
    title: `Application Update: ${status}`,
    message: `Your application for "${job?.title || "the job"}" has been updated. ${
        statusMessages[status] || `Current status: ${status}.`
    }`,
    type: "job"
});

        return res.status(200).json({
            message: "Application status updated successfully.",
            status: 1,
            data: application
        });
    } catch (error) {
        console.error("Update Application Status Error:", error);

        return res.status(500).json({
            message: "Failed to update application status.",
            status: 0
        });
    }
};

// Company: securely download a resume for its own application
export const downloadApplicationResume = async (req, res) => {
    try {
        const company = await getLoggedInCompany(req);

        if (!company) {
            return res.status(403).json({
                message: "Only approved company accounts can access applicant resumes.",
                status: 0
            });
        }

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid application ID.",
                status: 0
            });
        }

        const application = await JobApplication.findOne({
            _id: req.params.id,
            companyId: company._id
        });

        if (!application || !application.resume?.filePath) {
            return res.status(404).json({
                message: "Application or resume not found.",
                status: 0
            });
        }

        const uploadRoot = path.resolve(
            __dirname,
            "../uploads/job-applications"
        );

        const filename = path.basename(
            application.resume.filePath
        );

        const filePath = path.join(uploadRoot, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                message: "The resume file is no longer available.",
                status: 0
            });
        }

        return res.download(
            filePath,
            path.basename(
                application.resume.fileName || filename
            )
        );
    } catch (error) {
        console.error("Download Application Resume Error:", error);

        return res.status(500).json({
            message: "Failed to download resume.",
            status: 0
        });
    }
};
