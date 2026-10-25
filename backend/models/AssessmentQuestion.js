import mongoose from "mongoose";

const assessmentQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        // Mixed keeps backward compatibility with older string options while
        // allowing the new dynamic skill format: { name, category: [] }.
        options: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },
        order: {
            type: Number,
            required: true
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

export default mongoose.model(
    "AssessmentQuestion",
    assessmentQuestionSchema
);
