import LearningContent from "../models/LearningContent.js";

// ================= ADD LEARNING CONTENT =================
export const addLearningContent = async (req, res) => {
    try {
        const content = await LearningContent.create({
            title: req.body.title,
            category: req.body.category,
            description: req.body.description,
            type: req.body.type,
            url: req.body.url,
            skills: req.body.skills || [],
            level: req.body.level,
            duration: req.body.duration,
            active: req.body.active ?? true
        });
        res.status(201).json({
            message: "Learning Content Added Successfully",
            status: 1,
            data: content
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

// ================= GET ALL CONTENT FOR ADMIN =================
export const getAllLearningContent = async (req, res) => {
    try {
        const content = await LearningContent.find().sort({ createdAt: -1 });
        res.status(200).json({
            message: "Learning Content Fetched Successfully",
            status: 1,
            data: content
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

// ================= GET ACTIVE CONTENT FOR USER =================
export const getActiveLearningContent = async (req, res) => {
    try {
        const content = await LearningContent.find({
            active: true
        }).sort({ createdAt: -1 });
        res.status(200).json({
            message: "Learning Content Fetched Successfully",
            status: 1,
            data: content
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

// ================= UPDATE LEARNING CONTENT =================
export const updateLearningContent = async (req, res) => {
    try {
        const content = await LearningContent.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        if (!content) {
            return res.status(404).json({
                message: "Learning Content Not Found",
                status: 0
            });
        }
        res.status(200).json({
            message: "Learning Content Updated Successfully",
            status: 1,
            data: content
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

// ================= DELETE LEARNING CONTENT =================
export const deleteLearningContent = async (req, res) => {
    try {
        const content = await LearningContent.findByIdAndDelete(req.params.id);
        if (!content) {
            return res.status(404).json({
                message: "Learning Content Not Found",
                status: 0
            });
        }
        res.status(200).json({
            message: "Learning Content Deleted Successfully",
            status: 1,
            data: content
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};