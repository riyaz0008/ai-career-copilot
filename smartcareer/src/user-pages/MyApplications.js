import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const statusStyles = {
    Pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    "Under Review": "border-blue-500/30 bg-blue-500/10 text-blue-300",
    Shortlisted: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    "Interview Scheduled": "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    "Interview Completed": "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
    Rejected: "border-red-500/30 bg-red-500/10 text-red-300",
    Accepted: "border-green-500/30 bg-green-500/10 text-green-300"
};

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [jobOffers, setJobOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("All");

    const fetchApplications = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const user = JSON.parse(
                localStorage.getItem("user") || "null"
            );

            const token =
                localStorage.getItem("token") ||
                user?.token ||
                user?.data?.token;

            if (!token) {
                setApplications([]);
                setJobOffers([]);
                setError("Please log in to view your applications.");
                return;
            }

            const response = await api.get("/api/my-applications", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const result = response.data;

            const list = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                ? result.data
                : Array.isArray(result?.applications)
                ? result.applications
                : [];

            setApplications(list);

            // Fetch the current user's job offers separately.
            try {
                const offersResponse = await api.get("/api/my-job-offers", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const offersResult = offersResponse.data;

                const offersList = Array.isArray(offersResult)
                    ? offersResult
                    : Array.isArray(offersResult?.data)
                    ? offersResult.data
                    : Array.isArray(offersResult?.offers)
                    ? offersResult.offers
                    : [];

                setJobOffers(offersList);
            } catch (offerError) {
                console.error("Fetch Job Offers Error:", offerError);
                setJobOffers([]);
            }
        } catch (err) {
            console.error("Fetch My Applications Error:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load applications. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const filteredApplications =
        filter === "All"
            ? applications
            : applications.filter(
                (application) => application.status === filter
            );

    const formatDate = (date) => {
        if (!date) return "Not available";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not available";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const getCompanyName = (application) => {
        return application.companyId?.companyName || "Company";
    };

    const getJobTitle = (application) => {
        return application.jobId?.title || "Job no longer available";
    };

    const getResumeName = (application) => {
        return application.resume?.fileName || "Resume uploaded";
    };

    // Match an offer to the exact application.
    const hasJobOffer = (applicationId) => {
        return jobOffers.some((offer) => {
            const offerApplicationId =
                typeof offer.applicationId === "object"
                    ? offer.applicationId?._id
                    : offer.applicationId;

            return (
                String(offerApplicationId || "") ===
                String(applicationId || "")
            );
        });
    };

    const statusCounts = {
        All: applications.length,
        Pending: applications.filter(
            (item) => item.status === "Pending"
        ).length,
        "Under Review": applications.filter(
            (item) => item.status === "Under Review"
        ).length,
        Shortlisted: applications.filter(
            (item) => item.status === "Shortlisted"
        ).length,
        "Interview Scheduled": applications.filter(
            (item) => item.status === "Interview Scheduled"
        ).length,
        "Interview Completed": applications.filter(
            (item) => item.status === "Interview Completed"
        ).length,
        Rejected: applications.filter(
            (item) => item.status === "Rejected"
        ).length,
        Accepted: applications.filter(
            (item) => item.status === "Accepted"
        ).length
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
                <div className="text-center">
                    <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />

                    <h2 className="text-lg font-semibold">
                        Loading Your Applications
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Please wait while we retrieve your application details.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
            <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <Link
                        to="/user-dashboard"
                        className="flex w-fit items-center gap-3"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold shadow-lg shadow-indigo-950/40">
                            AI
                        </div>

                        <div>
                            <p className="text-lg font-bold leading-tight">
                                AI <span className="text-indigo-400">Career Copilot</span>
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Your career journey
                            </p>
                        </div>
                    </Link>

                    <Link
                        to="/browse-jobs"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500"
                    >
                        <span className="text-lg">⌕</span>
                        Browse Jobs
                        <span>→</span>
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
                <section className="relative mb-8 overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 p-6 sm:p-9">
                    <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 right-1/4 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                                <span>✦</span>
                                Career Opportunities
                            </div>

                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                                My Applications
                            </h1>

                            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                                Track your job and internship applications,
                                check interview schedules and stay updated
                                on your career opportunities.
                            </p>
                        </div>

                        <div className="flex h-24 w-24 shrink-0 items-center justify-center self-start rounded-3xl border border-white/10 bg-white/5 text-5xl shadow-xl sm:h-28 sm:w-28 sm:self-center">
                            📂
                        </div>
                    </div>
                </section>

                {/* Application Summary */}
                <section className="mb-9">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold">
                            Application Overview
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            A quick look at your application activity.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-indigo-500/20 bg-slate-900 p-5 transition hover:border-indigo-500/50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">
                                    Total Applications
                                </p>
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-xl">
                                    📄
                                </span>
                            </div>

                            <p className="mt-4 text-3xl font-bold text-white">
                                {statusCounts.All}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                                All submitted applications
                            </p>
                        </div>

                        <div className="rounded-2xl border border-amber-500/20 bg-slate-900 p-5 transition hover:border-amber-500/50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">
                                    Pending Applications
                                </p>
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-xl">
                                    ⏳
                                </span>
                            </div>

                            <p className="mt-4 text-3xl font-bold text-amber-300">
                                {statusCounts.Pending}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                                Awaiting a decision
                            </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-500/20 bg-slate-900 p-5 transition hover:border-emerald-500/50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">
                                    Shortlisted
                                </p>
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
                                    ✓
                                </span>
                            </div>

                            <p className="mt-4 text-3xl font-bold text-emerald-300">
                                {statusCounts.Shortlisted}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                                Applications shortlisted
                            </p>
                        </div>

                        <div className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-5 transition hover:border-cyan-500/50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-400">
                                    Interviews Scheduled
                                </p>
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-xl">
                                    📅
                                </span>
                            </div>

                            <p className="mt-4 text-3xl font-bold text-cyan-300">
                                {statusCounts["Interview Scheduled"]}
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                                Upcoming interview invitations
                            </p>
                        </div>
                    </div>
                </section>

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
                        <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-lg text-red-300">
                                !
                            </span>

                            <div className="flex-1">
                                <h3 className="font-semibold text-red-300">
                                    Unable to load applications
                                </h3>

                                <p className="mt-1 text-sm leading-6 text-red-200/80">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => fetchApplications()}
                                    className="mt-3 rounded-lg border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/10"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
                    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-bold">Your Applications</h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Filter applications by their current status.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => fetchApplications(true)}
                            disabled={refreshing}
                            className="mt-2 w-fit rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-indigo-500 hover:text-white disabled:opacity-50 sm:mt-0"
                        >
                            {refreshing ? "Refreshing..." : "↻ Refresh"}
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {[
                            "All",
                            "Pending",
                            "Under Review",
                            "Shortlisted",
                            "Interview Scheduled",
                            "Interview Completed",
                            "Accepted",
                            "Rejected"
                        ].map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setFilter(item)}
                                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition sm:px-4 ${
                                    filter === item
                                        ? "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-950/30"
                                        : "border-slate-700 bg-slate-950 text-slate-400 hover:border-indigo-500/50 hover:text-white"
                                }`}
                            >
                                {item}

                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs ${
                                        filter === item
                                            ? "bg-white/15 text-white"
                                            : "bg-slate-800 text-slate-400"
                                    }`}
                                >
                                    {statusCounts[item]}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Empty State */}
                {!error && filteredApplications.length === 0 && (
                    <section className="rounded-3xl border border-slate-800 bg-slate-900 px-5 py-12 text-center sm:px-8 sm:py-16">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-indigo-500/20 bg-indigo-500/10 text-4xl">
                            📄
                        </div>

                        <h2 className="mt-6 text-2xl font-bold">
                            {applications.length === 0
                                ? "Your Career Journey Starts Here"
                                : "No Applications Found"}
                        </h2>

                        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-400">
                            {applications.length === 0
                                ? "You haven't applied to any jobs or internships yet. Explore available opportunities and submit your first application."
                                : "There are no applications under this status. Select another filter to view your applications."}
                        </p>

                        {applications.length === 0 && (
                            <Link
                                to="/browse-jobs"
                                className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500"
                            >
                                Browse Jobs & Internships
                                <span>→</span>
                            </Link>
                        )}
                    </section>
                )}

                {/* Application Cards */}
                <section className="space-y-5">
                    {filteredApplications.map((application) => {
                        const status = application.status || "Pending";
                        const interview = application.interview;

                        return (
                            <article
                                key={application._id}
                                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:border-indigo-500/40"
                            >
                                <div className="p-5 sm:p-6">
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                        <div className="flex min-w-0 items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-2xl">
                                                💼
                                            </div>

                                            <div className="min-w-0">
                                                <h2 className="break-words text-lg font-bold sm:text-xl">
                                                    {getJobTitle(application)}
                                                </h2>

                                                <p className="mt-2 break-words font-medium text-indigo-300">
                                                    {getCompanyName(application)}
                                                </p>

                                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                                                    {application.jobId?.jobType && (
                                                        <span className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
                                                            {application.jobId.jobType}
                                                        </span>
                                                    )}

                                                    {application.jobId?.workMode && (
                                                        <span className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
                                                            {application.jobId.workMode}
                                                        </span>
                                                    )}

                                                    {application.jobId?.location && (
                                                        <span className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
                                                            📍 {application.jobId.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <span
                                            className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${
                                                statusStyles[status] ||
                                                "border-slate-700 bg-slate-800 text-slate-300"
                                            }`}
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                            {status}
                                        </span>
                                    </div>

                                    <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-800 pt-5 sm:grid-cols-2">
                                        <div className="rounded-xl bg-slate-950/70 p-4">
                                            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                                Applied On
                                            </p>

                                            <p className="mt-2 text-sm font-medium text-slate-200">
                                                {formatDate(application.createdAt)}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-slate-950/70 p-4">
                                            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                                Resume
                                            </p>

                                            <p className="mt-2 break-all text-sm font-medium text-indigo-300">
                                                📎 {getResumeName(application)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Interview Details */}
                                    {interview?.date && (
                                        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-indigo-500/5 p-5 sm:p-6">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
                                                        <span>📅</span>
                                                        Interview Information
                                                    </div>

                                                    <h3 className="mt-3 text-xl font-bold">
                                                        {status === "Interview Completed"
                                                            ? "Interview Completed"
                                                            : "Your Interview Is Scheduled"}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-400">
                                                        Please review the details provided by the company.
                                                    </p>
                                                </div>

                                                <span
                                                    className={`inline-flex w-fit rounded-full border px-3 py-2 text-xs font-bold ${
                                                        statusStyles[status] ||
                                                        "border-slate-700 bg-slate-800 text-slate-300"
                                                    }`}
                                                >
                                                    {status}
                                                </span>
                                            </div>

                                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                <div className="rounded-xl border border-slate-700/70 bg-slate-950/60 p-4">
                                                    <p className="text-xs text-slate-500">
                                                        Interview Date
                                                    </p>

                                                    <p className="mt-2 font-semibold text-white">
                                                        {formatDate(interview.date)}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-slate-700/70 bg-slate-950/60 p-4">
                                                    <p className="text-xs text-slate-500">
                                                        Interview Time
                                                    </p>

                                                    <p className="mt-2 font-semibold text-white">
                                                        {interview.time || "Not available"}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-slate-700/70 bg-slate-950/60 p-4">
                                                    <p className="text-xs text-slate-500">
                                                        Interview Mode
                                                    </p>

                                                    <p className="mt-2 font-semibold text-white">
                                                        {interview.mode || "Not available"}
                                                    </p>
                                                </div>
                                            </div>

                                            {interview.details && (
                                                <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/60 p-4">
                                                    <p className="text-xs text-slate-500">
                                                        Interview Details
                                                    </p>

                                                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
                                                        {interview.details}
                                                    </p>
                                                </div>
                                            )}

                                            {interview.mode === "Online" && interview.meetingLink && (
                                                <div className="mt-4 rounded-xl border border-cyan-500/20 bg-slate-950/60 p-4">
                                                    <p className="text-xs text-slate-500">
                                                        Online Meeting Link
                                                    </p>

                                                    <a
                                                        href={interview.meetingLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-2 inline-flex items-center gap-2 break-all text-sm font-semibold text-cyan-300 underline decoration-cyan-500/40 underline-offset-4 transition hover:text-cyan-200"
                                                    >
                                                        Join Interview
                                                        <span>↗</span>
                                                    </a>

                                                    <p className="mt-2 break-all text-xs text-slate-500">
                                                        {interview.meetingLink}
                                                    </p>
                                                </div>
                                            )}

                                            {interview.mode === "In-person" && interview.location && (
                                                <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/60 p-4">
                                                    <p className="text-xs text-slate-500">
                                                        Interview Location
                                                    </p>

                                                    <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-200">
                                                        📍 {interview.location}
                                                    </p>
                                                </div>
                                            )}

                                            {interview.mode === "Phone" && (
                                                <p className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/60 p-4 text-sm leading-6 text-slate-300">
                                                    The company will conduct the interview by phone. Please follow any additional instructions in the interview details.
                                                </p>
                                            )}

                                            {interview.completedAt && (
                                                <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                                                    <span className="text-xl text-emerald-400">
                                                        ✓
                                                    </span>

                                                    <div>
                                                        <p className="font-semibold text-emerald-300">
                                                            Interview Completed
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-400">
                                                            Updated on {formatDate(interview.completedAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {application.coverLetter && (
                                        <details className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
                                            <summary className="cursor-pointer text-sm font-semibold text-slate-300 transition hover:text-white">
                                                View Cover Letter
                                            </summary>

                                            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-400">
                                                {application.coverLetter}
                                            </p>
                                        </details>
                                    )}

                                    {/* Job Offer Button */}
                                   {application.interview?.completedAt &&
    hasJobOffer(application._id) && (
                                            <div className="mt-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 p-5">
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">🤝</span>

                                                            <h3 className="font-bold text-indigo-200">
                                                                Job Offer Received!
                                                            </h3>
                                                        </div>

                                                        <p className="mt-2 text-sm leading-6 text-slate-300">
                                                            Congratulations! The company has sent you a job offer.
                                                            View the offer details and review the terms.
                                                        </p>
                                                    </div>

                                                    <Link
                                                        to="/my-job-offers"
                                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500"
                                                    >
                                                        View Job Offer
                                                        <span>→</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}

                                    <div className="mt-5 border-t border-slate-800 pt-4">
                                        <p className="break-all text-xs text-slate-500">
                                            Application ID: {application._id}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </section>

                {/* Explore More Jobs */}
                <section className="relative mt-10 overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950/80 p-6 sm:mt-14 sm:p-9 lg:p-10">
                    <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />

                    <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                                <span>✦</span>
                                Your Next Opportunity
                            </div>

                            <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                                Ready for Your Next Career Move?
                            </h2>

                            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                                Discover new job openings and internships,
                                explore opportunities that match your skills,
                                and take the next step toward your career goals.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-300 sm:text-sm">
                                <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                    <span className="text-emerald-400">✓</span>
                                    Explore Jobs
                                </span>

                                <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                    <span className="text-emerald-400">✓</span>
                                    Find Internships
                                </span>

                                <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                                    <span className="text-emerald-400">✓</span>
                                    Grow Your Career
                                </span>
                            </div>
                        </div>

                        <div className="relative flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                            <Link
                                to="/browse-jobs"
                                className="inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-950/40 transition hover:-translate-y-0.5 hover:from-indigo-400 hover:to-violet-500"
                            >
                                Explore More Jobs & Internships
                                <span className="text-lg">→</span>
                            </Link>

                            <Link
                                to="/user-dashboard"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-950/50 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white"
                            >
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mt-12 border-t border-slate-800">
                <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-center text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left lg:px-8">
                    <p>
                        © {new Date().getFullYear()} AI Career Copilot
                    </p>

                    <p>
                        Keep learning. Keep applying. Keep growing.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MyApplications;