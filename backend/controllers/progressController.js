import User from "../models/User.js";
import CareerAssessment from "../models/CareerAssessment.js";
import CareerPath from "../models/CareerPath.js";
import UserLearningProgress from "../models/UserLearningProgress.js";
import LearningContent from "../models/LearningContent.js";

const normalize = (value) => {
    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "");
};

const getRoadmapStepSkills = (roadmapStep) => {
    if (
        typeof roadmapStep === "object" &&
        roadmapStep !== null
    ) {
        return Array.isArray(roadmapStep.skills)
            ? roadmapStep.skills
                .map(skill => String(skill).trim())
                .filter(Boolean)
            : [];
    }

    return [];
};

const getRoadmapStepName = (roadmapStep) => {
    if (
        typeof roadmapStep === "object" &&
        roadmapStep !== null
    ) {
        return String(roadmapStep.name || "").trim();
    }

    return String(roadmapStep || "").trim();
};

const isStepCompleted = (
    roadmapStep,
    completedSkills
) => {
    const requiredSkills =
        getRoadmapStepSkills(roadmapStep);

    if (requiredSkills.length === 0) {
        return false;
    }

    const completedSkillSet = new Set(
        completedSkills
            .map(skill => normalize(skill))
            .filter(Boolean)
    );

    return requiredSkills.every(skill =>
        completedSkillSet.has(
            normalize(skill)
        )
    );
};

const isStepStarted = (
    roadmapStep,
    learningProgress
) => {
    const requiredSkills =
        getRoadmapStepSkills(roadmapStep);

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
            requiredSkillSet.has(
                normalize(skill)
            )
        );
    });
};

const getDurationInMinutes = (duration) => {
    if (!duration) return 0;

    const value = String(duration)
        .toLowerCase()
        .trim();

    const numberMatch = value.match(
        /\d+(\.\d+)?/
    );

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
    const hours = Math.floor(
        totalMinutes / 60
    );

    const minutes = totalMinutes % 60;

    if (hours === 0) {
        return `${minutes} min`;
    }

    if (minutes === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${minutes}min`;
};

export const getUserProgress = async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await User.findById(uid);

        if (!user) {
            return res.status(404).json({
                message: "User Not Found",
                status: 0
            });
        }

        const assessment =
            await CareerAssessment.findOne({
                userId: uid
            });

        const learningProgress =
            await UserLearningProgress.find({
                userId: uid
            }).sort({
                updatedAt: -1
            });

        const completedProgress =
            learningProgress.filter(
                item => item.status === "completed"
            );

        /*
         * Only completed learning skills are used
         * for roadmap completion.
         *
         * Assessment-selected skills are NOT
         * treated as completed learning.
         */
        const completedSkills = [
            ...new Set(
                completedProgress
                    .flatMap(
                        item => item.skills || []
                    )
                    .map(skill =>
                        String(skill).trim()
                    )
                    .filter(Boolean)
            )
        ];

        let roadmap = [];
        let careerProgress = 0;
        let careerName = "";

        if (assessment) {
            const interestKey = normalize(
                assessment.interest
            );

            /*
             * Find active career path using
             * normalized category matching.
             *
             * Example:
             * "Software Development"
             * and
             * "software-development"
             * will match.
             */
            const careerPaths =
                await CareerPath.find({
                    active: true
                });

            const careerPath =
                careerPaths.find(
                    career =>
                        normalize(
                            career.category
                        ) === interestKey
                );

            if (careerPath) {
                careerName =
                    careerPath.title;

                const careerRoadmap =
                    Array.isArray(
                        careerPath.roadmap
                    )
                        ? careerPath.roadmap
                        : [];

                if (careerRoadmap.length > 0) {
                    let previousIncomplete = false;

                    roadmap =
                        careerRoadmap.map(
                            (
                                step,
                                index
                            ) => {
                                const stepName =
                                    getRoadmapStepName(
                                        step
                                    );

                                const requiredSkills =
                                    getRoadmapStepSkills(
                                        step
                                    );

                                const completed =
                                    isStepCompleted(
                                        step,
                                        completedSkills
                                    );

                                const started =
                                    isStepStarted(
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
                                } else if (
                                    !previousIncomplete
                                ) {
                                    status =
                                        "Currently Learning";
                                }

                                if (!completed) {
                                    previousIncomplete =
                                        true;
                                }

                                return {
                                    name: stepName,
                                    skills:
                                        requiredSkills,
                                    order:
                                        index + 1,
                                    status
                                };
                            }
                        );

                    const completedSteps =
                        roadmap.filter(
                            item =>
                                item.status ===
                                "Completed"
                        ).length;

                    careerProgress =
                        Math.round(
                            (
                                completedSteps /
                                roadmap.length
                            ) * 100
                        );
                }
            }
        }

        /*
         * Completed learning content
         * for total learning time.
         */
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

        let totalMinutes = 0;

        completedContents.forEach(
            content => {
                totalMinutes +=
                    getDurationInMinutes(
                        content.duration
                    );
            }
        );

        const learningHours =
            formatLearningTime(
                totalMinutes
            );

        /*
         * Latest completed learning.
         */
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
                "Progress Fetched Successfully",
            status: 1,
            data: {
                careerName,
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
            "Progress Error:",
            error
        );

        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};