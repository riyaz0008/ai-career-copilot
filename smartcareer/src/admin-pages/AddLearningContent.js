import React, { useState } from "react";
import api from "../api";

const AddLearningContent = ({ onClose, onSuccess }) => {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("Video");
    const [url, setUrl] = useState("");
    const [skills, setSkills] = useState("");
    const [level, setLevel] = useState("Beginner");
    const [duration, setDuration] = useState("");
    const [active, setActive] = useState(true);

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const learningData = {
            title,
            category,
            description,
            type,
            url,
            skills: skills
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean),
            level,
            duration,
            active
        };

        try {
            const response = await api.post(
                "/api/admin/learning-content",
                learningData
            );

            if (response.data.status === 1) {
                alert("Learning Content Added Successfully!");

                setTitle("");
                setCategory("");
                setDescription("");
                setType("Video");
                setUrl("");
                setSkills("");
                setLevel("Beginner");
                setDuration("");
                setActive(true);

                if (onSuccess) {
                    onSuccess();
                }
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.log("Add Learning Content Error:", error);

            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert("Something went wrong.");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-800/80">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">
                            Add Learning Content
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Create a new learning resource for users.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-2xl font-bold transition"
                    >
                        ×
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-8 space-y-6 text-left"
                >
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Example: React Complete Tutorial"
                            required
                            className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Category
                            </label>

                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                            >
                                <option value="" className="bg-slate-950">
                                    Select Category
                                </option>
                                <option className="bg-slate-950">
                                    Software Development
                                </option>
                                <option className="bg-slate-950">
                                    FullStack Development
                                </option>
                                <option className="bg-slate-950">
                                    Data Science & AI
                                </option>
                                <option className="bg-slate-950">
                                    Cyber Security
                                </option>
                                <option className="bg-slate-950">
                                    Cloud & DevOps
                                </option>
                                <option className="bg-slate-950">
                                    UI/UX Design
                                </option>
                                <option className="bg-slate-950">
                                    Other
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Content Type
                            </label>

                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                            >
                                <option className="bg-slate-950">
                                    Video
                                </option>
                                <option className="bg-slate-950">
                                    Article
                                </option>
                                <option className="bg-slate-950">
                                    Course
                                </option>
                                <option className="bg-slate-950">
                                    Documentation
                                </option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe this learning resource"
                            required
                            rows="4"
                            className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Resource URL
                        </label>

                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            required
                            className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Skills
                        </label>

                        <input
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="React, JavaScript, HTML"
                            required
                            className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                        />

                        <p className="text-xs text-slate-500 mt-2">
                            Separate multiple skills with commas.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Level
                            </label>

                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                            >
                                <option className="bg-slate-950">
                                    Beginner
                                </option>
                                <option className="bg-slate-950">
                                    Intermediate
                                </option>
                                <option className="bg-slate-950">
                                    Advanced
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Duration
                            </label>

                            <input
                                type="text"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="Example: 5 Hours"
                                required
                                className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                        />

                        <label className="text-sm font-bold text-slate-200">
                            Active Content
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/80">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-3 border border-slate-700 bg-slate-800/60 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-800 hover:text-white transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition"
                        >
                            Add Learning Content
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLearningContent;