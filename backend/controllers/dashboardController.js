import User from "../models/User.js";
import CareerAssessment from "../models/CareerAssessment.js";
import UserLearningProgress from "../models/UserLearningProgress.js";
import LearningContent from "../models/LearningContent.js";
import CareerPath from "../models/CareerPath.js";
import AssessmentQuestion from "../models/AssessmentQuestion.js";

const normalize = (value) => {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "");
};

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

const getDurationInMinutes = (duration) => {
    if (!duration) return 0;

    const value = String(duration)
        .toLowerCase()
        .trim();

    const numberMatch = value.match(/\d+(\.\d+)?/);

    if (!numberMatch) return 0;

    const number = Number(numberMatch[0]);

    if (
        value.includes("hour") ||
        value.includes("hr") ||
        value.endsWith("h")
    ) {
        return number * 60;
    }

    return number;
};

const formatLearningTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
        return `${minutes} min`;
    }

    if (minutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${minutes}min`;
};

const getRoadmapStepName = (step) => {
    if (typeof step === "object" && step !== null) {
        return String(step.name || "").trim();
    }

    return String(step || "").trim();
};

const getRoadmapStepSkills = (step) => {
    if (typeof step === "object" && step !== null) {
        return Array.isArray(step.skills)
            ? step.skills
                .map(skill => String(skill || "").trim())
                .filter(Boolean)
            : [];
    }

    return [];
};

const isRoadmapStepCompleted = (
    roadmapStep,
    completedSkills
) => {
    const requiredSkills = getRoadmapStepSkills(
        roadmapStep
    );

    if (requiredSkills.length === 0) {
        return false;
    }

    const completedSkillSet = new Set(
        completedSkills
            .map(skill => normalize(skill))
            .filter(Boolean)
    );

    return requiredSkills.every(skill =>
        completedSkillSet.has(normalize(skill))
    );
};

const isRoadmapStepStarted = (
    roadmapStep,
    learningProgress
) => {
    const requiredSkills = getRoadmapStepSkills(
        roadmapStep
    );

    if (requiredSkills.length === 0) {
        return false;
    }

    const requiredSkillSet = new Set(
        requiredSkills
            .map(skill => normalize(skill))
            .filter(Boolean)
    );

    return learningProgress.some(progress => {
        if (progress.status !== "started") {
            return false;
        }

        return (progress.skills || []).some(skill =>
            requiredSkillSet.has(normalize(skill))
        );
    });
};

export const getDashboardData = async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await User.findById(uid);

        if (!user) {
            return res.status(404).json({
                message: "User Not Found",
                status: 0
            });
        }

        const assessment = await CareerAssessment.findOne({
            userId: uid
        });

        const learningProgress =
            await UserLearningProgress.find({
                userId: uid
            });

        const completedProgress =
            learningProgress.filter(
                item => item.status === "completed"
            );

        const completedSkills = [
            ...new Set(
                completedProgress
                    .flatMap(item => item.skills || [])
                    .map(skill => String(skill).trim())
                    .filter(Boolean)
            )
        ];

        const completedContentIds =
            completedProgress
                .map(item => item.learningContentId)
                .filter(Boolean);

        const completedContents =
            await LearningContent.find({
                _id: {
                    $in: completedContentIds
                }
            });

        let totalLearningMinutes = 0;

        completedContents.forEach(content => {
            totalLearningMinutes +=
                getDurationInMinutes(
                    content.duration
                );
        });

        const learningHours =
            formatLearningTime(
                totalLearningMinutes
            );

        let profileCompletion = 80;

        if (
            user.skills &&
            user.skills.trim() !== ""
        ) {
            profileCompletion += 10;
        }

        if (
            user.goal &&
            user.goal.trim() !== ""
        ) {
            profileCompletion += 10;
        }

        let recommendedCareers = [];
        let careerRoadmap = [];
        let careerProgress = 0;

        if (assessment) {
            const careerPaths =
                await CareerPath.find({
                    active: true
                });

            const adminSkills =
                await getAdminSkillDefinitions();

            const assessmentSkillSet =
                new Set(
                    (assessment.skills || [])
                        .map(skill => normalize(skill))
                        .filter(Boolean)
                );

            const completedLearningSkillSet =
                new Set(
                    completedProgress
                        .flatMap(
                            progress =>
                                progress.skills || []
                        )
                        .map(skill =>
                            normalize(skill)
                        )
                        .filter(Boolean)
                );

            const userSkillSet = new Set([
                ...assessmentSkillSet,
                ...completedLearningSkillSet
            ]);

            const recommendations =
                careerPaths.map(career => {
                    const categoryKey =
                        normalize(
                            career.category
                        );

                    const categorySkills =
                        adminSkills.filter(
                            skill =>
                                skill.categories.some(
                                    category =>
                                        normalize(
                                            category
                                        ) ===
                                        categoryKey
                                )
                        );

                    const matchedSkills =
                        categorySkills
                            .filter(skill =>
                                userSkillSet.has(
                                    normalize(
                                        skill.name
                                    )
                                )
                            )
                            .map(
                                skill =>
                                    skill.name
                            );

                    const missingSkills =
                        categorySkills
                            .filter(
                                skill =>
                                    !userSkillSet.has(
                                        normalize(
                                            skill.name
                                        )
                                    )
                            )
                            .map(
                                skill =>
                                    skill.name
                            );

                    const assessmentMatchedSkills =
                        categorySkills
                            .filter(skill =>
                                assessmentSkillSet.has(
                                    normalize(
                                        skill.name
                                    )
                                )
                            )
                            .map(
                                skill =>
                                    skill.name
                            );

                    const completedLearningSkills =
                        categorySkills
                            .filter(
                                skill =>
                                    completedLearningSkillSet.has(
                                        normalize(
                                            skill.name
                                        )
                                    ) &&
                                    !assessmentSkillSet.has(
                                        normalize(
                                            skill.name
                                        )
                                    )
                            )
                            .map(
                                skill =>
                                    skill.name
                            );

                    const interestScore =
                        normalize(
                            assessment.interest
                        ) === categoryKey
                            ? 25
                            : 0;

                    const experienceScore =
                        normalize(
                            assessment.experience
                        ) ===
                        normalize(
                            career.experience
                        )
                            ? 20
                            : 0;

                    const skillsScore =
                        categorySkills.length > 0
                            ? Math.round(
                                (
                                    matchedSkills.length /
                                    categorySkills.length
                                ) * 35
                            )
                            : 0;

                    const workStyleScore =
                        hasValue(
                            career.workStyle,
                            assessment.workStyle
                        )
                            ? 10
                            : 0;

                    const goalScore =
                        hasValue(
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

                    const careerData =
                        career.toObject();

                    careerData.skills =
                        categorySkills.map(
                            skill =>
                                skill.name
                        );

                    return {
                        career: careerData,
                        compatibility,
                        matchedSkills,
                        missingSkills,
                        assessmentMatchedSkills,
                        completedLearningSkills,
                        breakdown: {
                            interest:
                                interestScore,
                            experience:
                                experienceScore,
                            skills:
                                skillsScore,
                            workStyle:
                                workStyleScore,
                            goal:
                                goalScore
                        }
                    };
                });

            recommendations.sort((a, b) => {
                if (
                    b.compatibility !==
                    a.compatibility
                ) {
                    return (
                        b.compatibility -
                        a.compatibility
                    );
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

            recommendedCareers =
                recommendations.slice(0, 3);

            const primaryCareer =
                recommendedCareers[0];

            if (
                primaryCareer?.career?.roadmap &&
                primaryCareer.career.roadmap.length > 0
            ) {
                careerRoadmap =
                    primaryCareer.career.roadmap.map(
                        (step, index) => {
                            const completed =
                                isRoadmapStepCompleted(
                                    step,
                                    completedSkills
                                );

                            const started =
                                isRoadmapStepStarted(
                                    step,
                                    learningProgress
                                );

                            let status =
                                "Upcoming";

                            if (completed) {
                                status =
                                    "Completed";
                            } else if (started) {
                                status =
                                    "Currently Learning";
                            }

                            return {
                                name:
                                    getRoadmapStepName(
                                        step
                                    ),
                                skills:
                                    getRoadmapStepSkills(
                                        step
                                    ),
                                status,
                                order:
                                    index + 1
                            };
                        }
                    );

                let firstIncompleteFound =
                    false;

                careerRoadmap.forEach(
                    step => {
                        if (
                            step.status ===
                            "Completed"
                        ) {
                            return;
                        }

                        if (
                            !firstIncompleteFound
                        ) {
                            step.status =
                                "Currently Learning";

                            firstIncompleteFound =
                                true;
                        } else {
                            step.status =
                                "Upcoming";
                        }
                    }
                );

                const completedRoadmapSteps =
                    careerRoadmap.filter(
                        step =>
                            step.status ===
                            "Completed"
                    ).length;

                careerProgress =
                    Math.round(
                        (
                            completedRoadmapSteps /
                            careerRoadmap.length
                        ) * 100
                    );
            }
        }

        res.status(200).json({
            message:
                "Dashboard Data Fetched Successfully",
            status: 1,
            data: {
                profileCompletion,
                careerProgress,
                skillsCompleted:
                    completedSkills.length,
                completedSkills,
                learningHours,
                assessmentCompleted:
                    !!assessment,
                careerRoadmap,
                recommendedCareers
            }
        });
    } catch (error) {
        console.error(
            "Dashboard Error:",
            error
        );

        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};