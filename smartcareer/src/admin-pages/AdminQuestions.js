import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import AddQuestion from "./AddQuestion";
import EditQuestion from "./EditQuestion";
import DeleteQuestion from "./DeleteQuestion";

const AdminQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [editQuestion, setEditQuestion] = useState(null);
    const [deleteQuestion, setDeleteQuestion] = useState(null);

    const getQuestions = async () => {
        try {
            const response = await api.get(
                "/api/admin/assessment-question"
            );
            if (response.data.status === 1) {
                setQuestions(response.data.data);
            }
        } catch (error) {
            console.log("Get Questions Error:", error);
        }
    };

    useEffect(() => {
        getQuestions();
    }, []);

    const questionAdded = () => {
        setShowAdd(false);
        getQuestions();
    };

    const questionUpdated = () => {
        setEditQuestion(null);
        getQuestions();
    };

    const questionDeleted = () => {
        setDeleteQuestion(null);
        getQuestions();
    };

    const activeQuestions = questions.filter(
        (question) => question.active
    ).length;

    const inactiveQuestions = questions.filter(
        (question) => !question.active
    ).length;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            <div className="bg-slate-900/80 backdrop-blur-2xl border-b border-slate-800/80">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
                                📝
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white tracking-tight">
                                    Assessment Questions
                                </h1>
                                <p className="text-sm text-slate-400 mt-0.5">
                                    Manage questions used in the career assessment.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                to="/admin-dashboard"
                                className="px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900 text-slate-300 font-bold text-xs hover:bg-slate-800 hover:text-indigo-400 transition shadow-sm"
                            >
                                ← Back to Dashboard
                            </Link>
                            <button
                                onClick={() => setShowAdd(true)}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
                            >
                                + Add Question
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto p-6 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Total Questions
                                </p>
                                <p className="text-3xl font-black text-white mt-2">
                                    {questions.length}
                                </p>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg shadow-inner">
                                📝
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Active Questions
                                </p>
                                <p className="text-3xl font-black text-emerald-400 mt-2">
                                    {activeQuestions}
                                </p>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg shadow-inner font-bold">
                                ✓
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Inactive Questions
                                </p>
                                <p className="text-3xl font-black text-rose-400 mt-2">
                                    {inactiveQuestions}
                                </p>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-lg shadow-inner font-bold">
                                !
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="px-8 py-6 border-b border-slate-800/80 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-white tracking-tight">
                                All Assessment Questions
                            </h2>
                            <p className="text-sm text-slate-400 mt-0.5">
                                Review and manage your assessment questions.
                            </p>
                        </div>
                        <span className="px-3.5 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold uppercase tracking-wide">
                            {questions.length} Questions
                        </span>
                    </div>
                    <div className="divide-y divide-slate-800/80">
                        {questions.length === 0 ? (
                            <div className="text-center py-16 px-6">
                                <div className="w-20 h-20 mx-auto bg-slate-800 border border-slate-700 rounded-3xl flex items-center justify-center text-4xl shadow-inner mb-4">
                                    📝
                                </div>
                                <h3 className="text-lg font-bold text-white">
                                    No questions available
                                </h3>
                                <p className="text-slate-400 mt-1 text-sm">
                                    Add your first assessment question to get started.
                                </p>
                                <button
                                    onClick={() => setShowAdd(true)}
                                    className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30"
                                >
                                    + Add Question
                                </button>
                            </div>
                        ) : (
                            questions.map((question, index) => (
                                <div
                                    key={question._id}
                                    className="p-8 hover:bg-slate-800/40 transition"
                                >
                                    <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 shrink-0 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center font-bold text-sm shadow-inner">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-white">
                                                    {question.question}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-bold">
                                                        {question.category}
                                                    </span>
                                                    <span className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-xl text-xs font-bold">
                                                        {question.type}
                                                    </span>
                                                    <span
                                                        className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                                                            question.active
                                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                        }`}
                                                    >
                                                        {question.active
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                                    <span className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium">
                                                        Order {question.order}
                                                    </span>
                                                </div>
                                                {question.options &&
                                                    question.options.length > 0 && (
                                                        <div className="mt-5">
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                                                Answer Options
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {question.options.map(
                                                                    (option, optionIndex) => (
                                                                        <div
                                                                            key={optionIndex}
                                                                            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl"
                                                                        >
                                                                            <p className="text-sm font-semibold text-slate-200">
                                                                                {option.name}
                                                                            </p>
                                                                            {option.category &&
                                                                                option.category.length > 0 && (
                                                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                                                        {option.category.map(
                                                                                            (skillCategory, categoryIndex) => (
                                                                                                <span
                                                                                                    key={categoryIndex}
                                                                                                    className="px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-semibold"
                                                                                                >
                                                                                                    {skillCategory}
                                                                                                </span>
                                                                                            )
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2.5 lg:pt-1">
                                            <button
                                                onClick={() =>
                                                    setEditQuestion(question)
                                                }
                                                className="px-4 py-2 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-xl hover:bg-indigo-500/20 text-xs font-bold transition shadow-sm h-fit"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setDeleteQuestion(question)
                                                }
                                                className="px-4 py-2 border border-rose-500/30 bg-rose-500/10 text-rose-300 rounded-xl hover:bg-rose-500/20 text-xs font-bold transition shadow-sm h-fit"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            {showAdd && (
                <AddQuestion
                    onClose={() => setShowAdd(false)}
                    onSuccess={questionAdded}
                />
            )}
            {editQuestion && (
                <EditQuestion
                    question={editQuestion}
                    onClose={() => setEditQuestion(null)}
                    onSuccess={questionUpdated}
                />
            )}
            {deleteQuestion && (
                <DeleteQuestion
                    question={deleteQuestion}
                    onClose={() => setDeleteQuestion(null)}
                    onSuccess={questionDeleted}
                />
            )}
        </div>
    );
};

export default AdminQuestions;