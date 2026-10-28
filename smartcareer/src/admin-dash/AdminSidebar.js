import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const AdminSidebar = () => {
    const navigate = useNavigate();

    const menuItems = [
        {
            name: "Dashboard",
            path: "/admin-dashboard",
            icon: "📊"
        },
        {
            name: "Manage Users",
            path: "/admin-users",
            icon: "👥"
        },
        {
            name: "Assessments",
            path: "/admin-assessments",
            icon: "📝"
        },
        {
            name: "Assessment Questions",
            path: "/admin-questions",
            icon: "❓"
        },
        {
            name: "Career Paths",
            path: "/admin-career-paths",
            icon: "🎯"
        },
        {
            name: "Learning Content",
            path: "/admin/learning-content",
            icon: "📚"
        },
        {
            name: "Company Verification",
            path: "/admin-companies",
            icon: "🏢"
        },
        {
            name: "Job Approval",
            path: "/admin-job-approval",
            icon: "📋"
        },
        {
    name: "Interview Questions",
    path: "/admin-interview-questions",
    icon: "🎤"
},
        {
            name: "Settings",
            path: "/admin-settings",
            icon: "⚙️"
        }
    ];

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("user");
        localStorage.removeItem("loggedInUser");

        navigate("/login", { replace: true });
    };

    return (
        <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white">

            {/* Sidebar Header */}
            <div className="border-b border-slate-800 px-6 py-6">
                <h2 className="text-xl font-bold">
                    <span className="text-indigo-400">
                        AI Career
                    </span>
                    <span className="text-white">
                        {" "}Copilot
                    </span>
                </h2>

                <p className="mt-2 text-xs uppercase tracking-widest text-slate-500">
                    Admin Panel
                </p>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/admin-dashboard"}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition duration-200 ${
                                isActive
                                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/30"
                                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                            }`
                        }
                    >
                        <span
                            className="text-lg"
                            aria-hidden="true"
                        >
                            {item.icon}
                        </span>

                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="border-t border-slate-800 p-4">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                >
                    <span
                        className="text-lg"
                        aria-hidden="true"
                    >
                        🚪
                    </span>

                    <span>Logout</span>
                </button>
            </div>

        </aside>
    );
};

export default AdminSidebar;