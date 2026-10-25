import React from "react";
import { NavLink } from "react-router-dom";

const CompanySidebar = () => {
    const menuItems = [
        {
            name: "Dashboard",
            path: "/company-dashboard",
            icon: "🏠",
            end: true
        },
        {
            name: "Post a Job",
            path: "/company-post-job",
            icon: "➕"
        },
        {
            name: "Manage Jobs",
            path: "/company-manage-jobs",
            icon: "💼"
        },
        {
            name: "Manage Applications",
            path: "/company-applications",
            icon: "📋"
        },
        {
            name: "Offer Status",
            path: "/company-offer-change-requests",
            icon: "🤝"
        },
        {
            name: "Company Profile",
            path: "/company-profile",
            icon: "🏢"
        }
    ];

    return (
        <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r border-slate-800/80 bg-slate-950 text-slate-200">

            {/* Sidebar Header */}
            <div className="border-b border-slate-800/80 bg-slate-900/40 px-6 py-6">
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                    AI Career Copilot
                </h1>

                <p className="mt-1 text-xs font-medium text-indigo-400">
                    Company Portal
                </p>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end || false}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                                isActive
                                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold text-white shadow-lg shadow-indigo-600/25"
                                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                            }`
                        }
                    >
                        <span className="text-lg">
                            {item.icon}
                        </span>

                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="border-t border-slate-800/80 p-4">
                <p className="text-xs leading-5 text-slate-500">
                    Manage your recruitment activities from one place.
                </p>
            </div>
        </aside>
    );
};

export default CompanySidebar;