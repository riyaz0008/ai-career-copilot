import React, { useEffect, useState } from "react";
import api from "../api";
import { Link, useParams } from "react-router-dom";

const normalizeSkill = (value) =>
    String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "");

const CareerPathDetails = () => {
    const { id } = useParams();

    const [career, setCareer] = useState(null);
    const [completedSkills, setCompletedSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCareerPath = async () => {
            try {
                setLoading(true);
                setError("");

                const user = JSON.parse(
                    localStorage.getItem("user")
                );

                const userId = user?._id;

                if (!userId) {
                    setError("User not found.");
                    return;
                }

                const [careerResponse, progressResponse] =
                    await Promise.all([
                        api.get(`/api/career-path/${id}`),
                        api.get(
                            `/api/learning-progress/${userId}`
                        )
                    ]);

                if (careerResponse.data.status === 1) {
                    setCareer(
                        careerResponse.data.data
                    );
                } else {
                    setError(
                        careerResponse.data.message ||
                        "Career Path not found."
                    );
                }

                if (progressResponse.data.status === 1) {
                    const progressData =
                        progressResponse.data.data || {};

                    const completed =
                        Array.isArray(
                            progressData.completedSkills
                        )
                            ? progressData.completedSkills
                            : [];

                    setCompletedSkills(completed);
                }
            } catch (error) {
                console.log(
                    "Career Path Error:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Career Path not found."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCareerPath();
    }, [id]);

    const isSkillCompleted = (value) => {
        const normalizedValue =
            normalizeSkill(value);

        return completedSkills.some(
            (skill) =>
                normalizeSkill(skill) ===
                normalizedValue
        );
    };

    const isRoadmapStepCompleted = (step) => {
        const requiredSkills = Array.isArray(
            step?.skills
        )
            ? step.skills
            : [];

        if (requiredSkills.length === 0) {
            return false;
        }

        return requiredSkills.every((skill) =>
            isSkillCompleted(skill)
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <p className="text-slate-400">
                    Loading Career Path...
                </p>
            </div>
        );
    }

    if (error || !career) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6">
                <h2 className="text-2xl font-bold text-red-400 mb-3">
                    Career Path Not Found
                </h2>

                <p className="text-slate-400 mb-6">
                    {error || "Unable to load career path."}
                </p>

                <Link
                    to="/career-recommendations"
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition"
                >
                    Back to Career Recommendations
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            <header className="bg-slate-900/90 backdrop-blur-2xl border-b border-slate-800/80 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-lg">🎯</span>
                        </div>

                        <div>
                            <h1 className="text-lg md:text-xl font-bold">
                                AI Career Copilot
                            </h1>

                            <p className="text-xs md:text-sm text-slate-400">
                                Career Path
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/career-recommendations"
                        className="px-4 py-2 rounded-xl border border-slate-700/80 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition font-medium text-sm"
                    >
                        ← Back to Career Recommendations
                    </Link>

                </div>
            </header>

            <div className="px-6 py-10">
                <div className="max-w-6xl mx-auto">

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

                            <div>
                                <p className="text-indigo-400 text-sm font-semibold uppercase tracking-wide mb-2">
                                    Career Path
                                </p>

                                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                    {career.title}
                                </h1>

                                <p className="text-slate-400 leading-relaxed max-w-3xl">
                                    {career.description}
                                </p>
                            </div>

                            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-5 py-4 min-w-[180px]">
                                <p className="text-xs text-slate-400 mb-1">
                                    Category
                                </p>

                                <p className="text-indigo-300 font-semibold">
                                    {career.category}
                                </p>
                            </div>

                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <p className="text-sm text-slate-400 mb-2">
                                Experience
                            </p>

                            <p className="font-semibold text-slate-200">
                                {career.experience || "Any"}
                            </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <p className="text-sm text-slate-400 mb-2">
                                Education
                            </p>

                            <p className="font-semibold text-slate-200">
                                {career.education || "Any Graduate"}
                            </p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <p className="text-sm text-slate-400 mb-2">
                                Work Style
                            </p>

                            <p className="font-semibold text-slate-200">
                                {Array.isArray(career.workStyle)
                                    ? career.workStyle.join(", ")
                                    : career.workStyle || "Not specified"}
                            </p>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-6">
                                Required Skills
                            </h2>

                            <div className="space-y-3">
                                {(career.skills || []).length > 0 ? (
                                    career.skills.map(
                                        (skill, index) => {
                                            const completed =
                                                isSkillCompleted(
                                                    skill
                                                );

                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between bg-slate-800/60 rounded-lg px-4 py-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                                                                completed
                                                                    ? "bg-emerald-600 text-white"
                                                                    : "bg-slate-700 text-slate-400"
                                                            }`}
                                                        >
                                                            {completed
                                                                ? "✓"
                                                                : "•"}
                                                        </div>

                                                        <span
                                                            className={
                                                                completed
                                                                    ? "text-emerald-300"
                                                                    : "text-slate-300"
                                                            }
                                                        >
                                                            {skill}
                                                        </span>
                                                    </div>

                                                    <span
                                                        className={`text-xs font-medium ${
                                                            completed
                                                                ? "text-emerald-400"
                                                                : "text-slate-500"
                                                        }`}
                                                    >
                                                        {completed
                                                            ? "Completed"
                                                            : "Improve"}
                                                    </span>
                                                </div>
                                            );
                                        }
                                    )
                                ) : (
                                    <p className="text-slate-500">
                                        No skills available.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-6">
                                Career Roadmap
                            </h2>

                            <div className="space-y-6">
                                {(career.roadmap || []).length > 0 ? (
                                    career.roadmap.map(
                                        (step, index) => {
                                            const completed =
                                                isRoadmapStepCompleted(
                                                    step
                                                );

                                            return (
                                                <div
                                                    key={index}
                                                    className="flex gap-4"
                                                >
                                                    <div
                                                        className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                                                            completed
                                                                ? "bg-emerald-600 text-white"
                                                                : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                                                        }`}
                                                    >
                                                        {completed
                                                            ? "✓"
                                                            : index + 1}
                                                    </div>

                                                    <div className="pt-1 flex-1">
                                                        <p
                                                            className={
                                                                completed
                                                                    ? "text-emerald-300 font-medium"
                                                                    : "text-slate-300 font-medium"
                                                            }
                                                        >
                                                            {step?.name ||
                                                                `Step ${index + 1}`}
                                                        </p>

                                                        {Array.isArray(
                                                            step?.skills
                                                        ) &&
                                                            step.skills.length >
                                                            0 && (
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    Skills:{" "}
                                                                    {step.skills.join(
                                                                        ", "
                                                                    )}
                                                                </p>
                                                            )}

                                                        <p
                                                            className={`text-xs mt-1 ${
                                                                completed
                                                                    ? "text-emerald-400"
                                                                    : "text-slate-500"
                                                            }`}
                                                        >
                                                            {completed
                                                                ? "Completed"
                                                                : "Improve"}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )
                                ) : (
                                    <p className="text-slate-500">
                                        No roadmap available.
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>

                    {career.scope && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
                            <h2 className="text-xl font-bold mb-3">
                                Career Scope
                            </h2>

                            <p className="text-slate-400 leading-relaxed">
                                {career.scope}
                            </p>
                        </div>
                    )}

                    {Array.isArray(career.goal) &&
                        career.goal.length > 0 && (
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6">
                                <h2 className="text-xl font-bold mb-4">
                                    Suitable Goals
                                </h2>

                                <div className="flex flex-wrap gap-2">
                                    {career.goal.map(
                                        (goal, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm"
                                            >
                                                {goal}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                </div>
            </div>
        </div>
    );
};

export default CareerPathDetails;