import mongoose from "mongoose";

const userLearningProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        learningContentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LearningContent",
            required: true
        },
        skills: {
            type: [String],
            default: []
        },
        startedAt: {
            type: Date,
            default: null
        },
        completedAt: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ["started", "completed"],
            default: "started"
        }
    },
    { timestamps: true }
);

export default mongoose.model("UserLearningProgress", userLearningProgressSchema);