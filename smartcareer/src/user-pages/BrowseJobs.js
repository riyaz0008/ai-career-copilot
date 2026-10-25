import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const BrowseJobs = () => {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [assessment, setAssessment] = useState(null);

    const [loading, setLoading] = useState(true);
    const [assessmentLoading, setAssessmentLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [jobTypeFilter, setJobTypeFilter] = useState("All");
    const [workModeFilter, setWorkModeFilter] = useState("All");

    const [selectedJob, setSelectedJob] = useState(null);
    const [appliedJobIds, setAppliedJobIds] = useState([]);
    const [applicationsLoading, setApplicationsLoading] = useState(false);

    const getToken = () => {
        try {
            const user = JSON.parse(
                localStorage.getItem("user") || "null"
            );

            return (
                localStorage.getItem("token") ||
                user?.token ||
                user?.data?.token ||
                ""
            );
        } catch (error) {
            console.error("Error reading logged-in user:", error);
            return localStorage.getItem("token") || "";
        }
    };

    const getLoggedInUserId = () => {
        try {
            const user = JSON.parse(
                localStorage.getItem("user") || "null"
            );

            return (
                user?._id ||
                user?.id ||
                user?.data?._id ||
                user?.data?.id ||
                ""
            );
        } catch (error) {
            console.error("Error reading user ID:", error);
            return "";
        }
    };

    useEffect(() => {
        fetchJobs();
        fetchMyApplications();
        fetchCareerAssessment();
    }, []);

    // Fetch approved, active jobs from the existing backend API.
    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/api/jobs");
            const result = response.data;

            const jobsData = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result?.jobs)
                        ? result.jobs
                        : [];

            setJobs(jobsData);
        } catch (err) {
            console.error("Error fetching jobs:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load jobs. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Fetch the logged-in user's saved career assessment.
    const fetchCareerAssessment = async () => {
        const userId = getLoggedInUserId();
        const token = getToken();

        if (!userId || !token) {
            setAssessment(null);
            setAssessmentLoading(false);
            return;
        }

        try {
            setAssessmentLoading(true);

            const response = await api.get(
                `/api/career-assessment/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data?.status === 1 && response.data?.data) {
                setAssessment(response.data.data);
            } else {
                setAssessment(null);
            }
        } catch (err) {
            // A user who has not completed the assessment can still browse jobs.
            if (err.response?.status !== 404) {
                console.error(
                    "Error fetching career assessment:",
                    err
                );
            }

            setAssessment(null);
        } finally {
            setAssessmentLoading(false);
        }
    };

    // Fetch jobs the current user has already applied for.
    const fetchMyApplications = async () => {
        const token = getToken();

        if (!token) {
            setAppliedJobIds([]);
            setApplicationsLoading(false);
            return;
        }

        try {
            setApplicationsLoading(true);

            const response = await api.get("/api/my-applications", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const applications = Array.isArray(response.data?.data)
                ? response.data.data
                : [];

            const jobIds = applications
                .map((application) => {
                    const job = application.jobId;

                    return String(
                        typeof job === "object"
                            ? job?._id || ""
                            : job || ""
                    );
                })
                .filter(Boolean);

            setAppliedJobIds(jobIds);
        } catch (err) {
            console.error("Error fetching applications:", err);

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {
                setAppliedJobIds([]);
            }
        } finally {
            setApplicationsLoading(false);
        }
    };

    const isApplied = (jobId) => {
        return appliedJobIds.includes(String(jobId));
    };

    // Normalize text so that skill comparisons ignore case and symbols.
    const normalize = (value) => {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "");
    };

    // Calculate a job match score from the saved career assessment.
    const getJobMatchScore = (job) => {
        if (!assessment) {
            return 0;
        }

        const userSkills = Array.isArray(assessment.skills)
            ? assessment.skills
                .map(normalize)
                .filter(Boolean)
            : [];

        const requiredSkills = Array.isArray(job.requiredSkills)
            ? job.requiredSkills
                .map(normalize)
                .filter(Boolean)
            : [];

        const uniqueRequiredSkills = [...new Set(requiredSkills)];
        const uniqueUserSkills = [...new Set(userSkills)];

        const matchedSkills = uniqueRequiredSkills.filter((skill) =>
            uniqueUserSkills.includes(skill)
        );

        const skillRatio = uniqueRequiredSkills.length > 0
            ? matchedSkills.length / uniqueRequiredSkills.length
            : 0;

        const interest = normalize(assessment.interest);
        const goal = normalize(assessment.goal);

        const jobText = normalize([
            job.title,
            job.department,
            job.description,
            job.education,
            ...(Array.isArray(job.requiredSkills)
                ? job.requiredSkills
                : [])
        ].filter(Boolean).join(" "));

        const interestMatch = Boolean(
            interest && jobText.includes(interest)
        );

        const goalMatch = Boolean(
            goal && jobText.includes(goal)
        );

        // Skills contribute 70%, interest 20%, and career goal 10%.
        // This is a rule-based matching score, not an AI prediction.
        let score =
            skillRatio * 70 +
            (interestMatch ? 20 : 0) +
            (goalMatch ? 10 : 0);

        return Math.round(Math.min(100, score));
    };

    // Apply the search and filter controls to both job sections.
    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const companyName =
                typeof job.companyId === "object"
                    ? job.companyId?.companyName || ""
                    : "";

            const searchText = [
                job.title,
                job.department,
                companyName,
                job.description,
                job.location,
                ...(Array.isArray(job.requiredSkills)
                    ? job.requiredSkills
                    : [])
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch = searchText.includes(
                search.trim().toLowerCase()
            );

            const matchesLocation = (job.location || "")
                .toLowerCase()
                .includes(locationFilter.trim().toLowerCase());

            const matchesJobType =
                jobTypeFilter === "All" ||
                job.jobType === jobTypeFilter;

            const matchesWorkMode =
                workModeFilter === "All" ||
                job.workMode === workModeFilter;

            return (
                matchesSearch &&
                matchesLocation &&
                matchesJobType &&
                matchesWorkMode
            );
        });
    }, [
        jobs,
        search,
        locationFilter,
        jobTypeFilter,
        workModeFilter
    ]);

    // Keep only jobs with a positive assessment match and sort by score.
    const recommendedJobs = useMemo(() => {
        if (!assessment) {
            return [];
        }

        return filteredJobs
            .map((job) => ({
                ...job,
                matchScore: getJobMatchScore(job)
            }))
            .filter((job) => job.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);
    }, [filteredJobs, assessment]);

    const formatSalary = (job) => {
        const min = job.salaryMin;
        const max = job.salaryMax;

        if (min == null && max == null) {
            return "Not specified";
        }

        const formatAmount = (amount) => {
            const value = Number(amount);

            if (Number.isNaN(value)) {
                return amount;
            }

            if (value >= 100000) {
                return `${(value / 100000).toFixed(1)} LPA`;
            }

            return `₹${value.toLocaleString("en-IN")}`;
        };

        if (min != null && max != null) {
            return `${formatAmount(min)} - ${formatAmount(max)}`;
        }

        if (min != null) {
            return `From ${formatAmount(min)}`;
        }

        return `Up to ${formatAmount(max)}`;
    };

    const formatDate = (date) => {
        if (!date) {
            return "Not specified";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not specified";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const getCompanyName = (job) => {
        if (job.companyId && typeof job.companyId === "object") {
            return job.companyId.companyName || "Company";
        }

        return "Company";
    };

    const getCompanyWebsite = (job) => {
        if (job.companyId && typeof job.companyId === "object") {
            return job.companyId.website || "";
        }

        return "";
    };

    const handleApply = (job) => {
        if (!job?._id) {
            return;
        }

        const token = getToken();

        if (!token) {
            alert("Please log in to apply for a job.");
            navigate("/login");
            return;
        }

        if (isApplied(job._id)) {
            alert("You have already applied for this job.");
            navigate("/my-applications");
            return;
        }

        navigate(`/apply-job/${job._id}`);
    };

    const resetFilters = () => {
        setSearch("");
        setLocationFilter("");
        setJobTypeFilter("All");
        setWorkModeFilter("All");
    };

    const renderApplyButton = (job, isModal = false) => {
        const alreadyApplied = isApplied(job._id);

        return (
            <button
                type="button"
                disabled={applicationsLoading || alreadyApplied}
                onClick={() => handleApply(job)}
                className={`rounded-xl ${
                    isModal ? "px-5 py-3" : "px-4 py-2.5"
                } text-sm font-semibold transition ${
                    alreadyApplied
                        ? "cursor-not-allowed border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "bg-indigo-600 text-white hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
                }`}
            >
                {applicationsLoading
                    ? "Checking..."
                    : alreadyApplied
                        ? isModal
                            ? "✓ Already Applied"
                            : "✓ Applied"
                        : isModal
                            ? "Apply for This Job"
                            : "Apply Now"}
            </button>
        );
    };

    // Reusable card for recommended and all available jobs.
    const renderJobCard = (job, showMatch = false) => (
        <article
            key={job._id}
            className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition duration-200 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-950/20 sm:p-6"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-xl font-bold text-indigo-300">
                        {(getCompanyName(job)[0] || "C").toUpperCase()}
                    </div>

                    <div className="min-w-0">
                        <h3 className="break-words text-lg font-bold text-white transition group-hover:text-indigo-300">
                            {job.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                            {getCompanyName(job)}
                        </p>

                        {job.department && (
                            <p className="mt-1 text-xs text-slate-500">
                                {job.department}
                            </p>
                        )}
                    </div>
                </div>

                <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Active
                </span>
            </div>

            {showMatch && (
                <div className="mt-5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-indigo-200">
                                <span className="mr-2">✦</span>
                                Career Match
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Based on your career assessment
                            </p>
                        </div>

                        <span className="text-2xl font-bold text-indigo-300">
                            {job.matchScore}%
                        </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                            style={{
                                width: `${job.matchScore}%`
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-300 sm:grid-cols-2">
                <p>
                    <span className="mr-2">📍</span>
                    {job.location || "Location not specified"}
                </p>

                <p>
                    <span className="mr-2">💼</span>
                    {job.jobType || "Job type not specified"}
                </p>

                <p>
                    <span className="mr-2">🏢</span>
                    {job.workMode || "Work mode not specified"}
                </p>

                <p>
                    <span className="mr-2">💰</span>
                    {formatSalary(job)}
                </p>

                <p className="sm:col-span-2">
                    <span className="mr-2">⏳</span>
                    Experience: {job.experience || "Not specified"}
                </p>
            </div>

            {job.description && (
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
                    {job.description}
                </p>
            )}

            {Array.isArray(job.requiredSkills) &&
                job.requiredSkills.length > 0 && (
                    <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Required Skills
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {job.requiredSkills
                                .slice(0, 6)
                                .map((skill, index) => (
                                    <span
                                        key={`${skill}-${index}`}
                                        className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300"
                                    >
                                        {skill}
                                    </span>
                                ))}

                            {job.requiredSkills.length > 6 && (
                                <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
                                    +{job.requiredSkills.length - 6} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-500">
                    Deadline: {formatDate(job.applicationDeadline)}
                </p>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setSelectedJob(job)}
                        className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-indigo-500 hover:text-white"
                    >
                        View Details
                    </button>

                    {renderApplyButton(job)}
                </div>
            </div>
        </article>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <Link
                        to="/user-dashboard"
                        className="text-xl font-bold tracking-tight text-white"
                    >
                        <span className="text-indigo-400">AI</span> Career Copilot
                    </Link>

                    <nav className="flex items-center gap-3">
                        <Link
                            to="/user-dashboard"
                            className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            Dashboard
                        </Link>

                        <Link
                            to="/my-applications"
                            className="rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            My Applications
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Hero */}
                <section className="mb-8 overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-6 sm:p-10">
                    <div className="max-w-3xl">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
                            Career Opportunities
                        </p>

                        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                            Find the right job for your future.
                        </h1>

                        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                            Discover jobs matched to your skills and career
                            interests, explore new opportunities, and take
                            the next step in your professional journey.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <a
                                href="#recommended-jobs"
                                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                            >
                                Recommended Jobs
                            </a>

                            <a
                                href="#job-listings"
                                className="rounded-xl border border-slate-600 bg-slate-900/50 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                            >
                                Browse All Jobs
                            </a>

                            <Link
                                to="/my-applications"
                                className="rounded-xl border border-slate-600 bg-slate-900/50 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                            >
                                My Applications
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Search and Filters */}
                <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold">
                            Search for Jobs
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Search by job title, company, department or skill.
                            Filters apply to both job sections.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Search
                            </label>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="e.g. React Developer"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Location
                            </label>

                            <input
                                type="text"
                                value={locationFilter}
                                onChange={(e) =>
                                    setLocationFilter(e.target.value)
                                }
                                placeholder="e.g. Ahmedabad"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Job Type
                            </label>

                            <select
                                value={jobTypeFilter}
                                onChange={(e) =>
                                    setJobTypeFilter(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                            >
                                <option value="All">All Job Types</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Work Mode
                            </label>

                            <select
                                value={workModeFilter}
                                onChange={(e) =>
                                    setWorkModeFilter(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                            >
                                <option value="All">All Work Modes</option>
                                <option value="Remote">Remote</option>
                                <option value="On-site">On-site</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-slate-400">
                            {filteredJobs.length} job
                            {filteredJobs.length !== 1 ? "s" : ""} found
                        </p>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500 hover:text-white"
                        >
                            Clear Filters
                        </button>
                    </div>
                </section>

                {/* Loading and error states */}
                {loading ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-16 text-center">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
                        <p className="text-slate-300">Loading jobs...</p>
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                        <p className="font-semibold text-red-300">
                            Unable to load jobs
                        </p>

                        <p className="mt-2 text-sm text-slate-300">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchJobs}
                            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-500"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Recommended Jobs */}
                        <section
                            id="recommended-jobs"
                            className="mb-12 scroll-mt-24"
                        >
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-400">
                                        <span className="mr-2">✦</span>
                                        Personalized for You
                                    </p>

                                    <h2 className="text-2xl font-bold">
                                        Recommended Jobs
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Opportunities ranked using your saved
                                        career assessment.
                                    </p>
                                </div>

                                {assessment && (
                                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                                        {recommendedJobs.length} matched job
                                        {recommendedJobs.length !== 1
                                            ? "s"
                                            : ""}
                                    </span>
                                )}
                            </div>

                            {assessmentLoading ? (
                                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                                    <p className="text-sm text-slate-400">
                                        Checking your career assessment...
                                    </p>
                                </div>
                            ) : !assessment ? (
                                <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 to-slate-900 p-6 sm:p-8">
                                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-2xl">
                                            ✦
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold">
                                                Get personalized job recommendations
                                            </h3>

                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                Complete your Career Assessment
                                                so we can compare your skills,
                                                interests and career goals with
                                                available job openings.
                                            </p>
                                        </div>

                                        <Link
                                            to="/career-assessment"
                                            className="shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                                        >
                                            Complete Assessment
                                        </Link>
                                    </div>
                                </div>
                            ) : recommendedJobs.length === 0 ? (
                                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                                    <div className="mb-3 text-4xl">🔎</div>

                                    <h3 className="text-lg font-semibold">
                                        No matching jobs found
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
                                        No jobs matched your current assessment
                                        and filters. Browse all jobs below or
                                        adjust your search filters to explore
                                        more opportunities.
                                    </p>

                                    <a
                                        href="#job-listings"
                                        className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-500"
                                    >
                                        Browse All Jobs
                                    </a>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                    {recommendedJobs.map((job) =>
                                        renderJobCard(job, true)
                                    )}
                                </div>
                            )}
                        </section>

                        {/* All Approved Jobs */}
                        <section
                            id="job-listings"
                            className="scroll-mt-24"
                        >
                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-violet-400">
                                        Explore Opportunities
                                    </p>

                                    <h2 className="text-2xl font-bold">
                                        Browse All Jobs
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-400">
                                        Explore all approved openings from
                                        verified companies, even if they are
                                        not in your recommendations.
                                    </p>
                                </div>

                                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300">
                                    {filteredJobs.length} available
                                </span>
                            </div>

                            {filteredJobs.length === 0 ? (
                                <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-16 text-center">
                                    <div className="mb-4 text-5xl">🔎</div>

                                    <h3 className="text-lg font-semibold">
                                        {jobs.length === 0
                                            ? "No approved jobs available"
                                            : "No jobs match your filters"}
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                                        {jobs.length === 0
                                            ? "There are no approved job openings available right now. Please check again later."
                                            : "Try changing your search, location, job type or work mode."}
                                    </p>

                                    {jobs.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={resetFilters}
                                            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-500"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                    {filteredJobs.map((job) =>
                                        renderJobCard(job)
                                    )}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>

            {/* Job Details Modal */}
            {selectedJob && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedJob(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="job-details-title"
                        className="my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2
                                    id="job-details-title"
                                    className="text-2xl font-bold"
                                >
                                    {selectedJob.title}
                                </h2>

                                <p className="mt-2 text-slate-400">
                                    {getCompanyName(selectedJob)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedJob(null)}
                                aria-label="Close job details"
                                className="rounded-lg px-3 py-1 text-2xl text-slate-400 hover:bg-slate-800 hover:text-white"
                            >
                                ×
                            </button>
                        </div>

                        {assessment && (
                            <div className="mt-5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                                <p className="text-sm font-semibold text-indigo-200">
                                    Career Match:{" "}
                                    {getJobMatchScore(selectedJob)}%
                                </p>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                                        style={{
                                            width: `${getJobMatchScore(
                                                selectedJob
                                            )}%`
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-5 flex flex-wrap gap-2">
                            {[
                                selectedJob.jobType,
                                selectedJob.workMode,
                                selectedJob.location
                            ]
                                .filter(Boolean)
                                .map((item, index) => (
                                    <span
                                        key={`${item}-${index}`}
                                        className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300"
                                    >
                                        {item}
                                    </span>
                                ))}
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-slate-500">
                                    Salary
                                </p>
                                <p className="mt-1 font-semibold">
                                    {formatSalary(selectedJob)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Experience
                                </p>
                                <p className="mt-1 font-semibold">
                                    {selectedJob.experience || "Not specified"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Education
                                </p>
                                <p className="mt-1 font-semibold">
                                    {selectedJob.education || "Not specified"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500">
                                    Application Deadline
                                </p>
                                <p className="mt-1 font-semibold">
                                    {formatDate(
                                        selectedJob.applicationDeadline
                                    )}
                                </p>
                            </div>
                        </div>

                        {selectedJob.description && (
                            <div className="mt-6">
                                <h3 className="font-semibold">
                                    Job Description
                                </h3>

                                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-300">
                                    {selectedJob.description}
                                </p>
                            </div>
                        )}

                        {selectedJob.responsibilities && (
                            <div className="mt-6">
                                <h3 className="font-semibold">
                                    Responsibilities
                                </h3>

                                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-300">
                                    {Array.isArray(
                                        selectedJob.responsibilities
                                    )
                                        ? selectedJob.responsibilities.join("\n")
                                        : selectedJob.responsibilities}
                                </p>
                            </div>
                        )}

                        {Array.isArray(selectedJob.requiredSkills) &&
                            selectedJob.requiredSkills.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-semibold">
                                        Required Skills
                                    </h3>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedJob.requiredSkills.map(
                                            (skill, index) => (
                                                <span
                                                    key={`${skill}-${index}`}
                                                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300"
                                                >
                                                    {skill}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {getCompanyWebsite(selectedJob) && (
                            <div className="mt-6">
                                <a
                                    href={getCompanyWebsite(selectedJob)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
                                >
                                    Visit Company Website ↗
                                </a>
                            </div>
                        )}

                        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-5">
                            <button
                                type="button"
                                onClick={() => setSelectedJob(null)}
                                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                            >
                                Close
                            </button>

                            {renderApplyButton(selectedJob, true)}
                        </div>
                    </div>
                </div>
            )}

            <footer className="mt-10 border-t border-slate-800 py-6 text-center text-sm text-slate-500">
                © {new Date().getFullYear()} AI Career Copilot. Build your career with confidence.
            </footer>
        </div>
    );
};

export default BrowseJobs;