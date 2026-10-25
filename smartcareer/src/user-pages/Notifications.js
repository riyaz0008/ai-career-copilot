import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem("user"));

    const fetchNotifications = async () => {
        try {
            if (!user?._id) return;

            const response = await api.get(`/api/notifications/${user._id}`);

            if (response.data.status === 1) {
                setNotifications(response.data.data.notifications);
                setUnreadCount(response.data.data.unreadCount);
            }
        } catch (error) {
            console.error("Notifications Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            const response = await api.put(
                `/api/notifications/read/${id}`
            );

            if (response.data.status === 1) {
                setNotifications((prev) =>
                    prev.map((item) =>
                        item._id === id
                            ? { ...item, read: true }
                            : item
                    )
                );

                setUnreadCount((prev) => Math.max(prev - 1, 0));
            }
        } catch (error) {
            console.error("Read Notification Error:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await api.put(
                `/api/notifications/read-all/${user._id}`
            );

            if (response.data.status === 1) {
                setNotifications((prev) =>
                    prev.map((item) => ({
                        ...item,
                        read: true
                    }))
                );

                setUnreadCount(0);
            }
        } catch (error) {
            console.error("Mark All Read Error:", error);
        }
    };
    const getIcon = (type) => {
        if (type === "learning") return "📚";
        if (type === "assessment") return "🎯";
        if (type === "career") return "💼";
        if (type === "progress") return "📈";
        return "🔔";
    };

    const getTypeStyle = (type) => {
        if (type === "learning") {
            return "bg-blue-500/10 text-blue-400";
        }

        if (type === "assessment") {
            return "bg-violet-500/10 text-violet-400";
        }

        if (type === "career") {
            return "bg-emerald-500/10 text-emerald-400";
        }

        if (type === "progress") {
            return "bg-indigo-500/10 text-indigo-400";
        }

        return "bg-slate-700/50 text-slate-400";
    };

    const formatTime = (date) => {
        const now = new Date();
        const created = new Date(date);
        const seconds = Math.floor((now - created) / 1000);

        if (seconds < 60) return "Just now";

        const minutes = Math.floor(seconds / 60);

        if (minutes < 60) {
            return `${minutes} min ago`;
        }

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {
            return `${hours} hr ago`;
        }

        const days = Math.floor(hours / 24);

        if (days < 7) {
            return `${days} day${days > 1 ? "s" : ""} ago`;
        }

        return created.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">
                        Loading notifications...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="bg-slate-900 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">
                            AI Career Copilot
                        </h1>

                        <p className="text-sm text-slate-400">
                            Notifications
                        </p>
                    </div>

                    <Link
                        to="/user-dashboard"
                        className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 hover:text-white transition"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-5 md:px-8 py-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold">
                                Notifications
                            </h1>

                            {unreadCount > 0 && (
                                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        <p className="text-slate-400 mt-2">
                            Stay updated with your career and learning journey.
                        </p>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <span className="text-indigo-400 text-lg">
                                    ✓
                                </span>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-white">
                                    You have {unreadCount} unread{" "}
                                    {unreadCount === 1
                                        ? "notification"
                                        : "notifications"}
                                </p>

                                <p className="text-xs text-slate-500 mt-1">
                                    Mark them all as read when you're done.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={markAllAsRead}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all duration-200"
                        >
                            ✓ Mark all as read
                        </button>
                    </div>
                )}

                {notifications.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl py-20 px-6 text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-3xl mb-5">
                            🔔
                        </div>

                        <h2 className="text-xl font-semibold">
                            You're all caught up
                        </h2>

                        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                            You don't have any notifications right now.
                            We'll let you know when something important happens.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() =>
                                    !notification.read &&
                                    markAsRead(notification._id)
                                }
                                className={`relative flex gap-4 p-5 rounded-2xl border transition cursor-pointer ${
                                    notification.read
                                        ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                                        : "bg-indigo-500/[0.06] border-indigo-500/20 hover:border-indigo-500/30"
                                }`}
                            >
                                {!notification.read && (
                                    <span className="absolute top-5 right-5 w-2 h-2 rounded-full bg-indigo-500"></span>
                                )}

                                <div
                                    className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-xl ${getTypeStyle(
                                        notification.type
                                    )}`}
                                >
                                    {getIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0 pr-5">
                                    <div className="flex items-center gap-2">
                                        <h2
                                            className={`font-semibold ${
                                                notification.read
                                                    ? "text-slate-300"
                                                    : "text-white"
                                            }`}
                                        >
                                            {notification.title}
                                        </h2>

                                        {!notification.read && (
                                            <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">
                                                New
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                                        {notification.message}
                                    </p>

                                    <div className="flex items-center gap-3 mt-3">
                                        <span
                                            className={`text-xs px-2.5 py-1 rounded-md capitalize ${getTypeStyle(
                                                notification.type
                                            )}`}
                                        >
                                            {notification.type}
                                        </span>

                                        <span className="text-xs text-slate-600">
                                            {formatTime(
                                                notification.createdAt
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-center mt-8"></div>
            </main>
        </div>
    );
};

export default Notifications;