import React, { useEffect, useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";

const AdminSettings = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("adminUser"));

    const [activeTab, setActiveTab] = useState("profile");
    const [showPassword, setShowPassword] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        firstname: "",
        lastname: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const fetchAdminSettings = async () => {
            if (!user?._id) {
                setError("Admin not found. Please login again.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(
                    `/api/admin/settings/${user._id}`
                );

                if (response.data.status === 1) {
                    const data = response.data.data;

                    setFormData({
                        name: `${data.firstname || ""} ${data.lastname || ""}`.trim(),
                        email: data.email || "",
                        firstname: data.firstname || "",
                        lastname: data.lastname || "",
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: ""
                    });
                } else {
                    setError(response.data.message);
                }
            } catch (error) {
                console.error("Admin Settings Error:", error);
                setError("Unable to load admin settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchAdminSettings();
    }, [user?._id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setSaved(false);
        setError("");
    };

    const handleSaveProfile = async () => {
        if (!user?._id) {
            setError("Admin not found. Please login again.");
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
                `/api/admin/settings/${user._id}`,
                {
                    firstname,
                    lastname,
                    email: formData.email
                }
            );

            if (response.data.status === 1) {
                const updatedAdmin = response.data.data;

                setFormData({
                    ...formData,
                    name: `${updatedAdmin.firstname || ""} ${updatedAdmin.lastname || ""}`.trim(),
                    email: updatedAdmin.email || "",
                    firstname: updatedAdmin.firstname || "",
                    lastname: updatedAdmin.lastname || ""
                });

                localStorage.setItem(
                    "adminUser",
                    JSON.stringify(updatedAdmin)
                );

                setSaved(true);

                setTimeout(() => {
                    setSaved(false);
                }, 3000);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error("Admin Profile Error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to update admin profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!user?._id) {
            setError("Admin not found. Please login again.");
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
                `/api/admin/settings/password/${user._id}`,
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
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error("Admin Password Error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to change password."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">

            <div className="bg-slate-900/90 backdrop-blur-2xl border-b border-slate-800/80">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div className="flex items-center gap-4">

                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
                                ⚙️
                            </div>

                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                    Admin Settings
                                </h1>

                                <p className="text-sm text-slate-400 mt-1">
                                    Manage your admin account and security
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

            <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-12 text-center shadow-2xl">

                        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>

                        <p className="text-slate-400 mt-4 text-sm font-medium">
                            Loading admin settings...
                        </p>

                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                        <div className="lg:col-span-1">

                            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-3 shadow-xl lg:sticky lg:top-6">

                                <button
                                    onClick={() => setActiveTab("profile")}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition ${
                                        activeTab === "profile"
                                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                                >
                                    <span className="text-lg">
                                        👤
                                    </span>

                                    <span className="font-bold text-sm">
                                        Admin Profile
                                    </span>
                                </button>

                                <button
                                    onClick={() => setActiveTab("security")}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition mt-1 ${
                                        activeTab === "security"
                                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }`}
                                >
                                    <span className="text-lg">
                                        🔐
                                    </span>

                                    <span className="font-bold text-sm">
                                        Change Password
                                    </span>
                                </button>

                                <div className="border-t border-slate-800/80 my-3"></div>

                                <button
                                    onClick={() => setActiveTab("logout")}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition ${
                                        activeTab === "logout"
                                            ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/20"
                                            : "text-rose-400 hover:bg-rose-500/10"
                                    }`}
                                >
                                    <span className="text-lg">
                                        🚪
                                    </span>

                                    <span className="font-bold text-sm">
                                        Logout
                                    </span>
                                </button>

                            </div>
                        </div>

                        <div className="lg:col-span-3">

                            {activeTab === "profile" && (
                                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative">

                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                                    <div className="p-6 md:p-8">

                                        <div className="flex items-center gap-4 mb-7">

                                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl">
                                                👤
                                            </div>

                                            <div>
                                                <h2 className="text-xl font-black text-white">
                                                    Admin Profile
                                                </h2>

                                                <p className="text-sm text-slate-400 mt-1">
                                                    Update your admin account information
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
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                    Email Address
                                                </label>

                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                                />
                                            </div>

                                        </div>

                                        <div className="mt-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">

                                            <div className="flex gap-3">
                                                <span className="text-indigo-400">
                                                    ℹ️
                                                </span>

                                                <p className="text-sm text-slate-400">
                                                    Update your name and email address used for the admin account.
                                                </p>
                                            </div>

                                        </div>

                                        <div className="flex justify-end mt-6">

                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-600/30"
                                            >
                                                {saving
                                                    ? "Saving..."
                                                    : "Save Changes"}
                                            </button>

                                        </div>

                                    </div>
                                </div>
                            )}

                            {activeTab === "security" && (
                                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative">

                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                                    <div className="p-6 md:p-8">

                                        <div className="flex items-center gap-4 mb-7">

                                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl">
                                                🔐
                                            </div>

                                            <div>
                                                <h2 className="text-xl font-black text-white">
                                                    Change Password
                                                </h2>

                                                <p className="text-sm text-slate-400 mt-1">
                                                    Update your admin account password
                                                </p>
                                            </div>

                                        </div>

                                        <div className="space-y-5">

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                    Current Password
                                                </label>

                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleChange}
                                                    placeholder="Enter current password"
                                                    className="w-full px-4 py-3.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                    New Password
                                                </label>

                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    placeholder="Enter new password"
                                                    className="w-full px-4 py-3.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                    Confirm New Password
                                                </label>

                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    placeholder="Confirm new password"
                                                    className="w-full px-4 py-3.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                                />
                                            </div>

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

                                        <div className="mt-7 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">

                                            <p className="text-sm text-amber-400">
                                                💡 Use a strong password with at least 6 characters.
                                            </p>

                                        </div>

                                        <div className="flex justify-end mt-6">

                                            <button
                                                onClick={handleChangePassword}
                                                disabled={saving}
                                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-600/30"
                                            >
                                                {saving
                                                    ? "Updating..."
                                                    : "Update Password"}
                                            </button>

                                        </div>

                                    </div>
                                </div>
                            )}

                            {activeTab === "logout" && (
                                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative">

                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-red-500"></div>

                                    <div className="p-6 md:p-8">

                                        <div className="flex items-center gap-4 mb-7">

                                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-2xl">
                                                🚪
                                            </div>

                                            <div>
                                                <h2 className="text-xl font-black text-white">
                                                    Logout
                                                </h2>

                                                <p className="text-sm text-slate-400 mt-1">
                                                    Sign out from your admin account
                                                </p>
                                            </div>

                                        </div>

                                        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl">

                                            <p className="text-slate-300">
                                                Are you sure you want to logout from the Admin Dashboard?
                                            </p>

                                            <p className="text-sm text-slate-500 mt-2">
                                                You will need to login again to access the admin panel.
                                            </p>

                                        </div>

                                        <div className="flex justify-end mt-6">

                                            <button
                                                onClick={handleLogout}
                                                className="px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-rose-600/20"
                                            >
                                                Logout
                                            </button>

                                        </div>

                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>

            {saved && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 bg-slate-900 border border-emerald-500/30 text-emerald-400 rounded-2xl shadow-2xl backdrop-blur-xl">

                    <span className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        ✓
                    </span>

                    <span className="font-bold text-sm">
                        Settings saved successfully
                    </span>

                </div>
            )}

        </div>
    );
};

export default AdminSettings;