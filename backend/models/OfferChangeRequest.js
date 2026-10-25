
import mongoose from "mongoose";

const offerChangeRequestSchema = new mongoose.Schema(
    {
        offerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobOffer",
            required: true,
            index: true
        },
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobApplication",
            required: true
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
        requestType: {
            type: String,
            enum: [
                "Salary",
                "Joining Date",
                "Work Location",
                "Working Hours",
                "Benefits",
                "Other"
            ],
            required: true
        },
        expectedSalary: {
            type: Number,
            min: 1,
            default: null
        },
        joiningDate: {
            type: Date,
            default: null
        },
        workLocation: {
            type: String,
            trim: true,
            default: ""
        },
        workingHours: {
            type: String,
            trim: true,
            default: ""
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1500
        },
        status: {
            type: String,
            enum: [
                "Pending",
                "Offer Revised",
                "Original Offer Maintained",
                "Request Declined",
                "Cancelled"
            ],
            default: "Pending",
            index: true
        },
        companyResponse: {
            type: String,
            trim: true,
            default: ""
        },
        respondedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

const OfferChangeRequest = mongoose.model(
    "OfferChangeRequest",
    offerChangeRequestSchema
);

export default OfferChangeRequest;
