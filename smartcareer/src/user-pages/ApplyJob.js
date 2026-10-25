import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";

const ApplyJob = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [coverLetter, setCoverLetter] = useState("");
    const [resume, setResume] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/api/jobs");
                const result = response.data;

                const jobs = Array.isArray(result)
                    ? result
                    : Array.isArray(result?.data)
                        ? result.data
                        : Array.isArray(result?.jobs)
                            ? result.jobs
                            : [];

                const foundJob = jobs.find(
                    (item) => String(item._id) === String(jobId)
                );

                if (!foundJob) {
                    setError("This job is unavailable or no longer accepting applications.");
                    return;
                }

                setJob(foundJob);
            } catch (err) {
                console.error("Error loading job:", err);
                setError(
                    err.response?.data?.message ||
                    "Unable to load job details. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [jobId]);

    const handleResumeChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            setResume(null);
            return;
        }

        if (file.type !== "application/pdf") {
            setResume(null);
            e.target.value = "";
            alert("Please select your resume in PDF format.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setResume(null);
            e.target.value = "";
            alert("Resume size must be 5 MB or less.");
            return;
        }

        setResume(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem("user") || "null");
        const token =
            localStorage.getItem("token") ||
            user?.token ||
            user?.data?.token;

        if (!token) {
            alert("Please log in before applying.");
            navigate("/login");
            return;
        }

        if (!resume) {
            alert("Please upload your resume PDF.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const formData = new FormData();
            formData.append("resume", resume);
            formData.append("coverLetter", coverLetter);

            // This endpoint must support multipart/form-data on the backend.
            await api.post(
                `/api/jobs/${jobId}/apply`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Your application was submitted successfully!");
            navigate("/my-applications");
        } catch (err) {
            console.error("Job application error:", err);

            setError(
                err.response?.data?.message ||
                "Application failed. Please check your backend configuration and try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                Loading job details...
            </div>
        );
    }

    if (error && !job) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
                <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                    <h2 className="text-xl font-bold">Job Not Available</h2>
                    <p className="mt-3 text-sm text-slate-400">{error}</p>
                    <Link
                        to="/browse-jobs"
                        className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500"
                    >
                        Back to Browse Jobs
                    </Link>
                </div>
            </div>
        );
    }

    const companyName =
        typeof job?.companyId === "object"
            ? job.companyId?.companyName || "Company"
            : "Company";

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="border-b border-slate-800 bg-slate-950 px-4 py-5">
                <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
                    <Link
                        to="/browse-jobs"
                        className="text-lg font-bold text-white"
                    >
                        <span className="text-indigo-400">AI</span> Career Copilot
                    </Link>

                    <Link
                        to="/browse-jobs"
                        className="text-sm text-slate-300 hover:text-white"
                    >
                        ← Browse Jobs
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-10">
                <div className="mb-7">
                    <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
                        Job Application
                    </p>
                    <h1 className="mt-2 text-3xl font-bold">
                        Apply for this position
                    </h1>
                    <p className="mt-2 text-slate-400">
                        Submit your resume and application details.
                    </p>
                </div>

                {job && (
                    <div className="mb-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950 to-slate-900 p-6">
                        <h2 className="text-xl font-bold">{job.title}</h2>
                        <p className="mt-2 text-slate-300">{companyName}</p>

                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                            {job.location && <span>📍 {job.location}</span>}
                            {job.jobType && <span>💼 {job.jobType}</span>}
                            {job.workMode && <span>🏢 {job.workMode}</span>}
                        </div>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8"
                >
                    {error && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Resume (PDF) <span className="text-red-400">*</span>
                        </label>

                        <input
                            type="file"
                            accept=".pdf,application/pdf"
                            required
                            onChange={handleResumeChange}
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-indigo-500"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            PDF only. Maximum file size: 5 MB.
                        </p>

                        {resume && (
                            <p className="mt-2 text-sm text-emerald-400">
                                Selected: {resume.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">
                            Cover Letter
                        </label>

                        <textarea
                            rows={6}
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder="Introduce yourself and explain why you are suitable for this position..."
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            Explain your relevant skills, experience and interest in this role.
                        </p>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end">
                        <Link
                            to="/browse-jobs"
                            className="rounded-xl border border-slate-700 px-5 py-3 text-center text-sm font-semibold text-slate-300 hover:bg-slate-800"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? "Submitting..." : "Submit Application"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ApplyJob;