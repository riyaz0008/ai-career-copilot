import React, { useState } from "react";
import api from "../api";

const EditQuestion = ({ question, onClose, onSuccess }) => {
    const [questionText, setQuestionText] = useState(question.question);
    const [category, setCategory] = useState(question.category);
    const [type, setType] = useState(question.type);
    const [options, setOptions] = useState(
        (question.options || []).map((option) =>
            typeof option === "string"
                ? { name: option, category: [] }
                : {
                    ...option,
                    category: Array.isArray(option.category)
                        ? option.category
                        : option.category
                            ? [option.category]
                            : []
                }
        )
    );
    const [order, setOrder] = useState(question.order);
    const [active, setActive] = useState(question.active);

    const skillCategories = [
        "Software Development",
        "Data Science & AI",
        "Cyber Security",
        "UI/UX Design",
        "Cloud & DevOps",
        "Business & Management"
    ];

    const changeOption = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = {
            ...newOptions[index],
            name: value
        };
        setOptions(newOptions);
    };

    const changeSkillCategory = (index, categoryName) => {
        const newOptions = [...options];
        const currentCategories = newOptions[index].category || [];

        if (currentCategories.includes(categoryName)) {
            newOptions[index] = {
                ...newOptions[index],
                category: currentCategories.filter(
                    (category) => category !== categoryName
                )
            };
        } else {
            newOptions[index] = {
                ...newOptions[index],
                category: [...currentCategories, categoryName]
            };
        }

        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([
            ...options,
            {
                name: "",
                category: []
            }
        ]);
    };

    const removeOption = (index) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleCategoryChange = (value) => {
        setCategory(value);

        if (value !== "Skills") {
            setOptions(
                options.map((option) => ({
                    name: option.name || "",
                    category: []
                }))
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const finalOptions = options
            .filter((option) => option.name.trim() !== "")
            .map((option) => ({
                name: option.name.trim(),
                category: category === "Skills"
                    ? option.category || []
                    : []
            }));

        const questionData = {
            question: questionText,
            category,
            type,
            options: finalOptions,
            order: Number(order),
            active
        };

        try {
            const response = await api.put(
                `/api/admin/assessment-question/${question._id}`,
                questionData
            );

            if (response.data.status === 1) {
                alert("Question updated successfully!");
                onSuccess();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.log("Update Question Error:", error);
            console.log("Server Error:", error.response?.data);
            alert(
                error.response?.data?.message ||
                "Something went wrong."
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <div className="flex justify-between items-center px-8 py-6 border-b border-slate-800/80">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">
                            Edit Question
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Update assessment question details.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-2xl font-bold transition"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Question
                        </label>

                        <textarea
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            required
                            rows="3"
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
                                onChange={(e) =>
                                    handleCategoryChange(e.target.value)
                                }
                                className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                            >
                                <option className="bg-slate-950">
                                    Interest
                                </option>
                                <option className="bg-slate-950">
                                    Experience
                                </option>
                                <option className="bg-slate-950">
                                    Skills
                                </option>
                                <option className="bg-slate-950">
                                    Work Style
                                </option>
                                <option className="bg-slate-950">
                                    Career Goal
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Question Type
                            </label>

                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                            >
                                <option className="bg-slate-950">
                                    Single Choice
                                </option>
                                <option className="bg-slate-950">
                                    Multiple Choice
                                </option>
                                <option className="bg-slate-950">
                                    Multiple Select
                                </option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                                Options
                            </label>

                            <button
                                type="button"
                                onClick={addOption}
                                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                            >
                                + Add Option
                            </button>
                        </div>

                        <div className="space-y-4">
                            {options.map((option, index) => (
                                <div key={index} className="flex gap-2.5">
                                    <div className="flex-1 space-y-2">
                                        <input
                                            value={option.name}
                                            onChange={(e) =>
                                                changeOption(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            required
                                            placeholder={`Option ${index + 1}`}
                                            className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 text-sm shadow-inner"
                                        />

                                        {category === "Skills" && (
                                            <div className="border border-slate-700/80 bg-slate-950 rounded-xl p-3">
                                                <p className="text-xs font-bold text-slate-400 mb-3">
                                                    Select Skill Categories
                                                </p>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {skillCategories.map(
                                                        (skillCategory) => (
                                                            <label
                                                                key={skillCategory}
                                                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-900 cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        option.category?.includes(
                                                                            skillCategory
                                                                        ) || false
                                                                    }
                                                                    onChange={() =>
                                                                        changeSkillCategory(
                                                                            index,
                                                                            skillCategory
                                                                        )
                                                                    }
                                                                    className="w-4 h-4 accent-indigo-600"
                                                                />

                                                                <span className="text-xs text-slate-300">
                                                                    {
                                                                        skillCategory
                                                                    }
                                                                </span>
                                                            </label>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeOption(index)
                                            }
                                            className="px-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-xl transition font-bold h-fit py-3"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Question Order
                            </label>

                            <input
                                type="number"
                                value={order}
                                onChange={(e) => setOrder(e.target.value)}
                                required
                                min="1"
                                className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 text-sm shadow-inner"
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-6">
                            <input
                                type="checkbox"
                                checked={active}
                                onChange={(e) => setActive(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                            />

                            <label className="text-sm font-bold text-slate-200">
                                Active Question
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/80">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-slate-700 bg-slate-800/60 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-800 hover:text-white transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditQuestion;