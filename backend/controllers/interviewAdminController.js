import mongoose from "mongoose";
import InterviewQuestion from "../models/InterviewQuestion.js";

// Add Interview Question
export const addInterviewQuestion = async (req, res) => {
    try {
        const {
            question,
            category,
            options,
            correctAnswer,
            explanation,
            difficulty
        } = req.body;

        if (
            !question?.trim() ||
            !category ||
            !Array.isArray(options) ||
            options.length !== 4 ||
            options.some(
                (option) =>
                    typeof option !== "string" ||
                    !option.trim()
            ) ||
            !Number.isInteger(correctAnswer) ||
            correctAnswer < 0 ||
            correctAnswer > 3 ||
            !explanation?.trim()
        ) {
            return res.status(400).json({
                message: "Provide a question, exactly 4 options, a valid correct answer index, and an explanation.",
                status: 0
            });
        }

        const validCategories = [
            "Technical",
            "HR",
            "Aptitude",
            "Coding"
        ];

        const validDifficulties = [
            "Easy",
            "Medium",
            "Hard"
        ];

        if (!validCategories.includes(category)) {
            return res.status(400).json({
                message: "Invalid question category.",
                status: 0
            });
        }

        const selectedDifficulty = difficulty || "Medium";

        if (!validDifficulties.includes(selectedDifficulty)) {
            return res.status(400).json({
                message: "Invalid question difficulty.",
                status: 0
            });
        }

        const newQuestion = await InterviewQuestion.create({
            question: question.trim(),
            category,
            options: options.map((option) => option.trim()),
            correctAnswer,
            explanation: explanation.trim(),
            difficulty: selectedDifficulty,
            active: true
        });

        return res.status(201).json({
            message: "Interview question added successfully.",
            status: 1,
            data: {
                _id: newQuestion._id,
                question: newQuestion.question,
                category: newQuestion.category,
                options: newQuestion.options,
                difficulty: newQuestion.difficulty,
                active: newQuestion.active
            }
        });
    } catch (error) {
        console.error("Add Interview Question Error:", error);

        return res.status(500).json({
            message: "Failed to add interview question.",
            status: 0
        });
    }
};


// Update Interview Question
export const updateInterviewQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid question ID.",
                status: 0
            });
        }

        const {
            question,
            category,
            options,
            correctAnswer,
            explanation,
            difficulty
        } = req.body;

        const updates = {};

        if (question !== undefined) {
            if (typeof question !== "string" || !question.trim()) {
                return res.status(400).json({
                    message: "Question cannot be empty.",
                    status: 0
                });
            }

            updates.question = question.trim();
        }

        if (category !== undefined) {
            if (
                !["Technical", "HR", "Aptitude", "Coding"].includes(category)
            ) {
                return res.status(400).json({
                    message: "Invalid question category.",
                    status: 0
                });
            }

            updates.category = category;
        }

        if (options !== undefined) {
            if (
                !Array.isArray(options) ||
                options.length !== 4 ||
                options.some(
                    (option) =>
                        typeof option !== "string" ||
                        !option.trim()
                )
            ) {
                return res.status(400).json({
                    message: "Exactly 4 non-empty options are required.",
                    status: 0
                });
            }

            updates.options = options.map((option) => option.trim());
        }

        if (correctAnswer !== undefined) {
            if (
                !Number.isInteger(correctAnswer) ||
                correctAnswer < 0 ||
                correctAnswer > 3
            ) {
                return res.status(400).json({
                    message: "Correct answer must be an option index from 0 to 3.",
                    status: 0
                });
            }

            updates.correctAnswer = correctAnswer;
        }

        if (explanation !== undefined) {
            if (
                typeof explanation !== "string" ||
                !explanation.trim()
            ) {
                return res.status(400).json({
                    message: "Explanation cannot be empty.",
                    status: 0
                });
            }

            updates.explanation = explanation.trim();
        }

        if (difficulty !== undefined) {
            if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
                return res.status(400).json({
                    message: "Invalid question difficulty.",
                    status: 0
                });
            }

            updates.difficulty = difficulty;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide at least one field to update.",
                status: 0
            });
        }

        const updatedQuestion = await InterviewQuestion.findByIdAndUpdate(
            id,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedQuestion) {
            return res.status(404).json({
                message: "Interview question not found.",
                status: 0
            });
        }

        return res.status(200).json({
            message: "Interview question updated successfully.",
            status: 1,
            data: {
                _id: updatedQuestion._id,
                question: updatedQuestion.question,
                category: updatedQuestion.category,
                options: updatedQuestion.options,
                difficulty: updatedQuestion.difficulty,
                active: updatedQuestion.active
            }
        });
    } catch (error) {
        console.error("Update Interview Question Error:", error);

        return res.status(500).json({
            message: "Failed to update interview question.",
            status: 0
        });
    }
};


// Delete Interview Question
export const deleteInterviewQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid question ID.",
                status: 0
            });
        }

        const deletedQuestion = await InterviewQuestion.findByIdAndDelete(id);

        if (!deletedQuestion) {
            return res.status(404).json({
                message: "Interview question not found.",
                status: 0
            });
        }

        return res.status(200).json({
            message: "Interview question deleted successfully.",
            status: 1
        });
    } catch (error) {
        console.error("Delete Interview Question Error:", error);

        return res.status(500).json({
            message: "Failed to delete interview question.",
            status: 0
        });
    }
};


// Activate / Deactivate Interview Question
export const toggleInterviewQuestionStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid question ID.",
                status: 0
            });
        }

        const question = await InterviewQuestion.findById(id);

        if (!question) {
            return res.status(404).json({
                message: "Interview question not found.",
                status: 0
            });
        }

        // Automatically toggle the current status
        question.active = !question.active;

        await question.save();

        return res.status(200).json({
            message: `Interview question ${
                question.active ? "activated" : "deactivated"
            } successfully.`,
            status: 1,
            data: {
                _id: question._id,
                active: question.active
            }
        });
    } catch (error) {
        console.error("Toggle Interview Question Error:", error);

        return res.status(500).json({
            message: "Failed to change interview question status.",
            status: 0
        });
    }
};