import CareerAssessment from "../models/CareerAssessment.js";
import CareerPath from "../models/CareerPath.js";
import AssessmentQuestion from "../models/AssessmentQuestion.js";

const normalizeSkill = (skill) => {
    return String(skill || "")
        .toLowerCase()
        .trim()
        .replace(/[\s._/-]+/g, "");
};

const skillAliases = {
    javascript: "javascript",
    js: "javascript",
    typescript: "typescript",
    ts: "typescript",
    nodejs: "nodejs",
    node: "nodejs",
    expressjs: "expressjs",
    express: "expressjs",
    mongodb: "mongodb",
    mongo: "mongodb",
    sql: "sql",
    mysql: "mysql",
    postgresql: "postgresql",
    postgres: "postgresql",
    python: "python",
    java: "java",
    cpp: "cpp",
    cplusplus: "cpp",
    c: "c",
    github: "github",
    git: "git",
    restapi: "restapi",
    rest: "restapi",
    uiux: "uiux",
    uidesign: "uiux",
    uxdesign: "uiux",
    figma: "figma",
    aws: "aws",
    azure: "azure",
    docker: "docker",
    kubernetes: "kubernetes",
    linux: "linux",
    wireframing: "wireframing",
    prototyping: "prototyping",
    userresearch: "userresearch"
};

const getSkillKey = (skill) => {
    const normalized = normalizeSkill(skill);
    return skillAliases[normalized] || normalized;
};

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

export const getCareerRecommendations = async (req, res) => {
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

        const skillQuestions = await AssessmentQuestion.find({
            active: true,
            category: {
                $in: ["Skills", "Skill"]
            }
        });

        // ================= ADMIN SKILL CATEGORY MAPPING =================
        const skillCategoryMap = {};

        skillQuestions.forEach((question) => {
            (question.options || []).forEach((option) => {
                if (!option || !option.name) {
                    return;
                }

                const skillKey = getSkillKey(option.name);

                skillCategoryMap[skillKey] = [
                    ...new Set(
                        (option.category || []).map((category) =>
                            String(category).toLowerCase().trim()
                        )
                    )
                ];
            });
        });

        const userSkills = (assessment.skills || [])
            .map((skill) => ({
                original: skill,
                key: getSkillKey(skill),
                categories: skillCategoryMap[getSkillKey(skill)] || []
            }))
            .filter((skill) => skill.key);

        const userWorkStyle = String(
            assessment.workStyle || ""
        ).toLowerCase().trim();

        const userGoal = String(
            assessment.goal || ""
        ).toLowerCase().trim();

        const recommendations = careerPaths.map((career) => {
            let score = 0;

            // ================= INTEREST =================
            const careerCategory = String(
                career.category || ""
            ).toLowerCase().trim();

            const interestMatch =
                careerCategory ===
                String(assessment.interest || "").toLowerCase().trim();

            if (interestMatch) {
                score += 25;
            }

            // ================= EXPERIENCE =================
            const experienceScore = getExperienceScore(
                assessment.experience,
                career.experience
            );

            score += experienceScore;

            // ================= SKILLS =================
            const careerSkills = (career.skills || [])
                .map((skill) => ({
                    original: skill,
                    key: getSkillKey(skill)
                }))
                .filter((skill) => skill.key);

            const uniqueCareerSkills = [
                ...new Map(
                    careerSkills.map((skill) => [
                        skill.key,
                        skill.original
                    ])
                ).values()
            ];

            const matchedSkillKeys = [
                ...new Set(
                    userSkills
                        .filter((userSkill) => {
                            return careerSkills.some(
                                (careerSkill) =>
                                    careerSkill.key === userSkill.key
                            );
                        })
                        .map((userSkill) => userSkill.key)
                )
            ];

            const categoryMatchedSkills = [
                ...new Set(
                    userSkills
                        .filter((userSkill) =>
                            userSkill.categories.includes(careerCategory)
                        )
                        .map((userSkill) => userSkill.key)
                )
            ];

            const allMatchedSkillKeys = [
                ...new Set([
                    ...matchedSkillKeys,
                    ...categoryMatchedSkills
                ])
            ];

            const matchedSkills = careerSkills
                .filter((careerSkill) =>
                    allMatchedSkillKeys.includes(careerSkill.key)
                )
                .map((careerSkill) => careerSkill.original);

            const categoryMatchedSkillNames = userSkills
                .filter((userSkill) =>
                    categoryMatchedSkills.includes(userSkill.key)
                )
                .map((userSkill) => userSkill.original);

            const uniqueMatchedSkills = [
                ...new Set([
                    ...matchedSkills,
                    ...categoryMatchedSkillNames
                ])
            ];

            const missingSkills = careerSkills
                .filter(
                    (careerSkill) =>
                        !allMatchedSkillKeys.includes(careerSkill.key)
                )
                .map((careerSkill) => careerSkill.original);

            const uniqueMissingSkills = [
                ...new Set(missingSkills)
            ];

            let skillScore = 0;

            if (uniqueCareerSkills.length > 0) {
                skillScore = Math.round(
                    (allMatchedSkillKeys.length /
                        uniqueCareerSkills.length) *
                    35
                );

                if (skillScore > 35) {
                    skillScore = 35;
                }
            }

            score += skillScore;

            // ================= WORK STYLE =================
            const careerWorkStyles = (career.workStyle || [])
                .map((style) =>
                    String(style).toLowerCase().trim()
                );

            const workStyleMatch = careerWorkStyles.some(
                (style) => style === userWorkStyle
            );

            if (workStyleMatch) {
                score += 10;
            }

            // ================= GOAL =================
            const careerGoals = (career.goal || [])
                .map((goal) =>
                    String(goal).toLowerCase().trim()
                );

            const goalMatch = careerGoals.some(
                (goal) => goal === userGoal
            );

            if (goalMatch) {
                score += 10;
            }

            return {
                career,
                score,
                compatibility: score,
                breakdown: {
                    interest: interestMatch ? 25 : 0,
                    experience: experienceScore,
                    skills: skillScore,
                    workStyle: workStyleMatch ? 10 : 0,
                    goal: goalMatch ? 10 : 0
                },
                matchedSkills: uniqueMatchedSkills,
                missingSkills: uniqueMissingSkills
            };
        });

        recommendations.sort((a, b) => b.score - a.score);

        res.status(200).json({
            message: "Career Recommendations Fetched Successfully",
            status: 1,
            data: recommendations
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};