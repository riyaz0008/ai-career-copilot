
import React, { useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../admin-dash/AdminSidebar";
import AdminTopHeader from "../admin-dash/AdminTopHeader";
import api from "../api";

const initialForm = {
    question: "",
    category: "Technical",
    options: ["", "", "", ""],
    correctAnswer: "0",
    explanation: "",
    difficulty: "Medium"
};

const ManageInterviewQuestions = () => {
    const [form, setForm] = useState(initialForm);
    const [questionId, setQuestionId] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [action, setAction] = useState("add");

    const showMessage = (text, type = "success") => {
        setMessage(text);
        setMessageType(type);
    };

    const updateOption = (index, value) => {
        setForm((previous) => ({
            ...previous,
            options: previous.options.map((option, i) =>
                i === index ? value : option
            )
        }));
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!form.question.trim()) {
            showMessage("Please enter the question.", "error");
            return false;
        }

        if (form.options.some((option) => !option.trim())) {
            showMessage("Please fill all four options.", "error");
            return false;
        }

        if (!form.explanation.trim()) {
            showMessage("Please enter the explanation.", "error");
            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        if (!validateForm()) return;

        if (action === "edit" && !questionId.trim()) {
            showMessage("Please enter the question ID to update.", "error");
            return;
        }

        const payload = {
            question: form.question.trim(),
            category: form.category,
            options: form.options.map((option) => option.trim()),
            correctAnswer: Number(form.correctAnswer),
            explanation: form.explanation.trim(),
            difficulty: form.difficulty
        };

        try {
            setLoading(true);

            if (action === "add") {
                const response = await api.post(
                    "/api/interview/admin/questions",
                    payload
                );

                if (response.data.status === 1) {
                    showMessage(
                        response.data.message || "Question added successfully."
                    );
                    setForm(initialForm);
                } else {
                    showMessage(
                        response.data.message || "Unable to add question.",
                        "error"
                    );
                }
            } else {
                const response = await api.put(
                    `/api/interview/admin/questions/${questionId.trim()}`,
                    payload
                );

                if (response.data.status === 1) {
                    showMessage(
                        response.data.message || "Question updated successfully."
                    );
                } else {
                    showMessage(
                        response.data.message || "Unable to update question.",
                        "error"
                    );
                }
            }
        } catch (error) {
            showMessage(
                error.response?.data?.message ||
                    "Request failed. Please check your login and backend.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionAction = async (type) => {
        setMessage("");

        if (!questionId.trim()) {
            showMessage("Please enter a question ID first.", "error");
            return;
        }

        if (
            type === "delete" &&
            !window.confirm("Are you sure you want to delete this question?")
        ) {
            return;
        }

        const endpoints = {
            delete: {
                method: "delete",
                url: `/api/interview/admin/questions/${questionId.trim()}`
            },
            status: {
                method: "patch",
                url: `/api/interview/admin/questions/${questionId.trim()}/status`
            }
        };

        try {
            setLoading(true);

            const endpoint = endpoints[type];
            const response =
                type === "delete"
                    ? await api.delete(endpoint.url)
                    : await api.patch(endpoint.url);

        if (response.data.status === 1) {
    showMessage(
        response.data.message ||
            (type === "delete"
                ? "Question deleted successfully."
                : `Question status updated successfully. ${
                    response.data.data?.active === true
                        ? "Question is now Active."
                        : response.data.data?.active === false
                          ? "Question is now Inactive."
                          : ""
                }`)
    );

    if (type === "delete") {
        setQuestionId("");
    }
} else {
                showMessage(
                    response.data.message || "Action could not be completed.",
                    "error"
                );
            }
        } catch (error) {
            showMessage(
                error.response?.data?.message ||
                    "Action failed. Please check the question ID.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const selectAction = (value) => {
        setAction(value);
        setMessage("");
    };

    return (
        <div className="flex min-h-screen bg-slate-950 text-white">
            <AdminSidebar />

            <main className="min-w-0 flex-1">
                <AdminTopHeader />

                <div className="p-5 md:p-8">
                    <div className="mb-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 p-6 md:p-8">
                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                            Admin Panel
                        </p>

                        <h1 className="mt-3 text-3xl font-black md:text-4xl">
                            Interview Questions
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                            Manage the mixed mock interview question bank for
                            Technical, HR, Aptitude and Coding categories.
                        </p>

                        
                    </div>

                    {message && (
                        <div
                            className={`mb-6 rounded-xl border p-4 text-sm ${
                                messageType === "error"
                                    ? "border-red-800 bg-red-950/40 text-red-300"
                                    : "border-emerald-800 bg-emerald-950/40 text-emerald-300"
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[
                            {
                                value: "Add",
                                title: "Add Question",
                                description: "Create a new MCQ."
                            },
                            {
                                value: "edit",
                                title: "Update Question",
                                description: "Edit a question using its ID."
                            },
                            {
                                value: "manage",
                                title: "Manage Status",
                                description: "Delete or toggle question status."
                            }
                        ].map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() =>
                                    selectAction(
                                        item.value === "Add"
                                            ? "add"
                                            : item.value === "edit"
                                              ? "edit"
                                              : "manage"
                                    )
                                }
                                className={`rounded-2xl border p-5 text-left transition ${
                                    (action === "add" && item.value === "Add") ||
                                    (action === "edit" && item.value === "edit") ||
                                    (action === "manage" && item.value === "manage")
                                        ? "border-indigo-500 bg-indigo-950/50"
                                        : "border-slate-800 bg-slate-900 hover:border-slate-600"
                                }`}
                            >
                                <h2 className="font-bold">{item.title}</h2>
                                <p className="mt-2 text-sm text-slate-400">
                                    {item.description}
                                </p>
                            </button>
                        ))}
                    </div>

                    {(action === "edit" || action === "manage") && (
                        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                            <label className="mb-2 block text-sm font-semibold">
                                Question ID
                            </label>

                            <input
                                type="text"
                                value={questionId}
                                onChange={(event) =>
                                    setQuestionId(event.target.value)
                                }
                                placeholder="Paste MongoDB question _id"
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                Question ID MongoDB ke interviewquestions collection
                                se copy karein.
                            </p>

                            {action === "manage" && (
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() => handleQuestionAction("status")}
                                        className="rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold hover:bg-amber-500 disabled:opacity-50"
                                    >
                                        Activate / Deactivate
                                    </button>

                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() => handleQuestionAction("delete")}
                                        className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold hover:bg-red-500 disabled:opacity-50"
                                    >
                                        Delete Question
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {action !== "manage" && (
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl md:p-8"
                        >
                            <h2 className="mb-6 text-xl font-bold">
                                {action === "add"
                                    ? "Create Interview Question"
                                    : "Update Interview Question"}
                            </h2>

                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-semibold">
                                    Question
                                </label>

                                <textarea
                                    name="question"
                                    value={form.question}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Enter the interview question..."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                    >
                                        <option value="Technical">Technical</option>
                                        <option value="HR">HR</option>
                                        <option value="Aptitude">Aptitude</option>
                                        <option value="Coding">Coding</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        Difficulty
                                    </label>

                                    <select
                                        name="difficulty"
                                        value={form.difficulty}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold">
                                        Correct Option
                                    </label>

                                    <select
                                        name="correctAnswer"
                                        value={form.correctAnswer}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                    >
                                        <option value="0">Option A</option>
                                        <option value="1">Option B</option>
                                        <option value="2">Option C</option>
                                        <option value="3">Option D</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="mb-3 block text-sm font-semibold">
                                    Four Options
                                </label>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {form.options.map((option, index) => (
                                        <div key={index}>
                                            <label className="mb-2 block text-xs font-semibold text-slate-400">
                                                Option {String.fromCharCode(65 + index)}
                                            </label>

                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(event) =>
                                                    updateOption(index, event.target.value)
                                                }
                                                placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-semibold">
                                    Explanation
                                </label>

                                <textarea
                                    name="explanation"
                                    value={form.explanation}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Explain why the selected option is correct..."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Please wait..."
                                    : action === "add"
                                      ? "Add Question"
                                      : "Update Question"}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ManageInterviewQuestions;
