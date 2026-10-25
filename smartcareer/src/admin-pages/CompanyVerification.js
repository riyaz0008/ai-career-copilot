import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const CompanyVerification = () => {
    const navigate = useNavigate();

    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("adminToken");

            const response = await api.get("/api/admin/companies", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const result = response.data;

            const companyList = Array.isArray(result.data)
                ? result.data
                : Array.isArray(result.companies)
                ? result.companies
                : [];

            setCompanies(companyList);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Companies load nahi ho sakin. Admin login aur backend route check karein."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const updateVerification = async (companyId, verificationStatus) => {
        try {
            setUpdatingId(companyId);
            setError("");
            setMessage("");

            const token = localStorage.getItem("adminToken");

            const response = await api.put(
                `/api/admin/companies/${companyId}/verification`,
                { status: verificationStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(
                response.data?.message ||
                `Company ${verificationStatus} successfully.`
            );

            await fetchCompanies();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Company status update nahi hua."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "approved":
                return "bg-green-500/10 text-green-400 border-green-500/30";

            case "rejected":
                return "bg-red-500/10 text-red-400 border-red-500/30";

            default:
                return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
        }
    };

    // Search by company name, email, contact, phone, website or status
    const filteredCompanies = companies.filter((company) => {
        const searchText = search.trim().toLowerCase();

        return (
            (company.companyName || "").toLowerCase().includes(searchText) ||
            (company.email || "").toLowerCase().includes(searchText) ||
            (company.contactName || "").toLowerCase().includes(searchText) ||
            (company.phone || "").toLowerCase().includes(searchText) ||
            (company.website || "").toLowerCase().includes(searchText) ||
            (company.verificationStatus || "pending")
                .toLowerCase()
                .includes(searchText)
        );
    });

    const pendingCompanies = companies.filter(
        (company) =>
            (company.verificationStatus || "pending") === "pending"
    ).length;

    const approvedCompanies = companies.filter(
        (company) => company.verificationStatus === "approved"
    ).length;

    const summaryCards = [
        {
            label: "Total Companies",
            value: companies.length,
            description: "All registered companies",
            icon: "🏢",
            color: "text-indigo-400",
            iconBg: "bg-indigo-500/10",
            borderColor: "border-indigo-500/20"
        },
        {
            label: "Pending Requests",
            value: pendingCompanies,
            description: "Awaiting admin review",
            icon: "⏳",
            color: "text-amber-400",
            iconBg: "bg-amber-500/10",
            borderColor: "border-amber-500/20"
        },
        {
            label: "Approved Companies",
            value: approvedCompanies,
            description: "Verified company accounts",
            icon: "✓",
            color: "text-green-400",
            iconBg: "bg-green-500/10",
            borderColor: "border-green-500/20"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 p-6 shadow-xl sm:p-8">
                    <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

                    <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                                Admin Panel
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Company Verification
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                                Review company registrations, verify business
                                details, and manage approval requests.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate("/admin-dashboard")}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-200 transition duration-200 hover:border-indigo-500 hover:bg-indigo-500/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            <span aria-hidden="true">←</span>
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Success Message */}
                {message && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
                        <span className="text-lg">✓</span>
                        <p>{message}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                        <span className="text-lg">!</span>
                        <p>{error}</p>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {summaryCards.map((item) => (
                        <div
                            key={item.label}
                            className={`group rounded-2xl border ${item.borderColor} bg-slate-900 p-5 transition duration-200 hover:-translate-y-1 hover:bg-slate-900/80 hover:shadow-lg sm:p-6`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">
                                        {item.label}
                                    </p>

                                    <p className={`mt-3 text-3xl font-bold ${item.color}`}>
                                        {item.value}
                                    </p>

                                    <p className="mt-2 text-xs text-slate-500">
                                        {item.description}
                                    </p>
                                </div>

                                <div
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg} text-xl ${item.color}`}
                                >
                                    {item.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Registered Companies */}
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">

                    {/* Table Header + Search Bar */}
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-800 px-5 py-5 sm:px-6 lg:flex-row lg:items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Registered Companies
                            </h2>

                            <p className="mt-1 text-sm text-slate-400">
                                Review company details and verification status.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search companies..."
                                    aria-label="Search companies"
                                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950 py-2.5 pl-10 pr-10 text-sm font-medium text-white shadow-inner outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:w-72"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        aria-label="Clear search"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 transition hover:text-white"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            <span className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-indigo-400">
                                {filteredCompanies.length} Companies
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
                            <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />

                            <p className="text-sm text-slate-400">
                                Loading companies...
                            </p>
                        </div>
                    ) : filteredCompanies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-3xl">
                                🏢
                            </div>

                            <h3 className="text-base font-semibold text-white">
                                {search
                                    ? "No Matching Companies"
                                    : "No Companies Found"}
                            </h3>

                            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                                {search
                                    ? "Try a different company name, email, contact person, phone number or status."
                                    : "No company registrations are available to review at the moment."}
                            </p>

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="mt-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left text-sm">

                                <thead className="bg-slate-800/70 text-xs uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold sm:px-6">
                                            Company
                                        </th>

                                        <th className="px-5 py-4 font-semibold">
                                            Contact
                                        </th>

                                        <th className="px-5 py-4 font-semibold">
                                            Website
                                        </th>

                                        <th className="px-5 py-4 font-semibold">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 font-semibold">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-800">
                                    {filteredCompanies.map((company) => {
                                        const status =
                                            company.verificationStatus || "pending";

                                        return (
                                            <tr
                                                key={company._id}
                                                className="transition duration-200 hover:bg-slate-800/40"
                                            >
                                                {/* Company Details */}
                                                <td className="px-5 py-5 sm:px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 font-bold text-indigo-300">
                                                            {company.companyName
                                                                ? company.companyName
                                                                      .charAt(0)
                                                                      .toUpperCase()
                                                                : "C"}
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-white">
                                                                {company.companyName || "—"}
                                                            </p>

                                                            <p className="mt-1 text-slate-400">
                                                                {company.email || "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact Details */}
                                                <td className="px-5 py-5">
                                                    <p className="font-medium text-slate-200">
                                                        {company.contactName || "—"}
                                                    </p>

                                                    <p className="mt-1 text-slate-400">
                                                        {company.phone || "—"}
                                                    </p>
                                                </td>

                                                {/* Website */}
                                                <td className="px-5 py-5">
                                                    {company.website ? (
                                                        <a
                                                            href={
                                                                /^https?:\/\//i.test(company.website)
                                                                    ? company.website
                                                                    : `https://${company.website}`
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 text-indigo-400 transition hover:text-indigo-300 hover:underline"
                                                        >
                                                            Visit website
                                                            <span aria-hidden="true">↗</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-500">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Verification Status */}
                                                <td className="px-5 py-5">
                                                    <span
                                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(status)}`}
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                        {status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-5">
                                                    {status === "pending" ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateVerification(
                                                                        company._id,
                                                                        "approved"
                                                                    )
                                                                }
                                                                disabled={updatingId !== null}
                                                                className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-400 transition hover:bg-green-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {updatingId === company._id
                                                                    ? "Updating..."
                                                                    : "Approve"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateVerification(
                                                                        company._id,
                                                                        "rejected"
                                                                    )
                                                                }
                                                                disabled={updatingId !== null}
                                                                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {updatingId === company._id
                                                                    ? "Updating..."
                                                                    : "Reject"}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-500">
                                                            No action required
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Note */}
                <p className="mt-5 text-center text-xs text-slate-500">
                    Company verification is managed by the administrator.
                </p>
            </div>
        </div>
    );
};

export default CompanyVerification;