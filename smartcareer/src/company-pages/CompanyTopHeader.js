import React from "react";
import { useNavigate } from "react-router-dom";

const CompanyTopHeader = ({ company }) => {
    const navigate = useNavigate();

    const companyName = company?.companyName || "Company";

    const handleLogout = () => {
        localStorage.removeItem("companyToken");
        localStorage.removeItem("company");
        navigate("/company-login", { replace: true });
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-950/90 px-5 py-4 shadow-md backdrop-blur-2xl sm:px-8">
            <div>
                <h2 className="text-lg font-extrabold tracking-tight text-white">
                    Company Dashboard
                </h2>
                <p className="mt-0.5 text-xs font-medium text-indigo-400">
                    Recruitment Management Portal
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900 px-3 py-2 sm:flex">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-sm font-bold text-white">
                        {companyName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <p className="max-w-40 truncate text-sm font-bold text-white">
                            {companyName}
                        </p>
                        <p className="text-xs capitalize text-emerald-400">
                            {company?.verificationStatus || "pending"}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/10"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default CompanyTopHeader;