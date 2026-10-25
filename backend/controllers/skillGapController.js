import CareerAssessment from "../models/CareerAssessment.js";
import CareerPath from "../models/CareerPath.js";
import AssessmentQuestion from "../models/AssessmentQuestion.js";
import UserLearningProgress from "../models/UserLearningProgress.js";

const normalize = (value) =>
    String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "");

const getExperienceScore = (userExperience, careerExperience) => {
    const levels = {
        beginner: 1,
        intermediate: 2,
        advanced: 3,
        professional: 4
    };
    const userLevel =
        levels[String(userExperience || "").toLowerCase()] || 1;
    const careerLevel =
        levels[String(careerExperience || "").toLowerCase()] || 1;
    if (userLevel >= careerLevel) {
        return 20;
    }
    if (careerLevel - userLevel === 1) {
        return 10;
    }
    return 0;
};

const hasValue = (items, value) => {
    const normalizedValue = normalize(value);
    return (items || []).some(
        item => normalize(item) === normalizedValue
    );
};

const getAdminSkillDefinitions = async () => {
    const questions = await AssessmentQuestion.find({
        active: true
    }).sort({ order: 1 });
    const skillMap = {};
    questions
        .filter(question => normalize(question.category) === "skills")
        .forEach(question => {
            (question.options || []).forEach(option => {
                const skillName =
                    typeof option === "string"
                        ? option
                        : option?.name;
                if (!skillName) {
                    return;
                }
                const categories =
                    typeof option === "object"
                        ? option.categories || option.category || []
                        : [];
                const categoryList = Array.isArray(categories)
                    ? categories
                    : [categories];
                categoryList.forEach(category => {
                    const categoryKey = normalize(category);
                    if (!categoryKey) {
                        return;
                    }
                    if (!skillMap[categoryKey]) {
                        skillMap[categoryKey] = [];
                    }
                    const alreadyExists = skillMap[categoryKey].some(
                        skill => normalize(skill) === normalize(skillName)
                    );
                    if (!alreadyExists) {
                        skillMap[categoryKey].push(
                            String(skillName).trim()
                        );
                    }
                });
            });
        });
    return skillMap;
};

export const getSkillGap = async (req, res) => {
    try {
        const userId = req.params.uid;
        const assessment = await CareerAssessment.findOne({
            userId
        });
        if (!assessment) {
            return res.status(404).json({
                message: "Career Assessment not found",
                status: 0
            });
        }
        const careerPaths = await CareerPath.find({
            active: true
        });
        if (!careerPaths.length) {
            return res.status(404).json({
                message: "No Career Paths Found",
                status: 0
            });
        }
        const adminSkillDefinitions =
            await getAdminSkillDefinitions();
        const selectedSkillSet = new Set(
            (assessment.skills || []).map(skill => normalize(skill))
        );
        const learningProgress = await UserLearningProgress.find({
    userId,
    status: "completed"
});
const completedLearningSkillSet = new Set(
    learningProgress
        .flatMap(progress => progress.skills || [])
        .map(skill => normalize(skill))
        .filter(Boolean)
);
const userSkillSet = new Set([
    ...selectedSkillSet,
    ...completedLearningSkillSet
]);
        const results = careerPaths.map(career => {
            const categoryKey = normalize(career.category);
            const categorySkills =
                adminSkillDefinitions[categoryKey] || [];
            const matchedSkills = categorySkills.filter(skill =>
    userSkillSet.has(normalize(skill))
);
const missingSkills = categorySkills.filter(
    skill =>
        !userSkillSet.has(normalize(skill))
);
            const interestMatch =
                normalize(assessment.interest) === categoryKey;
            const interestScore = interestMatch ? 25 : 0;
            const experienceScore = getExperienceScore(
                assessment.experience,
                career.experience
            );
            const skillsScore =
                categorySkills.length > 0
                    ? Math.round(
                        (matchedSkills.length /
                            categorySkills.length) *
                        35
                    )
                    : 0;
            const workStyleScore = hasValue(
                career.workStyle,
                assessment.workStyle
            )
                ? 10
                : 0;
            const goalScore = hasValue(
                career.goal,
                assessment.goal
            )
                ? 10
                : 0;
            const compatibility =
                interestScore +
                experienceScore +
                skillsScore +
                workStyleScore +
                goalScore;
            return {
                careerId: career._id,
                careerTitle: career.title,
                matchedSkills,
                missingSkills,
                totalSkills: categorySkills.length,
                skillPercentage:
                    categorySkills.length > 0
                        ? Math.round(
                            (matchedSkills.length /
                                categorySkills.length) *
                            100
                        )
                        : 0,
                compatibility
            };
        });
        results.sort(
            (a, b) => b.compatibility - a.compatibility
        );
        res.status(200).json({
            message: "Skill Gap Fetched Successfully",
            status: 1,
            data: results
        });
    } catch (error) {
        console.error("Skill Gap Error:", error);
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};