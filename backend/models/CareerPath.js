import mongoose from "mongoose";

const careerPathSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        skills: {
            type: [String],
            default: []
        },
        experience: {
            type: String,
            default: ""
        },
        workStyle: {
            type: [String],
            default: []
        },
        goal: {
            type: [String],
            default: []
        },
        education: {
            type: String,
            default: ""
        },
        scope: {
            type: String,
            default: ""
        },
        roadmap: {
    type: [
        {
            name: { type: String, required: true },
            skills: { type: [String], default: [] }
        }
    ],
    default: []
},
        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("CareerPath", careerPathSchema);
