import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const AdminAssessments = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAssessments = async () => {
        try {
            const response = await api.get(
                "/api/admin/assessments"
            );

            if (response.data.status === 1) {
                setAssessments(response.data.data);
            }
        } catch (error) {
            console.log("Assessment Error:", error);

            if (error.response?.data?.message) {
                console.log(error.response.data.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAssessments();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            <div className="bg-slate-900/80 backdrop-blur-2xl border-b border-slate-800/80">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-7">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
                                📋
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                    User Assessments
                                </h1>
                                <p className="text-sm text-slate-400 mt-1">
                                    Review and manage completed career assessments.
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/admin-dashboard"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900 text-slate-300 font-bold text-sm hover:bg-slate-800 hover:text-indigo-400 hover:border-indigo-500/40 transition shadow-sm w-fit"
                        >
                            <span>←</span>
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 md:p-8">
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                    <div className="px-8 py-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-extrabold text-white tracking-tight">
                                Completed Assessments
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                View career interests, experience, work style and goals.
                            </p>
                        </div>

                        <span className="px-3.5 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold tracking-wide uppercase w-fit">
                            {assessments.length} Records
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto shadow-lg"></div>
                            <p className="text-slate-400 mt-4 text-sm font-medium">
                                Loading assessments...
                            </p>
                        </div>
                    ) : assessments.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 mx-auto bg-slate-800/80 border border-slate-700/60 rounded-3xl flex items-center justify-center text-4xl shadow-inner mb-4">
                                📋
                            </div>
                            <h3 className="text-lg font-bold text-white">
                                No assessments found
                            </h3>
                            <p className="text-slate-400 mt-1 text-sm">
                                Completed user assessments will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950/60 border-b border-slate-800/80">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            #
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Career Interest
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Experience
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Work Style
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Career Goal
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-800/80">
                                    {assessments.map((assessment, index) => (
                                        <tr
                                            key={assessment._id}
                                            className="hover:bg-slate-800/40 transition"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                            </td>

                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-semibold">
                                                    {assessment.interest}
                                                </span>
                                            </td>

                                            <td className="px-6 py-5 text-slate-200 font-semibold text-sm">
                                                {assessment.experience}
                                            </td>

                                            <td className="px-6 py-5 text-slate-300 text-sm">
                                                {assessment.workStyle}
                                            </td>

                                            <td className="px-6 py-5 text-slate-300 text-sm">
                                                {assessment.goal}
                                            </td>

                                            <td className="px-6 py-5">
                                                <Link
                                                    to={`/admin-assessments/${assessment._id}`}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
                                                >
                                                    View Details
                                                    <span>→</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAssessments;