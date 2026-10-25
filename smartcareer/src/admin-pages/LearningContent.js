import React, { useEffect, useState } from "react";
import api from "../api";
import AddLearningContent from "./AddLearningContent";
import { Link } from "react-router-dom";

const LearningContent = () => {
    const [content, setContent] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [editForm, setEditForm] = useState({
        title: "",
        category: "",
        description: "",
        type: "",
        url: "",
        skills: "",
        level: "",
        duration: "",
        active: true
    });

    const fetchContent = async () => {
        try {
            const response = await api.get(
                "/api/admin/learning-content"
            );
            if (response.data.status === 1) {
                setContent(response.data.data);
            }
        } catch (error) {
            console.log("Learning Content Error:", error);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const deleteContent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this content?")) {
            return;
        }

        try {
            const response = await api.delete(
                `/api/admin/learning-content/${id}`
            );

            if (response.data.status === 1) {
                alert("Learning Content Deleted Successfully!");
                fetchContent();
            }
        } catch (error) {
            console.log("Delete Content Error:", error);
            alert("Something went wrong.");
        }
    };

    const openEdit = (item) => {
        setEditItem(item);
        setShowAdd(false);

        setEditForm({
            title: item.title || "",
            category: item.category || "",
            description: item.description || "",
            type: item.type || "",
            url: item.url || "",
            skills: (item.skills || []).join(", "),
            level: item.level || "",
            duration: item.duration || "",
            active: item.active
        });
    };

    const closeEdit = () => {
        setEditItem(null);

        setEditForm({
            title: "",
            category: "",
            description: "",
            type: "",
            url: "",
            skills: "",
            level: "",
            duration: "",
            active: true
        });
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;

        setEditForm({
            ...editForm,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const updateContent = async (e) => {
        e.preventDefault();

        try {
            const response = await api.put(
                `/api/admin/learning-content/${editItem._id}`,
                {
                    title: editForm.title,
                    category: editForm.category,
                    description: editForm.description,
                    type: editForm.type,
                    url: editForm.url,
                    skills: editForm.skills
                        .split(",")
                        .map((skill) => skill.trim())
                        .filter(Boolean),
                    level: editForm.level,
                    duration: editForm.duration,
                    active: editForm.active
                }
            );

            if (response.data.status === 1) {
                alert("Learning Content Updated Successfully!");
                closeEdit();
                fetchContent();
            }
        } catch (error) {
            console.log("Update Content Error:", error);
            alert("Something went wrong.");
        }
    };

    const activeContent = content.filter((item) => item.active).length;
    const inactiveContent = content.filter((item) => !item.active).length;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            <header className="bg-slate-900/80 backdrop-blur-2xl border-b border-slate-800/80 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-8 py-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30 text-white">
                                📚
                            </div>

                            <div>
                              

                                <h1 className="text-2xl font-black text-white tracking-tight">
                                    Learning Content
                                </h1>
                            </div>
                        </div>

                        <Link
                            to="/admin-dashboard"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900 text-slate-300 font-bold text-sm hover:bg-slate-800 hover:text-indigo-400 hover:border-indigo-500/40 transition shadow-sm w-fit"
                        >
                            <span>←</span>
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-10">
                {!editItem && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
                        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Total Content
                                    </p>

                                    <h2 className="text-3xl font-black text-white mt-2">
                                        {content.length}
                                    </h2>
                                </div>

                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl">
                                    📚
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Active Content
                                    </p>

                                    <h2 className="text-3xl font-black text-emerald-400 mt-2">
                                        {activeContent}
                                    </h2>
                                </div>

                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
                                    ✓
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Inactive Content
                                    </p>

                                    <h2 className="text-3xl font-black text-rose-400 mt-2">
                                        {inactiveContent}
                                    </h2>
                                </div>

                                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xl">
                                    !
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!editItem && (
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setShowAdd(!showAdd)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
                        >
                            {showAdd ? "✕ Close" : "+ Add Content"}
                        </button>
                    </div>
                )}

                {!editItem && showAdd && (
                    <div className="mb-8">
                        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                            <AddLearningContent
    onClose={() => setShowAdd(false)}
    onSuccess={() => {
        fetchContent();
        setShowAdd(false);
    }}
/>
                        </div>
                    </div>
                )}

                {editItem ? (
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative max-w-5xl mx-auto">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                        <div className="px-8 py-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">
                                    Edit Learning Content
                                </h2>

                                <p className="text-sm text-slate-400 mt-1">
                                    Update learning resource details.
                                </p>
                            </div>

                            <button
                                onClick={closeEdit}
                                className="px-5 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition"
                            >
                                ✕ Close
                            </button>
                        </div>

                        <form onSubmit={updateContent} className="p-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Title
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={editForm.title}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Category
                                    </label>

                                    <input
                                        type="text"
                                        name="category"
                                        value={editForm.category}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={editForm.description}
                                        onChange={handleEditChange}
                                        rows="4"
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Type
                                    </label>

                                    <input
                                        type="text"
                                        name="type"
                                        value={editForm.type}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Level
                                    </label>

                                    <input
                                        type="text"
                                        name="level"
                                        value={editForm.level}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Duration
                                    </label>

                                    <input
                                        type="text"
                                        name="duration"
                                        value={editForm.duration}
                                        onChange={handleEditChange}
                                        placeholder="Example: 1 min or 2 Hours"
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        Skills
                                    </label>

                                    <input
                                        type="text"
                                        name="skills"
                                        value={editForm.skills}
                                        onChange={handleEditChange}
                                        placeholder="Example: Node.js, Express"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        URL
                                    </label>

                                    <input
                                        type="text"
                                        name="url"
                                        value={editForm.url}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-500/30 transition">
                                        <input
                                            type="checkbox"
                                            name="active"
                                            checked={editForm.active}
                                            onChange={handleEditChange}
                                            className="w-4 h-4 accent-indigo-600"
                                        />

                                        <span className="text-sm font-semibold text-slate-300">
                                            Active Content
                                        </span>
                                    </label>
                                </div>

                                <div className="md:col-span-2 flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition"
                                    >
                                        Update Content
                                    </button>

                                    <button
                                        type="button"
                                        onClick={closeEdit}
                                        className="px-6 py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                        <div className="px-8 py-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">
                                    All Learning Resources
                                </h2>

                                <p className="text-sm text-slate-400 mt-1">
                                    Manage learning resources for users.
                                </p>
                            </div>

                            <span className="px-3.5 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold uppercase tracking-wide w-fit">
                                {content.length} Resources
                            </span>
                        </div>

                        {content.length === 0 ? (
                            <div className="p-14 text-center">
                                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl mb-4">
                                    📚
                                </div>

                                <h3 className="text-lg font-bold text-white">
                                    No Learning Content
                                </h3>

                                <p className="text-sm text-slate-500 mt-1">
                                    No learning content available.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800/80">
                                {content.map((item, index) => (
                                    <div
                                        key={item._id}
                                        className="p-8 hover:bg-slate-800/30 transition"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                            <div className="flex gap-5 flex-1 min-w-0">
                                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shadow-inner">
                                                    {String(index + 1).padStart(2, "0")}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap mb-2">
                                                        <h3 className="text-xl font-extrabold text-white tracking-tight">
                                                            {item.title}
                                                        </h3>

                                                        <span
                                                            className={`px-3 py-1 rounded-xl text-xs font-bold tracking-wide uppercase border ${
                                                                item.active
                                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                            }`}
                                                        >
                                                            {item.active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </div>

                                                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">
                                                        {item.category}
                                                    </p>

                                                    <p className="text-sm text-slate-400 max-w-4xl leading-relaxed mb-4">
                                                        {item.description}
                                                    </p>

                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-semibold">
                                                            {item.category}
                                                        </span>

                                                        <span className="px-3 py-1.5 bg-slate-800/80 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-medium">
                                                            {item.type}
                                                        </span>

                                                        <span className="px-3 py-1.5 bg-slate-800/80 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-medium">
                                                            {item.level}
                                                        </span>

                                                        <span className="px-3 py-1.5 bg-slate-800/80 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-medium">
                                                            {item.duration}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2.5 shrink-0">
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-4 py-2 border border-slate-700 bg-slate-800/70 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 hover:text-white transition"
                                                >
                                                    View ↗
                                                </a>

                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="px-4 py-2 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-500/20 transition"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        deleteContent(item._id)
                                                    }
                                                    className="px-4 py-2 border border-rose-500/30 bg-rose-500/10 text-rose-300 rounded-xl text-xs font-bold hover:bg-rose-500/20 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default LearningContent;