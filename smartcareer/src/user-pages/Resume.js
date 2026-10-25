
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const emptyResume = {
    source: "builder",
    personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        linkedIn: "",
        portfolio: ""
    },
    photo: "",
    education: [
        { degree: "", institution: "", year: "", grade: "" }
    ],
    skills: [],
    projects: [
        {
            title: "",
            description: "",
            technologies: "",
            projectUrl: ""
        }
    ],
    template: "classic"
};

const Input = ({
    label,
    value,
    onChange,
    placeholder,
    type = "text"
}) => (
    <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">
            {label}
        </span>
        <input
            type={type}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || label}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
        />
    </label>
);

const TextArea = ({ label, value, onChange, placeholder }) => (
    <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">
            {label}
        </span>
        <textarea
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || label}
            rows={4}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
        />
    </label>
);

const Resume = () => {
    const [mode, setMode] = useState("builder");
    const [form, setForm] = useState({ ...emptyResume });
    const [savedResume, setSavedResume] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [skillInput, setSkillInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const getToken = () => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            return (
                localStorage.getItem("token") ||
                user.token ||
                user.data?.token ||
                ""
            );
        } catch {
            return localStorage.getItem("token") || "";
        }
    };

    const headers = () => ({
        Authorization: `Bearer ${getToken()}`
    });

    const fetchResume = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/api/resume", {
                headers: headers()
            });

            const data = response.data.data;
            setSavedResume(data || null);

            if (data?.source === "builder") {
                setForm({
                    ...emptyResume,
                    ...data,
                    personalInfo: {
                        ...emptyResume.personalInfo,
                        ...(data.personalInfo || {})
                    },
                    photo: data.photo || "",
                    education: data.education?.length
                        ? data.education
                        : [{ ...emptyResume.education[0] }],
                    skills: data.skills || [],
                    projects: data.projects?.length
                        ? data.projects
                        : [{ ...emptyResume.projects[0] }]
                });
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load resume. Please check your login."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResume();
    }, []);

    const updatePersonal = (field, value) => {
        setForm((prev) => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                [field]: value
            }
        }));
    };

    const updateArrayItem = (field, index, key, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].map((item, i) =>
                i === index ? { ...item, [key]: value } : item
            )
        }));
    };

    const addArrayItem = (field, item) => {
        setForm((prev) => ({
            ...prev,
            [field]: [...prev[field], item]
        }));
    };

    const removeArrayItem = (field, index) => {
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handlePhotoChange = (event) => {
        const file = event.target.files?.[0];

        setError("");
        setMessage("");

        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            setError("Please select a JPG, PNG, or WEBP image.");
            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("Photo size must be 2 MB or smaller.");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setForm((prev) => ({
                ...prev,
                photo: reader.result
            }));
        };

        reader.onerror = () => {
            setError("Unable to read the selected photo.");
        };

        reader.readAsDataURL(file);
    };

    const removePhoto = () => {
        setForm((prev) => ({
            ...prev,
            photo: ""
        }));
    };

    const addSkill = () => {
        const skill = skillInput.trim();

        if (!skill) return;

        if (
            form.skills.some(
                (item) => item.toLowerCase() === skill.toLowerCase()
            )
        ) {
            setSkillInput("");
            return;
        }

        setForm((prev) => ({
            ...prev,
            skills: [...prev.skills, skill]
        }));

        setSkillInput("");
    };

    const removeSkill = (index) => {
        setForm((prev) => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    const saveResume = async () => {
        if (!form.personalInfo.fullName.trim()) {
            setError("Please enter your full name.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const response = await api.put(
                "/api/resume/builder",
                { ...form, source: "builder" },
                { headers: headers() }
            );

            if (response.data.status === 1) {
                const data = response.data.data;

                setSavedResume(data);

                setForm((prev) => ({
                    ...prev,
                    ...data,
                    personalInfo: {
                        ...prev.personalInfo,
                        ...(data.personalInfo || {})
                    },
                    photo: data.photo ?? ""
                }));

                setMessage("Resume saved successfully!");
            } else {
                setError(response.data.message || "Unable to save resume.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save resume. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];

        setSelectedFile(null);
        setError("");
        setMessage("");

        if (!file) return;

        if (
            file.type !== "application/pdf" ||
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            setError("Please select a PDF file.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("PDF size must be 5 MB or smaller.");
            event.target.value = "";
            return;
        }

        setSelectedFile(file);
    };

    const uploadResume = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            setError("Please select a PDF file first.");
            return;
        }

        try {
            setUploading(true);
            setError("");
            setMessage("");

            const formData = new FormData();
            formData.append("resume", selectedFile);

            const response = await api.post(
                "/api/resume",
                formData,
                { headers: headers() }
            );

            if (response.data.status === 1) {
                setSavedResume(response.data.data);
                setSelectedFile(null);
                event.target.reset();
                setMessage("Resume uploaded successfully!");
            } else {
                setError(response.data.message || "Upload failed.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to upload resume."
            );
        } finally {
            setUploading(false);
        }
    };

    const downloadResume = async () => {
        try {
            setError("");
            setMessage("");

            const response = await api.get("/api/resume/download", {
                headers: headers(),
                responseType: "blob"
            });

            const blob = new Blob([response.data], {
                type: "application/pdf"
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download =
                savedResume?.fileName ||
                `${form.personalInfo.fullName || "Resume"}_Resume.pdf`;

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setMessage("Resume downloaded successfully.");
        } catch {
            setError("Unable to download resume.");
        }
    };

    const deleteResume = async () => {
        if (!window.confirm("Do you want to delete your saved resume?")) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await api.delete("/api/resume", {
                headers: headers()
            });

            if (response.data.status === 1) {
                setSavedResume(null);
                setSelectedFile(null);
                setForm({ ...emptyResume });
                setMessage("Resume deleted successfully.");
            } else {
                setError(response.data.message || "Unable to delete resume.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to delete resume."
            );
        }
    };

    const formatDate = (date) => {
        if (!date) return "Not available";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
                Loading resume...
            </div>
        );
    }

    const hasEducation = form.education.some((item) =>
        item.degree || item.institution || item.year || item.grade
    );

    const hasProjects = form.projects.some((item) =>
        item.title || item.description
    );

    return (
        <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">
            <header className="sticky top-0 z-50 -mx-4 -mt-8 mb-8 border-b border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
            to="/user-dashboard"
            className="flex items-center gap-3"
        >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white shadow-lg shadow-indigo-500/20">
                C
            </div>

            <div>
                <h2 className="text-lg font-bold tracking-wide text-white">
                    Career Copilot
                </h2>
                <p className="text-xs text-slate-400">
                    Your Career Companion
                </p>
            </div>
        </Link>

        <Link
            to="/user-dashboard"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500 hover:text-white sm:px-4"
        >
            <span>←</span>
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
        </Link>
    </div>
</header>
            <div className="mx-auto max-w-7xl">

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-semibold text-indigo-400">
                            CAREER PROFILE
                        </p>
                        <h1 className="text-3xl font-bold sm:text-4xl">
                            Resume Builder
                        </h1>
                        <p className="mt-2 text-slate-400">
                            Create a professional resume in your preferred format.
                        </p>
                    </div>

               
                </div>

                {message && (
                    <div className="mb-5 rounded-lg border border-emerald-700 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-5 rounded-lg border border-red-700 bg-red-500/10 p-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <div className="mb-6 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setMode("builder")}
                        className={`rounded-xl px-5 py-3 text-sm font-semibold ${
                            mode === "builder"
                                ? "bg-indigo-600 text-white"
                                : "border border-slate-700 bg-slate-900 text-slate-300"
                        }`}
                    >
                        ✍ Create Resume
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode("upload")}
                        className={`rounded-xl px-5 py-3 text-sm font-semibold ${
                            mode === "upload"
                                ? "bg-indigo-600 text-white"
                                : "border border-slate-700 bg-slate-900 text-slate-300"
                        }`}
                    >
                        📄 Upload Existing Resume
                    </button>
                </div>

                {mode === "builder" && (
                    <div className="grid items-start gap-6 xl:grid-cols-2">

                        <div className="space-y-6">

                            {/* Personal Information */}
                            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                                <h2 className="mb-5 text-xl font-semibold">
                                    1. Personal Information
                                </h2>

                                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-600 bg-slate-950">
                                        {form.photo ? (
                                            <img
                                                src={form.photo}
                                                alt="Profile"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-center text-xs text-slate-500">
                                                No photo
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <label className="mb-2 block text-sm font-medium text-slate-300">
                                            Upload Profile Photo
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={handlePhotoChange}
                                            className="w-full text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-white"
                                        />
                                        <p className="mt-2 text-xs text-slate-500">
                                            JPG, PNG or WEBP · Maximum 2 MB
                                        </p>

                                        {form.photo && (
                                            <button
                                                type="button"
                                                onClick={removePhoto}
                                                className="mt-2 text-sm text-red-400 hover:text-red-300"
                                            >
                                                Remove Photo
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Input
                                        label="Full Name *"
                                        value={form.personalInfo.fullName}
                                        onChange={(v) => updatePersonal("fullName", v)}
                                        placeholder="Enter your full name"
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={form.personalInfo.email}
                                        onChange={(v) => updatePersonal("email", v)}
                                        placeholder="yourname@example.com"
                                    />
                                    <Input
                                        label="Phone"
                                        value={form.personalInfo.phone}
                                        onChange={(v) => updatePersonal("phone", v)}
                                        placeholder="Enter phone number"
                                    />
                                    <Input
                                        label="Address"
                                        value={form.personalInfo.address}
                                        onChange={(v) => updatePersonal("address", v)}
                                        placeholder="City, State"
                                    />
                                    <Input
                                        label="LinkedIn URL"
                                        value={form.personalInfo.linkedIn}
                                        onChange={(v) => updatePersonal("linkedIn", v)}
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                    <Input
                                        label="Portfolio URL"
                                        value={form.personalInfo.portfolio}
                                        onChange={(v) => updatePersonal("portfolio", v)}
                                        placeholder="https://..."
                                    />
                                </div>
                            </section>

                            {/* Education */}
                            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                                <div className="mb-5 flex items-center justify-between gap-3">
                                    <h2 className="text-xl font-semibold">
                                        2. Education
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem("education", {
                                            degree: "",
                                            institution: "",
                                            year: "",
                                            grade: ""
                                        })}
                                        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm"
                                    >
                                        + Add
                                    </button>
                                </div>

                                {form.education.map((item, index) => (
                                    <div
                                        key={index}
                                        className="mb-4 rounded-xl border border-slate-800 p-4"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="font-medium text-slate-300">
                                                Education {index + 1}
                                            </span>

                                            {form.education.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem("education", index)}
                                                    className="text-sm text-red-400"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Input
                                                label="Qualification"
                                                value={item.degree}
                                                onChange={(v) => updateArrayItem("education", index, "degree", v)}
                                                placeholder="e.g. Bachelor of Computer Applications"
                                            />
                                            <Input
                                                label="Institution"
                                                value={item.institution}
                                                onChange={(v) => updateArrayItem("education", index, "institution", v)}
                                                placeholder="College or school name"
                                            />
                                            <Input
                                                label="Year"
                                                value={item.year}
                                                onChange={(v) => updateArrayItem("education", index, "year", v)}
                                                placeholder="e.g. 2023 - 2026"
                                            />
                                            <Input
                                                label="Percentage / CGPA"
                                                value={item.grade}
                                                onChange={(v) => updateArrayItem("education", index, "grade", v)}
                                                placeholder="e.g. 79% or 7.80 CGPA"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </section>

                            {/* Skills */}
                            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                                <h2 className="mb-2 text-xl font-semibold">
                                    3. Skills
                                </h2>
                                <p className="mb-4 text-sm text-slate-400">
                                    Add your programming languages, frameworks, tools and design skills.
                                </p>

                                <div className="flex gap-2">
                                    <input
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addSkill();
                                            }
                                        }}
                                        placeholder="e.g. React, Java, Python"
                                        className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addSkill}
                                        className="rounded-lg bg-indigo-600 px-4 py-2 font-medium"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {form.skills.map((skill, index) => (
                                        <span
                                            key={`${skill}-${index}`}
                                            className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(index)}
                                                className="text-indigo-300 hover:text-white"
                                                aria-label={`Remove ${skill}`}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </section>

                            {/* Projects */}
                            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                                <div className="mb-5 flex items-center justify-between gap-3">
                                    <h2 className="text-xl font-semibold">
                                        4. Projects
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => addArrayItem("projects", {
                                            title: "",
                                            description: "",
                                            technologies: "",
                                            projectUrl: ""
                                        })}
                                        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm"
                                    >
                                        + Add
                                    </button>
                                </div>

                                {form.projects.map((item, index) => (
                                    <div
                                        key={index}
                                        className="mb-4 space-y-4 rounded-xl border border-slate-800 p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-slate-300">
                                                Project {index + 1}
                                            </span>
                                            {form.projects.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem("projects", index)}
                                                    className="text-sm text-red-400"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        <Input
                                            label="Project Title"
                                            value={item.title}
                                            onChange={(v) => updateArrayItem("projects", index, "title", v)}
                                            placeholder="Enter project name"
                                        />
                                        <TextArea
                                            label="Project Description"
                                            value={item.description}
                                            onChange={(v) => updateArrayItem("projects", index, "description", v)}
                                            placeholder="Describe your project, features and functionality"
                                        />
                                        <Input
                                            label="Technologies Used"
                                            value={item.technologies}
                                            onChange={(v) => updateArrayItem("projects", index, "technologies", v)}
                                            placeholder="e.g. React, Node.js, MongoDB"
                                        />
                                        <Input
                                            label="Project URL"
                                            value={item.projectUrl}
                                            onChange={(v) => updateArrayItem("projects", index, "projectUrl", v)}
                                            placeholder="GitHub or live project URL"
                                        />
                                    </div>
                                ))}
                            </section>

                            {/* Resume Template */}
                            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                                <h2 className="mb-4 text-xl font-semibold">
                                    5. Resume Template
                                </h2>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {["classic", "modern"].map((template) => (
                                        <button
                                            type="button"
                                            key={template}
                                            onClick={() => setForm((p) => ({ ...p, template }))}
                                            className={`rounded-xl border p-4 text-left capitalize ${
                                                form.template === template
                                                    ? "border-indigo-500 bg-indigo-500/10"
                                                    : "border-slate-700 bg-slate-950"
                                            }`}
                                        >
                                            <span className="font-semibold">{template}</span>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {template === "classic"
                                                    ? "Professional black-and-white layout"
                                                    : "Modern layout with indigo headings"}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={saveResume}
                                    disabled={saving}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-semibold disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : savedResume?.source === "builder"
                                        ? "Save Changes"
                                        : "Save Resume"}
                                </button>
                                <button
                                    type="button"
                                    onClick={downloadResume}
                                    disabled={savedResume?.source !== "builder"}
                                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    ↓ Download PDF
                                </button>
                            </div>
                        </div>

                        {/* LIVE RESUME PREVIEW */}
                        <div className="xl:sticky xl:top-6">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-xl font-semibold">
                                    Live Resume Preview
                                </h2>
                                <span className="text-xs text-slate-500">
                                    Updates as you type
                                </span>
                            </div>

                            <div
                                className={`min-h-[700px] rounded-sm bg-white p-6 text-slate-900 shadow-2xl sm:p-10 ${
                                    form.template === "classic"
                                        ? "font-serif"
                                        : "font-sans"
                                }`}
                            >
                                {/* PROFESSIONAL RESUME HEADER */}
                                <header
                                    className={`border-b-2 pb-5 ${
                                        form.template === "classic"
                                            ? "border-slate-800"
                                            : "border-indigo-700"
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="min-w-0 flex-1">
                                            <h1
                                                className={`break-words text-3xl font-bold uppercase tracking-wide sm:text-4xl ${
                                                    form.template === "classic"
                                                        ? "text-slate-950"
                                                        : "text-indigo-950"
                                                }`}
                                            >
                                                {form.personalInfo.fullName || "YOUR NAME"}
                                            </h1>
                                            <p
                                                className={`mt-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                                                    form.template === "classic"
                                                        ? "text-slate-500"
                                                        : "text-indigo-700"
                                                }`}
                                            >
                                                Professional Resume
                                            </p>
                                        </div>

                                        {form.photo && (
                                            <img
                                                src={form.photo}
                                                alt="Resume profile"
                                                className="h-24 w-24 shrink-0 rounded-md border border-slate-300 object-cover sm:h-28 sm:w-28"
                                            />
                                        )}
                                    </div>

                                    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-600">
                                        {form.personalInfo.phone && (
                                            <span className="break-all">
                                                {form.personalInfo.phone}
                                            </span>
                                        )}

                                        {form.personalInfo.phone && form.personalInfo.email && (
                                            <span className="text-slate-400">|</span>
                                        )}

                                        {form.personalInfo.email && (
                                            <span className="break-all">
                                                {form.personalInfo.email}
                                            </span>
                                        )}

                                        {(form.personalInfo.phone || form.personalInfo.email) &&
                                            form.personalInfo.address && (
                                                <span className="text-slate-400">|</span>
                                            )}

                                        {form.personalInfo.address && (
                                            <span>{form.personalInfo.address}</span>
                                        )}
                                    </div>

                                    {(form.personalInfo.linkedIn || form.personalInfo.portfolio) && (
                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                            {form.personalInfo.linkedIn && (
                                                <a
                                                    href={form.personalInfo.linkedIn}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="break-all text-indigo-700 underline"
                                                >
                                                    LinkedIn Profile
                                                </a>
                                            )}
                                            {form.personalInfo.portfolio && (
                                                <a
                                                    href={form.personalInfo.portfolio}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="break-all text-indigo-700 underline"
                                                >
                                                    Portfolio
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </header>

                                {/* EDUCATION */}
                                <section className="mt-6">
                                    <h3
                                        className={`mb-3 border-b border-slate-300 pb-2 text-sm font-bold uppercase tracking-wider ${
                                            form.template === "classic"
                                                ? "text-black"
                                                : "text-indigo-900"
                                        }`}
                                    >
                                        Education
                                    </h3>

                                    {form.education
                                        .filter((e) => e.degree || e.institution || e.year || e.grade)
                                        .map((item, index) => (
                                            <div key={index} className="mb-4">
                                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                    <p className="text-sm font-bold">
                                                        {item.degree}
                                                    </p>
                                                    <p className="text-xs text-slate-600">
                                                        {item.year}
                                                    </p>
                                                </div>
                                                <div className="mt-1 flex flex-wrap justify-between gap-2 text-xs text-slate-600">
                                                    <p>{item.institution}</p>
                                                    <p>{item.grade}</p>
                                                </div>
                                            </div>
                                        ))}

                                    {!hasEducation && (
                                        <p className="text-xs text-slate-400">
                                            Your education will appear here.
                                        </p>
                                    )}
                                </section>

                                {/* PROJECTS */}
                                <section className="mt-6">
                                    <h3
                                        className={`mb-3 border-b border-slate-300 pb-2 text-sm font-bold uppercase tracking-wider ${
                                            form.template === "classic"
                                                ? "text-black"
                                                : "text-indigo-900"
                                        }`}
                                    >
                                        Projects
                                    </h3>

                                    {form.projects
                                        .filter((p) => p.title || p.description)
                                        .map((item, index) => (
                                            <div key={index} className="mb-4">
                                                <p className="text-sm font-bold">
                                                    {item.title || "Project"}
                                                </p>

                                                {item.technologies && (
                                                    <p className="mt-1 text-xs italic text-slate-600">
                                                        Technologies: {item.technologies}
                                                    </p>
                                                )}

                                                {item.description && (
                                                    <p className="mt-1 whitespace-pre-wrap text-xs leading-5">
                                                        {item.description}
                                                    </p>
                                                )}

                                                {item.projectUrl && (
                                                    <a
                                                        href={item.projectUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-1 block break-all text-xs text-indigo-700 underline"
                                                    >
                                                        {item.projectUrl}
                                                    </a>
                                                )}
                                            </div>
                                        ))}

                                    {!hasProjects && (
                                        <p className="text-xs text-slate-400">
                                            Your projects will appear here.
                                        </p>
                                    )}
                                </section>

                                {/* SKILLS */}
                                <section className="mt-6">
                                    <h3
                                        className={`mb-3 border-b border-slate-300 pb-2 text-sm font-bold uppercase tracking-wider ${
                                            form.template === "classic"
                                                ? "text-black"
                                                : "text-indigo-900"
                                        }`}
                                    >
                                        Skills
                                    </h3>

                                    {form.skills.length > 0 ? (
                                        <ul className="grid grid-cols-1 gap-x-6 gap-y-1 text-xs leading-5 sm:grid-cols-2">
                                            {form.skills.map((skill, index) => (
                                                <li
                                                    key={`${skill}-${index}`}
                                                    className="break-words"
                                                >
                                                    <span className="mr-2">•</span>
                                                    {skill}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-slate-400">
                                            Your skills will appear here.
                                        </p>
                                    )}
                                </section>
                            </div>

                            <p className="mt-3 text-center text-xs text-slate-500">
                                This is the live preview. The downloaded PDF layout is controlled by your backend PDF generator.
                            </p>
                        </div>
                    </div>
                )}

                {/* UPLOAD EXISTING PDF */}
                {mode === "upload" && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                            <div className="mb-5 text-4xl">📄</div>
                            <h2 className="text-xl font-semibold">
                                Upload Existing Resume
                            </h2>
                            <p className="mt-2 text-sm text-slate-400">
                                Upload an existing PDF resume. Maximum file size: 5 MB.
                            </p>

                            <form onSubmit={uploadResume} className="mt-6">
                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={handleFileChange}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-white"
                                />

                                {selectedFile && (
                                    <p className="mt-3 break-all text-sm text-indigo-300">
                                        Selected: {selectedFile.name}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={!selectedFile || uploading}
                                    className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold hover:bg-indigo-500 disabled:opacity-50"
                                >
                                    {uploading ? "Uploading..." : "Upload Resume"}
                                </button>
                            </form>
                        </section>

                        {/* SAVED RESUME DETAILS */}
                        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                            <h2 className="text-xl font-semibold">
                                Saved Resume
                            </h2>

                            {savedResume ? (
                                <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-5">
                                    <div className="text-4xl">📑</div>
                                    <p className="mt-4 break-all font-semibold">
                                        {savedResume.fileName ||
                                            `${savedResume.personalInfo?.fullName || "Created"} Resume`}
                                    </p>
                                    <p className="mt-2 text-sm text-slate-400">
                                        Type: {savedResume.source === "builder"
                                            ? "Created with Resume Builder"
                                            : "Uploaded PDF"}
                                    </p>

                                    {savedResume.fileSize > 0 && (
                                        <p className="mt-1 text-sm text-slate-400">
                                            Size: {(savedResume.fileSize / 1024).toFixed(1)} KB
                                        </p>
                                    )}

                                    <p className="mt-1 text-sm text-slate-400">
                                        Last updated: {formatDate(
                                            savedResume.updatedAt || savedResume.uploadedAt
                                        )}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={downloadResume}
                                        className="mt-5 w-full rounded-lg bg-slate-800 px-4 py-3 font-medium hover:bg-slate-700"
                                    >
                                        ↓ Download Resume
                                    </button>

                                    {savedResume.source === "builder" && (
                                        <button
                                            type="button"
                                            onClick={() => setMode("builder")}
                                            className="mt-3 w-full rounded-lg border border-indigo-500/30 px-4 py-3 text-indigo-300 hover:bg-indigo-500/10"
                                        >
                                            Edit Created Resume
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={deleteResume}
                                        className="mt-3 w-full rounded-lg border border-red-500/30 px-4 py-3 text-red-400 hover:bg-red-500/10"
                                    >
                                        Delete Resume
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-5 rounded-xl border border-dashed border-slate-700 p-8 text-center">
                                    <p className="text-slate-400">
                                        No resume saved yet. Create one or upload a PDF.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {savedResume && (
                    <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="font-medium">Manage saved resume</p>
                            <p className="mt-1 text-sm text-slate-400">
                                Last updated: {formatDate(
                                    savedResume.updatedAt || savedResume.uploadedAt
                                )}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={deleteResume}
                            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                        >
                            Delete Saved Resume
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Resume;
