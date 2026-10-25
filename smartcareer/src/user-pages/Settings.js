import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const Settings = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const [activeTab, setActiveTab] = useState("general");
    const [showPassword, setShowPassword] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [notifications, setNotifications] = useState({
        learningReminders: true,
        assessmentUpdates: true,
        jobAlerts: false
    });

    const [darkMode, setDarkMode] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        firstname: "",
        lastname: "",
        education: "",
        career: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user?._id) {
                setError("User not found. Please login again.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/api/settings/${user._id}`);

                if (response.data.status === 1) {
                    const data = response.data.data;

                    setFormData({
                        name: `${data.firstname || ""} ${data.lastname || ""}`.trim(),
                        email: data.email || "",
                        firstname: data.firstname || "",
                        lastname: data.lastname || "",
                        education: data.education || "",
                        career: data.career || "",
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: ""
                    });
                }
            } catch (error) {
                console.error("Settings Fetch Error:", error);
                setError("Unable to load account settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [user?._id]);

    useEffect(() => {
        const fetchNotificationPreferences = async () => {
            if (!user?._id) return;

            try {
                const response = await api.get(
                    `/api/notification-preferences/${user._id}`
                );

                if (response.data.status === 1) {
                    const data = response.data.data;

                    setNotifications({
                        learningReminders: data.learningReminders ?? true,
                        assessmentUpdates: data.assessmentUpdates ?? true,
                        jobAlerts: data.jobAlerts ?? false
                    });
                }
            } catch (error) {
                console.error(
                    "Notification Preferences Error:",
                    error
                );
            }
        };

        fetchNotificationPreferences();
    }, [user?._id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setSaved(false);
        setError("");
    };

    const handleChangePassword = async () => {
        if (!user?._id) {
            setError("User not found. Please login again.");
            return;
        }

        if (
            !formData.currentPassword ||
            !formData.newPassword ||
            !formData.confirmPassword
        ) {
            setError("Please fill all password fields.");
            return;
        }

        if (formData.newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const response = await api.put(
                `/api/settings/password/${user._id}`,
                {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                    confirmPassword: formData.confirmPassword
                }
            );

            if (response.data.status === 1) {
                setFormData({
                    ...formData,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });

                setSaved(true);

                setTimeout(() => {
                    setSaved(false);
                }, 3000);
            }
        } catch (error) {
            console.error("Change Password Error:", error);

            setError(
                error.response?.data?.message ||
                    "Unable to change password."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!user?._id) {
            setError("User not found. Please login again.");
            return;
        }

        if (!formData.name.trim()) {
            setError("Please enter your full name.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const nameParts = formData.name.trim().split(" ");
            const firstname = nameParts.shift() || "";
            const lastname = nameParts.join(" ") || "";

            const response = await api.put(
                `/api/settings/${user._id}`,
                {
                    firstname,
                    lastname,
                    email: formData.email,
                    education: formData.education,
                    career: formData.career
                }
            );

            if (response.data.status === 1) {
                const updatedUser = response.data.data;

                setFormData({
                    ...formData,
                    name: `${updatedUser.firstname || ""} ${updatedUser.lastname || ""}`.trim(),
                    email: updatedUser.email || "",
                    firstname: updatedUser.firstname || "",
                    lastname: updatedUser.lastname || "",
                    education: updatedUser.education || "",
                    career: updatedUser.career || ""
                });

                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                );

                setSaved(true);

                setTimeout(() => {
                    setSaved(false);
                }, 3000);
            }
        } catch (error) {
            console.error("Settings Save Error:", error);

            setError(
                error.response?.data?.message ||
                    "Unable to save account settings."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotifications = async () => {
        if (!user?._id) {
            setError("User not found. Please login again.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const response = await api.put(
                `/api/notification-preferences/${user._id}`,
                notifications
            );

            if (response.data.status === 1) {
                setSaved(true);

                setTimeout(() => {
                    setSaved(false);
                }, 3000);
            }
        } catch (error) {
            console.error(
                "Save Notification Preferences Error:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to save notification preferences."
            );
        } finally {
            setSaving(false);
        }
    };

    const toggleNotification = (name) => {
        setNotifications({
            ...notifications,
            [name]: !notifications[name]
        });

        setSaved(false);
    };

    const tabs = [
        {
            id: "general",
            icon: "⚙️",
            label: "General"
        },
        {
            id: "security",
            icon: "🔐",
            label: "Security"
        },
        {
            id: "notifications",
            icon: "🔔",
            label: "Notifications"
        },
        {
            id: "appearance",
            icon: "🎨",
            label: "Appearance"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <header className="bg-slate-900/90 backdrop-blur-2xl border-b border-slate-800/80 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-lg">⚙️</span>
                        </div>

                        <div>
                            <h1 className="text-lg md:text-xl font-bold">
                                Settings
                            </h1>

                            <p className="text-xs md:text-sm text-slate-400">
                                Manage your account and preferences
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
                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-12 text-center shadow-2xl">
                        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>

                        <p className="text-slate-400 mt-4">
                            Loading your settings...
                        </p>
                    </div>
                ) : (
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                        <div className="p-6 md:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-1">
                                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 lg:sticky lg:top-24">
                                        <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                            Account Settings
                                        </p>

                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() =>
                                                    setActiveTab(tab.id)
                                                }
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition mt-1 ${
                                                    activeTab === tab.id
                                                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/10"
                                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                                }`}
                                            >
                                                <span className="text-lg">
                                                    {tab.icon}
                                                </span>

                                                <span className="font-medium">
                                                    {tab.label}
                                                </span>
                                            </button>
                                        ))}

                                        <div className="border-t border-slate-800 my-3"></div>

                                        <Link
                                            to="/my-profile"
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
                                        >
                                            <span className="text-lg">
                                                👤
                                            </span>

                                            <span className="font-medium">
                                                My Profile
                                            </span>
                                        </Link>
                                    </div>
                                </div>

                                <div className="lg:col-span-3">
                                    {activeTab === "general" && (
                                        <div className="space-y-6">
                                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 md:p-8">
                                                <div className="flex items-center gap-4 mb-7">
                                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl">
                                                        👤
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                                                            Profile
                                                        </p>

                                                        <h2 className="text-xl font-semibold">
                                                            Account Information
                                                        </h2>

                                                        <p className="text-sm text-slate-400">
                                                            Update your basic
                                                            account details
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                            Full Name
                                                        </label>

                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={
                                                                formData.name
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                            Email Address
                                                        </label>

                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={
                                                                formData.email
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                            Education
                                                        </label>

                                                        <input
                                                            type="text"
                                                            name="education"
                                                            value={
                                                                formData.education
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                            Career
                                                        </label>

                                                        <input
                                                            type="text"
                                                            name="career"
                                                            value={
                                                                formData.career
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                                    <div className="flex gap-3">
                                                        <span className="text-indigo-400">
                                                            ℹ️
                                                        </span>

                                                        <p className="text-sm text-slate-400">
                                                            Your account
                                                            information is
                                                            used to personalize
                                                            your career
                                                            recommendations
                                                            and learning
                                                            experience.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end mt-6">
                                                    <button
                                                        onClick={handleSave}
                                                        disabled={saving}
                                                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 rounded-xl font-semibold transition shadow-lg shadow-indigo-500/20"
                                                    >
                                                        {saving
                                                            ? "Saving..."
                                                            : "Save Changes"}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 md:p-8">
                                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                                                    Account
                                                </p>

                                                <h2 className="text-xl font-semibold">
                                                    Account Status
                                                </h2>

                                                <p className="text-sm text-slate-400 mt-1 mb-6">
                                                    Current status of your
                                                    Career Copilot account
                                                </p>

                                                <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                            <span className="text-emerald-400">
                                                                ✓
                                                            </span>
                                                        </div>

                                                        <div>
                                                            <p className="font-medium">
                                                                Account Active
                                                            </p>

                                                            <p className="text-sm text-slate-500">
                                                                Your account is
                                                                currently active
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        Active
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "security" && (
                                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 md:p-8">
                                            <div className="flex items-center gap-4 mb-7">
                                                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl">
                                                    🔐
                                                </div>

                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
                                                        Account Protection
                                                    </p>

                                                    <h2 className="text-xl font-semibold">
                                                        Security
                                                    </h2>

                                                    <p className="text-sm text-slate-400">
                                                        Manage your password
                                                        and account security
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-5">
                                                {[
                                                    {
                                                        name: "currentPassword",
                                                        label: "Current Password",
                                                        placeholder:
                                                            "Enter current password"
                                                    },
                                                    {
                                                        name: "newPassword",
                                                        label: "New Password",
                                                        placeholder:
                                                            "Enter new password"
                                                    },
                                                    {
                                                        name: "confirmPassword",
                                                        label: "Confirm New Password",
                                                        placeholder:
                                                            "Confirm new password"
                                                    }
                                                ].map((field) => (
                                                    <div key={field.name}>
                                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                            {field.label}
                                                        </label>

                                                        <input
                                                            type={
                                                                showPassword
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            name={field.name}
                                                            value={
                                                                formData[
                                                                    field.name
                                                                ]
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            placeholder={
                                                                field.placeholder
                                                            }
                                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                                        />
                                                    </div>
                                                ))}

                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={showPassword}
                                                        onChange={() =>
                                                            setShowPassword(
                                                                !showPassword
                                                            )
                                                        }
                                                        className="w-4 h-4 accent-indigo-600"
                                                    />

                                                    <span className="text-sm text-slate-400">
                                                        Show passwords
                                                    </span>
                                                </label>
                                            </div>

                                            <div className="mt-7 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                                                <p className="text-sm text-yellow-400">
                                                    💡 Use a strong password
                                                    containing uppercase
                                                    letters, lowercase letters,
                                                    numbers and special
                                                    characters.
                                                </p>
                                            </div>

                                            <div className="flex justify-end mt-6">
                                                <button
                                                    onClick={
                                                        handleChangePassword
                                                    }
                                                    disabled={saving}
                                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 rounded-xl font-semibold transition shadow-lg shadow-indigo-500/20"
                                                >
                                                    {saving
                                                        ? "Updating..."
                                                        : "Update Password"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "notifications" && (
                                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 md:p-8">
                                            <div className="flex items-center gap-4 mb-7">
                                                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl">
                                                    🔔
                                                </div>

                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-1">
                                                        Preferences
                                                    </p>

                                                    <h2 className="text-xl font-semibold">
                                                        Notification Preferences
                                                    </h2>

                                                    <p className="text-sm text-slate-400">
                                                        Choose what updates you
                                                        want to receive
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {[
                                                    {
                                                        key: "learningReminders",
                                                        title: "Learning Reminders",
                                                        desc: "Get reminders about your pending learning content"
                                                    },
                                                    {
                                                        key: "assessmentUpdates",
                                                        title: "Assessment Updates",
                                                        desc: "Receive notifications when your career assessment is completed or updated"
                                                    },
                                                    {
                                                        key: "jobAlerts",
                                                        title: "Job Alerts",
                                                        desc: "Get notifications about relevant job opportunities"
                                                    }
                                                ].map((item) => (
                                                    <div
                                                        key={item.key}
                                                        className="flex items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition"
                                                    >
                                                        <div>
                                                            <h3 className="font-medium text-white">
                                                                {item.title}
                                                            </h3>

                                                            <p className="text-sm text-slate-500 mt-1">
                                                                {item.desc}
                                                            </p>
                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                toggleNotification(
                                                                    item.key
                                                                )
                                                            }
                                                            className={`relative w-12 h-6 rounded-full transition flex-shrink-0 ${
                                                                notifications[
                                                                    item.key
                                                                ]
                                                                    ? "bg-gradient-to-r from-indigo-600 to-violet-600"
                                                                    : "bg-slate-700"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${
                                                                    notifications[
                                                                        item.key
                                                                    ]
                                                                        ? "left-7"
                                                                        : "left-1"
                                                                }`}
                                                            ></span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-end mt-6">
                                                <button
                                                    onClick={
                                                        handleSaveNotifications
                                                    }
                                                    disabled={saving}
                                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 rounded-xl font-semibold transition shadow-lg shadow-indigo-500/20"
                                                >
                                                    {saving
                                                        ? "Saving..."
                                                        : "Save Preferences"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "appearance" && (
                                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 md:p-8">
                                            <div className="flex items-center gap-4 mb-7">
                                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl">
                                                    🎨
                                                </div>

                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
                                                        Interface
                                                    </p>

                                                    <h2 className="text-xl font-semibold">
                                                        Appearance
                                                    </h2>

                                                    <p className="text-sm text-slate-400">
                                                        Customize how Career
                                                        Copilot looks
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <h3 className="font-medium">
                                                            Dark Mode
                                                        </h3>

                                                        <p className="text-sm text-slate-500 mt-1">
                                                            Use the dark
                                                            interface
                                                            throughout the
                                                            dashboard
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() =>
                                                            setDarkMode(
                                                                !darkMode
                                                            )
                                                        }
                                                        className={`relative w-12 h-6 rounded-full transition ${
                                                            darkMode
                                                                ? "bg-gradient-to-r from-indigo-600 to-violet-600"
                                                                : "bg-slate-700"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${
                                                                darkMode
                                                                    ? "left-7"
                                                                    : "left-1"
                                                            }`}
                                                        ></span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-6">
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                                    Interface Preview
                                                </p>

                                                <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
                                                    <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                                                    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
                                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center">
                                                            AI
                                                        </div>

                                                        <div>
                                                            <p className="font-medium text-sm">
                                                                AI Career
                                                                Copilot
                                                            </p>

                                                            <p className="text-xs text-slate-500">
                                                                Smart Career
                                                                Guidance
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-5">
                                                        <div className="h-20 rounded-xl bg-slate-900 border border-slate-800"></div>
                                                        <div className="h-20 rounded-xl bg-slate-900 border border-slate-800"></div>
                                                        <div className="h-20 rounded-xl bg-slate-900 border border-slate-800"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end mt-6">
                                                <button
                                                    onClick={handleSave}
                                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl font-semibold transition shadow-lg shadow-indigo-500/20"
                                                >
                                                    Save Appearance
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {saved && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 bg-emerald-600 text-white rounded-xl shadow-2xl">
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                        ✓
                    </span>

                    <span className="font-medium">
                        Settings saved successfully
                    </span>
                </div>
            )}
        </div>
    );
};

export default Settings;