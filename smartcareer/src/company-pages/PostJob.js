import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const initialForm = {
    title: "",
    department: "",
    jobType: "Full-time",
    workMode: "On-site",
    location: "",
    salaryMin: "",
    salaryMax: "",
    experience: "Fresher",
    description: "",
    responsibilities: "",
    requiredSkills: "",
    education: "",
    applicationDeadline: ""
};

const PostJob = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
        setSuccess("");

        const requiredSkills = form.requiredSkills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);

        if (requiredSkills.length === 0) {
            setError("Please enter at least one required skill.");
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

        if (
            form.salaryMin !== "" &&
            Number(form.salaryMin) < 0
        ) {
            setError("Minimum salary cannot be negative.");
            return;
        }

        if (
            form.salaryMax !== "" &&
            Number(form.salaryMax) < 0
        ) {
            setError("Maximum salary cannot be negative.");
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

        setLoading(true);

        try {
            const companyToken = localStorage.getItem("companyToken");

            if (!companyToken) {
                navigate("/company-login");
                return;
            }

            const payload = {
                ...form,
                salaryMin:
                    form.salaryMin === ""
                        ? null
                        : Number(form.salaryMin),
                salaryMax:
                    form.salaryMax === ""
                        ? null
                        : Number(form.salaryMax),
                applicationDeadline: deadline.toISOString(),
                requiredSkills,
                responsibilities: form.responsibilities
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean)
            };

            const response = await api.post(
                "/api/company/jobs",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${companyToken}`
                    }
                }
            );

            if (response.data?.status === 1) {
                setSuccess(
                    "Job submitted successfully. Waiting for admin approval."
                );

                setForm(initialForm);

                setTimeout(() => {
                    navigate("/company-manage-jobs");
                }, 1000);
            } else {
                setError(
                    response.data?.message ||
                    "Unable to post job."
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to post job. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

    const labelClass =
        "mb-2 block text-sm font-medium text-slate-300";

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
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
                                Company Hiring Portal
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/company-dashboard"
                        className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500 hover:bg-slate-700 hover:text-white sm:px-4"
                    >
                        ← Dashboard
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="mb-2 text-sm font-semibold text-indigo-400">
                            COMPANY DASHBOARD
                        </p>

                        <h1 className="text-2xl font-bold text-white sm:text-3xl">
                            Post a Job
                        </h1>

                        <p className="mt-2 text-sm text-slate-400">
                            Add job details to find the right candidates.
                        </p>
                    </div>

                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm font-medium text-indigo-300">
                        Company Hiring Portal
                    </div>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="relative space-y-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-8"
                >
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />

                    <section>
                        <h2 className="mb-5 text-lg font-bold text-white">
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className={labelClass}>
                                    Job Title *
                                </label>
                                <input
                                    className={inputClass}
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Full Stack Developer"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Department
                                </label>
                                <input
                                    className={inputClass}
                                    name="department"
                                    value={form.department}
                                    onChange={handleChange}
                                    placeholder="e.g. Engineering"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Job Type *
                                </label>
                                <select
                                    className={inputClass}
                                    name="jobType"
                                    value={form.jobType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Internship</option>
                                    <option>Contract</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Work Mode *
                                </label>
                                <select
                                    className={inputClass}
                                    name="workMode"
                                    value={form.workMode}
                                    onChange={handleChange}
                                    required
                                >
                                    <option>On-site</option>
                                    <option>Remote</option>
                                    <option>Hybrid</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Location *
                                </label>
                                <input
                                    className={inputClass}
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Ahmedabad, Gujarat"
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
                                <label className={labelClass}>
                                    Minimum Salary (annual)
                                </label>
                                <input
                                    className={inputClass}
                                    type="number"
                                    min="0"
                                    name="salaryMin"
                                    value={form.salaryMin}
                                    onChange={handleChange}
                                    placeholder="e.g. 300000"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Maximum Salary (annual)
                                </label>
                                <input
                                    className={inputClass}
                                    type="number"
                                    min="0"
                                    name="salaryMax"
                                    value={form.salaryMax}
                                    onChange={handleChange}
                                    placeholder="e.g. 600000"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Experience *
                                </label>
                                <select
                                    className={inputClass}
                                    name="experience"
                                    value={form.experience}
                                    onChange={handleChange}
                                    required
                                >
                                    <option>Fresher</option>
                                    <option>0-1 years</option>
                                    <option>1-3 years</option>
                                    <option>3-5 years</option>
                                    <option>5+ years</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Education
                                </label>
                                <input
                                    className={inputClass}
                                    name="education"
                                    value={form.education}
                                    onChange={handleChange}
                                    placeholder="e.g. BCA, MCA, B.Tech"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>
                                    Required Skills * (comma-separated)
                                </label>
                                <input
                                    className={inputClass}
                                    name="requiredSkills"
                                    value={form.requiredSkills}
                                    onChange={handleChange}
                                    placeholder="React, Node.js, MongoDB, JavaScript"
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
                                    className={inputClass}
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Describe the role and its requirements..."
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>
                                    Responsibilities (one per line)
                                </label>
                                <textarea
                                    className={inputClass}
                                    name="responsibilities"
                                    value={form.responsibilities}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder={"Develop web applications\nWork with the development team\nMaintain code quality"}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClass}>
                                    Application Deadline *
                                </label>
                                <input
                                    className={inputClass}
                                    type="date"
                                    name="applicationDeadline"
                                    value={form.applicationDeadline}
                                    onChange={handleChange}
                                    min={new Date().toLocaleDateString("en-CA")}
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-6">
                        <Link
                            to="/company-dashboard"
                            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Posting Job..." : "Publish Job"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default PostJob;