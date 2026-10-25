
import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: true,
            trim: true
        },
        contactName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        loginEmailSent: {
    type: Boolean,
    default: false
},
        password: {
            type: String,
            required: true
        },
        website: {
            type: String,
            trim: true,
            default: ""
        },
        phone: {
            type: String,
            trim: true,
            default: ""
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        verificationStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        }
    },
    { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);

export default Company;