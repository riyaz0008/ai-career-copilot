import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        department: {
            type: String,
            trim: true,
            default: ""
        },
        jobType: {
            type: String,
            enum: ["Full-time", "Part-time", "Internship", "Contract"],
            required: true
        },
        workMode: {
            type: String,
            enum: ["On-site", "Remote", "Hybrid"],
            required: true
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        salaryMin: {
            type: Number,
            min: 0,
            default: null
        },
        salaryMax: {
            type: Number,
            min: 0,
            default: null
        },
        experience: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        responsibilities: {
            type: [String],
            default: []
        },
        requiredSkills: {
            type: [String],
            required: true,
            validate: {
                validator: (skills) => skills.length > 0,
                message: "At least one required skill must be added."
            }
        },
        education: {
            type: String,
            trim: true,
            default: ""
        },
        applicationDeadline: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["Active", "Closed"],
            default: "Active"
        },
        approvalStatus: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
            index: true
        }
    },
    {
        timestamps: true
    }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;