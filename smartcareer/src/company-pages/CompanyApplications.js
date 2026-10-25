
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const CompanyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [search, setSearch] = useState("");
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [updatingId, setUpdatingId] = useState("");
    const [downloadingId, setDownloadingId] = useState("");
    const [schedulingId, setSchedulingId] = useState("");
    const [offerFormId, setOfferFormId] = useState("");
    const [sendingOfferId, setSendingOfferId] = useState("");

    const [interviewForm, setInterviewForm] = useState({
        date: "",
        time: "",
        mode: "Online",
        details: "",
        meetingLink: "",
        location: ""
    });

    const [offerForm, setOfferForm] = useState({
        salary: "",
        salaryPeriod: "Monthly",
        joiningDate: "",
        workLocation: "",
        offerDetails: ""
    });

    const getHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("companyToken") || ""}`
    });

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/api/company/applications",
                { headers: getHeaders() }
            );

            if (response.data?.status === 1) {
                setApplications(response.data.data || []);
            } else {
                setError(response.data?.message || "Unable to load applications.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load applications. Please login again if your session has expired."
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyOffers = async () => {
        try {
            const response = await api.get(
                "/api/company/job-offers",
                { headers: getHeaders() }
            );

            if (response.data?.status === 1) {
                setOffers(response.data.data || []);
            }
        } catch (err) {
            console.error(
                "Failed to load company offers:",
                err.response?.data?.message || err.message
            );
        }
    };

    useEffect(() => {
        fetchApplications();
        fetchCompanyOffers();
    }, []);

    const filteredApplications = applications.filter((application) => {
        const applicant = application.userId;
        const job = application.jobId;

        const searchableText = [
            applicant?.firstname,
            applicant?.lastname,
            applicant?.email,
            job?.title,
            job?.location,
            application.status
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchableText.includes(search.trim().toLowerCase());
    });

    const allowedTransitions = {
        Pending: ["Under Review", "Shortlisted", "Rejected"],
        "Under Review": ["Shortlisted", "Rejected"],
        Shortlisted: ["Interview Scheduled", "Rejected"],
        "Interview Scheduled": ["Interview Completed", "Rejected"],
        "Interview Completed": ["Accepted", "Rejected"],
        Accepted: [],
        Rejected: []
    };

    const getAvailableStatuses = (status) => allowedTransitions[status] || [];

    const getApplicantName = (applicant) => {
        if (!applicant) return "Applicant";

        return [
            applicant.firstname,
            applicant.lastname
        ].filter(Boolean).join(" ") || "Applicant";
    };

    const getStatusStyle = (status) => {
        const styles = {
            Pending: "bg-amber-500/10 text-amber-300 border-amber-500/20",
            "Under Review": "bg-blue-500/10 text-blue-300 border-blue-500/20",
            Shortlisted: "bg-violet-500/10 text-violet-300 border-violet-500/20",
            "Interview Scheduled": "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
            "Interview Completed": "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
            Rejected: "bg-red-500/10 text-red-300 border-red-500/20",
            Accepted: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
        };

        return styles[status] || styles.Pending;
    };

    const getOfferStatusStyle = (status) => {
        const styles = {
            "Offer Sent": "bg-amber-500/10 text-amber-300 border-amber-500/20",
            "Offer Accepted": "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
            "Offer Declined": "bg-red-500/10 text-red-300 border-red-500/20",
            Withdrawn: "bg-slate-700 text-slate-300 border-slate-600"
        };

        return styles[status] || styles["Offer Sent"];
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "N/A";

        return parsedDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const handleStatusChange = async (applicationId, status) => {
        if (status === "Interview Scheduled") {
            setSchedulingId(applicationId);
            setOfferFormId("");
            setSuccess("");
            setError("");

            setInterviewForm({
                date: "",
                time: "",
                mode: "Online",
                details: "",
                meetingLink: "",
                location: ""
            });

            return;
        }

        if (!window.confirm(`Change application status to "${status}"?`)) return;

        try {
            setUpdatingId(applicationId);
            setError("");
            setSuccess("");

            const response = await api.put(
                `/api/company/applications/${applicationId}/status`,
                { status },
                { headers: getHeaders() }
            );

            if (response.data?.status === 1) {
                const updatedApplication = response.data.data;

                setApplications((previous) =>
                    previous.map((application) =>
                        application._id === applicationId
                            ? { ...application, ...(updatedApplication || {}), status }
                            : application
                    )
                );

                setSuccess(`Application status updated to "${status}".`);
            } else {
                setError(response.data?.message || "Failed to update application status.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update application status.");
        } finally {
            setUpdatingId("");
        }
    };

    const handleInterviewFormChange = (event) => {
        const { name, value } = event.target;

        setInterviewForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleScheduleInterview = async (event) => {
        event.preventDefault();

        if (!schedulingId) return;

        if (
            !interviewForm.date ||
            !interviewForm.time ||
            !interviewForm.mode ||
            !interviewForm.details.trim()
        ) {
            setError("Please fill in all required interview details.");
            return;
        }

        const selectedDateTime = new Date(
            `${interviewForm.date}T${interviewForm.time}`
        );

        if (
            Number.isNaN(selectedDateTime.getTime()) ||
            selectedDateTime <= new Date()
        ) {
            setError("Please select a future interview date and time.");
            return;
        }

        if (interviewForm.mode === "Online" && !interviewForm.meetingLink.trim()) {
            setError("Please enter the online meeting link.");
            return;
        }

        if (interviewForm.mode === "In-person" && !interviewForm.location.trim()) {
            setError("Please enter the interview location.");
            return;
        }

        try {
            setUpdatingId(schedulingId);
            setError("");
            setSuccess("");

            const response = await api.put(
                `/api/company/applications/${schedulingId}/status`,
                {
                    status: "Interview Scheduled",
                    interview: {
                        date: interviewForm.date,
                        time: interviewForm.time,
                        mode: interviewForm.mode,
                        details: interviewForm.details.trim(),
                        meetingLink: interviewForm.meetingLink.trim(),
                        location: interviewForm.location.trim()
                    }
                },
                { headers: getHeaders() }
            );

            if (response.data?.status === 1) {
                const updatedApplication = response.data.data;

                setApplications((previous) =>
                    previous.map((application) =>
                        application._id === schedulingId
                            ? {
                                ...application,
                                ...(updatedApplication || {}),
                                status: "Interview Scheduled"
                            }
                            : application
                    )
                );

                setSchedulingId("");
                setInterviewForm({
                    date: "",
                    time: "",
                    mode: "Online",
                    details: "",
                    meetingLink: "",
                    location: ""
                });

                setSuccess("Interview scheduled successfully.");
            } else {
                setError(response.data?.message || "Failed to schedule the interview.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to schedule the interview.");
        } finally {
            setUpdatingId("");
        }
    };

    const handleCancelInterview = () => {
        setSchedulingId("");
        setError("");

        setInterviewForm({
            date: "",
            time: "",
            mode: "Online",
            details: "",
            meetingLink: "",
            location: ""
        });
    };

    const handleOfferFormChange = (event) => {
        const { name, value } = event.target;

        setOfferForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const openOfferForm = (application) => {
        const existingOffer = offers.find(
            (offer) =>
                String(offer.applicationId?._id || offer.applicationId) ===
                String(application._id)
        );

        if (existingOffer) {
            setError("A job offer already exists for this application.");
            return;
        }

        setError("");
        setSuccess("");
        setSchedulingId("");
        setOfferFormId(application._id);

        setOfferForm({
            salary: "",
            salaryPeriod: "Monthly",
            joiningDate: "",
            workLocation: application.jobId?.location || "",
            offerDetails: ""
        });
    };

    const handleSendOffer = async (event, application) => {
        event.preventDefault();

        if (!offerFormId) return;

        const salary = Number(offerForm.salary);

        if (!Number.isFinite(salary) || salary <= 0) {
            setError("Please enter a valid salary greater than zero.");
            return;
        }

        if (!offerForm.joiningDate) {
            setError("Please select the joining date.");
            return;
        }

        if (!offerForm.workLocation.trim() || !offerForm.offerDetails.trim()) {
            setError("Please fill in the work location and offer details.");
            return;
        }

        if (new Date(`${offerForm.joiningDate}T23:59:59`) <= new Date()) {
            setError("Joining date must be in the future.");
            return;
        }

        try {
            setSendingOfferId(application._id);
            setError("");
            setSuccess("");

            const response = await api.post(
                `/api/company/job-offers/${application._id}`,
                {
                    salary,
                    salaryPeriod: offerForm.salaryPeriod,
                    joiningDate: offerForm.joiningDate,
                    workLocation: offerForm.workLocation.trim(),
                    offerDetails: offerForm.offerDetails.trim()
                },
                { headers: getHeaders() }
            );

            if (response.data?.status === 1) {
                setSuccess(
                    `Job offer sent successfully to ${getApplicantName(application.userId)}.`
                );

                setOfferFormId("");
                setOfferForm({
                    salary: "",
                    salaryPeriod: "Monthly",
                    joiningDate: "",
                    workLocation: "",
                    offerDetails: ""
                });

                await fetchCompanyOffers();
            } else {
                setError(response.data?.message || "Failed to send the job offer.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send the job offer.");
        } finally {
            setSendingOfferId("");
        }
    };

    const cancelOfferForm = () => {
        setOfferFormId("");
        setError("");

        setOfferForm({
            salary: "",
            salaryPeriod: "Monthly",
            joiningDate: "",
            workLocation: "",
            offerDetails: ""
        });
    };

    const handleDownloadResume = async (application) => {
        try {
            setDownloadingId(application._id);
            setError("");
            setSuccess("");

            const response = await api.get(
                `/api/company/applications/${application._id}/resume`,
                {
                    headers: getHeaders(),
                    responseType: "blob"
                }
            );

            const blobUrl = window.URL.createObjectURL(
                new Blob([response.data], { type: "application/pdf" })
            );

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = application.resume?.fileName || "Applicant-Resume.pdf";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Resume download failed. Please check your login and try again."
            );
        } finally {
            setDownloadingId("");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                    <p className="text-slate-400">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* Separate Header Section */}
            <header className="border-b border-slate-800 bg-slate-900/80">
                <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-indigo-400">
                                Recruitment Management
                            </p>

                            <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
                                Job Applications
                            </h1>

                            <p className="mt-2 text-sm text-slate-400 sm:text-base">
                                Review applicants, download resumes, schedule interviews and send job offers.
                            </p>
                        </div>

                        <Link
                            to="/company-dashboard"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700"
                        >
                            <span aria-hidden="true">←</span>
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

                {/* Separate Search Section */}
                <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-bold text-white">
                            Search Applications
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Find candidates and their applications.
                        </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <svg
                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-4-4" />
                        </svg>

                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search applicants..."
                            aria-label="Search applications"
                            className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-3 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-white"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </section>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300"
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300"
                    >
                        {success}
                    </div>
                )}

                {/* Application Summary Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                        <p className="text-sm text-slate-400">Total Applications</p>
                        <h2 className="mt-2 text-3xl font-bold">
                            {applications.length}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                        <p className="text-sm text-slate-400">Under Review</p>
                        <h2 className="mt-2 text-3xl font-bold text-blue-400">
                            {applications.filter((item) => item.status === "Under Review").length}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                        <p className="text-sm text-slate-400">Shortlisted</p>
                        <h2 className="mt-2 text-3xl font-bold text-violet-400">
                            {applications.filter((item) => item.status === "Shortlisted").length}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                        <p className="text-sm text-slate-400">Interviews Scheduled</p>
                        <h2 className="mt-2 text-3xl font-bold text-cyan-400">
                            {applications.filter((item) => item.status === "Interview Scheduled").length}
                        </h2>
                    </div>
                </div>

                {/* Applications List */}
                {filteredApplications.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
                        <div className="mb-4 text-5xl">📄</div>

                        <h2 className="text-xl font-bold">
                            {search ? "No Matching Applications" : "No Applications Yet"}
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-slate-400">
                            {search
                                ? "No applications match your search. Try another name, email, job title or status."
                                : "Applications will appear here when candidates apply to your approved job postings."}
                        </p>

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500"
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredApplications.map((application) => {
                            const applicant = application.userId;
                            const job = application.jobId;
                            const currentStatus = application.status || "Pending";
                            const availableStatuses = getAvailableStatuses(currentStatus);
                            const interview = application.interview;
                            const isScheduling = schedulingId === application._id;
                            const isOfferFormOpen = offerFormId === application._id;

                            const existingOffer = offers.find(
                                (offer) =>
                                    String(offer.applicationId?._id || offer.applicationId) ===
                                    String(application._id)
                            );

                            return (
                                <div
                                    key={application._id}
                                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 sm:p-6"
                                >
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex min-w-0 gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold">
                                                {getApplicantName(applicant).charAt(0).toUpperCase()}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h2 className="break-words text-xl font-bold">
                                                    {getApplicantName(applicant)}
                                                </h2>

                                                <p className="mt-1 break-all text-sm text-slate-400">
                                                    {applicant?.email || "Email unavailable"}
                                                </p>

                                                <h3 className="mt-3 font-semibold text-indigo-300">
                                                    {job?.title || "Job posting unavailable"}
                                                </h3>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {job?.jobType && (
                                                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                                                            {job.jobType}
                                                        </span>
                                                    )}

                                                    {job?.workMode && (
                                                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                                                            {job.workMode}
                                                        </span>
                                                    )}

                                                    {job?.location && (
                                                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                                                            📍 {job.location}
                                                        </span>
                                                    )}
                                                </div>

                                                {applicant?.education && (
                                                    <p className="mt-3 text-sm text-slate-400">
                                                        Education: {applicant.education}
                                                    </p>
                                                )}

                                                <p className="mt-3 text-xs text-slate-500">
                                                    Applied on: {formatDate(application.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 lg:w-56 lg:shrink-0">
                                            <span
                                                className={`inline-flex justify-center rounded-lg border px-3 py-2 text-sm font-semibold ${getStatusStyle(currentStatus)}`}
                                            >
                                                {currentStatus}
                                            </span>

                                            {availableStatuses.length > 0 ? (
                                                <>
                                                    <label
                                                        htmlFor={`status-${application._id}`}
                                                        className="text-xs text-slate-400"
                                                    >
                                                        Update Application Status
                                                    </label>

                                                    <select
                                                        id={`status-${application._id}`}
                                                        value=""
                                                        disabled={
                                                            updatingId === application._id ||
                                                            isScheduling ||
                                                            isOfferFormOpen
                                                        }
                                                        onChange={(event) => {
                                                            const selectedStatus = event.target.value;

                                                            if (selectedStatus) {
                                                                handleStatusChange(application._id, selectedStatus);
                                                            }
                                                        }}
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500 disabled:opacity-50"
                                                    >
                                                        <option value="">Select next action</option>
                                                        {availableStatuses.map((status) => (
                                                            <option key={status} value={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </>
                                            ) : (
                                                <p className="rounded-xl border border-slate-800 p-3 text-center text-xs text-slate-500">
                                                    This application has reached a final status.
                                                </p>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleDownloadResume(application)}
                                                disabled={downloadingId === application._id}
                                                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {downloadingId === application._id
                                                    ? "Downloading..."
                                                    : "↓ Download Resume"}
                                            </button>

                                            {currentStatus === "Accepted" && (
                                                existingOffer ? (
                                                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                                                        <p className="text-sm font-semibold text-emerald-300">
                                                            Job Offer
                                                        </p>

                                                        <span
                                                            className={`mt-2 inline-flex rounded-lg border px-3 py-1 text-xs font-semibold ${getOfferStatusStyle(existingOffer.status)}`}
                                                        >
                                                            {existingOffer.status}
                                                        </span>

                                                        <p className="mt-2 text-xs text-slate-400">
                                                            Salary: ₹{Number(existingOffer.salary).toLocaleString("en-IN")}
                                                            {" / "}
                                                            {existingOffer.salaryPeriod === "Yearly" ? "year" : "month"}
                                                        </p>

                                                        {existingOffer.respondedAt && (
                                                            <p className="mt-2 text-xs text-slate-500">
                                                                Responded: {formatDate(existingOffer.respondedAt)}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => openOfferForm(application)}
                                                        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold transition hover:bg-emerald-500"
                                                    >
                                                        ✉ Send Job Offer
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Job Offer Form */}
                                    {isOfferFormOpen && currentStatus === "Accepted" && !existingOffer && (
                                        <form
                                            onSubmit={(event) => handleSendOffer(event, application)}
                                            className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 sm:p-6"
                                        >
                                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                                                        Recruitment · Final Stage
                                                    </p>

                                                    <h3 className="mt-1 text-xl font-bold">
                                                        Send Job Offer
                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-400">
                                                        Prepare an offer for {getApplicantName(applicant)}.
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={cancelOfferForm}
                                                    className="self-start text-sm text-slate-400 hover:text-white"
                                                >
                                                    ✕ Cancel
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <label htmlFor={`offer-salary-${application._id}`} className="mb-2 block text-sm text-slate-300">
                                                        Salary *
                                                    </label>
                                                    <input
                                                        id={`offer-salary-${application._id}`}
                                                        type="number"
                                                        name="salary"
                                                        min="1"
                                                        step="0.01"
                                                        value={offerForm.salary}
                                                        onChange={handleOfferFormChange}
                                                        placeholder="e.g. 35000"
                                                        required
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor={`offer-period-${application._id}`} className="mb-2 block text-sm text-slate-300">
                                                        Salary Period *
                                                    </label>
                                                    <select
                                                        id={`offer-period-${application._id}`}
                                                        name="salaryPeriod"
                                                        value={offerForm.salaryPeriod}
                                                        onChange={handleOfferFormChange}
                                                        required
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
                                                    >
                                                        <option value="Monthly">Per Month</option>
                                                        <option value="Yearly">Per Year</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label htmlFor={`offer-joining-${application._id}`} className="mb-2 block text-sm text-slate-300">
                                                        Joining Date *
                                                    </label>
                                                    <input
                                                        id={`offer-joining-${application._id}`}
                                                        type="date"
                                                        name="joiningDate"
                                                        min={new Date().toLocaleDateString("en-CA")}
                                                        value={offerForm.joiningDate}
                                                        onChange={handleOfferFormChange}
                                                        required
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor={`offer-location-${application._id}`} className="mb-2 block text-sm text-slate-300">
                                                        Work Location *
                                                    </label>
                                                    <input
                                                        id={`offer-location-${application._id}`}
                                                        type="text"
                                                        name="workLocation"
                                                        value={offerForm.workLocation}
                                                        onChange={handleOfferFormChange}
                                                        placeholder="e.g. Ahmedabad / Remote"
                                                        maxLength={200}
                                                        required
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label htmlFor={`offer-details-${application._id}`} className="mb-2 block text-sm text-slate-300">
                                                        Offer Details & Terms *
                                                    </label>
                                                    <textarea
                                                        id={`offer-details-${application._id}`}
                                                        name="offerDetails"
                                                        value={offerForm.offerDetails}
                                                        onChange={handleOfferFormChange}
                                                        placeholder="Mention job role, benefits, working hours, probation period and other offer terms..."
                                                        rows={5}
                                                        maxLength={5000}
                                                        required
                                                        className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                                <button
                                                    type="submit"
                                                    disabled={sendingOfferId === application._id}
                                                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold transition hover:bg-emerald-500 disabled:opacity-50"
                                                >
                                                    {sendingOfferId === application._id
                                                        ? "Sending Offer..."
                                                        : "Confirm & Send Offer"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={cancelOfferForm}
                                                    disabled={sendingOfferId === application._id}
                                                    className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold transition hover:bg-slate-800 disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Interview Scheduling Form */}
                                    {isScheduling && (
                                        <form
                                            onSubmit={handleScheduleInterview}
                                            className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-950/70 p-5 sm:p-6"
                                        >
                                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                                                        Interview Management
                                                    </p>

                                                    <h3 className="mt-1 text-xl font-bold">
                                                        Schedule Interview
                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-400">
                                                        Enter the interview details for {getApplicantName(applicant)}.
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleCancelInterview}
                                                    className="self-start text-sm text-slate-400 hover:text-white"
                                                >
                                                    ✕ Cancel
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <label htmlFor={`interview-date-${application._id}`} className="mb-2 block text-sm text-slate-300">
                                                        Interview Date *
                                                    </label>
                                                    <input
                                                        id={`interview-date-${application._id}`}
                                                        type="date"
                                                        name="date"
                                                        min={new Date().toLocaleDateString("en-CA")}
                                                        value={interviewForm.date}
                                                        onChange={handleInterviewFormChange}
                                                        required
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor={`interview-time-${application._id}`} className="mb-2 block text-sm text-slate-300">
                                                        Interview Time *
                                                    </label>
                                                    <input
                                                        id={`interview-time-${application._id}`}
                                                        type="time"
                                                        name="time"
                                                        value={interviewForm.time}
                                                        onChange={handleInterviewFormChange}
                                                        required
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor={`interview-mode-${application._id}`} className="mb-2 block text-sm text-slate-300">
                                                        Interview Mode *
                                                    </label>
                                                    <select
                                                        id={`interview-mode-${application._id}`}
                                                        name="mode"
                                                        value={interviewForm.mode}
                                                        onChange={handleInterviewFormChange}
                                                        required
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                                                    >
                                                        <option value="Online">Online</option>
                                                        <option value="Phone">Phone</option>
                                                        <option value="In-person">In-person</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label htmlFor={`interview-details-${application._id}`} className="mb-2 block text-sm text-slate-300">
                                                        Interview Details *
                                                    </label>
                                                    <input
                                                        id={`interview-details-${application._id}`}
                                                        type="text"
                                                        name="details"
                                                        value={interviewForm.details}
                                                        onChange={handleInterviewFormChange}
                                                        placeholder="e.g. Technical interview"
                                                        required
                                                        maxLength={500}
                                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                                                    />
                                                </div>

                                                {interviewForm.mode === "Online" && (
                                                    <div className="md:col-span-2">
                                                        <label htmlFor={`meeting-link-${application._id}`} className="mb-2 block text-sm text-slate-300">
                                                            Meeting Link *
                                                        </label>
                                                        <input
                                                            id={`meeting-link-${application._id}`}
                                                            type="url"
                                                            name="meetingLink"
                                                            value={interviewForm.meetingLink}
                                                            onChange={handleInterviewFormChange}
                                                            placeholder="https://meet.google.com/..."
                                                            required
                                                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                                                        />
                                                    </div>
                                                )}

                                                {interviewForm.mode === "In-person" && (
                                                    <div className="md:col-span-2">
                                                        <label htmlFor={`interview-location-${application._id}`} className="mb-2 block text-sm text-slate-300">
                                                            Interview Location *
                                                        </label>
                                                        <input
                                                            id={`interview-location-${application._id}`}
                                                            type="text"
                                                            name="location"
                                                            value={interviewForm.location}
                                                            onChange={handleInterviewFormChange}
                                                            placeholder="Office address"
                                                            required
                                                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                                <button
                                                    type="submit"
                                                    disabled={updatingId === application._id}
                                                    className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold transition hover:bg-cyan-500 disabled:opacity-50"
                                                >
                                                    {updatingId === application._id
                                                        ? "Scheduling..."
                                                        : "Confirm Interview"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={handleCancelInterview}
                                                    disabled={updatingId === application._id}
                                                    className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold transition hover:bg-slate-800 disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Saved Interview Details */}
                                    {interview?.date && (
                                        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <h3 className="font-bold text-cyan-300">
                                                    📅 Interview Details
                                                </h3>

                                                {interview.completedAt && (
                                                    <span className="text-xs text-emerald-300">
                                                        Completed on {formatDate(interview.completedAt)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                                <div>
                                                    <p className="mb-1 text-slate-500">Date</p>
                                                    <p className="text-slate-200">{formatDate(interview.date)}</p>
                                                </div>

                                                <div>
                                                    <p className="mb-1 text-slate-500">Time</p>
                                                    <p className="text-slate-200">{interview.time || "N/A"}</p>
                                                </div>

                                                <div>
                                                    <p className="mb-1 text-slate-500">Mode</p>
                                                    <p className="text-slate-200">{interview.mode || "N/A"}</p>
                                                </div>

                                                {interview.details && (
                                                    <div className="sm:col-span-2 lg:col-span-3">
                                                        <p className="mb-1 text-slate-500">Details</p>
                                                        <p className="whitespace-pre-wrap text-slate-200">
                                                            {interview.details}
                                                        </p>
                                                    </div>
                                                )}

                                                {interview.mode === "Online" && interview.meetingLink && (
                                                    <div className="sm:col-span-2 lg:col-span-3">
                                                        <p className="mb-1 text-slate-500">Meeting Link</p>
                                                        <a
                                                            href={interview.meetingLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="break-all text-cyan-300 underline hover:text-cyan-200"
                                                        >
                                                            {interview.meetingLink}
                                                        </a>
                                                    </div>
                                                )}

                                                {interview.mode === "In-person" && interview.location && (
                                                    <div className="sm:col-span-2 lg:col-span-3">
                                                        <p className="mb-1 text-slate-500">Location</p>
                                                        <p className="whitespace-pre-wrap text-slate-200">
                                                            {interview.location}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Applicant Cover Letter */}
                                    {application.coverLetter && (
                                        <div className="mt-6 border-t border-slate-800 pt-5">
                                            <h4 className="mb-2 text-sm font-semibold text-slate-300">
                                                Cover Letter
                                            </h4>

                                            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-400">
                                                {application.coverLetter}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CompanyApplications;
