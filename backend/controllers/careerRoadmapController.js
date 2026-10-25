import CareerAssessment from "../models/CareerAssessment.js";
import CareerPath from "../models/CareerPath.js";
import AssessmentQuestion from "../models/AssessmentQuestion.js";

const normalizeSkill = (skill) => {
    return String(skill || "")
        .toLowerCase()
        .replace(/[\s._\/-]/g, "");
};

export const getCareerRoadmap = async (req, res) => {
    try {
        const userId = req.params.uid;
        const assessment = await CareerAssessment.findOne({ userId });
        if (!assessment) {
            return res.status(404).json({
                message: "Career Assessment not found",
                status: 0
            });
        }
        const careerPaths = await CareerPath.find({ active: true });
        if (!careerPaths.length) {
            return res.status(404).json({
                message: "No Career Paths Found",
                status: 0
            });
        }
        const skillQuestions = await AssessmentQuestion.find({
            active: true,
            category: {
                $in: ["Skills", "Skill"]
            }
        });
        const availableSkills = [
            ...new Set(
                skillQuestions
                    .flatMap(question => question.options || [])
                    .map(normalizeSkill)
                    .filter(Boolean)
            )
        ];
        const userSkills = (assessment.skills || [])
            .map(normalizeSkill)
            .filter(Boolean);
        const interest = String(
            assessment.interest || ""
        ).toLowerCase().trim();
        const matchingCareers = careerPaths.filter(career =>
            String(career.category || "").toLowerCase().trim() === interest
        );
        const career = matchingCareers[0] || careerPaths[0];
        const careerSkills = (career.skills || [])
            .map(skill => ({
                name: skill,
                key: normalizeSkill(skill)
            }))
            .filter(skill =>
                skill.key && availableSkills.includes(skill.key)
            );
        const roadmap = careerSkills.map((skill, index) => {
            const completed = userSkills.includes(skill.key);
            return {
                step: index + 1,
                skill: skill.name,
                title: `Learn ${skill.name}`,
                status: completed
                    ? "Completed"
                    : index === userSkills.length
                    ? "Currently Learning"
                    : "Upcoming",
                completed
            };
        });
        res.status(200).json({
            message: "Career Roadmap Fetched Successfully",
            status: 1,
            data: {
                careerId: career._id,
                careerTitle: career.title,
                roadmap
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};