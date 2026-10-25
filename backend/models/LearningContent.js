import mongoose from "mongoose";

const learningContentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        default: []
    },
    level: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model("LearningContent", learningContentSchema);