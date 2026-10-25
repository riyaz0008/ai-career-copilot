import CareerPath from "../models/CareerPath.js";
import CareerAssessment from "../models/CareerAssessment.js";
import AssessmentQuestion from "../models/AssessmentQuestion.js";
import UserLearningProgress from "../models/UserLearningProgress.js";

const normalize = (value) =>
    String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "");

const optionToObject = (option) => {
    if (typeof option === "string") {
        return {
            name: option.trim(),
            category: []
        };
    }

    return {
        name: String(option?.name || "").trim(),
        category: Array.isArray(option?.category)
            ? option.category
                .map(item => String(item || "").trim())
                .filter(Boolean)
            : option?.category
                ? [String(option.category).trim()]
                : []
    };
};

const getAdminSkillDefinitions = async () => {
    const skillQuestions = await AssessmentQuestion.find({
        active: true,
        category: { $regex: /skill/i }
    });

    const skillMap = new Map();

    skillQuestions.forEach(question => {
        (question.options || []).forEach(rawOption => {
            const option = optionToObject(rawOption);
            const key = normalize(option.name);

            if (!key) return;

            if (!skillMap.has(key)) {
                skillMap.set(key, {
                    name: option.name,
                    categories: []
                });
            }

            const current = skillMap.get(key);

            const mergedCategories = [
                ...current.categories,
                ...option.category
            ];

            current.categories = [
                ...new Map(
                    mergedCategories
                        .filter(Boolean)
                        .map(category => [
                            normalize(category),
                            category
                        ])
                ).values()
            ];
        });
    });

    return [...skillMap.values()];
};

const hasValue = (items, value) => {
    const normalizedValue = normalize(value);

    return (items || []).some(
        item => normalize(item) === normalizedValue
    );
};

export const addCareerPath = async (req, res) => {
    try {
        const careerPath = new CareerPath(req.body);

        const savedCareerPath = await careerPath.save();

        res.status(200).json({
            message: "Career Path Added Successfully",
            status: 1,
            data: savedCareerPath
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const getCareerPaths = async (req, res) => {
    try {
        const careerPaths = await CareerPath.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Career Paths Fetched Successfully",
            status: 1,
            data: careerPaths
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const updateCareerPath = async (req, res) => {
    try {
        const careerPath = await CareerPath.findByIdAndUpdate(
            req.params.cid,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!careerPath) {
            return res.status(404).json({
                message: "Career Path Not Found",
                status: 0
            });
        }

        res.status(200).json({
            message: "Career Path Updated Successfully",
            status: 1,
            data: careerPath
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const deleteCareerPath = async (req, res) => {
    try {
        const careerPath = await CareerPath.findByIdAndDelete(
            req.params.cid
        );

        res.status(200).json({
            message: "Career Path Deleted Successfully",
            status: 1,
            data: careerPath
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const getCareerPathById = async (req, res) => {
    try {
        const careerPath = await CareerPath.findOne({
            _id: req.params.cid,
            active: true
        });

        if (!careerPath) {
            return res.status(404).json({
                message: "Career Path Not Found",
                status: 0
            });
        }

        const adminSkills = await getAdminSkillDefinitions();

        const categoryKey = normalize(careerPath.category);

        const dynamicSkills = adminSkills.filter(skill =>
            skill.categories.some(
                category =>
                    normalize(category) === categoryKey
            )
        );

        const careerData = careerPath.toObject();

        careerData.skills = dynamicSkills.map(
            skill => skill.name
        );

        /*
         * Roadmap is now prepared from the skills
         * already saved in CareerPath.
         *
         * Example:
         * {
         *   name: "JavaScript Fundamentals",
         *   skills: ["JavaScript"]
         * }
         *
         * {
         *   name: "Node.js & Express.js",
         *   skills: ["Node.js", "Express.js"]
         * }
         */

        careerData.roadmapDetails = (careerPath.roadmap || []).map(
            step => {
                if (typeof step === "object" && step !== null) {
                    return {
                        name: step.name || "",
                        skills: Array.isArray(step.skills)
                            ? step.skills
                            : []
                    };
                }

                return {
                    name: String(step || ""),
                    skills: []
                };
            }
        );

        res.status(200).json({
            message: "Career Path Fetched Successfully",
            status: 1,
            data: careerData
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const getCareerRecommendations = async (req, res) => {
    try {
        const userId = req.params.uid;

        const assessment = await CareerAssessment.findOne({
            userId
        });

        if (!assessment) {
            return res.status(404).json({
                message: "Complete your career assessment first.",
                status: 0
            });
        }

        const careerPaths = await CareerPath.find({
            active: true
        });

        const adminSkills = await getAdminSkillDefinitions();

        const learningProgress =
            await UserLearningProgress.find({
                userId,
                status: "completed"
            });

        const assessmentSkillSet = new Set(
            (assessment.skills || [])
                .map(skill => normalize(skill))
                .filter(Boolean)
        );

        const completedLearningSkillSet = new Set(
            learningProgress
                .flatMap(progress => progress.skills || [])
                .map(skill => normalize(skill))
                .filter(Boolean)
        );

        const userSkillSet = new Set([
            ...assessmentSkillSet,
            ...completedLearningSkillSet
        ]);

        const recommendations = careerPaths.map(career => {
            const categoryKey = normalize(
                career.category
            );

            const categorySkills =
                adminSkills.filter(skill =>
                    skill.categories.some(
                        category =>
                            normalize(category) === categoryKey
                    )
                );

            const matchedSkills = categorySkills
                .filter(skill =>
                    userSkillSet.has(
                        normalize(skill.name)
                    )
                )
                .map(skill => skill.name);

            const missingSkills = categorySkills
                .filter(skill =>
                    !userSkillSet.has(
                        normalize(skill.name)
                    )
                )
                .map(skill => skill.name);

            const assessmentMatchedSkills =
                categorySkills
                    .filter(skill =>
                        assessmentSkillSet.has(
                            normalize(skill.name)
                        )
                    )
                    .map(skill => skill.name);

            const completedLearningSkills =
                categorySkills
                    .filter(skill =>
                        completedLearningSkillSet.has(
                            normalize(skill.name)
                        ) &&
                        !assessmentSkillSet.has(
                            normalize(skill.name)
                        )
                    )
                    .map(skill => skill.name);

            const interestScore =
                normalize(assessment.interest) === categoryKey
                    ? 25
                    : 0;

            const experienceScore =
                normalize(assessment.experience) ===
                normalize(career.experience)
                    ? 20
                    : 0;

            const skillsScore =
                categorySkills.length > 0
                    ? Math.round(
                        (matchedSkills.length /
                            categorySkills.length) * 35
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

            const careerData = career.toObject();

            careerData.skills =
                categorySkills.map(
                    skill => skill.name
                );

            /*
             * Return roadmap in the same structure
             * stored by Admin Career Path.
             */

            careerData.roadmapDetails =
                (career.roadmap || []).map(
                    step => {
                        if (
                            typeof step === "object" &&
                            step !== null
                        ) {
                            return {
                                name: step.name || "",
                                skills: Array.isArray(step.skills)
                                    ? step.skills
                                    : []
                            };
                        }

                        return {
                            name: String(step || ""),
                            skills: []
                        };
                    }
                );

            return {
                career: careerData,
                compatibility,
                matchedSkills,
                missingSkills,
                assessmentMatchedSkills,
                completedLearningSkills,
                breakdown: {
                    interest: interestScore,
                    experience: experienceScore,
                    skills: skillsScore,
                    workStyle: workStyleScore,
                    goal: goalScore
                }
            };
        });

        recommendations.sort((a, b) => {
            if (b.compatibility !== a.compatibility) {
                return b.compatibility - a.compatibility;
            }

            if (
                b.matchedSkills.length !==
                a.matchedSkills.length
            ) {
                return (
                    b.matchedSkills.length -
                    a.matchedSkills.length
                );
            }

            return a.career.title.localeCompare(
                b.career.title
            );
        });

        res.status(200).json({
            message:
                "Career Recommendations Fetched Successfully",
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