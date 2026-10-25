import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const CareerRoadmap = () => {
    const [roadmap, setRoadmap] = useState([]);
    const [careerTitle, setCareerTitle] = useState("");
    const [careerProgress, setCareerProgress] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id || user?.id;

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                if (!userId) {
                    setError(
                        "User session not found. Please login again."
                    );
                    setLoading(false);
                    return;
                }

                const response = await api.get(
                    `/api/learning-progress/${userId}`
                );

                const result = response.data;

                if (result.status !== 1) {
                    setError(
                        result.message ||
                        "Career roadmap not found."
                    );
                    return;
                }

                setCareerTitle(
                    result.data?.careerName || ""
                );

                setCareerProgress(
                    result.data?.careerProgress || 0
                );

                setRoadmap(
                    result.data?.roadmap || []
                );
            } catch (error) {
                console.error(
                    "Error fetching roadmap:",
                    error
                );

                setError(
                    "Unable to load career roadmap."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>

                    <p className="text-slate-400 mt-4">
                        Loading roadmap...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6">
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-10 text-center shadow-2xl max-w-md">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
                        🗺️
                    </div>

                    <h2 className="text-2xl font-bold mt-5">
                        Career Roadmap
                    </h2>

                    <p className="text-red-400 mt-3 mb-6">
                        {error}
                    </p>

                    <Link
                        to="/user-dashboard"
                        className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            <header className="bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/80 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold">
                            CR
                        </div>

                        <div>
                            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                                Career Roadmap
                            </h1>

                            <p className="text-xs text-slate-400 mt-1">
                                Your personalized career development path
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/user-dashboard"
                        className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 text-sm font-medium hover:bg-slate-800 hover:text-white hover:border-indigo-500/40 transition-all duration-200"
                    >
                        <span className="transition-transform group-hover:-translate-x-0.5">
                            ←
                        </span>

                        Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 md:px-8 py-10">
                <div className="mb-8">
                    <p className="text-indigo-400 text-sm font-bold uppercase tracking-wider mb-2">
                        Career Development
                    </p>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        Career Roadmap
                    </h1>

                    <p className="text-slate-400 mt-2">
                        Follow your personalized step-by-step learning path
                        to become a{" "}
                        <span className="text-white font-semibold">
                            {careerTitle || "your recommended career"}
                        </span>
                    </p>
                </div>

                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                    <div className="p-6 md:p-8">
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <p className="text-sm text-indigo-400 font-bold uppercase tracking-wider mb-2">
                                        Recommended Career
                                    </p>

                                    <h2 className="text-2xl font-extrabold text-white">
                                        {careerTitle || "Career Path"}
                                    </h2>

                                    <p className="text-slate-400 text-sm mt-2">
                                        Follow these skills step by step to
                                        reach your career goal.
                                    </p>
                                </div>

                                <div className="px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                                        Career Progress
                                    </p>

                                    <p className="text-sm text-indigo-400 font-bold mt-1">
                                        {careerProgress}%
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-400">
                                        Roadmap Progress
                                    </span>

                                    <span className="text-indigo-400 font-semibold">
                                        {careerProgress}%
                                    </span>
                                </div>

                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${careerProgress}%`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {roadmap.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">
                                No roadmap available.
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute left-5 top-5 bottom-5 w-px bg-slate-700"></div>

                                <div className="space-y-8">
                                    {roadmap.map((item, index) => {
                                        const status =
                                            item.status ||
                                            "Upcoming";

                                        const completed =
                                            status === "Completed";

                                        const current =
                                            status ===
                                            "Currently Learning";

                                        return (
                                            <div
                                                key={index}
                                                className="relative flex gap-5"
                                            >
                                                <div
                                                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold ${
                                                        completed
                                                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                                            : current
                                                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                                                            : "bg-slate-800 border border-slate-700 text-slate-400"
                                                    }`}
                                                >
                                                    {completed
                                                        ? "✓"
                                                        : index + 1}
                                                </div>

                                                <div
                                                    className={`flex-1 border rounded-2xl p-5 transition ${
                                                        completed
                                                            ? "bg-emerald-500/5 border-emerald-500/20"
                                                            : current
                                                            ? "bg-indigo-500/5 border-indigo-500/30"
                                                            : "bg-slate-900/70 border-slate-800"
                                                    }`}
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-white">
                                                                {item.name}
                                                            </h3>

                                                            {item.skills?.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mt-3">
                                                                    {item.skills.map(
                                                                        (
                                                                            skill,
                                                                            skillIndex
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    skillIndex
                                                                                }
                                                                                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300"
                                                                            >
                                                                                {
                                                                                    skill
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}

                                                            <p className="text-sm text-slate-400 mt-3">
                                                                {status}
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`text-xs px-3 py-1.5 rounded-lg w-fit font-semibold border ${
                                                                completed
                                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                    : current
                                                                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                                                    : "bg-slate-800 text-slate-400 border-slate-700"
                                                            }`}
                                                        >
                                                            {status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CareerRoadmap;