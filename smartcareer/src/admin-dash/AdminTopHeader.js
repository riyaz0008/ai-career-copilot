import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const AdminTopHeader = () => {
    const navigate = useNavigate();
    const menuRef = useRef(null);

    const [showMenu, setShowMenu] = useState(false);

    const [adminData, setAdminData] = useState({
        firstname: "",
        lastname: "",
        email: ""
    });

    useEffect(() => {
        const admin = localStorage.getItem("adminUser");

        if (admin) {
            const data = JSON.parse(admin);

            setAdminData({
                firstname: data.firstname || "",
                lastname: data.lastname || "",
                email: data.email || ""
            });
        }
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    const adminName =
        `${adminData.firstname} ${adminData.lastname}`.trim() || "Admin";

    const adminInitial =
        adminData.firstname
            ? adminData.firstname.charAt(0).toUpperCase()
            : "A";

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        navigate("/login");
    };

    return (
        <header className="bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/80 px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-40">

            <div>
                <h2 className="text-lg font-extrabold text-white tracking-tight">
                    Admin Dashboard
                </h2>

                <p className="text-xs text-slate-400 mt-0.5">
                    Manage your AI Career Copilot platform
                </p>
            </div>

            <div className="flex items-center gap-5">

                <div className="h-6 w-px bg-slate-800"></div>

                <div
                    ref={menuRef}
                    className="relative"
                >

                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 transition"
                    >

                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 text-sm">
                            {adminInitial}
                        </div>

                        <div className="hidden sm:block text-left">

                            <p className="text-sm font-bold text-white leading-tight">
                                {adminName}
                            </p>

                            <p className="text-xs text-indigo-400 font-medium">
                                Administrator
                            </p>

                        </div>

                        <span
                            className={`text-slate-400 text-xs transition-transform ${
                                showMenu ? "rotate-180" : ""
                            }`}
                        >
                            ▼
                        </span>

                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-3 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">

                            <div className="px-4 py-4 border-b border-slate-800">

                                <div className="flex items-center gap-3">

                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold">
                                        {adminInitial}
                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-sm font-semibold text-white truncate">
                                            {adminName}
                                        </p>

                                        <p className="text-xs text-slate-400 truncate">
                                            {adminData.email}
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <Link
                                to="/admin-settings"
                                onClick={() => setShowMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition"
                            >

                                <span className="text-lg">
                                    ⚙️
                                </span>

                                <div>
                                    <p className="text-sm font-medium">
                                        Settings
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        Admin account settings
                                    </p>
                                </div>

                            </Link>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition border-t border-slate-800"
                            >

                                <span className="text-lg">
                                    🚪
                                </span>

                                <div className="text-left">

                                    <p className="text-sm font-medium">
                                        Logout
                                    </p>

                                    <p className="text-xs text-red-400/60">
                                        Sign out from admin account
                                    </p>

                                </div>

                            </button>

                        </div>
                    )}

                </div>

            </div>

        </header>
    );
};

export default AdminTopHeader;