import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const initialForm = {
    title: "",
    department: "",
    jobType: "Full-time",
    workMode: "On-site",
    location: "",
    salaryMin: "",
    salaryMax: "",
    experience: "",
    description: "",
    responsibilities: "",
    requiredSkills: "",
    education: "",
    applicationDeadline: "",
    status: "Active"
};

const ManageJobs = () => {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [statusUpdatingId, setStatusUpdatingId] = useState(null);

    const [view, setView] = useState("list");
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(initialForm);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("companyToken");

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/company-login");
            return;
        }

        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/api/company/jobs",
                authConfig
            );

            const data = response.data?.data;

            setJobs(
                Array.isArray(data)
                    ? data
                    : Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load jobs."
            );
        } finally {
            setLoading(false);
        }
    };

    const openAddForm = () => {
        setForm(initialForm);
        setEditId(null);
        setError("");
        setMessage("");
        setView("add");
    };

    const openEditForm = (job) => {
        setEditId(job._id);

        setForm({
            title: job.title || "",
            department: job.department || "",
            jobType: job.jobType || "Full-time",
            workMode: job.workMode || "On-site",
            location: job.location || "",
            salaryMin: job.salaryMin ?? "",
            salaryMax: job.salaryMax ?? "",
            experience: job.experience || "",
            description: job.description || "",
            responsibilities: Array.isArray(job.responsibilities)
                ? job.responsibilities.join("\n")
                : "",
            requiredSkills: Array.isArray(job.requiredSkills)
                ? job.requiredSkills.join(", ")
                : "",
            education: job.education || "",
            applicationDeadline: job.applicationDeadline
                ? new Date(job.applicationDeadline)
                    .toISOString()
                    .slice(0, 10)
                : "",
            status: job.status || "Active"
        });

        setError("");
        setMessage("");
        setView("edit");
    };

    const closeForm = () => {
        setView("list");
        setEditId(null);
        setForm(initialForm);
        setError("");
        setMessage("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (
            !form.title.trim() ||
            !form.location.trim() ||
            !form.experience.trim() ||
            !form.description.trim()
        ) {
            setError("Please fill in all required fields.");
            return;
        }

        const skills = form.requiredSkills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);

        if (skills.length === 0) {
            setError("Please add at least one required skill.");
            return;
        }

        if (form.salaryMin !== "" && Number(form.salaryMin) < 0) {
            setError("Minimum salary cannot be negative.");
            return;
        }

        if (form.salaryMax !== "" && Number(form.salaryMax) < 0) {
            setError("Maximum salary cannot be negative.");
            return;
        }

        if (
            form.salaryMin !== "" &&
            form.salaryMax !== "" &&
            Number(form.salaryMin) > Number(form.salaryMax)
        ) {
            setError("Minimum salary cannot exceed maximum salary.");
            return;
        }

        if (!form.applicationDeadline) {
            setError("Please select the application deadline.");
            return;
        }

        const deadline = new Date(
            `${form.applicationDeadline}T23:59:59`
        );

        if (deadline <= new Date()) {
            setError("Application deadline must be in the future.");
            return;
        }

        const payload = {
            title: form.title.trim(),
            department: form.department.trim(),
            jobType: form.jobType,
            workMode: form.workMode,
            location: form.location.trim(),
            salaryMin:
                form.salaryMin === ""
                    ? null
                    : Number(form.salaryMin),
            salaryMax:
                form.salaryMax === ""
                    ? null
                    : Number(form.salaryMax),
            experience: form.experience.trim(),
            description: form.description.trim(),
            responsibilities: form.responsibilities
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            requiredSkills: skills,
            education: form.education.trim(),
            applicationDeadline: deadline.toISOString(),
            status: form.status
        };

        try {
            setSaving(true);

            if (view === "edit" && editId) {
                await api.put(
                    `/api/company/jobs/${editId}`,
                    payload,
                    authConfig
                );

                setMessage("Job updated successfully.");
            } else {
                await api.post(
                    "/api/company/jobs",
                    payload,
                    authConfig
                );

                setMessage(
                    "Job submitted successfully. Waiting for admin approval."
                );
            }

            await fetchJobs();

            setView("list");
            setEditId(null);
            setForm(initialForm);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save job."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this job?"
        );

        if (!confirmed) return;

        try {
            setDeletingId(id);
            setError("");
            setMessage("");

            await api.delete(
                `/api/company/jobs/${id}`,
                authConfig
            );

            setJobs((prev) =>
                prev.filter((job) => job._id !== id)
            );

            setMessage("Job deleted successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete job."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const handleStatusChange = async (job) => {
        const newStatus =
            job.status === "Active" ? "Closed" : "Active";

        try {
            setStatusUpdatingId(job._id);
            setError("");
            setMessage("");

            await api.put(
                `/api/company/jobs/${job._id}`,
                { status: newStatus },
                authConfig
            );

            setJobs((prev) =>
                prev.map((item) =>
                    item._id === job._id
                        ? { ...item, status: newStatus }
                        : item
                )
            );

            setMessage(`Job status changed to ${newStatus}.`);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update job status."
            );
        } finally {
            setStatusUpdatingId(null);
        }
    };

    const getApprovalStyle = (status) => {
        switch (status) {
            case "Approved":
                return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
            case "Rejected":
                return "border-red-500/30 bg-red-500/10 text-red-400";
            default:
                return "border-amber-500/30 bg-amber-500/10 text-amber-400";
        }
    };

    const inputClass =
        "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

    const labelClass =
        "mb-2 block text-sm font-medium text-slate-300";

    const Header = ({ subtitle }) => (
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xl shadow-lg shadow-indigo-500/20">
                        💼
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white sm:text-xl">
                            AI Career Copilot
                        </h1>
                        <p className="text-xs text-slate-400 sm:text-sm">
                            {subtitle}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/company-dashboard")}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500 hover:bg-slate-700 hover:text-white sm:px-4"
                >
                    ← Dashboard
                </button>
            </div>
        </header>
    );

    if (view === "add" || view === "edit") {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100">
                <Header
                    subtitle={
                        view === "edit" ? "Edit Job" : "Post a New Job"
                    }
                />

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="mb-2 text-sm font-semibold text-indigo-400">
                                COMPANY DASHBOARD
                            </p>
                            <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                {view === "edit" ? "Edit Job" : "Post a New Job"}
                            </h1>
                            <p className="mt-2 text-sm text-slate-400">
                                Enter the details for your job posting.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={closeForm}
                            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                            {message}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="relative space-y-7 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-8"
                    >
                        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />

                        <section>
                            <h2 className="mb-5 text-lg font-bold text-white">
                                Basic Information
                            </h2>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Job Title *</label>
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Full Stack Developer"
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Department</label>
                                    <input
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        placeholder="Software Engineering"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Job Type *</label>
                                    <select
                                        name="jobType"
                                        value={form.jobType}
                                        onChange={handleChange}
                                        className={inputClass}
                                        required
                                    >
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Internship</option>
                                        <option>Contract</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Work Mode *</label>
                                    <select
                                        name="workMode"
                                        value={form.workMode}
                                        onChange={handleChange}
                                        className={inputClass}
                                        required
                                    >
                                        <option>On-site</option>
                                        <option>Remote</option>
                                        <option>Hybrid</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Location *</label>
                                    <input
                                        name="location"
                                        value={form.location}
                                        onChange={handleChange}
                                        placeholder="Ahmedabad, Gujarat"
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Experience *</label>
                                    <input
                                        name="experience"
                                        value={form.experience}
                                        onChange={handleChange}
                                        placeholder="Fresher"
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="border-t border-slate-800 pt-6">
                            <h2 className="mb-5 text-lg font-bold text-white">
                                Salary and Requirements
                            </h2>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Minimum Salary</label>
                                    <input
                                        type="number"
                                        min="0"
                                        name="salaryMin"
                                        value={form.salaryMin}
                                        onChange={handleChange}
                                        placeholder="300000"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Maximum Salary</label>
                                    <input
                                        type="number"
                                        min="0"
                                        name="salaryMax"
                                        value={form.salaryMax}
                                        onChange={handleChange}
                                        placeholder="600000"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Education</label>
                                    <input
                                        name="education"
                                        value={form.education}
                                        onChange={handleChange}
                                        placeholder="MCA, B.Tech, Any Graduate"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Application Deadline *
                                    </label>
                                    <input
                                        type="date"
                                        name="applicationDeadline"
                                        value={form.applicationDeadline}
                                        onChange={handleChange}
                                        min={new Date().toLocaleDateString("en-CA")}
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>
                                        Required Skills * (comma-separated)
                                    </label>
                                    <input
                                        name="requiredSkills"
                                        value={form.requiredSkills}
                                        onChange={handleChange}
                                        placeholder="React, Node.js, MongoDB, JavaScript"
                                        className={inputClass}
                                        required
                                    />
                                    <p className="mt-2 text-xs text-slate-500">
                                        Separate each skill with a comma.
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>
                                        Job Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows="5"
                                        placeholder="Describe the role and its requirements..."
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>
                                        Responsibilities (one per line)
                                    </label>
                                    <textarea
                                        name="responsibilities"
                                        value={form.responsibilities}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder={"Develop web applications\nWork with the development team\nMaintain code quality"}
                                        className={inputClass}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className={labelClass}>Job Status</label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className={inputClass}
                                    >
                                        <option>Active</option>
                                        <option>Closed</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-6">
                            <button
                                type="button"
                                onClick={closeForm}
                                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving
                                    ? "Saving..."
                                    : view === "edit"
                                    ? "Update Job"
                                    : "Submit Job"}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Header subtitle="Manage Jobs" />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="mb-2 text-sm font-semibold text-indigo-400">
                            COMPANY DASHBOARD
                        </p>
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">
                            Manage Jobs
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">
                            View, edit and manage your job postings.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddForm}
                        className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500"
                    >
                        + Post a New Job
                    </button>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                        <p className="text-sm text-slate-400">Total Jobs</p>
                        <h2 className="mt-2 text-3xl font-bold text-white">
                            {jobs.length}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                        <p className="text-sm text-slate-400">Active Jobs</p>
                        <h2 className="mt-2 text-3xl font-bold text-emerald-400">
                            {jobs.filter((job) => job.status === "Active").length}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                        <p className="text-sm text-slate-400">Pending Approval</p>
                        <h2 className="mt-2 text-3xl font-bold text-amber-400">
                            {jobs.filter(
                                (job) =>
                                    (job.approvalStatus || "Pending") === "Pending"
                            ).length}
                        </h2>
                    </div>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                        {message}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-16 text-center">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
                        <p className="text-slate-400">Loading jobs...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 px-6 py-16 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-3xl">
                            💼
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            No Jobs Posted Yet
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                            Create your first job posting to start finding suitable candidates.
                        </p>
                        <button
                            type="button"
                            onClick={openAddForm}
                            className="mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:from-indigo-500 hover:to-violet-500"
                        >
                            + Post Your First Job
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {jobs.map((job) => {
                            const approvalStatus =
                                job.approvalStatus || "Pending";

                            return (
                                <div
                                    key={job._id}
                                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl transition hover:border-indigo-500/40 sm:p-7"
                                >
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_180px]">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="text-xl font-bold text-white">
                                                    {job.title}
                                                </h2>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        job.status === "Active"
                                                            ? "bg-emerald-500/10 text-emerald-400"
                                                            : "bg-slate-700 text-slate-300"
                                                    }`}
                                                >
                                                    {job.status}
                                                </span>

                                                <span
                                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getApprovalStyle(
                                                        approvalStatus
                                                    )}`}
                                                >
                                                    {approvalStatus === "Pending"
                                                        ? "⏳ Pending Approval"
                                                        : approvalStatus === "Approved"
                                                        ? "✓ Approved"
                                                        : "✕ Rejected"}
                                                </span>
                                            </div>

                                            <p className="mt-3 text-sm text-slate-400">
                                                📍 {job.location} · {job.jobType} · {job.workMode}
                                            </p>

                                            <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-400 sm:grid-cols-2">
                                                <p>
                                                    Experience:{" "}
                                                    <span className="font-medium text-white">
                                                        {job.experience}
                                                    </span>
                                                </p>

                                                <p>
                                                    Salary:{" "}
                                                    <span className="font-medium text-white">
                                                        {job.salaryMin != null
                                                            ? `₹${Number(job.salaryMin).toLocaleString("en-IN")}`
                                                            : "Not specified"}
                                                        {" - "}
                                                        {job.salaryMax != null
                                                            ? `₹${Number(job.salaryMax).toLocaleString("en-IN")}`
                                                            : "Not specified"}
                                                    </span>
                                                </p>

                                                <p>
                                                    Deadline:{" "}
                                                    <span className="font-medium text-white">
                                                        {job.applicationDeadline
                                                            ? new Date(
                                                                job.applicationDeadline
                                                            ).toLocaleDateString("en-GB")
                                                            : "Not set"}
                                                    </span>
                                                </p>

                                                <p>
                                                    Posted:{" "}
                                                    <span className="font-medium text-white">
                                                        {job.createdAt
                                                            ? new Date(
                                                                job.createdAt
                                                            ).toLocaleDateString("en-GB")
                                                            : "N/A"}
                                                    </span>
                                                </p>
                                            </div>

                                            <p className="mt-5 text-sm leading-6 text-slate-400">
                                                {job.description}
                                            </p>

                                            <div className="mt-5 flex flex-wrap gap-2">
                                                {(job.requiredSkills || []).map(
                                                    (skill, index) => (
                                                        <span
                                                            key={`${skill}-${index}`}
                                                            className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300"
                                                        >
                                                            {skill}
                                                        </span>
                                                    )
                                                )}
                                            </div>

                                            {approvalStatus === "Pending" && (
                                                <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-amber-400">
                                                    Your job is waiting for admin review. It will be visible to users after approval.
                                                </p>
                                            )}

                                            {approvalStatus === "Rejected" && (
                                                <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                                                    Your job was rejected by the admin. Please contact the administrator for further details.
                                                </p>
                                            )}

                                            {approvalStatus === "Approved" && (
                                                <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
                                                    Your job has been approved by the admin.
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <button
                                                type="button"
                                                onClick={() => openEditForm(job)}
                                                className="rounded-xl border border-indigo-500/40 px-4 py-3 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/10"
                                            >
                                                ✏️ Edit Job
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleStatusChange(job)}
                                                disabled={statusUpdatingId === job._id}
                                                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                                            >
                                                {statusUpdatingId === job._id
                                                    ? "Updating..."
                                                    : job.status === "Active"
                                                    ? "Close Job"
                                                    : "Activate Job"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(job._id)}
                                                disabled={deletingId === job._id}
                                                className="rounded-xl border border-red-500/30 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                                            >
                                                {deletingId === job._id
                                                    ? "Deleting..."
                                                    : "Delete Job"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ManageJobs;