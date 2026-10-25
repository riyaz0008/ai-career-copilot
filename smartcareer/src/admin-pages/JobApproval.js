import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const JobApproval = () => {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [filter, setFilter] = useState("Pending");
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [selectedJob, setSelectedJob] = useState(null);

    const getAuthConfig = () => {
        let token = localStorage.getItem("token");

        if (!token) {
            try {
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                token = user.token || user.data?.token;
            } catch {
                token = null;
            }
        }

        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/api/admin/jobs",
                getAuthConfig()
            );

            if (response.data.status === 1) {
                setJobs(response.data.data || []);
            } else {
                setError(response.data.message || "Failed to fetch jobs.");
            }
        } catch (err) {
            console.error("Fetch Admin Jobs Error:", err);
            setError(
                err.response?.data?.message ||
                "Unable to load jobs. Please check your admin login."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleApproval = async (jobId, approvalStatus) => {
        const action =
            approvalStatus === "Approved"
                ? "approve"
                : approvalStatus === "Rejected"
                ? "reject"
                : "return to pending";

        if (!window.confirm(`Are you sure you want to ${action} this job?`)) {
            return;
        }

        try {
            setUpdatingId(jobId);
            setMessage("");
            setError("");

            const response = await api.put(
                `/api/admin/jobs/${jobId}/approval`,
                { approvalStatus },
                getAuthConfig()
            );

            if (response.data.status === 1) {
                setMessage(
                    response.data.message || `Job ${action} successfully.`
                );

                await fetchJobs();

                setSelectedJob((current) => {
                    if (!current || current._id !== jobId) {
                        return current;
                    }

                    return {
                        ...current,
                        approvalStatus
                    };
                });
            } else {
                setError(response.data.message || "Unable to update job.");
            }
        } catch (err) {
            console.error("Job Approval Error:", err);
            setError(
                err.response?.data?.message ||
                "Failed to update job approval."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredJobs = jobs.filter((job) => {
        const status = job.approvalStatus || "Pending";
        const company =
            job.companyId && typeof job.companyId === "object"
                ? job.companyId
                : {};

        const searchText = search.trim().toLowerCase();

        const searchableFields = [
            job.title,
            company.companyName,
            company.email,
            company.contactName,
            company.phone,
            job.location,
            job.jobType,
            job.department,
            job.workMode,
            job.experience,
            job.education,
            job.description,
            status,
            job.status
        ];

        const matchesSearch =
            !searchText ||
            searchableFields.some((value) =>
                String(value || "").toLowerCase().includes(searchText)
            );

        return matchesSearch && (filter === "All" || status === filter);
    });

    const getStatusStyle = (status) => {
        if (status === "Approved") {
            return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
        }

        if (status === "Rejected") {
            return "border-red-500/30 bg-red-500/10 text-red-400";
        }

        return "border-amber-500/30 bg-amber-500/10 text-amber-400";
    };

    const formatDate = (date) => {
        if (!date) return "Not provided";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not provided";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const getCount = (status) => {
        if (status === "All") return jobs.length;

        return jobs.filter(
            (job) => (job.approvalStatus || "Pending") === status
        ).length;
    };

    const summaryCards = [
        {
            title: "Pending Jobs",
            count: getCount("Pending"),
            icon: "⏳",
            color: "amber"
        },
        {
            title: "Approved Jobs",
            count: getCount("Approved"),
            icon: "✓",
            color: "emerald"
        },
        {
            title: "Rejected Jobs",
            count: getCount("Rejected"),
            icon: "✕",
            color: "red"
        }
    ];

    const filters = ["Pending", "Approved", "Rejected", "All"];

    const formatSalary = (job) => {
        if (job.salaryMin == null && job.salaryMax == null) {
            return "Not specified";
        }

        const minimum =
            job.salaryMin != null
                ? `₹${Number(job.salaryMin).toLocaleString("en-IN")}`
                : "Not specified";

        const maximum =
            job.salaryMax != null
                ? `₹${Number(job.salaryMax).toLocaleString("en-IN")}`
                : "Not specified";

        return `${minimum} - ${maximum}`;
    };

    const DetailItem = ({ label, value }) => (
        <div className="min-w-0 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
            <p className="text-[11px] text-slate-500">{label}</p>
            <p className="mt-1 break-words text-sm font-medium text-slate-200">
                {value || "Not specified"}
            </p>
        </div>
    );

    const closeModal = () => {
        if (updatingId) return;
        setSelectedJob(null);
    };

    useEffect(() => {
        if (!selectedJob) return;

        const handleEscape = (event) => {
            if (event.key === "Escape" && !updatingId) {
                setSelectedJob(null);
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () => document.removeEventListener("keydown", handleEscape);
    }, [selectedJob, updatingId]);

    const selectedCompany =
        selectedJob?.companyId &&
        typeof selectedJob.companyId === "object"
            ? selectedJob.companyId
            : {};

    const selectedStatus = selectedJob?.approvalStatus || "Pending";

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">

            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/90">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xl">
                            💼
                        </div>

                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
                                AI Career Copilot
                            </p>
                            <h1 className="text-lg font-bold sm:text-xl">
                                Job Approval Management
                            </h1>
                            <p className="text-xs text-slate-400">
                                Review and manage company job postings.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/admin-dashboard")}
                        className="self-start rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-indigo-500 hover:bg-slate-700 sm:self-center"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

                {/* Heading */}
                <div className="mb-4">
                    <h2 className="text-lg font-bold">Job Overview</h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Review submitted jobs and manage approval status.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {summaryCards.map((card) => (
                        <div
                            key={card.title}
                            className={`rounded-xl border bg-slate-900 p-4 ${
                                card.color === "amber"
                                    ? "border-amber-500/20"
                                    : card.color === "emerald"
                                    ? "border-emerald-500/20"
                                    : "border-red-500/20"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-400">
                                        {card.title}
                                    </p>
                                    <p
                                        className={`mt-1 text-2xl font-bold ${
                                            card.color === "amber"
                                                ? "text-amber-400"
                                                : card.color === "emerald"
                                                ? "text-emerald-400"
                                                : "text-red-400"
                                        }`}
                                    >
                                        {card.count}
                                    </p>
                                </div>
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                                        card.color === "amber"
                                            ? "bg-amber-500/10 text-amber-400"
                                            : card.color === "emerald"
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-red-500/10 text-red-400"
                                    }`}
                                >
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search and Filters */}
                <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-sm font-semibold">
                                Search & Filter
                            </h2>
                            <p className="mt-1 text-xs text-slate-400">
                                Search by job title, company, location or email.
                            </p>
                        </div>

                        <div className="relative w-full sm:w-72 sm:shrink-0">
                            <svg
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                                <path
                                    d="m16 16 4 4"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search job postings..."
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-9 text-sm outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    aria-label="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                            {filters.map((item) => {
                                const active = filter === item;

                                return (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setFilter(item)}
                                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                            active
                                                ? "border-indigo-500 bg-indigo-600 text-white"
                                                : "border-slate-700 bg-slate-950 text-slate-300 hover:border-indigo-500/60"
                                        }`}
                                    >
                                        {item}
                                        <span
                                            className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                                active
                                                    ? "bg-white/15"
                                                    : "bg-slate-800 text-slate-400"
                                            }`}
                                        >
                                            {getCount(item)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-xs text-slate-400">
                            Showing{" "}
                            <span className="font-semibold text-white">
                                {filteredJobs.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-white">
                                {jobs.length}
                            </span>{" "}
                            jobs
                        </p>
                    </div>
                </div>

                {message && (
                    <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                        ✓ {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                        ! {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-12 text-center">
                        <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
                        <p className="text-sm text-slate-300">
                            Loading job postings...
                        </p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl">
                            📋
                        </div>

                        <h2 className="mt-4 text-lg font-bold">
                            {search.trim()
                                ? "No Matching Jobs Found"
                                : `No ${filter === "All" ? "" : filter.toLowerCase() + " "}jobs found`}
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                            {search.trim()
                                ? "Try another job title, company name, location or email."
                                : "Job postings matching this filter will appear here."}
                        </p>

                        {(search || filter !== "All") && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setFilter("All");
                                }}
                                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold hover:bg-indigo-500"
                            >
                                Clear Search & View All Jobs
                            </button>
                        )}
                    </div>
                ) : (
                    /* Compact Job Cards */
                    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                        {filteredJobs.map((job) => {
                            const company =
                                job.companyId &&
                                typeof job.companyId === "object"
                                    ? job.companyId
                                    : {};

                            const status = job.approvalStatus || "Pending";
                            const isUpdating = updatingId === job._id;

                            return (
                                <article
                                    key={job._id}
                                    className="min-w-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition hover:border-indigo-500/40"
                                >
                                    <div className="flex items-start justify-between gap-3 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-indigo-950/30 p-4">
                                        <div className="min-w-0">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-1 text-[10px] font-semibold text-indigo-300">
                                                    JOB POSTING
                                                </span>
                                                <span
                                                    className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${getStatusStyle(status)}`}
                                                >
                                                    {status}
                                                </span>
                                            </div>

                                            <h3 className="break-words text-base font-bold">
                                                {job.title || "Untitled Job"}
                                            </h3>

                                            <p className="mt-1 text-sm text-indigo-300">
                                                {company.companyName || "Company details unavailable"}
                                            </p>

                                            {job.department && (
                                                <p className="mt-1 text-xs text-slate-400">
                                                    {job.department}
                                                </p>
                                            )}
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ${
                                                job.status === "Active"
                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                    : "bg-slate-800 text-slate-300"
                                            }`}
                                        >
                                            {job.status || "N/A"}
                                        </span>
                                    </div>

                                    <div className="space-y-3 p-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
                                                <p className="text-[10px] text-slate-500">
                                                    Location
                                                </p>
                                                <p className="mt-1 break-words text-xs text-slate-200">
                                                    {job.location || "Not specified"}
                                                </p>
                                            </div>

                                            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
                                                <p className="text-[10px] text-slate-500">
                                                    Job Type
                                                </p>
                                                <p className="mt-1 break-words text-xs text-slate-200">
                                                    {job.jobType || "Not specified"}
                                                </p>
                                            </div>

                                            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
                                                <p className="text-[10px] text-slate-500">
                                                    Work Mode
                                                </p>
                                                <p className="mt-1 break-words text-xs text-slate-200">
                                                    {job.workMode || "Not specified"}
                                                </p>
                                            </div>

                                            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
                                                <p className="text-[10px] text-slate-500">
                                                    Salary
                                                </p>
                                                <p className="mt-1 break-words text-xs font-semibold text-emerald-400">
                                                    {formatSalary(job)}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                Required Skills
                                            </p>

                                            <div className="flex flex-wrap gap-1.5">
                                                {(job.requiredSkills || []).length > 0 ? (
                                                    job.requiredSkills.slice(0, 5).map((skill, index) => (
                                                        <span
                                                            key={`${job._id}-skill-${index}`}
                                                            className="max-w-full break-words rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-1 text-[10px] text-indigo-300"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-500">
                                                        No required skills specified.
                                                    </span>
                                                )}

                                                {(job.requiredSkills || []).length > 5 && (
                                                    <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] text-slate-300">
                                                        +{job.requiredSkills.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 border-t border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-[10px] text-slate-500">
                                                Deadline: {formatDate(job.applicationDeadline)}
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedJob(job)}
                                                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-indigo-500 hover:bg-slate-800 sm:flex-none"
                                                >
                                                    View Details
                                                </button>

                                                {status !== "Approved" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApproval(job._id, "Approved")}
                                                        disabled={isUpdating}
                                                        className="flex-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50 sm:flex-none"
                                                    >
                                                        {isUpdating ? "Updating..." : "✓ Approve"}
                                                    </button>
                                                )}

                                                {status !== "Rejected" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApproval(job._id, "Rejected")}
                                                        disabled={isUpdating}
                                                        className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50 sm:flex-none"
                                                    >
                                                        ✕ Reject
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* View Details Modal */}
            {selectedJob && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="job-details-title"
                        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50"
                    >
                        {/* Modal Header */}
                        <div className="flex items-start justify-between gap-3 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-indigo-950/50 px-5 py-4 sm:px-6">
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
                                    AI Career Copilot
                                </p>
                                <h2
                                    id="job-details-title"
                                    className="mt-1 break-words text-lg font-bold sm:text-xl"
                                >
                                    {selectedJob.title || "Job Details"}
                                </h2>
                                <p className="mt-1 text-sm text-indigo-300">
                                    {selectedCompany.companyName || "Company details unavailable"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={Boolean(updatingId)}
                                aria-label="Close job details"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-300 transition hover:border-slate-500 hover:text-white disabled:opacity-50"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Scrollable Content */}
                        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">

                            {/* Status */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(selectedStatus)}`}
                                >
                                    {selectedStatus}
                                </span>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        selectedJob.status === "Active"
                                            ? "bg-emerald-500/10 text-emerald-400"
                                            : "bg-slate-800 text-slate-300"
                                    }`}
                                >
                                    Job Status: {selectedJob.status || "N/A"}
                                </span>
                            </div>

                            {/* Job Details */}
                            <section>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                                    <span className="h-4 w-1 rounded-full bg-indigo-500" />
                                    Job Details
                                </h3>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <DetailItem label="Job Title" value={selectedJob.title} />
                                    <DetailItem label="Department" value={selectedJob.department} />
                                    <DetailItem label="Job Type" value={selectedJob.jobType} />
                                    <DetailItem label="Work Mode" value={selectedJob.workMode} />
                                    <DetailItem label="Location" value={selectedJob.location} />
                                    <DetailItem label="Experience" value={selectedJob.experience} />
                                    <DetailItem label="Education" value={selectedJob.education} />
                                    <DetailItem label="Application Deadline" value={formatDate(selectedJob.applicationDeadline)} />
                                </div>
                            </section>

                            {/* Salary */}
                            <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                                <p className="text-xs text-slate-400">Salary Range</p>
                                <p className="mt-1 break-words text-lg font-bold text-emerald-400">
                                    {formatSalary(selectedJob)}
                                </p>
                            </section>

                            {/* Company Information */}
                            <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                                    <span className="h-4 w-1 rounded-full bg-violet-500" />
                                    Company Information
                                </h3>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-500">Company Name</p>
                                        <p className="mt-1 break-words text-sm text-slate-200">
                                            {selectedCompany.companyName || "Not available"}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-500">Contact Person</p>
                                        <p className="mt-1 break-words text-sm text-slate-200">
                                            {selectedCompany.contactName || "Not available"}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-500">Email</p>
                                        <p className="mt-1 break-all text-sm text-slate-200">
                                            {selectedCompany.email || "Not available"}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-500">Phone</p>
                                        <p className="mt-1 break-words text-sm text-slate-200">
                                            {selectedCompany.phone || "Not available"}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-500">Verification Status</p>
                                        <p className="mt-1 text-sm capitalize text-slate-200">
                                            {selectedCompany.verificationStatus || "Unknown"}
                                        </p>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate-500">Website</p>
                                        {selectedCompany.website ? (
                                            <a
                                                href={
                                                    /^https?:\/\//i.test(selectedCompany.website)
                                                        ? selectedCompany.website
                                                        : `https://${selectedCompany.website}`
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-1 block break-all text-sm text-indigo-400 hover:underline"
                                            >
                                                Visit Company Website ↗
                                            </a>
                                        ) : (
                                            <p className="mt-1 text-sm text-slate-300">
                                                Not provided
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {selectedCompany.description && (
                                    <div className="mt-3 border-t border-slate-800 pt-3">
                                        <p className="text-[11px] text-slate-500">
                                            About Company
                                        </p>
                                        <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-slate-300">
                                            {selectedCompany.description}
                                        </p>
                                    </div>
                                )}
                            </section>

                            {/* Job Description */}
                            <section>
                                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
                                    <span className="h-4 w-1 rounded-full bg-indigo-500" />
                                    Job Description
                                </h3>
                                <p className="whitespace-pre-line break-words text-sm leading-6 text-slate-300">
                                    {selectedJob.description || "No description provided."}
                                </p>
                            </section>

                            {/* Responsibilities */}
                            <section>
                                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
                                    <span className="h-4 w-1 rounded-full bg-violet-500" />
                                    Responsibilities
                                </h3>

                                {selectedJob.responsibilities?.length > 0 ? (
                                    <ul className="space-y-2">
                                        {selectedJob.responsibilities.map((item, index) => (
                                            <li
                                                key={`${selectedJob._id}-responsibility-${index}`}
                                                className="flex items-start gap-2 text-sm leading-5 text-slate-300"
                                            >
                                                <span className="text-indigo-400">•</span>
                                                <span className="min-w-0 break-words">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500">
                                        No responsibilities provided.
                                    </p>
                                )}
                            </section>

                            {/* Required Skills */}
                            <section>
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                                    <span className="h-4 w-1 rounded-full bg-indigo-500" />
                                    Required Skills
                                </h3>

                                <div className="flex flex-wrap gap-2">
                                    {(selectedJob.requiredSkills || []).length > 0 ? (
                                        selectedJob.requiredSkills.map((skill, index) => (
                                            <span
                                                key={`${selectedJob._id}-modal-skill-${index}`}
                                                className="max-w-full break-words rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-300"
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500">
                                            No required skills specified.
                                        </p>
                                    )}
                                </div>
                            </section>

                            {/* Job Metadata */}
                            <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <p className="text-[11px] text-slate-500">Job ID</p>
                                        <p className="mt-1 break-all text-xs text-slate-300">
                                            {selectedJob._id}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] text-slate-500">Posted On</p>
                                        <p className="mt-1 text-xs text-slate-300">
                                            {formatDate(selectedJob.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Fixed Modal Footer */}
                        <div className="border-t border-slate-800 bg-slate-900 px-5 py-4 sm:px-6">
                            <div className="flex flex-wrap justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={Boolean(updatingId)}
                                    className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
                                >
                                    Close
                                </button>

                                {selectedStatus !== "Approved" && (
                                    <button
                                        type="button"
                                        onClick={() => handleApproval(selectedJob._id, "Approved")}
                                        disabled={Boolean(updatingId)}
                                        className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                                    >
                                        {updatingId === selectedJob._id
                                            ? "Updating..."
                                            : "✓ Approve"}
                                    </button>
                                )}

                                {selectedStatus !== "Rejected" && (
                                    <button
                                        type="button"
                                        onClick={() => handleApproval(selectedJob._id, "Rejected")}
                                        disabled={Boolean(updatingId)}
                                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                                    >
                                        ✕ Reject
                                    </button>
                                )}

                                {selectedStatus !== "Pending" && (
                                    <button
                                        type="button"
                                        onClick={() => handleApproval(selectedJob._id, "Pending")}
                                        disabled={Boolean(updatingId)}
                                        className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
                                    >
                                        ↺ Return to Pending
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default JobApproval;