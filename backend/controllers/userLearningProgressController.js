import UserLearningProgress from "../models/UserLearningProgress.js";
import LearningContent from "../models/LearningContent.js";
import CareerAssessment from "../models/CareerAssessment.js";
import CareerPath from "../models/CareerPath.js";
import AssessmentQuestion from "../models/AssessmentQuestion.js";
import Notification from "../models/Notification.js";

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
    step,
    completedSkills
) => {
    const requiredSkills = getRoadmapStepSkills(step);

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
    step,
    learningProgress
) => {
    const requiredSkills = getRoadmapStepSkills(step);

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

const getPrimaryCareer = async (userId, assessment) => {
    const careerPaths = await CareerPath.find({
        active: true
    });

    const adminSkills =
        await getAdminSkillDefinitions();

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
        const categoryKey =
            normalize(career.category);

        const categorySkills =
            adminSkills.filter(skill =>
                skill.categories.some(
                    category =>
                        normalize(category) ===
                        categoryKey
                )
            );

        const matchedSkills =
            categorySkills
                .filter(skill =>
                    userSkillSet.has(
                        normalize(skill.name)
                    )
                )
                .map(skill => skill.name);

        const missingSkills =
            categorySkills
                .filter(skill =>
                    !userSkillSet.has(
                        normalize(skill.name)
                    )
                )
                .map(skill => skill.name);

        const interestScore =
            normalize(assessment.interest) ===
            categoryKey
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

        return {
            career,
            compatibility,
            matchedSkills,
            missingSkills
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

    return recommendations[0]?.career || null;
};

export const startLearning = async (req, res) => {
    try {
        const {
            userId,
            learningContentId
        } = req.body;

        if (!userId || !learningContentId) {
            return res.status(400).json({
                message:
                    "User ID and Learning Content ID are required",
                status: 0
            });
        }

        const content =
            await LearningContent.findById(
                learningContentId
            );

        if (!content) {
            return res.status(404).json({
                message:
                    "Learning Content Not Found",
                status: 0
            });
        }

        const skills = content.skills?.length
            ? content.skills
            : [content.title];

        let progress =
            await UserLearningProgress.findOne({
                userId,
                learningContentId
            });

        if (!progress) {
            progress =
                await UserLearningProgress.create({
                    userId,
                    learningContentId,
                    skills,
                    startedAt: new Date(),
                    status: "started"
                });
        }

        res.status(200).json({
            message:
                "Learning Started Successfully",
            status: 1,
            data: progress
        });
    } catch (error) {
        console.error(
            "Start Learning Error:",
            error
        );

        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const completeLearning = async (
    req,
    res
) => {
    try {
        const {
            userId,
            learningContentId
        } = req.body;

        if (!userId || !learningContentId) {
            return res.status(400).json({
                message:
                    "User ID and Learning Content ID are required",
                status: 0
            });
        }

        const progress =
            await UserLearningProgress.findOne({
                userId,
                learningContentId
            });

        if (!progress) {
            return res.status(404).json({
                message:
                    "Learning Progress Not Found",
                status: 0
            });
        }

        const content =
            await LearningContent.findById(
                learningContentId
            );

        if (!content) {
            return res.status(404).json({
                message:
                    "Learning Content Not Found",
                status: 0
            });
        }

        const wasAlreadyCompleted =
            progress.status === "completed";

        progress.skills =
            content.skills?.length
                ? content.skills
                : [content.title];

        progress.status = "completed";
        progress.completedAt = new Date();

        await progress.save();

        if (!wasAlreadyCompleted) {
            await Notification.create({
                userId,
                title: "Learning Completed",
                message:
                    `You completed "${content.title}". Keep learning to improve your career progress.`,
                type: "learning"
            });

            const assessment =
                await CareerAssessment.findOne({
                    userId
                });

            if (assessment) {
                const careerPath =
                    await getPrimaryCareer(
                        userId,
                        assessment
                    );

                if (
                    careerPath &&
                    careerPath.roadmap?.length
                ) {
                    const allProgress =
                        await UserLearningProgress.find({
                            userId,
                            status: "completed"
                        });

                    const completedSkills = [
                        ...new Set(
                            allProgress
                                .flatMap(
                                    item =>
                                        item.skills || []
                                )
                                .map(skill =>
                                    String(skill).trim()
                                )
                                .filter(Boolean)
                        )
                    ];

                    const completedSteps =
                        careerPath.roadmap.filter(
                            step =>
                                isRoadmapStepCompleted(
                                    step,
                                    completedSkills
                                )
                        ).length;

                    const careerProgress =
                        Math.round(
                            (
                                completedSteps /
                                careerPath.roadmap.length
                            ) * 100
                        );

                    const milestones = [
                        25,
                        50,
                        75,
                        100
                    ];

                    if (
                        milestones.includes(
                            careerProgress
                        )
                    ) {
                        const existingNotification =
                            await Notification.findOne({
                                userId,
                                type: "progress",
                                title:
                                    `Career Progress: ${careerProgress}%`
                            });

                        if (!existingNotification) {
                            await Notification.create({
                                userId,
                                title:
                                    `Career Progress: ${careerProgress}%`,
                                message:
                                    careerProgress === 100
                                        ? "Congratulations! You have completed your career roadmap."
                                        : `Great progress! You have completed ${careerProgress}% of your career roadmap.`,
                                type: "progress"
                            });
                        }
                    }
                }
            }
        }

        res.status(200).json({
            message:
                "Learning Completed Successfully",
            status: 1,
            data: progress
        });
    } catch (error) {
        console.error(
            "Complete Learning Error:",
            error
        );

        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const getUserLearningProgress = async (
    req,
    res
) => {
    try {
        const { userId } = req.params;

        const assessment =
            await CareerAssessment.findOne({
                userId
            });

        if (!assessment) {
            return res.status(404).json({
                message:
                    "Complete your career assessment first.",
                status: 0
            });
        }

        const careerPath =
            await getPrimaryCareer(
                userId,
                assessment
            );

        if (!careerPath) {
            return res.status(404).json({
                message:
                    "Recommended career not found.",
                status: 0
            });
        }

        const learningProgress =
            await UserLearningProgress.find({
                userId
            }).sort({
                updatedAt: -1
            });

        const completedProgress =
            learningProgress.filter(
                item =>
                    item.status === "completed"
            );

        const completedSkills = [
            ...new Set(
                completedProgress
                    .flatMap(
                        item =>
                            item.skills || []
                    )
                    .map(skill =>
                        String(skill).trim()
                    )
                    .filter(Boolean)
            )
        ];

        const roadmap =
            (careerPath.roadmap || []).map(
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
                        order:
                            index + 1,
                        status
                    };
                }
            );

        let firstIncompleteFound =
            false;

        roadmap.forEach(step => {
            if (step.status === "Completed") {
                return;
            }

            if (!firstIncompleteFound) {
                step.status =
                    "Currently Learning";
                firstIncompleteFound = true;
            } else if (
                step.status !==
                "Currently Learning"
            ) {
                step.status = "Upcoming";
            }
        });

        const completedSteps =
            roadmap.filter(
                step =>
                    step.status === "Completed"
            ).length;

        const careerProgress =
            roadmap.length > 0
                ? Math.round(
                    (
                        completedSteps /
                        roadmap.length
                    ) * 100
                )
                : 0;

        const completedContentIds =
            completedProgress
                .map(
                    item =>
                        item.learningContentId
                )
                .filter(Boolean);

        const completedContents =
            await LearningContent.find({
                _id: {
                    $in:
                        completedContentIds
                }
            });

        const getDurationInMinutes = (
            duration
        ) => {
            if (!duration) return 0;

            const value =
                String(duration)
                    .toLowerCase()
                    .trim();

            const match =
                value.match(
                    /\d+(\.\d+)?/
                );

            if (!match) return 0;

            const number =
                Number(match[0]);

            if (
                value.includes("hour") ||
                value.includes("hr") ||
                value.endsWith("h")
            ) {
                return number * 60;
            }

            return number;
        };

        const totalMinutes =
            completedContents.reduce(
                (total, content) =>
                    total +
                    getDurationInMinutes(
                        content.duration
                    ),
                0
            );

        const hours =
            Math.floor(
                totalMinutes / 60
            );

        const minutes =
            totalMinutes % 60;

        const learningHours =
            hours === 0
                ? `${minutes} min`
                : minutes === 0
                    ? `${hours}h`
                    : `${hours}h ${minutes}min`;

        const recentLearning =
            completedProgress
                .slice(0, 5)
                .map(progress => {
                    const content =
                        completedContents.find(
                            item =>
                                item._id.toString() ===
                                progress.learningContentId?.toString()
                        );

                    return {
                        _id:
                            progress._id,
                        title:
                            content?.title ||
                            "Learning Content",
                        type:
                            content?.type ||
                            "",
                        duration:
                            content?.duration ||
                            "",
                        skills:
                            progress.skills ||
                            [],
                        status:
                            progress.status,
                        completedAt:
                            progress.completedAt ||
                            progress.updatedAt ||
                            progress.createdAt
                    };
                });

        res.status(200).json({
            message:
                "Learning Progress Fetched Successfully",
            status: 1,
            data: {
                careerName:
                    careerPath.title,
                careerId:
                    careerPath._id,
                careerProgress,
                completedSkills,
                skillsCompleted:
                    completedSkills.length,
                learningHours,
                completedLearning:
                    completedProgress.length,
                roadmap,
                recentLearning
            }
        });
    } catch (error) {
        console.error(
            "Get Learning Progress Error:",
            error
        );

        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const getUserProgress = getUserLearningProgress;