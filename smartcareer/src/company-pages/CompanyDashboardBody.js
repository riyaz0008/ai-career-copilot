import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const CompanyDashboardBody = ({ company }) => {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const status = company?.verificationStatus || "pending";

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (status !== "approved") {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const [jobsResponse, applicationsResponse] =
                    await Promise.all([
                        api.get("/api/company/jobs"),
                        api.get("/api/company/applications")
                    ]);

                if (jobsResponse.data?.status === 1) {
                    setJobs(jobsResponse.data.data || []);
                }

                if (applicationsResponse.data?.status === 1) {
                    setApplications(
                        applicationsResponse.data.data || []
                    );
                }
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load dashboard statistics."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [status]);

    const dashboardCards = [
        {
            title: "Verification Status",
            value:
                status === "approved"
                    ? "Approved"
                    : status === "rejected"
                        ? "Rejected"
                        : "Pending",
            description: "Company account verification",
            icon: "✓",
            color:
                status === "approved"
                    ? "text-emerald-400"
                    : status === "rejected"
                        ? "text-rose-400"
                        : "text-amber-400"
        },
        {
            title: "Jobs Posted",
            value: loading ? "..." : jobs.length,
            description: "Your job listings",
            icon: "💼",
            color: "text-indigo-400"
        },
        {
            title: "Applications",
            value: loading ? "..." : applications.length,
            description: "Candidates who applied",
            icon: "👥",
            color: "text-violet-400"
        },
        {
            title: "Company Profile",
            value: company?.companyName ? "Ready" : "Incomplete",
            description: "Registered company details",
            icon: "🏢",
            color: "text-blue-400"
        }
    ];

    const quickActions = [
        {
            title: "Post a Job",
            description:
                "Create a job opportunity with responsibilities, required skills, salary and location.",
            icon: "＋",
            color: "indigo",
            action: () => navigate("/company-post-job"),
            buttonText: "Create Job Posting"
        },
        {
            title: "Manage Jobs",
            description:
                "View your job listings and manage their details and status.",
            icon: "💼",
            color: "violet",
            action: () => navigate("/company-manage-jobs"),
            buttonText: "View My Jobs"
        },
        {
            title: "Manage Applications",
            description:
                "Review candidate applications, download resumes and schedule interviews.",
            icon: "📋",
            color: "cyan",
            action: () => navigate("/company-applications"),
            buttonText: "Review Applications"
        },
        {
            title: "Company Profile",
            description:
                "Update your company information, contact details and website.",
            icon: "🏢",
            color: "blue",
            action: () => navigate("/company-profile"),
            buttonText: "Update Profile"
        }
    ];

    return (
        <div className="min-h-[calc(100vh-73px)] bg-slate-950 p-5 text-slate-100 selection:bg-indigo-500 selection:text-white sm:p-8">

            {/* Welcome Section */}
            <section className="relative mb-8 overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl sm:p-8">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-400">
                            Welcome to your portal 👋
                        </p>

                        <h1 className="mb-3 text-3xl font-black tracking-tight sm:text-4xl">
                            Hello, {company?.companyName || "Company"}!
                        </h1>

                        <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                            Manage your company profile, create job opportunities
                            and connect with career-ready candidates.
                        </p>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3">
                        <span
                            className={`h-2.5 w-2.5 rounded-full ${
                                status === "approved"
                                    ? "bg-emerald-400"
                                    : status === "rejected"
                                        ? "bg-rose-400"
                                        : "bg-amber-400"
                            }`}
                        />

                        <span className="text-sm font-semibold capitalize">
                            {status}
                        </span>
                    </div>
                </div>
            </section>

            {/* API Error */}
            {error && (
                <div
                    role="alert"
                    className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"
                >
                    {error}

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="ml-3 font-semibold underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Statistics */}
            {status === "approved" && (
                <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {dashboardCards.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-indigo-500/40"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm text-slate-400">
                                    {item.title}
                                </p>

                                <span className="text-xl">
                                    {item.icon}
                                </span>
                            </div>

                            <h2
                                className={`mt-4 text-2xl font-black ${item.color}`}
                            >
                                {item.value}
                            </h2>

                            <p className="mt-2 text-xs text-slate-500">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </section>
            )}

            {/* Pending / Rejected Message */}
            {status !== "approved" && (
                <section className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
                    <h2 className="text-xl font-bold text-amber-400">
                        {status === "rejected"
                            ? "Company Registration Rejected"
                            : "Approval Pending"}
                    </h2>

                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                        {status === "rejected"
                            ? "Your company registration has been rejected. Please contact the administrator for further information."
                            : "Your company account is waiting for admin approval. Job posting features will be available after approval."}
                    </p>
                </section>
            )}

            {/* Quick Actions */}
            {status === "approved" && (
                <section className="mb-8">
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-white">
                            Quick Actions
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Manage your recruitment activities from one place.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {quickActions.map((item) => (
                            <div
                                key={item.title}
                                className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-indigo-500/50 hover:bg-slate-900/80"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-2xl text-indigo-300">
                                    {item.icon}
                                </div>

                                <h3 className="text-lg font-bold text-white">
                                    {item.title}
                                </h3>

                                <p className="mt-2 min-h-12 text-sm leading-relaxed text-slate-400">
                                    {item.description}
                                </p>

                                <button
                                    type="button"
                                    onClick={item.action}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:from-indigo-500 hover:to-violet-500"
                                >
                                    {item.buttonText}
                                    <span aria-hidden="true">→</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Company Information */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold">
                            Company Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Your registered company details.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/company-profile")}
                        className="w-fit rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-indigo-500 hover:bg-slate-700"
                    >
                        Edit Profile →
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Company Name
                        </p>

                        <p className="mt-2 break-words font-medium text-white">
                            {company?.companyName || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Contact Person
                        </p>

                        <p className="mt-2 break-words font-medium text-white">
                            {company?.contactName || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Email Address
                        </p>

                        <p className="mt-2 break-words font-medium text-white">
                            {company?.email || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Phone Number
                        </p>

                        <p className="mt-2 break-words font-medium text-white">
                            {company?.phone || "Not provided"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Website
                        </p>

                        {company?.website ? (
                            <a
                                href={
                                    company.website.startsWith("http")
                                        ? company.website
                                        : `https://${company.website}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-block break-all text-indigo-400 hover:text-indigo-300"
                            >
                                {company.website}
                            </a>
                        ) : (
                            <p className="mt-2 text-white">
                                Not provided
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Verification Status
                        </p>

                        <p
                            className={`mt-2 font-semibold capitalize ${
                                status === "approved"
                                    ? "text-emerald-400"
                                    : status === "rejected"
                                        ? "text-rose-400"
                                        : "text-amber-400"
                            }`}
                        >
                            {status}
                        </p>
                    </div>

                    {company?.description && (
                        <div className="sm:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Company Description
                            </p>

                            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-slate-300">
                                {company.description}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CompanyDashboardBody;