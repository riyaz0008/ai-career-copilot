import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const MyJobOffers = () => {
    const [offers, setOffers] = useState([]);
    const [changeRequests, setChangeRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [updatingId, setUpdatingId] = useState("");
    const [negotiatingId, setNegotiatingId] = useState("");
    const [selectedOffer, setSelectedOffer] = useState(null);

    const [negotiationForm, setNegotiationForm] = useState({
        requestType: "Salary",
        expectedSalary: "",
        joiningDate: "",
        workLocation: "",
        workingHours: "",
        message: ""
    });

    const getHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem("token")}`
    });

    const fetchOffers = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [offersResponse, requestsResponse] = await Promise.all([
                api.get("/api/my-job-offers", {
                    headers: getHeaders()
                }),
                api.get("/api/my-offer-change-requests", {
                    headers: getHeaders()
                })
            ]);

            if (offersResponse.data?.status === 1) {
                setOffers(offersResponse.data.data || []);
            } else {
                setOffers([]);
                setError(
                    offersResponse.data?.message ||
                    "Unable to load job offers."
                );
            }

            if (requestsResponse.data?.status === 1) {
                setChangeRequests(requestsResponse.data.data || []);
            } else {
                setChangeRequests([]);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your job offers. Please login and try again."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    const handleOfferResponse = async (offerId, responseType) => {
        const action =
            responseType === "Offer Accepted" ? "accept" : "decline";

        if (!window.confirm(`Are you sure you want to ${action} this offer?`)) {
            return;
        }

        setUpdatingId(offerId);
        setError("");
        setSuccess("");

        try {
            const response = await api.put(
                `/api/my-job-offers/${offerId}/respond`,
                { response: responseType },
                { headers: getHeaders() }
            );

            if (response.data?.status === 1) {
                setSuccess(
                    response.data.message ||
                    "Your response has been submitted."
                );

                await fetchOffers();

                if (selectedOffer?._id === offerId) {
                    setSelectedOffer(null);
                }
            } else {
                setError(
                    response.data?.message ||
                    "Unable to submit your response."
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Offer response could not be submitted. Please try again."
            );
        } finally {
            setUpdatingId("");
        }
    };

    const openNegotiationForm = (offer) => {
        setSelectedOffer(null);
        setNegotiatingId(offer._id);
        setError("");
        setSuccess("");

        setNegotiationForm({
            requestType: "Salary",
            expectedSalary: "",
            joiningDate: "",
            workLocation: "",
            workingHours: "",
            message: ""
        });
    };

    const closeNegotiationForm = () => {
        setNegotiatingId("");

        setNegotiationForm({
            requestType: "Salary",
            expectedSalary: "",
            joiningDate: "",
            workLocation: "",
            workingHours: "",
            message: ""
        });
    };

    const handleRequestTypeChange = (value) => {
        setNegotiationForm((previous) => ({
            ...previous,
            requestType: value,
            expectedSalary: "",
            joiningDate: "",
            workLocation: "",
            workingHours: ""
        }));
    };

    const getRequestDetails = () => {
        const details = {
            requestType: negotiationForm.requestType,
            message: negotiationForm.message.trim()
        };

        if (negotiationForm.requestType === "Salary") {
            details.expectedSalary = Number(negotiationForm.expectedSalary);
        }

        if (negotiationForm.requestType === "Joining Date") {
            details.joiningDate = negotiationForm.joiningDate;
        }

        if (negotiationForm.requestType === "Work Location") {
            details.workLocation = negotiationForm.workLocation.trim();
        }

        if (negotiationForm.requestType === "Working Hours") {
            details.workingHours = negotiationForm.workingHours.trim();
        }

        return details;
    };

    const handleRequestSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!negotiatingId) return;

        if (negotiationForm.message.trim().length < 5) {
            setError(
                "Please explain your requested change in at least 5 characters."
            );
            return;
        }

        if (negotiationForm.message.trim().length > 1500) {
            setError("Message cannot exceed 1500 characters.");
            return;
        }

        if (
            negotiationForm.requestType === "Salary" &&
            (
                !negotiationForm.expectedSalary ||
                !Number.isFinite(Number(negotiationForm.expectedSalary)) ||
                Number(negotiationForm.expectedSalary) <= 0
            )
        ) {
            setError("Please enter a valid expected salary.");
            return;
        }

        if (negotiationForm.requestType === "Joining Date") {
            const selectedDate = new Date(
                `${negotiationForm.joiningDate}T00:00:00`
            );

            if (
                !negotiationForm.joiningDate ||
                Number.isNaN(selectedDate.getTime()) ||
                selectedDate <= new Date(new Date().toDateString())
            ) {
                setError("Please select a future joining date.");
                return;
            }
        }

        if (
            negotiationForm.requestType === "Work Location" &&
            !negotiationForm.workLocation.trim()
        ) {
            setError("Please enter your preferred work location or mode.");
            return;
        }

        if (
            negotiationForm.requestType === "Working Hours" &&
            !negotiationForm.workingHours.trim()
        ) {
            setError("Please enter your preferred working hours.");
            return;
        }

        setUpdatingId(negotiatingId);

        try {
            const response = await api.post(
                `/api/my-job-offers/${negotiatingId}/change-requests`,
                getRequestDetails(),
                { headers: getHeaders() }
            );

            if (response.data?.status === 1) {
                setSuccess(
                    response.data.message ||
                    "Your offer change request was submitted successfully."
                );

                closeNegotiationForm();
                await fetchOffers();
            } else {
                setError(
                    response.data?.message ||
                    "Unable to submit your change request."
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Request could not be submitted. Please try again."
            );
        } finally {
            setUpdatingId("");
        }
    };

    const formatDate = (date) => {
        if (!date) return "Not specified";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not specified";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatSalary = (salary) => {
        return Number(salary || 0).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Offer Accepted":
                return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

            case "Offer Declined":
                return "border-red-500/30 bg-red-500/10 text-red-300";

            case "Withdrawn":
                return "border-slate-700 bg-slate-800 text-slate-300";

            default:
                return "border-amber-500/30 bg-amber-500/10 text-amber-300";
        }
    };

    const getRequestStatusStyle = (status) => {
        switch (status) {
            case "Request Declined":
                return "border-red-500/30 bg-red-500/10 text-red-300";

            case "Offer Revised":
                return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

            case "Original Offer Maintained":
                return "border-amber-500/30 bg-amber-500/10 text-amber-300";

            case "Pending":
                return "border-blue-500/30 bg-blue-500/10 text-blue-300";

            case "Cancelled":
                return "border-slate-700 bg-slate-800 text-slate-300";

            default:
                return "border-slate-700 bg-slate-800 text-slate-300";
        }
    };

    const getOfferRequests = (offerId) => {
        return changeRequests
            .filter((request) => {
                const requestOfferId =
                    request.offerId?._id || request.offerId;

                return String(requestOfferId) === String(offerId);
            })
            .sort((a, b) => {
                return (
                    new Date(b.updatedAt || b.createdAt || 0) -
                    new Date(a.updatedAt || a.createdAt || 0)
                );
            });
    };

    const DetailItem = ({ label, value }) => (
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold text-slate-200">
                {value || "Not specified"}
            </p>
        </div>
    );

    const renderOfferDetails = (offer) => {
        const job = offer.jobId || {};
        const company = offer.companyId || {};
        const isPending = offer.status === "Offer Sent";
        const offerRequests = getOfferRequests(offer._id);

        return (
            <div className="space-y-5">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                        Offer Details & Terms
                    </p>

                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                        {offer.offerDetails || "No additional details provided."}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DetailItem
                        label="Joining Date"
                        value={formatDate(offer.joiningDate)}
                    />
                    <DetailItem
                        label="Work Location"
                        value={offer.workLocation || job.location}
                    />
                    <DetailItem
                        label="Employment Type"
                        value={job.jobType}
                    />
                    <DetailItem
                        label="Work Mode"
                        value={job.workMode}
                    />
                    <DetailItem
                        label="Department"
                        value={job.department}
                    />
                    <DetailItem
                        label="Company Website"
                        value={company.website}
                    />
                </div>

                {offer.respondedAt && (
                    <p className="text-xs text-slate-500">
                        Offer response submitted: {formatDate(offer.respondedAt)}
                    </p>
                )}

                {offerRequests.length > 0 && (
                    <div className="space-y-3 border-t border-slate-800 pt-4">
                        <h3 className="font-semibold text-white">
                            Request History & Company Response
                        </h3>

                        {offerRequests.map((request) => (
                            <div
                                key={request._id}
                                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-slate-200">
                                            {request.requestType || "Offer Change Request"}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Requested on: {formatDate(request.createdAt)}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRequestStatusStyle(request.status)}`}
                                    >
                                        {request.status || "Pending"}
                                    </span>
                                </div>

                                {request.message && (
                                    <div className="mt-3">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Your Message
                                        </p>
                                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                            {request.message}
                                        </p>
                                    </div>
                                )}

                                {request.companyResponse && (
                                    <div className="mt-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                                            Company Response
                                        </p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                                            {request.companyResponse}
                                        </p>

                                        {request.respondedAt && (
                                            <p className="mt-2 text-xs text-slate-500">
                                                Responded on: {formatDate(request.respondedAt)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {request.status === "Pending" && (
                                    <p className="mt-3 text-sm text-blue-300">
                                        Your request is waiting for the company's response.
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {isPending && (
                    <div className="space-y-3 border-t border-slate-800 pt-4">
                        <h3 className="font-semibold text-white">
                            Review Your Offer
                        </h3>

                        <p className="text-sm leading-6 text-slate-400">
                            You can request changes before accepting or declining this offer.
                        </p>

                        <button
                            type="button"
                            onClick={() => openNegotiationForm(offer)}
                            className="w-full rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20"
                        >
                            Request Changes
                        </button>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                disabled={updatingId === offer._id}
                                onClick={() =>
                                    handleOfferResponse(offer._id, "Offer Accepted")
                                }
                                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                            >
                                {updatingId === offer._id
                                    ? "Please wait..."
                                    : "Accept Offer"}
                            </button>

                            <button
                                type="button"
                                disabled={updatingId === offer._id}
                                onClick={() =>
                                    handleOfferResponse(offer._id, "Offer Declined")
                                }
                                className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                            >
                                Decline Offer
                            </button>
                        </div>
                    </div>
                )}

                {offer.status === "Offer Accepted" && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-300">
                        <p className="font-semibold">Offer Accepted</p>
                        You have accepted this job offer.
                    </div>
                )}

                {offer.status === "Offer Declined" && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-300">
                        <p className="font-semibold">Offer Declined</p>
                        You have declined this job offer.
                    </div>
                )}

                {offer.status === "Withdrawn" && (
                    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-sm text-slate-300">
                        This offer has been withdrawn by the company.
                    </div>
                )}
            </div>
        );
    };

    const negotiatingOffer = offers.find(
        (offer) => offer._id === negotiatingId
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <Link
                        to="/"
                        className="shrink-0 text-xl font-extrabold tracking-tight sm:text-2xl"
                    >
                        <span className="text-indigo-400">AI</span>{" "}
                        Career Copilot
                    </Link>

                    <nav className="flex items-center gap-3 text-sm sm:gap-6">
                        <Link
                            to="/user-dashboard"
                            className="hidden text-slate-300 transition hover:text-white sm:inline"
                        >
                            Dashboard
                        </Link>

                        <Link
                            to="/browse-jobs"
                            className="hidden text-slate-300 transition hover:text-indigo-300 sm:inline"
                        >
                            Browse Jobs
                        </Link>

                        <Link
                            to="/my-applications"
                            className="text-slate-300 transition hover:text-indigo-300"
                        >
                            My Applications
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Page heading */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                            Career Opportunities
                        </p>

                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                            My Job Offers
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                            Review your offers, compare the terms and make your career decision.
                        </p>
                    </div>

                 
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="text-lg leading-none hover:text-white"
                        >
                            ×
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                        <span>{success}</span>
                        <button
                            type="button"
                            onClick={() => setSuccess("")}
                            className="text-lg leading-none hover:text-white"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">
                        <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />
                        <p className="text-sm text-slate-400">
                            Loading your job offers...
                        </p>
                    </div>
                ) : offers.length === 0 ? (
                    /* Empty state */
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-16 text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-3xl text-indigo-300">
                            ✉
                        </div>

                        <h2 className="text-xl font-bold">
                            No Job Offers Yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                            When a company sends you a job offer, it will appear here.
                        </p>

                        <Link
                            to="/browse-jobs#job-listings"
                            className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                        >
                            Browse Jobs →
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Summary */}
                        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                                <p className="text-xs text-slate-400">
                                    Total Offers
                                </p>
                                <p className="mt-2 text-2xl font-bold text-white">
                                    {offers.length}
                                </p>
                            </div>

                            <div className="rounded-xl border border-amber-500/20 bg-slate-900 p-4">
                                <p className="text-xs text-slate-400">
                                    Awaiting Response
                                </p>
                                <p className="mt-2 text-2xl font-bold text-amber-300">
                                    {offers.filter(
                                        (offer) => offer.status === "Offer Sent"
                                    ).length}
                                </p>
                            </div>

                            <div className="col-span-2 rounded-xl border border-emerald-500/20 bg-slate-900 p-4 sm:col-span-1">
                                <p className="text-xs text-slate-400">
                                    Accepted Offers
                                </p>
                                <p className="mt-2 text-2xl font-bold text-emerald-300">
                                    {offers.filter(
                                        (offer) => offer.status === "Offer Accepted"
                                    ).length}
                                </p>
                            </div>
                        </div>

                        {/* Compact offer cards */}
                        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
                            {offers.map((offer) => {
                                const job = offer.jobId || {};
                                const company = offer.companyId || {};

                                return (
                                    <article
                                        key={offer._id}
                                        className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition duration-200 hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-950/20"
                                    >
                                        <div className="border-b border-slate-800 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 p-5">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-lg font-bold text-indigo-300">
                                                    {(company.companyName || "C")
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h2 className="break-words text-lg font-bold text-white">
                                                        {job.title || "Job Position"}
                                                    </h2>
                                                    <p className="mt-1 text-sm text-slate-400">
                                                        {company.companyName || "Company"}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(offer.status)}`}
                                                >
                                                    {offer.status}
                                                </span>
                                            </div>

                                            <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                                                <div>
                                                    <p className="text-xs text-slate-400">
                                                        Offered Salary
                                                    </p>
                                                    <p className="mt-1 text-2xl font-extrabold text-emerald-300">
                                                        ₹{formatSalary(offer.salary)}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Per {offer.salaryPeriod === "Yearly" ? "year" : "month"}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500">
                                                        Joining Date
                                                    </p>
                                                    <p className="mt-1 text-sm font-semibold text-slate-200">
                                                        {formatDate(offer.joiningDate)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 p-5">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex items-start gap-2">
                                                    <span className="text-base">📍</span>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] text-slate-500">
                                                            Work Location
                                                        </p>
                                                        <p className="mt-1 break-words text-sm font-medium text-slate-300">
                                                            {offer.workLocation || job.location || "Not specified"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2">
                                                    <span className="text-base">💼</span>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] text-slate-500">
                                                            Employment Type
                                                        </p>
                                                        <p className="mt-1 text-sm font-medium text-slate-300">
                                                            {job.jobType || "Not specified"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="col-span-2 flex items-start gap-2">
                                                    <span className="text-base">🏢</span>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] text-slate-500">
                                                            Work Mode
                                                        </p>
                                                        <p className="mt-1 text-sm font-medium text-slate-300">
                                                            {job.workMode || "Not specified"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {offer.offerDetails && (
                                                <p className="line-clamp-2 text-sm leading-6 text-slate-400">
                                                    {offer.offerDetails}
                                                </p>
                                            )}

                                            <div className="flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                                <p className="text-xs text-slate-500">
                                                    Received: {formatDate(offer.createdAt)}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedOffer(offer)}
                                                    className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-indigo-500 hover:text-white"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}
            </main>

            {/* View Details Modal */}
            {selectedOffer && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedOffer(null);
                        }
                    }}
                >
                    <div className="my-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40">
                        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-800 bg-slate-900/95 p-5 backdrop-blur">
                            <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 font-bold text-indigo-300">
                                    {(selectedOffer.companyId?.companyName || "C")
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                    <h2 className="break-words text-xl font-bold">
                                        {selectedOffer.jobId?.title || "Job Offer Details"}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {selectedOffer.companyId?.companyName || "Company"}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedOffer(null)}
                                className="rounded-lg px-3 py-1 text-2xl leading-none text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                aria-label="Close details"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-5 p-5 sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                                <div>
                                    <p className="text-xs text-slate-500">
                                        Offered Salary
                                    </p>
                                    <p className="mt-1 text-2xl font-extrabold text-emerald-300">
                                        ₹{formatSalary(selectedOffer.salary)}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Per {selectedOffer.salaryPeriod === "Yearly" ? "year" : "month"}
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(selectedOffer.status)}`}
                                >
                                    {selectedOffer.status}
                                </span>
                            </div>

                            {renderOfferDetails(selectedOffer)}

                            <button
                                type="button"
                                onClick={() => setSelectedOffer(null)}
                                className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Changes Modal */}
            {negotiatingId && negotiatingOffer && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-5">
                    <div className="my-5 w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5">
                            <div>
                                <h2 className="text-xl font-bold">
                                    Request Offer Changes
                                </h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    {negotiatingOffer.jobId?.title || "Job Offer"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeNegotiationForm}
                                disabled={updatingId === negotiatingId}
                                className="rounded-lg px-3 py-1 text-2xl leading-none text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                                aria-label="Close request form"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleRequestSubmit} className="space-y-5 p-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    What would you like to change?
                                </label>

                                <select
                                    required
                                    value={negotiationForm.requestType}
                                    onChange={(event) =>
                                        handleRequestTypeChange(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                >
                                    <option value="Salary">Salary / Compensation</option>
                                    <option value="Joining Date">Joining Date</option>
                                    <option value="Work Location">Work Location / Work Mode</option>
                                    <option value="Working Hours">Working Hours</option>
                                    <option value="Benefits">Benefits / Employment Terms</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {negotiationForm.requestType === "Salary" && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Expected Salary (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        required
                                        value={negotiationForm.expectedSalary}
                                        onChange={(event) =>
                                            setNegotiationForm((previous) => ({
                                                ...previous,
                                                expectedSalary: event.target.value
                                            }))
                                        }
                                        placeholder="e.g. 40000"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                    />
                                    <p className="mt-2 text-xs text-slate-500">
                                        Current salary period: {negotiatingOffer.salaryPeriod || "Monthly"}
                                    </p>
                                </div>
                            )}

                            {negotiationForm.requestType === "Joining Date" && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Requested Joining Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toLocaleDateString("en-CA")}
                                        value={negotiationForm.joiningDate}
                                        onChange={(event) =>
                                            setNegotiationForm((previous) => ({
                                                ...previous,
                                                joiningDate: event.target.value
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                    />
                                </div>
                            )}

                            {negotiationForm.requestType === "Work Location" && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Preferred Work Location / Mode
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength="200"
                                        value={negotiationForm.workLocation}
                                        onChange={(event) =>
                                            setNegotiationForm((previous) => ({
                                                ...previous,
                                                workLocation: event.target.value
                                            }))
                                        }
                                        placeholder="e.g. Remote or Ahmedabad"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                    />
                                </div>
                            )}

                            {negotiationForm.requestType === "Working Hours" && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Preferred Working Hours
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength="200"
                                        value={negotiationForm.workingHours}
                                        onChange={(event) =>
                                            setNegotiationForm((previous) => ({
                                                ...previous,
                                                workingHours: event.target.value
                                            }))
                                        }
                                        placeholder="e.g. 10 AM to 6 PM"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Message to Company
                                </label>
                                <textarea
                                    required
                                    rows="4"
                                    minLength="5"
                                    maxLength="1500"
                                    value={negotiationForm.message}
                                    onChange={(event) =>
                                        setNegotiationForm((previous) => ({
                                            ...previous,
                                            message: event.target.value
                                        }))
                                    }
                                    placeholder="Explain what change you need and why..."
                                    className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                />
                                <p className="mt-1 text-right text-xs text-slate-500">
                                    {negotiationForm.message.length}/1500
                                </p>
                            </div>

                            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm leading-6 text-amber-200">
                                Your request will be sent to the company for review.
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={closeNegotiationForm}
                                    disabled={updatingId === negotiatingId}
                                    className="flex-1 rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={updatingId === negotiatingId}
                                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {updatingId === negotiatingId
                                        ? "Submitting..."
                                        : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyJobOffers;