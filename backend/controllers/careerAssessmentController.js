import CareerAssessment from "../models/CareerAssessment.js";
import AssessmentQuestion from "../models/AssessmentQuestion.js";
import Notification from "../models/Notification.js";
import NotificationPreference from "../models/NotificationPreference.js";

const normalize = (value) =>
    String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "");

const getOptionName = (option) => {
    if (typeof option === "string") return option.trim();
    return String(option?.name || "").trim();
};

const getOptionCategories = (option) => {
    if (!option || typeof option === "string") return [];
    const categories = option.categories ?? option.category;
    if (Array.isArray(categories)) return categories;
    if (typeof categories === "string" && categories.trim()) return [categories];
    return [];
};

const getAllowedSkills = async (interest) => {
    const skillQuestions = await AssessmentQuestion.find({
        active: true,
        category: { $regex: /skill/i }
    });

    const allowed = new Map();

    skillQuestions.forEach(question => {
        (question.options || []).forEach(option => {
            const name = getOptionName(option);
            if (!name) return;

            const categories = getOptionCategories(option);

            if (
                categories.length === 0 ||
                categories.some(category => normalize(category) === normalize(interest))
            ) {
                allowed.set(normalize(name), name);
            }
        });
    });

    return allowed;
};

export const saveCareerAssessment = async (req, res) => {
    try {
        const userId = req.params.uid;
        const {
            interest,
            experience,
            skills,
            workStyle,
            goal
        } = req.body;

        const allowedSkills = await getAllowedSkills(interest);
        const selectedSkills = Array.isArray(skills) ? skills : [];

        const validSkills = [
            ...new Map(
                selectedSkills
                    .map(skill => {
                        const adminName = allowedSkills.get(normalize(skill));
                        return adminName
                            ? [normalize(adminName), adminName]
                            : null;
                    })
                    .filter(Boolean)
            ).values()
        ];

        const assessment = await CareerAssessment.findOneAndUpdate(
            { userId },
            {
                userId,
                interest,
                experience,
                skills: validSkills,
                workStyle,
                goal
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        const preferences = await NotificationPreference.findOne({ userId });

if (!preferences || preferences.assessmentUpdates) {
    await Notification.create({
        userId,
        title: "Career Assessment Completed",
        message: "Your career assessment has been saved successfully. Explore your personalized career recommendations.",
        type: "assessment"
    });
}

        res.status(200).json({
            message: "Career Assessment Saved Successfully",
            status: 1,
            data: assessment
        });
    } catch (error) {
        console.error("Career Assessment Error:", error);
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const getCareerAssessment = async (req, res) => {
    try {
        const userId = req.params.uid;
        const assessment = await CareerAssessment.findOne({ userId });

        if (!assessment) {
            return res.status(404).json({
                message: "Career Assessment not found",
                status: 0
            });
        }

        res.status(200).json({
            message: "Career Assessment fetched",
            status: 1,
            data: assessment
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};