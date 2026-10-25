
import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true
        },
        resume: {
            fileName: {
                type: String,
                required: true
            },
            filePath: {
                type: String,
                required: true
            },
            fileSize: {
                type: Number,
                required: true
            }
        },
        coverLetter: {
            type: String,
            default: "",
            trim: true
        },
        status: {
            type: String,
            enum: [
                "Pending",
                "Under Review",
                "Shortlisted",
                "Interview Scheduled",
                "Interview Completed",
                "Rejected",
                "Accepted"
            ],
            default: "Pending"
        },
        interview: {
            date: {
                type: Date,
                default: null
            },
            time: {
                type: String,
                default: ""
            },
            mode: {
                type: String,
                enum: ["Online", "Phone", "In-person", ""],
                default: ""
            },
            details: {
                type: String,
                default: "",
                trim: true
            },
            meetingLink: {
                type: String,
                default: "",
                trim: true
            },
            location: {
                type: String,
                default: "",
                trim: true
            },
            scheduledAt: {
                type: Date,
                default: null
            },
            completedAt: {
                type: Date,
                default: null
            }
        }
    },
    {
        timestamps: true
    }
);

jobApplicationSchema.index(
    { jobId: 1, userId: 1 },
    { unique: true }
);

const JobApplication = mongoose.model(
    "JobApplication",
    jobApplicationSchema
);

export default JobApplication;
