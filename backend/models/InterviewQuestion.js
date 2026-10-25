import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: ["Technical", "HR", "Aptitude", "Coding"]
        },

        options: {
            type: [String],
            required: true,
            validate: {
                validator: function (options) {
                    return (
                        options.length === 4 &&
                        options.every(
                            (option) =>
                                typeof option === "string" &&
                                option.trim().length > 0
                        )
                    );
                },
                message: "Every question must have exactly 4 non-empty options."
            }
        },

        correctAnswer: {
            type: Number,
            required: true,
            min: 0,
            max: 3
        },

        explanation: {
            type: String,
            required: true,
            trim: true
        },

        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Medium"
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

const InterviewQuestion = mongoose.model(
    "InterviewQuestion",
    interviewQuestionSchema
);

export default InterviewQuestion;