import express from "express";
import User from "../models/User.js";
import AssessmentQuestion from "../models/AssessmentQuestion.js";
import CareerPath from "../models/CareerPath.js";
import CareerAssessment from "../models/CareerAssessment.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/api/admin/dashboard", authMiddleware, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        const assessmentsCompleted =
            await CareerAssessment.countDocuments();

        const careerPaths =
            await CareerPath.countDocuments({
                active: { $ne: false }
            });

        const assessmentQuestions =
            await AssessmentQuestion.countDocuments({
                active: { $ne: false }
            });

        const recentUsers = await User.find()
            .select("firstname lastname email status createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        const recentAssessments =
            await CareerAssessment.find()
                .sort({ createdAt: -1 })
                .limit(5);

        res.status(200).json({
            message: "Admin dashboard data fetched successfully",
            status: 1,
            data: {
                totalUsers,
                assessmentsCompleted,
                careerPaths,
                assessmentQuestions,
                recentUsers,
                recentAssessments
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
});

export default router;