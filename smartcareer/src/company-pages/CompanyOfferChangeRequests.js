import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000";

const CompanyOfferChangeRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [responseStatus, setResponseStatus] = useState("Original Offer Maintained");
    const [companyResponse, setCompanyResponse] = useState("");
    const [revisedSalary, setRevisedSalary] = useState("");
    const [revisedJoiningDate, setRevisedJoiningDate] = useState("");
    const [revisedWorkLocation, setRevisedWorkLocation] = useState("");
    const [saving, setSaving] = useState(false);

    // Search state
    const [search, setSearch] = useState("");

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem("companyToken")}`
        }
    });

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/api/company/offer-change-requests`,
                getHeaders()
            );

            setRequests(
                Array.isArray(response.data?.data)
                    ? response.data.data
                    : []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Offer status load nahi ho saka."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Filter requests using search text
    const filteredRequests = requests.filter((request) => {
        const candidate = request.userId || {};
        const offer = request.offerId || {};
        const job = offer.jobId || request.applicationId?.jobId || {};

        const searchableText = [
            candidate.firstname,
            candidate.lastname,
            candidate.email,
            job.title,
            request.requestType,
            request.status,
            request.requestStatus,
            request.displayMessage,
            request.message,
            request.companyResponse
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchableText.includes(search.trim().toLowerCase());
    });

    const handleRespond = async (event) => {
        event.preventDefault();

        if (!selectedRequest) return;

        if (!companyResponse.trim()) {
            alert("Please enter your response to the candidate.");
            return;
        }

        if (
            responseStatus === "Offer Revised" &&
            selectedRequest.requestType === "Salary" &&
            (!revisedSalary || Number(revisedSalary) <= 0)
        ) {
            alert("Please enter a valid revised salary.");
            return;
        }

        if (
            responseStatus === "Offer Revised" &&
            selectedRequest.requestType === "Joining Date" &&
            !revisedJoiningDate
        ) {
            alert("Please select the revised joining date.");
            return;
        }

        if (
            responseStatus === "Offer Revised" &&
            selectedRequest.requestType === "Work Location" &&
            !revisedWorkLocation.trim()
        ) {
            alert("Please enter the revised work location.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                status: responseStatus,
                companyResponse: companyResponse.trim()
            };

            if (
                responseStatus === "Offer Revised" &&
                selectedRequest.requestType === "Salary"
            ) {
                payload.revisedSalary = Number(revisedSalary);
            }

            if (
                responseStatus === "Offer Revised" &&
                selectedRequest.requestType === "Joining Date"
            ) {
                payload.revisedJoiningDate = revisedJoiningDate;
            }

            if (
                responseStatus === "Offer Revised" &&
                selectedRequest.requestType === "Work Location"
            ) {
                payload.revisedWorkLocation = revisedWorkLocation.trim();
            }

            const response = await axios.put(
                `${API_URL}/api/company/offer-change-requests/${selectedRequest._id}/respond`,
                payload,
                getHeaders()
            );

            alert(
                response.data?.message ||
                "Response submitted successfully."
            );

            setSelectedRequest(null);
            setCompanyResponse("");
            setRevisedSalary("");
            setRevisedJoiningDate("");
            setRevisedWorkLocation("");

            await fetchRequests();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Response submit nahi ho saka."
            );
        } finally {
            setSaving(false);
        }
    };

    const statusStyle = (status) => {
        switch (status) {
            case "Pending":
                return "bg-amber-500/10 text-amber-300 border-amber-500/20";

            case "Offer Revised":
            case "Offer Accepted":
                return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";

            case "Offer Declined":
            case "Request Declined":
                return "bg-red-500/10 text-red-300 border-red-500/20";

            case "Original Offer Maintained":
                return "bg-blue-500/10 text-blue-300 border-blue-500/20";

            case "Cancelled":
                return "bg-slate-700 text-slate-300 border-slate-600";

            default:
                return "bg-slate-700 text-slate-300 border-slate-600";
        }
    };

    const formatDate = (date) => {
        if (!date) return "Not provided";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const acceptedCount = requests.filter(
        (request) => request.status === "Offer Accepted"
    ).length;

    const rejectedCount = requests.filter(
        (request) => request.status === "Offer Declined"
    ).length;

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/80">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
                    <div>
                        <p className="text-sm font-medium text-indigo-400">
                            Recruitment Management
                        </p>

                        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                            Offer Status
                        </h1>

                        <p className="mt-2 text-sm text-slate-400">
                            Track candidate offers and review change requests.
                        </p>
                    </div>

                    <Link
                        to="/company-dashboard"
                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-indigo-500 hover:bg-slate-700"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Search Bar - Header ke bahar */}
                <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-white">
                            Search Offer Requests
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            Find candidates and their offer requests.
                        </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <svg
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                cx="11"
                                cy="11"
                                r="7"
                                strokeWidth="2"
                            />
                            <path
                                d="m16 16 4 4"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>

                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search requests..."
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pl-9 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                title="Clear search"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Statistics */}
                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                        <p className="text-sm text-slate-400">
                            Total Requests
                        </p>

                        <h2 className="mt-2 text-3xl font-bold">
                            {requests.length}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/20 bg-slate-900 p-5">
                        <p className="text-sm text-slate-400">
                            Offer Accepted
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-emerald-300">
                            {acceptedCount}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-5">
                        <p className="text-sm text-slate-400">
                            Offer Rejected
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-red-300">
                            {rejectedCount}
                        </h2>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}

                        <button
                            onClick={fetchRequests}
                            className="ml-3 font-semibold underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Requests */}
                {loading ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-400">
                        Loading offer status...
                    </div>
                ) : requests.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-3xl">
                            ↔
                        </div>

                        <h2 className="mt-5 text-xl font-bold">
                            No Offer Status Yet
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                            Candidate offers and negotiation requests will
                            appear here.
                        </p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl">
                            🔍
                        </div>

                        <h2 className="mt-4 text-lg font-bold">
                            No Matching Requests
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            No offer requests match "{search}".
                        </p>

                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold transition hover:bg-indigo-500"
                        >
                            Clear Search
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredRequests.map((request) => {
                            const candidate = request.userId || {};
                            const offer = request.offerId || {};

                            const job =
                                offer.jobId ||
                                request.applicationId?.jobId ||
                                {};

                            const displayStatus = request.status;

                            const displayMessage =
                                request.displayMessage ||
                                request.message ||
                                "No candidate message.";

                            const canReview =
                                (request.requestStatus || request.status) ===
                                "Pending" &&
                                !["Offer Accepted", "Offer Declined"].includes(
                                    offer.status
                                );

                            return (
                                <div
                                    key={request._id}
                                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-black/10 sm:p-6"
                                >
                                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                                        <div>
                                            <h2 className="text-lg font-bold">
                                                {candidate.firstname || ""}{" "}
                                                {candidate.lastname || ""}
                                            </h2>

                                            <p className="mt-1 break-all text-sm text-slate-400">
                                                {candidate.email ||
                                                    "Email unavailable"}
                                            </p>

                                            <p className="mt-3 font-semibold text-indigo-300">
                                                {job.title || "Job position"}
                                            </p>
                                        </div>

                                        <span
                                            className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyle(displayStatus)}`}
                                        >
                                            {displayStatus === "Offer Declined"
                                                ? "Offer Rejected"
                                                : displayStatus}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <div className="rounded-xl bg-slate-800/70 p-4">
                                            <p className="text-xs text-slate-400">
                                                Request Type
                                            </p>

                                            <p className="mt-1 font-semibold">
                                                {request.requestType ||
                                                    "Offer Response"}
                                            </p>
                                        </div>

                                        {request.requestType === "Salary" && (
                                            <div className="rounded-xl bg-slate-800/70 p-4">
                                                <p className="text-xs text-slate-400">
                                                    Expected Salary
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {request.expectedSalary
                                                        ? `₹${Number(
                                                            request.expectedSalary
                                                        ).toLocaleString("en-IN")}`
                                                        : "Not specified"}
                                                </p>
                                            </div>
                                        )}

                                        {request.requestType === "Joining Date" && (
                                            <div className="rounded-xl bg-slate-800/70 p-4">
                                                <p className="text-xs text-slate-400">
                                                    Requested Joining Date
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {formatDate(request.joiningDate)}
                                                </p>
                                            </div>
                                        )}

                                        {request.requestType === "Work Location" && (
                                            <div className="rounded-xl bg-slate-800/70 p-4">
                                                <p className="text-xs text-slate-400">
                                                    Requested Location
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    {request.workLocation ||
                                                        "Not specified"}
                                                </p>
                                            </div>
                                        )}

                                        <div className="rounded-xl bg-slate-800/70 p-4">
                                            <p className="text-xs text-slate-400">
                                                Request Date
                                            </p>

                                            <p className="mt-1 font-semibold">
                                                {formatDate(request.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 rounded-xl border border-slate-800 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Candidate Message
                                        </p>

                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                                            {displayMessage}
                                        </p>
                                    </div>

                                    {request.companyResponse && (
                                        <div className="mt-4 rounded-xl border border-slate-800 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                Company Response
                                            </p>

                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">
                                                {request.companyResponse}
                                            </p>

                                            {request.respondedAt && (
                                                <p className="mt-2 text-xs text-slate-500">
                                                    Responded on{" "}
                                                    {formatDate(request.respondedAt)}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {canReview && (
                                        <div className="mt-5 flex justify-end">
                                            <button
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setResponseStatus(
                                                        "Original Offer Maintained"
                                                    );
                                                    setCompanyResponse("");
                                                    setRevisedSalary("");
                                                    setRevisedJoiningDate("");
                                                    setRevisedWorkLocation("");
                                                }}
                                                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold transition hover:from-indigo-500 hover:to-violet-500"
                                            >
                                                Review Request
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Respond Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
                    <div className="my-6 w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 p-5 sm:p-6">
                            <div>
                                <h2 className="text-xl font-bold">
                                    Respond to Request
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    {selectedRequest.requestType} request
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedRequest(null)}
                                className="rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleRespond}
                            className="space-y-5 p-5 sm:p-6"
                        >
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Decision
                                </label>

                                <select
                                    value={responseStatus}
                                    onChange={(event) =>
                                        setResponseStatus(event.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                >
                                    <option value="Offer Revised">
                                        Offer Revised
                                    </option>

                                    <option value="Original Offer Maintained">
                                        Original Offer Maintained
                                    </option>

                                    <option value="Request Declined">
                                        Request Declined
                                    </option>
                                </select>
                            </div>

                            {responseStatus === "Offer Revised" &&
                                selectedRequest.requestType === "Salary" && (
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            Revised Salary (₹)
                                        </label>

                                        <input
                                            type="number"
                                            min="1"
                                            value={revisedSalary}
                                            onChange={(event) =>
                                                setRevisedSalary(event.target.value)
                                            }
                                            required
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                            placeholder="Enter revised salary"
                                        />
                                    </div>
                                )}

                            {responseStatus === "Offer Revised" &&
                                selectedRequest.requestType === "Joining Date" && (
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            Revised Joining Date
                                        </label>

                                        <input
                                            type="date"
                                            value={revisedJoiningDate}
                                            onChange={(event) =>
                                                setRevisedJoiningDate(event.target.value)
                                            }
                                            required
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                )}

                            {responseStatus === "Offer Revised" &&
                                selectedRequest.requestType === "Work Location" && (
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            Revised Work Location
                                        </label>

                                        <input
                                            type="text"
                                            value={revisedWorkLocation}
                                            onChange={(event) =>
                                                setRevisedWorkLocation(event.target.value)
                                            }
                                            required
                                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                            placeholder="Enter revised location"
                                        />
                                    </div>
                                )}

                            {responseStatus === "Offer Revised" &&
                                ![
                                    "Salary",
                                    "Joining Date",
                                    "Work Location"
                                ].includes(selectedRequest.requestType) && (
                                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6 text-amber-200">
                                        For {selectedRequest.requestType}, explain
                                        the revised terms clearly in your response.
                                    </div>
                                )}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-300">
                                    Response Message
                                </label>

                                <textarea
                                    value={companyResponse}
                                    onChange={(event) =>
                                        setCompanyResponse(event.target.value)
                                    }
                                    rows={4}
                                    maxLength={1500}
                                    required
                                    className="w-full resize-y rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                    placeholder="Explain your decision to the candidate..."
                                />
                            </div>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRequest(null)}
                                    className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving
                                        ? "Submitting..."
                                        : "Submit Response"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyOfferChangeRequests;