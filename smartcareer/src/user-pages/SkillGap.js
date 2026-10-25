import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const SkillGap = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id || user?.id;

    const normalizeSkill = (value) => {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "");
    };

    useEffect(() => {
        const fetchSkillGap = async () => {
            try {
                if (!userId) {
                    setError("User not found.");
                    setLoading(false);
                    return;
                }

                const [skillGapResponse, progressResponse] =
                    await Promise.all([
                        api.get(`/api/skill-gap/${userId}`),
                        api.get(`/api/learning-progress/${userId}`)
                    ]);

                if (skillGapResponse.data.status !== 1) {
                    setError(
                        skillGapResponse.data.message ||
                        "Unable to load skill gap."
                    );
                    return;
                }

                const skillGapData =
                    Array.isArray(skillGapResponse.data.data)
                        ? skillGapResponse.data.data
                        : [];

                const progressData =
                    progressResponse.data.status === 1
                        ? progressResponse.data.data
                        : {};

                const completedSkills =
                    Array.isArray(progressData.completedSkills)
                        ? progressData.completedSkills
                            .map(skill => normalizeSkill(skill))
                            .filter(Boolean)
                        : [];

                const updatedResults = skillGapData.map(career => {
                    const originalMatched =
                        career.matchedSkills || [];

                    const originalMissing =
                        career.missingSkills || [];

                    const completedMissing =
                        originalMissing.filter(skill =>
                            completedSkills.includes(
                                normalizeSkill(skill)
                            )
                        );

                    const remainingMissing =
                        originalMissing.filter(skill =>
                            !completedSkills.includes(
                                normalizeSkill(skill)
                            )
                        );

                    const updatedMatched = [
                        ...originalMatched
                    ];

                    completedMissing.forEach(skill => {
                        const alreadyMatched =
                            updatedMatched.some(
                                matchedSkill =>
                                    normalizeSkill(
                                        matchedSkill
                                    ) ===
                                    normalizeSkill(skill)
                            );

                        if (!alreadyMatched) {
                            updatedMatched.push(skill);
                        }
                    });

                    const totalSkills =
                        career.totalSkills ||
                        updatedMatched.length +
                        remainingMissing.length;

                    const skillPercentage =
                        totalSkills > 0
                            ? Math.round(
                                (
                                    updatedMatched.length /
                                    totalSkills
                                ) * 100
                            )
                            : 0;

                    return {
                        ...career,
                        matchedSkills: updatedMatched,
                        missingSkills: remainingMissing,
                        totalSkills,
                        skillPercentage
                    };
                });

                setResults(updatedResults);
            } catch (error) {
                console.error(
                    "Skill Gap Error:",
                    error.response?.data ||
                    error.message ||
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to load skill gap."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSkillGap();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center animate-pulse">
                        <span className="text-xl">📊</span>
                    </div>

                    <p className="text-slate-400">
                        Loading skill gap analysis...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
                <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                    <div className="p-8 text-center">
                        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <span className="text-2xl">⚠</span>
                        </div>

                        <h2 className="text-2xl font-bold mb-3">
                            Skill Gap Analysis
                        </h2>

                        <p className="text-red-400 mb-6">
                            {error}
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

    const primaryCareer = results[0];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <header className="bg-slate-900/90 backdrop-blur-2xl border-b border-slate-800/80 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-lg">📊</span>
                        </div>

                        <div>
                            <h1 className="text-lg md:text-xl font-bold">
                                AI Career Copilot
                            </h1>

                            <p className="text-xs md:text-sm text-slate-400">
                                Skill Gap Analysis
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
                                Skill Gap Analysis
                            </h1>

                            <p className="text-slate-400 mt-2 max-w-2xl">
                                Understand your current skills and identify
                                the skills you need to develop for your
                                recommended career paths.
                            </p>
                        </div>

                        {primaryCareer && (
                            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 mb-8">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
                                            Recommended Career
                                        </p>

                                        <h2 className="text-2xl md:text-3xl font-bold">
                                            {primaryCareer.careerTitle}
                                        </h2>

                                        <p className="text-slate-400 mt-2">
                                            Your current skill match for this
                                            career.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-5">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 flex flex-col items-center justify-center">
                                            <div className="text-2xl font-bold text-indigo-400">
                                                {primaryCareer.skillPercentage}%
                                            </div>

                                            <p className="text-[10px] uppercase tracking-wider text-slate-500">
                                                Match
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {primaryCareer && (
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-5">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                                                Your Strengths
                                            </p>

                                            <h2 className="text-xl font-bold">
                                                Matched Skills
                                            </h2>
                                        </div>

                                        <span className="min-w-9 h-9 px-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                                            {primaryCareer.matchedSkills.length}
                                        </span>
                                    </div>

                                    {primaryCareer.matchedSkills.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {primaryCareer.matchedSkills.map(
                                                (skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium"
                                                    >
                                                        ✓ {skill}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500">
                                            No matched skills found.
                                        </p>
                                    )}
                                </div>

                                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-5">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-1">
                                                Areas to Improve
                                            </p>

                                            <h2 className="text-xl font-bold">
                                                Missing Skills
                                            </h2>
                                        </div>

                                        <span className="min-w-9 h-9 px-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold flex items-center justify-center">
                                            {primaryCareer.missingSkills.length}
                                        </span>
                                    </div>

                                    {primaryCareer.missingSkills.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {primaryCareer.missingSkills.map(
                                                (skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl text-sm font-medium"
                                                    >
                                                        + {skill}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-emerald-400 font-medium">
                                            ✓ You have all required skills.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-800/80">
                                <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                                    Overview
                                </p>

                                <h2 className="text-xl font-bold">
                                    Career-wise Skill Gap
                                </h2>
                            </div>

                            <div className="divide-y divide-slate-800/80">
                                {results.length > 0 ? (
                                    results.map(career => (
                                        <div
                                            key={career.careerId}
                                            className="p-6"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-lg">
                                                        {career.careerTitle}
                                                    </h3>

                                                    <p className="text-sm text-slate-500 mt-1">
                                                        {
                                                            career.matchedSkills
                                                                .length
                                                        }{" "}
                                                        matched •{" "}
                                                        {
                                                            career.missingSkills
                                                                .length
                                                        }{" "}
                                                        missing
                                                    </p>
                                                </div>

                                                <span className="text-indigo-400 font-bold text-lg">
                                                    {career.skillPercentage}%
                                                </span>
                                            </div>

                                            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2.5 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${career.skillPercentage}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-slate-500">
                                            No career skill gap data available.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Link
                                to="/learning-resources"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition"
                            >
                                Improve Missing Skills
                                <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SkillGap;