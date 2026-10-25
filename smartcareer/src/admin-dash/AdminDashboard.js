import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopHeader from "./AdminTopHeader";
import api from "../api";

const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState({
        totalUsers: 0,
        assessmentsCompleted: 0,
        careerPaths: 0,
        assessmentQuestions: 0,
        recentUsers: [],
        recentAssessments: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get("/api/admin/dashboard");

            if (response.data.status === 1) {
                setDashboard(response.data.data);
            }
        } catch (error) {
            console.log("Dashboard Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getInitial = (firstname) => {
        return firstname ? firstname.charAt(0).toUpperCase() : "U";
    };

    const getFullName = (user) => {
        return `${user.firstname || ""} ${user.lastname || ""}`.trim();
    };

    const getTimeAgo = (date) => {
        if (!date) return "";

        const seconds = Math.floor(
            (new Date() - new Date(date)) / 1000
        );

        if (seconds < 60) {
            return "Just now";
        }

        const minutes = Math.floor(seconds / 60);

        if (minutes < 60) {
            return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        }

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {
            return `${hours} hour${hours > 1 ? "s" : ""} ago`;
        }

        const days = Math.floor(hours / 24);

        return `${days} day${days > 1 ? "s" : ""} ago`;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex selection:bg-indigo-500 selection:text-white">
            <AdminSidebar />

            <main className="flex-1 min-w-0">
                <AdminTopHeader />

                <div className="p-6 md:p-8">
                    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white mb-8 border border-slate-800/80 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                            <div>
                                <p className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                                    Welcome back 👋
                                </p>

                                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                                    Platform Overview
                                </h1>

                                <p className="text-slate-300 mt-2 max-w-xl text-sm md:text-base leading-relaxed">
                                    Monitor users, career assessments, learning content
                                    and overall platform activity from one place.
                                </p>
                            </div>

                            <div className="bg-slate-800/60 border border-slate-700/60 backdrop-blur-xl rounded-2xl p-5 text-center min-w-[150px] shadow-inner">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    System Status
                                </p>

                                <p className="text-sm font-bold mt-1 text-emerald-400 flex items-center justify-center gap-1.5">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                    Active
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Total Users
                                    </p>

                                    <h3 className="text-3xl font-black text-white mt-2">
                                        {loading ? "..." : dashboard.totalUsers}
                                    </h3>

                                    <p className="text-xs font-bold text-emerald-400 mt-2 inline-block bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                        Registered users
                                    </p>
                                </div>

                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl shadow-inner">
                                    👥
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Assessments Completed
                                    </p>

                                    <h3 className="text-3xl font-black text-white mt-2">
                                        {loading ? "..." : dashboard.assessmentsCompleted}
                                    </h3>

                                    <p className="text-xs font-bold text-emerald-400 mt-2 inline-block bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                        Completed assessments
                                    </p>
                                </div>

                                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl shadow-inner">
                                    📝
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Career Paths
                                    </p>

                                    <h3 className="text-3xl font-black text-white mt-2">
                                        {loading ? "..." : dashboard.careerPaths}
                                    </h3>

                                    <p className="text-xs font-bold text-indigo-400 mt-2 inline-block bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                                        Active paths
                                    </p>
                                </div>

                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl shadow-inner">
                                    💼
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Assessment Questions
                                    </p>

                                    <h3 className="text-3xl font-black text-white mt-2">
                                        {loading ? "..." : dashboard.assessmentQuestions}
                                    </h3>

                                    <p className="text-xs font-bold text-amber-400 mt-2 inline-block bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                                        Active questions
                                    </p>
                                </div>

                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shadow-inner">
                                    ❓
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-xl font-extrabold text-white mb-5 tracking-tight">
                        Quick Actions
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        <Link
                            to="/admin-users"
                            className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition group shadow-xl"
                        >
                            <div className="text-3xl mb-4 p-3 bg-indigo-500/10 rounded-2xl w-fit border border-indigo-500/20">
                                👥
                            </div>

                            <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition">
                                Manage Users
                            </h3>

                            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                                View and manage registered users.
                            </p>
                        </Link>
                        <Link
    to="/admin-interview-questions"
    className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/50 transition group shadow-xl"
>
    <div className="text-3xl mb-4 p-3 bg-indigo-500/10 rounded-2xl w-fit border border-indigo-500/20">
        🎤
    </div>

    <h3 className="font-bold text-white text-lg group-hover:text-indigo-300">
        Interview Questions
    </h3>

    <p className="text-sm text-slate-400 mt-1.5">
        Add and manage mixed mock interview MCQs.
    </p>
</Link>

                        <Link
                            to="/admin-questions"
                            className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition group shadow-xl"
                        >
                            <div className="text-3xl mb-4 p-3 bg-indigo-500/10 rounded-2xl w-fit border border-indigo-500/20">
                                ❓
                            </div>

                            <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition">
                                Manage Questions
                            </h3>

                            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                                Add, edit or delete assessment questions.
                            </p>
                        </Link>

                        <Link
                            to="/admin-career-paths"
                            className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition group shadow-xl"
                        >
                            <div className="text-3xl mb-4 p-3 bg-indigo-500/10 rounded-2xl w-fit border border-indigo-500/20">
                                💼
                            </div>

                            <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition">
                                Career Paths
                            </h3>

                            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                                Manage available career paths.
                            </p>
                        </Link>

                        <Link
                            to="/admin/learning-content"
                            className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition group shadow-xl"
                        >
                            <div className="text-3xl mb-4 p-3 bg-indigo-500/10 rounded-2xl w-fit border border-indigo-500/20">
                                📚
                            </div>

                            <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition">
                                Learning Content
                            </h3>

                            <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                                Manage courses and learning resources.
                            </p>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b border-slate-800/80">
                                <h2 className="font-extrabold text-white text-lg tracking-tight">
                                    Recent Users
                                </h2>

                                <Link
                                    to="/admin-users"
                                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                                >
                                    View All
                                </Link>
                            </div>

                            <div className="divide-y divide-slate-800/80">
                                {loading ? (
                                    <div className="p-6 text-center text-slate-400">
                                        Loading users...
                                    </div>
                                ) : dashboard.recentUsers.length === 0 ? (
                                    <div className="p-6 text-center text-slate-400">
                                        No users found.
                                    </div>
                                ) : (
                                    dashboard.recentUsers.map((user, index) => (
                                        <div
                                            key={user._id || index}
                                            className="p-6 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                                                    {getInitial(user.firstname)}
                                                </div>

                                                <div>
                                                    <p className="font-bold text-white text-sm">
                                                        {getFullName(user)}
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={`text-xs font-semibold px-3 py-1 rounded-xl ${
                                                    user.status === "inactive"
                                                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                }`}
                                            >
                                                {user.status || "Active"}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-slate-800/80">
                                <h2 className="font-extrabold text-white text-lg tracking-tight">
                                    Recent Activity
                                </h2>
                            </div>

                            <div className="divide-y divide-slate-800/80">
                                {loading ? (
                                    <div className="p-6 text-center text-slate-400">
                                        Loading activity...
                                    </div>
                                ) : (
                                    <>
                                        {dashboard.recentAssessments.length > 0 &&
                                            dashboard.recentAssessments.map(
                                                (assessment, index) => (
                                                    <div
                                                        key={
                                                            assessment._id ||
                                                            index
                                                        }
                                                        className="p-6 flex gap-4 items-start"
                                                    >
                                                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                                            📝
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-bold text-white">
                                                                New career
                                                                assessment
                                                                completed
                                                            </p>

                                                            <p className="text-xs text-slate-400 mt-1">
                                                                A user completed
                                                                the career
                                                                assessment.
                                                            </p>

                                                            <p className="text-xs text-slate-500 mt-2 font-medium">
                                                                {getTimeAgo(
                                                                    assessment.createdAt
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                        {dashboard.recentUsers.length > 0 &&
                                            dashboard.recentUsers
                                                .slice(0, 3)
                                                .map((user, index) => (
                                                    <div
                                                        key={
                                                            user._id ||
                                                            index
                                                        }
                                                        className="p-6 flex gap-4 items-start"
                                                    >
                                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                                            👤
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-bold text-white">
                                                                New user
                                                                registered
                                                            </p>

                                                            <p className="text-xs text-slate-400 mt-1">
                                                                {getFullName(
                                                                    user
                                                                )}{" "}
                                                                created an
                                                                account.
                                                            </p>

                                                            <p className="text-xs text-slate-500 mt-2 font-medium">
                                                                {getTimeAgo(
                                                                    user.createdAt
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}

                                        {dashboard.recentAssessments.length ===
                                            0 &&
                                            dashboard.recentUsers.length ===
                                                0 && (
                                                <div className="p-6 text-center text-slate-400">
                                                    No recent activity.
                                                </div>
                                            )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;