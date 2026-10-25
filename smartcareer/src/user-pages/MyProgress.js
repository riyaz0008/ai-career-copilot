import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const MyProgress = () => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                if (!user?._id) return;

                const response = await api.get(`/api/progress/${user._id}`);

                if (response.data.status === 1) {
                    setProgress(response.data.data);
                }
            } catch (error) {
                console.error("Progress Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center animate-pulse">
                        <span className="text-xl">📈</span>
                    </div>

                    <p className="text-slate-400">
                        Loading progress...
                    </p>
                </div>
            </div>
        );
    }

    if (!progress) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
                <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-3">
                            My Progress
                        </h2>

                        <p className="text-slate-400 mb-6">
                            Unable to load progress.
                        </p>

                        <Link
                            to="/user-dashboard"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl font-semibold transition"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
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
                            <span className="text-lg">📈</span>
                        </div>

                        <div>
                            <h1 className="text-lg md:text-xl font-bold">
                                AI Career Copilot
                            </h1>

                            <p className="text-xs md:text-sm text-slate-400">
                                My Progress
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
                                Career Development
                            </p>

                            <h1 className="text-3xl md:text-4xl font-bold">
                                My Progress
                            </h1>

                            <p className="text-slate-400 mt-2 max-w-2xl">
                                Track your career growth, learning progress
                                and completed skills.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500/30 transition">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-400 text-sm">
                                        Career Progress
                                    </p>

                                    <span className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                        📊
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold mt-4">
                                    {progress.careerProgress}%
                                </h2>

                                <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${progress.careerProgress}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 hover:border-emerald-500/30 transition">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-400 text-sm">
                                        Skills Completed
                                    </p>

                                    <span className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        ✓
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold mt-4">
                                    {progress.skillsCompleted}
                                </h2>

                                <p className="text-slate-500 text-sm mt-2">
                                    Skills completed through learning
                                </p>
                            </div>

                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 hover:border-violet-500/30 transition">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-400 text-sm">
                                        Learning Time
                                    </p>

                                    <span className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                        ⏱
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold mt-4">
                                    {progress.learningHours}
                                </h2>

                                <p className="text-slate-500 text-sm mt-2">
                                    Total completed learning
                                </p>
                            </div>

                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 hover:border-pink-500/30 transition">
                                <div className="flex items-center justify-between">
                                    <p className="text-slate-400 text-sm">
                                        Completed Learning
                                    </p>

                                    <span className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                                        🎓
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold mt-4">
                                    {progress.completedLearning}
                                </h2>

                                <p className="text-slate-500 text-sm mt-2">
                                    Learning items completed
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                                            Your Journey
                                        </p>

                                        <h2 className="text-xl font-semibold">
                                            Career Roadmap
                                        </h2>

                                        <p className="text-slate-400 text-sm mt-1">
                                            {progress.careerName ||
                                                "Complete your assessment to get a career roadmap"}
                                        </p>
                                    </div>

                                    <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold text-sm">
                                        {progress.careerProgress}%
                                    </span>
                                </div>

                                {progress.roadmap.length === 0 ? (
                                    <div className="text-center py-10 bg-slate-900/50 rounded-xl border border-slate-800/60">
                                        <div className="text-3xl mb-3">
                                            🗺️
                                        </div>

                                        <p className="text-slate-400">
                                            Complete your Career Assessment
                                            to see your roadmap.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {progress.roadmap.map((step) => (
                                            <div
                                                key={step.order}
                                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-900/70 transition"
                                            >
                                                <div
                                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold shrink-0 ${
                                                        step.status ===
                                                        "Completed"
                                                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                                            : step.status ===
                                                              "Currently Learning"
                                                            ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                                                            : "bg-slate-800 border border-slate-700 text-slate-500"
                                                    }`}
                                                >
                                                    {step.order}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-slate-200">
                                                        {step.name}
                                                    </h3>

                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {step.status}
                                                    </p>
                                                </div>

                                                <div className="shrink-0">
                                                    {step.status ===
                                                        "Completed" && (
                                                        <span className="text-emerald-400 text-sm font-medium">
                                                            ✓ Completed
                                                        </span>
                                                    )}

                                                    {step.status ===
                                                        "Currently Learning" && (
                                                        <span className="text-indigo-400 text-sm font-medium">
                                                            In Progress
                                                        </span>
                                                    )}

                                                    {step.status ===
                                                        "Upcoming" && (
                                                        <span className="text-slate-500 text-sm">
                                                            Upcoming
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6">
                                <div className="mb-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                                        Achievements
                                    </p>

                                    <h2 className="text-xl font-semibold">
                                        Completed Skills
                                    </h2>
                                </div>

                                {progress.completedSkills.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-3xl mb-3">
                                            🎯
                                        </div>

                                        <p className="text-slate-400 text-sm">
                                            No skills completed yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {progress.completedSkills.map(
                                            (skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm"
                                                >
                                                    ✓ {skill}
                                                </span>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 mt-6">
                            <div className="mb-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-1">
                                    Learning Activity
                                </p>

                                <h2 className="text-xl font-semibold">
                                    Recent Learning
                                </h2>
                            </div>

                            {progress.recentLearning.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-3xl mb-3">
                                        📚
                                    </div>

                                    <p className="text-slate-400 text-sm">
                                        No completed learning yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {progress.recentLearning.map((item) => (
                                        <div
                                            key={item._id}
                                            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-slate-900/70 border border-slate-800/70 rounded-xl hover:border-slate-700 transition"
                                        >
                                            <div>
                                                <h3 className="font-medium text-slate-200">
                                                    {item.title}
                                                </h3>

                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {item.skills.map(
                                                        (
                                                            skill,
                                                            index
                                                        ) => (
                                                            <span
                                                                key={index}
                                                                className="text-xs px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg"
                                                            >
                                                                {skill}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-left md:text-right shrink-0">
                                                <p className="text-emerald-400 text-sm font-medium">
                                                    ✓ Completed
                                                </p>

                                                <p className="text-slate-500 text-xs mt-1">
                                                    {item.duration}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyProgress;