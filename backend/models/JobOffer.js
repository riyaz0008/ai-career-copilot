
import mongoose from "mongoose";

const jobOfferSchema = new mongoose.Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
            index: true
        },
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobApplication",
            required: true,
            unique: true
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true
        },
        salary: {
            type: Number,
            required: true,
            min: 0
        },
        salaryPeriod: {
            type: String,
            enum: ["Monthly", "Yearly"],
            default: "Monthly"
        },
        joiningDate: {
            type: Date,
            required: true
        },
        workLocation: {
            type: String,
            required: true,
            trim: true
        },
        offerDetails: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: [
                "Offer Sent",
                "Offer Accepted",
                "Offer Declined",
                "Withdrawn"
            ],
            default: "Offer Sent",
            index: true
        },
        candidateResponseAt: {
            type: Date,
            default: null
        },
        respondedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const JobOffer = mongoose.model("JobOffer", jobOfferSchema);

export default JobOffer;
