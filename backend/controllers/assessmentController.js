import CareerAssessment from "../models/CareerAssessment.js";
import "../models/User.js";

export const getAssessments = async (req, res) => {
    try {
        const assessments = await CareerAssessment.find()
            .sort({ createdAt: -1 });
        res.status(200).json({
            "message": "Assessments Fetched Successfully",
            status: 1,
            data: assessments
        });
    } catch (error) {
        res.status(500).json({
            "message": error.message,
            status: 0
        });
    }
};

export const getAssessmentById = async (req, res) => {
    try {
        const id = req.params.aid;
        console.log("Assessment ID:", id);
        const assessment = await CareerAssessment.findById(id)
            .populate("userId", "firstname lastname email");
        console.log("Assessment Data:", assessment);
        if (!assessment) {
            return res.status(404).json({
                "message": "Assessment Not Found",
                status: 0
            });
        }
        res.status(200).json({
            "message": "Assessment Fetched Successfully",
            status: 1,
            data: assessment
        });
    } catch (error) {
        console.log("Assessment Error:", error);
        res.status(500).json({
            "message": error.message,
            status: 0
        });
    }
};