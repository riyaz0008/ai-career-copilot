import AssessmentQuestion from "../models/AssessmentQuestion.js";

const normalizeOption = (option) => {
    if (typeof option === "string") {
        return {
            name: option.trim(),
            category: []
        };
    }

    return {
        name: String(option?.name || "").trim(),
        category: Array.isArray(option?.category)
            ? [...new Set(option.category.map(item => String(item || "").trim()).filter(Boolean))]
            : option?.category
                ? [String(option.category).trim()].filter(Boolean)
                : []
    };
};

const normalizeQuestionOptions = (category, options = []) => {
    return options
        .map(normalizeOption)
        .filter(option => option.name !== "")
        .map(option => ({
            name: option.name,
            category: String(category || "").toLowerCase().includes("skill")
                ? option.category
                : []
        }));
};

const formatQuestion = (question) => {
    const data = question.toObject ? question.toObject() : question;
    return {
        ...data,
        options: normalizeQuestionOptions(data.category, data.options)
    };
};

export const addAssessmentQuestion = async (req, res) => {
    try {
        const options = normalizeQuestionOptions(
            req.body.category,
            req.body.options
        );

        if (
            String(req.body.category || "").toLowerCase().includes("skill") &&
            options.some(option => option.category.length === 0)
        ) {
            return res.status(400).json({
                message: "Please assign at least one career category to every skill.",
                status: 0
            });
        }

        const saveQuestion = new AssessmentQuestion({
            question: req.body.question,
            category: req.body.category,
            type: req.body.type,
            options,
            order: req.body.order,
            active: req.body.active
        });

        const result = await saveQuestion.save();

        res.status(200).json({
            message: "Assessment Question Added Successfully",
            status: 1,
            data: formatQuestion(result)
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const getAssessmentQuestions = async (req, res) => {
    try {
        const questions = await AssessmentQuestion.find().sort({ order: 1 });
        res.status(200).json({
            message: "Assessment Questions Fetched Successfully",
            status: 1,
            data: questions.map(formatQuestion)
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const updateAssessmentQuestion = async (req, res) => {
    try {
        const id = req.params.qid;
        const options = normalizeQuestionOptions(
            req.body.category,
            req.body.options
        );

        if (
            String(req.body.category || "").toLowerCase().includes("skill") &&
            options.some(option => option.category.length === 0)
        ) {
            return res.status(400).json({
                message: "Please assign at least one career category to every skill.",
                status: 0
            });
        }

        const updateQuestion = await AssessmentQuestion.findByIdAndUpdate(
            id,
            {
                question: req.body.question,
                category: req.body.category,
                type: req.body.type,
                options,
                order: req.body.order,
                active: req.body.active
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updateQuestion) {
            return res.status(404).json({
                message: "Assessment Question Not Found",
                status: 0
            });
        }

        res.status(200).json({
            message: "Assessment Question Updated Successfully",
            status: 1,
            data: formatQuestion(updateQuestion)
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const deleteAssessmentQuestion = async (req, res) => {
    try {
        const id = req.params.qid;
        const deleteQuestion = await AssessmentQuestion.findByIdAndDelete(id);
        res.status(200).json({
            message: "Assessment Question Deleted Successfully",
            status: 1,
            data: deleteQuestion ? formatQuestion(deleteQuestion) : null
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const getActiveAssessmentQuestions = async (req, res) => {
    try {
        const questions = await AssessmentQuestion.find({
            active: true
        }).sort({ order: 1 });

        res.status(200).json({
            message: "Assessment Questions Fetched Successfully",
            status: 1,
            data: questions.map(formatQuestion)
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};
