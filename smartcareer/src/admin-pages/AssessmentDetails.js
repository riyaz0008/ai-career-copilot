import React, { useEffect, useState } from "react";
import api from "../api";
import { Link, useParams } from "react-router-dom";

const AssessmentDetails = () => {
    const { aid } = useParams();
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);

    const getAssessment = async () => {
        try {
            const response = await api.get(
                `/api/admin/assessments/${aid}`
            );
            if (response.data.status === 1) {
                setAssessment(response.data.data);
            }
        } catch (error) {
            console.log("Assessment Details Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAssessment();
    }, [aid]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto shadow-lg"></div>
                    <p className="text-slate-400 mt-4 text-sm font-medium">Loading assessment...</p>
                </div>
            </div>
        );
    }

    if (!assessment) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-10 text-center max-w-md">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-3xl shadow-inner">
                        !
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight mt-6">
                        Assessment not found
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm">
                        The requested assessment could not be found.
                    </p>
                    <Link
                        to="/admin-assessments"
                        className="inline-block mt-8 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition"
                    >
                        Back to Assessments
                    </Link>
                </div>
            </div>
        );
    }

    const firstName = assessment.userId?.firstname || "User";
    const lastName = assessment.userId?.lastname || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const initial = firstName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            <div className="bg-slate-900/80 backdrop-blur-2xl border-b border-slate-800/80">
                <div className="max-w-6xl mx-auto px-6 md:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                                Career Assessment
                            </p>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                Assessment Details
                            </h1>
                            <p className="text-sm text-slate-400 mt-0.5">
                                Review the user's completed career assessment.
                            </p>
                        </div>
                        <Link
                            to="/admin-assessments"
                            className="px-5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-300 font-bold text-xs hover:bg-slate-800 hover:text-indigo-400 transition shadow-sm w-fit"
                        >
                            ← Back to Assessments
                        </Link>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto p-6 md:p-8">
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden mb-8 relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 px-8 py-8 border-b border-slate-800/80">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-500/30">
                                    {initial}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
                                        Assessment Submitted By
                                    </p>
                                    <h2 className="text-2xl font-black text-white tracking-tight">
                                        {fullName}
                                    </h2>
                                </div>
                            </div>
                            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl px-5 py-3 shadow-inner">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Assessment ID
                                </p>
                                <p className="text-xs text-slate-200 font-mono mt-1 break-all">
                                    {assessment._id}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Full Name
                            </p>
                            <p className="text-white font-bold mt-1 text-sm">
                                {fullName}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Email Address
                            </p>
                            <p className="text-white font-bold mt-1 text-sm break-all">
                                {assessment.userId?.email || "Not available"}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Submitted On
                            </p>
                            <p className="text-white font-bold mt-1 text-sm">
                                {assessment.createdAt
                                    ? new Date(assessment.createdAt).toLocaleDateString(
                                          "en-IN",
                                          {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric"
                                          }
                                      )
                                    : "Not available"}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-xl p-7">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg shadow-inner">
                                🎯
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Career Interest
                                </p>
                                <h3 className="text-base font-bold text-white tracking-tight">
                                    Interest
                                </h3>
                            </div>
                        </div>
                        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl px-5 py-3.5 shadow-inner">
                            <p className="text-slate-200 font-semibold text-sm">
                                {assessment.interest || "Not provided"}
                            </p>
                        </div>
                    </div>
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-xl p-7">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-lg shadow-inner">
                                📊
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Experience Level
                                </p>
                                <h3 className="text-base font-bold text-white tracking-tight">
                                    Experience
                                </h3>
                            </div>
                        </div>
                        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl px-5 py-3.5 shadow-inner">
                            <p className="text-slate-200 font-semibold text-sm">
                                {assessment.experience || "Not provided"}
                            </p>
                        </div>
                    </div>
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-xl p-7">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg shadow-inner">
                                💻
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Existing Skills
                                </p>
                                <h3 className="text-base font-bold text-white tracking-tight">
                                    Skills
                                </h3>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {assessment.skills?.length > 0 ? (
                                assessment.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3.5 py-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-semibold shadow-sm"
                                    >
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-slate-500 text-sm italic">
                                    No skills provided
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-xl p-7">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-lg shadow-inner">
                                🤝
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Preferred Work Style
                                </p>
                                <h3 className="text-base font-bold text-white tracking-tight">
                                    Work Style
                                </h3>
                            </div>
                        </div>
                        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl px-5 py-3.5 shadow-inner">
                            <p className="text-slate-200 font-semibold text-sm">
                                {assessment.workStyle || "Not provided"}
                            </p>
                        </div>
                    </div>
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-xl p-7 md:col-span-2">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg shadow-inner">
                                🚀
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Career Objective
                                </p>
                                <h3 className="text-base font-bold text-white tracking-tight">
                                    Career Goal
                                </h3>
                            </div>
                        </div>
                        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl px-5 py-4 shadow-inner">
                            <p className="text-slate-200 font-semibold text-sm leading-relaxed">
                                {assessment.goal || "Not provided"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentDetails;