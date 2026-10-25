import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const LearningResources = () => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [learning, setLearning] = useState({});

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id || user?.id;

    const normalize = (value) => {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "");
    };

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await api.get("/api/learning-content");

                if (response.data.status === 1) {
                    setContent(response.data.data);
                } else {
                    setError(response.data.message);
                }
            } catch (error) {
                console.log("Learning Content Error:", error);
                setError("Unable to load learning resources.");
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    const getDurationInSeconds = (duration) => {
        const value = parseInt(duration);

        if (!value || value <= 0) return 60;

        const text = String(duration).toLowerCase();

        if (text.includes("hour")) {
            return value * 60 * 60;
        }

        if (text.includes("min")) {
            return value * 60;
        }

        if (text.includes("sec")) {
            return value;
        }

        return value * 60;
    };

    const formatTime = (seconds) => {
        const safeSeconds = Math.max(0, seconds);

        const hours = Math.floor(safeSeconds / 3600);
        const minutes = Math.floor((safeSeconds % 3600) / 60);
        const remainingSeconds = safeSeconds % 60;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
        )}:${String(remainingSeconds).padStart(2, "0")}`;
    };

    const startLearning = async (item) => {
        try {
            if (!userId) {
                alert("User session not found. Please login again.");
                return;
            }

            const response = await api.post(
                "/api/learning-progress/start",
                {
                    userId,
                    learningContentId: item._id
                }
            );

            if (response.data.status === 1) {
                const progressData = response.data.data;

                const totalSeconds = getDurationInSeconds(item.duration);

                const startedAt = progressData.startedAt
                    ? new Date(progressData.startedAt).getTime()
                    : Date.now();

                const elapsedSeconds = Math.floor(
                    (Date.now() - startedAt) / 1000
                );

                const remainingSeconds = Math.max(
                    0,
                    totalSeconds - elapsedSeconds
                );

                setLearning((prev) => ({
                    ...prev,
                    [item._id]: {
                        started: true,
                        remaining: remainingSeconds,
                        completed: progressData.status === "completed",
                        startedAt
                    }
                }));

                window.open(
                    item.url,
                    "_blank",
                    "noopener,noreferrer"
                );
            }
        } catch (error) {
            console.log("Start Learning Error:", error);
            alert("Unable to start learning.");
        }
    };

    const completeLearning = async (item) => {
        try {
            if (!userId) {
                alert("User session not found. Please login again.");
                return;
            }

            const currentProgress = learning[item._id];

            if (!currentProgress || currentProgress.remaining > 0) {
                alert("Please complete the learning duration first.");
                return;
            }

            const response = await api.post(
                "/api/learning-progress/complete",
                {
                    userId,
                    learningContentId: item._id
                }
            );

            if (response.data.status === 1) {
                setLearning((prev) => ({
                    ...prev,
                    [item._id]: {
                        ...prev[item._id],
                        completed: true,
                        remaining: 0
                    }
                }));

                alert("Learning Completed Successfully!");
            }
        } catch (error) {
            console.log("Complete Learning Error:", error);
            alert("Unable to complete learning.");
        }
    };

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                if (!userId || content.length === 0) return;

                const response = await api.get(
                    `/api/learning-progress/${userId}`
                );

                if (response.data.status !== 1) return;

                const progressData = response.data.data || {};

                const completedSkills = Array.isArray(
                    progressData.completedSkills
                )
                    ? progressData.completedSkills
                    : [];

                const completedLearning = Array.isArray(
                    progressData.completedLearning
                )
                    ? progressData.completedLearning
                    : [];

                const completedSkillSet = new Set(
                    completedSkills
                        .map((skill) => normalize(skill))
                        .filter(Boolean)
                );

                const progressList = {};

                content.forEach((item) => {
                    const itemSkills = Array.isArray(item.skills)
                        ? item.skills
                        : [];

                    const learningRecord = completedLearning.find(
                        (progress) => {
                            const progressContentId =
                                progress.learningContentId?._id ||
                                progress.learningContentId;

                            return (
                                String(progressContentId) ===
                                String(item._id)
                            );
                        }
                    );

                    const hasCompletedSkill = itemSkills.some(
                        (skill) =>
                            completedSkillSet.has(
                                normalize(skill)
                            )
                    );

                    if (learningRecord || hasCompletedSkill) {
                        progressList[item._id] = {
                            started: true,
                            remaining: 0,
                            completed: true,
                            startedAt: learningRecord?.startedAt
                                ? new Date(
                                      learningRecord.startedAt
                                  ).getTime()
                                : null
                        };
                    }
                });

                setLearning(progressList);
            } catch (error) {
                console.log(
                    "Learning Progress Error:",
                    error.response?.data || error.message
                );
            }
        };

        fetchProgress();
    }, [userId, content]);

    useEffect(() => {
        const timer = setInterval(() => {
            setLearning((prev) => {
                const updated = { ...prev };

                Object.keys(updated).forEach((id) => {
                    const current = updated[id];

                    if (
                        current.started &&
                        !current.completed &&
                        current.remaining > 0
                    ) {
                        updated[id] = {
                            ...current,
                            remaining: current.remaining - 1
                        };
                    }
                });

                return updated;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center animate-pulse">
                        <span className="text-xl">📚</span>
                    </div>

                    <p className="text-slate-400">
                        Loading learning resources...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <header className="bg-slate-900/90 backdrop-blur-2xl border-b border-slate-800/80 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-lg">📚</span>
                        </div>

                        <div>
                            <h1 className="text-lg md:text-xl font-bold">
                                AI Career Copilot
                            </h1>

                            <p className="text-xs md:text-sm text-slate-400">
                                Learning Resources
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/user-dashboard"
                        className="px-4 py-2 rounded-xl border border-slate-700/80 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition font-medium text-sm"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 md:px-8 py-8">
                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                    <div className="p-6 md:p-8">
                        <div className="mb-8">
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                                Skill Development
                            </p>

                            <h1 className="text-3xl md:text-4xl font-bold">
                                Learning Resources
                            </h1>

                            <p className="text-slate-400 mt-2 max-w-2xl">
                                Improve your skills with recommended learning
                                content and track your learning progress.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 mb-6">
                                {error}
                            </div>
                        )}

                        {content.length === 0 ? (
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-10 text-center">
                                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
                                    <span className="text-2xl">📚</span>
                                </div>

                                <h2 className="text-xl font-semibold mb-2">
                                    No Learning Resources Available
                                </h2>

                                <p className="text-slate-400">
                                    New learning resources will be added soon.
                                </p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {content.map((item) => {
                                    const progress = learning[item._id];

                                    return (
                                        <div
                                            key={item._id}
                                            className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                                        >
                                            <div className="flex justify-between items-start gap-3 mb-5">
                                                <span className="text-xs px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
                                                    {item.category}
                                                </span>

                                                <span className="text-xs text-slate-500 uppercase tracking-wider">
                                                    {item.type}
                                                </span>
                                            </div>

                                            <h2 className="text-xl font-bold mb-3">
                                                {item.title}
                                            </h2>

                                            <p className="text-sm text-slate-400 leading-6 mb-5">
                                                {item.description}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-5">
                                                {(item.skills || []).map(
                                                    (skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg"
                                                        >
                                                            {skill}
                                                        </span>
                                                    )
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-5">
                                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                                                        Level
                                                    </p>

                                                    <p className="text-sm font-semibold text-slate-200">
                                                        {item.level}
                                                    </p>
                                                </div>

                                                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                                                        Duration
                                                    </p>

                                                    <p className="text-sm font-semibold text-slate-200">
                                                        {item.duration}
                                                    </p>
                                                </div>
                                            </div>

                                            {!progress?.started ? (
                                                <button
                                                    onClick={() =>
                                                        startLearning(item)
                                                    }
                                                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl py-2.5 font-semibold transition shadow-lg shadow-indigo-500/10"
                                                >
                                                    Start Learning
                                                </button>
                                            ) : progress.completed ? (
                                                <button
                                                    disabled
                                                    className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl py-2.5 font-semibold cursor-not-allowed"
                                                >
                                                    ✓ Completed
                                                </button>
                                            ) : progress.remaining > 0 ? (
                                                <button
                                                    disabled
                                                    className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-xl py-2.5 font-semibold cursor-not-allowed"
                                                >
                                                    Learning in progress:{" "}
                                                    {formatTime(
                                                        progress.remaining
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        completeLearning(item)
                                                    }
                                                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl py-2.5 font-semibold transition shadow-lg shadow-emerald-500/10"
                                                >
                                                    Complete Learning
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LearningResources;