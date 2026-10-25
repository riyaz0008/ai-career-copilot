import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

const InterviewPreparation = () => {
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [started, setStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const answeredCount = Object.keys(answers).length;
    const current = questions[currentQuestion];

    const progress = questions.length
        ? ((currentQuestion + 1) / questions.length) * 100
        : 0;

    // Shuffle questions into a random order.
    const shuffleQuestions = (items) => {
        const shuffled = [...items];

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    };

    // Start the assessment.
    const startTest = async () => {
        try {
            setLoading(true);
            setError("");
            setResult(null);
            setAnswers({});
            setQuestions([]);
            setCurrentQuestion(0);
            setStarted(false);

            const response = await api.get("/api/interview/questions");

            if (
                response.data.status === 1 &&
                Array.isArray(response.data.data) &&
                response.data.data.length > 0
            ) {
                setQuestions(shuffleQuestions(response.data.data));
                setStarted(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                setError(
                    "No interview questions are currently available. Please try again later."
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to load the assessment. Please sign in and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Select or update an answer.
    const selectAnswer = (questionId, optionIndex) => {
        setAnswers((previous) => ({
            ...previous,
            [questionId]: optionIndex
        }));

        setError("");
    };

    // Navigate between questions.
    const goToQuestion = (index) => {
        if (index < 0 || index >= questions.length) return;

        setCurrentQuestion(index);
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const nextQuestion = () => {
        goToQuestion(currentQuestion + 1);
    };

    const previousQuestion = () => {
        goToQuestion(currentQuestion - 1);
    };

    // Submit the assessment.
    const submitTest = async () => {
        if (answeredCount !== questions.length) {
            setError(
                `Please answer all questions before submitting. ${
                    questions.length - answeredCount
                } question(s) remaining.`
            );
            return;
        }

        try {
            setLoading(true);
            setError("");

            const answerData = questions.map((question) => ({
                questionId: question._id,
                selectedAnswer: answers[question._id]
            }));

            const response = await api.post("/api/interview/submit", {
                answers: answerData
            });

            if (response.data.status === 1) {
                setResult(response.data.data);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                setError(
                    response.data.message ||
                        "Unable to submit your assessment. Please try again."
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "An error occurred while submitting your assessment."
            );
        } finally {
            setLoading(false);
        }
    };

    // Start over with a new question order.
    const restartTest = () => {
        setQuestions([]);
        setAnswers({});
        setResult(null);
        setStarted(false);
        setCurrentQuestion(0);
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Support keyboard navigation with arrow keys.
    useEffect(() => {
        if (!started || result || loading) return;

        const handleKeyDown = (event) => {
            if (
                event.target instanceof HTMLElement &&
                ["INPUT", "TEXTAREA", "SELECT"].includes(
                    event.target.tagName
                )
            ) {
                return;
            }

            if (event.key === "ArrowRight") {
                setCurrentQuestion((previous) =>
                    Math.min(previous + 1, questions.length - 1)
                );
            }

            if (event.key === "ArrowLeft") {
                setCurrentQuestion((previous) =>
                    Math.max(previous - 1, 0)
                );
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [started, result, loading, questions.length]);

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                    <Link
                        to="/user-dashboard"
                        className="flex min-w-0 items-center gap-3"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold shadow-lg shadow-indigo-950/40">
                            AI
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-base font-bold sm:text-lg">
                                AI Career Copilot
                            </h1>
                            <p className="text-xs text-slate-400">
                                Interview Preparation
                            </p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={() => navigate("/user-dashboard")}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-indigo-500 hover:bg-indigo-950 sm:px-4"
                    >
                        <span aria-hidden="true">←</span>
                        <span>Back to Dashboard</span>
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Hero - Only show before starting the assessment */}
                {!started && !result && (
                    <section className="relative mb-8 overflow-hidden rounded-3xl border border-indigo-900/60 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-6 sm:p-10">
                        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />

                        <div className="relative">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-700/60 bg-indigo-950/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                                <span>✦</span>
                                Career Development
                            </div>

                            <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                                Prepare smarter.
                                <span className="block bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                                    Interview with confidence.
                                </span>
                            </h2>

                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                                Strengthen your interview readiness with
                                practice questions covering technical knowledge,
                                HR, aptitude, and coding.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {[
                                    { name: "Technical", icon: "💻" },
                                    { name: "HR", icon: "🤝" },
                                    { name: "Aptitude", icon: "🧠" },
                                    { name: "Coding", icon: "⌨️" }
                                ].map((item) => (
                                    <span
                                        key={item.name}
                                        className="rounded-full border border-slate-700 bg-slate-950/50 px-4 py-2 text-sm text-slate-200"
                                    >
                                        {item.icon} {item.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Error message */}
                {error && (
                    <div
                        role="alert"
                        className="mb-6 flex items-start gap-3 rounded-2xl border border-red-800/70 bg-red-950/40 p-4 text-sm text-red-300"
                    >
                        <span className="text-lg">⚠</span>
                        <p>{error}</p>
                    </div>
                )}

                {/* Assessment introduction */}
                {!started && !result && (
                    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                        {/* Main assessment card */}
                        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-600/10 blur-3xl" />

                            <div className="relative">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/30 bg-indigo-500/10">
                                    <svg
                                        className="h-7 w-7 text-indigo-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.8}
                                            d="M9 12l2 2 4-4m5.5-2.5A11 11 0 0112 3a11 11 0 01-8.5 4.5 11 11 0 006.5 13.2 11 11 0 006.5-13.2z"
                                        />
                                    </svg>
                                </div>

                                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
                                    Interview Assessment
                                </p>

                                <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                                    Mixed Mock Interview
                                </h3>

                                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                                    Evaluate your interview readiness through
                                    questions on technical fundamentals,
                                    workplace scenarios, aptitude, and
                                    programming concepts. Review your results
                                    to identify strengths and areas for improvement.
                                </p>

                                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                                    <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-indigo-300">
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.8}
                                                    d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                                                />
                                            </svg>
                                        </div>

                                        <div>
                                            <p className="font-semibold text-white">
                                                Multiple-Choice Questions
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-slate-400">
                                                Choose the most appropriate answer
                                                from the available options.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-violet-300">
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.8}
                                                    d="M4 19V5m0 14h16M8 15l3-4 3 2 5-7"
                                                />
                                            </svg>
                                        </div>

                                        <div>
                                            <p className="font-semibold text-white">
                                                Performance Review
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-slate-400">
                                                Review your score, correct answers,
                                                and explanations.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-7">
                                    <p className="mb-3 text-sm font-semibold text-slate-200">
                                        Assessment Coverage
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            "Technical Knowledge",
                                            "HR",
                                            "Aptitude",
                                            "Coding"
                                        ].map((category) => (
                                            <span
                                                key={category}
                                                className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-xs font-medium text-slate-300"
                                            >
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-7 border-t border-slate-800 pt-6">
                                    <p className="text-sm leading-6 text-slate-400">
                                        Find a quiet moment, read each question
                                        carefully, and submit your answers when
                                        you are ready to review your performance.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={startTest}
                                        disabled={loading}
                                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    >
                                        {loading
                                            ? "Preparing Assessment..."
                                            : "Begin Assessment"}

                                        {!loading && (
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 12h14m-7-7l7 7-7 7"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Assessment guidelines */}
                        <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7">
                            <div className="border-b border-slate-800 pb-5">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                                    Before You Begin
                                </p>

                                <h3 className="mt-2 text-xl font-bold">
                                    Assessment Guidelines
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Follow these guidelines to make the most
                                    of your practice session.
                                </p>
                            </div>

                            <div className="mt-6 space-y-6">
                                {[
                                    {
                                        number: "01",
                                        title: "Read Each Question Carefully",
                                        description:
                                            "Review the question and all answer choices before making your selection."
                                    },
                                    {
                                        number: "02",
                                        title: "Review Your Responses",
                                        description:
                                            "Move between questions and change your selected answers before submitting."
                                    },
                                    {
                                        number: "03",
                                        title: "Submit When Ready",
                                        description:
                                            "Complete the assessment to receive your score and answer review."
                                    }
                                ].map((item) => (
                                    <div
                                        key={item.number}
                                        className="flex gap-4"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 text-sm font-bold text-indigo-300">
                                            {item.number}
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-100">
                                                {item.title}
                                            </h4>
                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-7 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-4">
                                <p className="text-sm font-semibold text-indigo-300">
                                    Focus on Continuous Improvement
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Use your results to understand your strengths
                                    and focus on topics that need more practice.
                                </p>
                            </div>
                        </aside>
                    </section>
                )}

                {/* One question at a time */}
                {started && !result && current && (
                    <section>
                        {/* Progress and question navigation */}
                        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Assessment in Progress
                                    </p>

                                    <h3 className="mt-1 text-xl font-bold">
                                        Question {currentQuestion + 1}
                                        <span className="font-medium text-slate-500">
                                            {" "}/ {questions.length}
                                        </span>
                                    </h3>
                                </div>

                                <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm">
                                    <span className="font-bold text-indigo-300">
                                        {answeredCount}
                                    </span>
                                    <span className="text-slate-400">
                                        {" "}of {questions.length} answered
                                    </span>
                                </div>
                            </div>

                            <div
                                className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800"
                                role="progressbar"
                                aria-valuenow={currentQuestion + 1}
                                aria-valuemin={1}
                                aria-valuemax={questions.length}
                                aria-label="Question progress"
                            >
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {questions.map((question, index) => {
                                    const isAnswered =
                                        answers[question._id] !== undefined;
                                    const isCurrent =
                                        index === currentQuestion;

                                    return (
                                        <button
                                            type="button"
                                            key={question._id}
                                            onClick={() => goToQuestion(index)}
                                            aria-label={`Go to question ${index + 1}`}
                                            aria-current={
                                                isCurrent ? "step" : undefined
                                            }
                                            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold transition ${
                                                isCurrent
                                                    ? "border-indigo-400 bg-indigo-600 text-white ring-2 ring-indigo-500/20"
                                                    : isAnswered
                                                    ? "border-emerald-700 bg-emerald-950 text-emerald-300 hover:border-emerald-500"
                                                    : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500"
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                                <span>
                                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-indigo-500" />
                                    Current question
                                </span>

                                <span>
                                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                                    Answered
                                </span>

                                <span>
                                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-slate-600" />
                                    Not answered
                                </span>
                            </div>
                        </div>

                        {/* Current question */}
                        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
                            <div className="border-b border-slate-800 px-5 py-5 sm:px-8">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <span className="text-sm font-semibold text-indigo-300">
                                        QUESTION{" "}
                                        {String(currentQuestion + 1).padStart(
                                            2,
                                            "0"
                                        )}
                                    </span>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-full border border-indigo-800/70 bg-indigo-950/60 px-3 py-1.5 text-xs font-medium text-indigo-300">
                                            {current.category}
                                        </span>

                                        <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-300">
                                            {current.difficulty || "Medium"}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="mt-5 text-lg font-bold leading-8 sm:text-2xl sm:leading-9">
                                    {current.question}
                                </h3>
                            </div>

                            <div className="p-5 sm:p-8">
                                <p className="mb-4 text-sm font-medium text-slate-400">
                                    Choose one answer
                                </p>

                                <div className="grid gap-3">
                                    {current.options.map(
                                        (option, optionIndex) => {
                                            const selected =
                                                answers[current._id] ===
                                                optionIndex;

                                            return (
                                                <button
                                                    type="button"
                                                    key={optionIndex}
                                                    onClick={() =>
                                                        selectAnswer(
                                                            current._id,
                                                            optionIndex
                                                        )
                                                    }
                                                    aria-pressed={selected}
                                                    className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition sm:p-5 ${
                                                        selected
                                                            ? "border-indigo-500 bg-indigo-950/70 ring-1 ring-indigo-500/30"
                                                            : "border-slate-700 bg-slate-950/70 hover:border-slate-500 hover:bg-slate-950"
                                                    }`}
                                                >
                                                    <span
                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition ${
                                                            selected
                                                                ? "bg-indigo-600 text-white"
                                                                : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                                                        }`}
                                                    >
                                                        {String.fromCharCode(
                                                            65 + optionIndex
                                                        )}
                                                    </span>

                                                    <span
                                                        className={`flex-1 text-sm leading-6 sm:text-base ${
                                                            selected
                                                                ? "font-medium text-white"
                                                                : "text-slate-300"
                                                        }`}
                                                    >
                                                        {option}
                                                    </span>

                                                    <span
                                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                                            selected
                                                                ? "border-indigo-400 bg-indigo-500"
                                                                : "border-slate-600"
                                                        }`}
                                                    >
                                                        {selected && (
                                                            <span className="text-xs text-white">
                                                                ✓
                                                            </span>
                                                        )}
                                                    </span>
                                                </button>
                                            );
                                        }
                                    )}
                                </div>

                                {/* Previous and next controls */}
                                <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:items-center">
                                    <button
                                        type="button"
                                        onClick={previousQuestion}
                                        disabled={
                                            currentQuestion === 0 || loading
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <span aria-hidden="true">←</span>
                                        Previous
                                    </button>

                                    {currentQuestion < questions.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={nextQuestion}
                                            disabled={loading}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-500 disabled:opacity-50"
                                        >
                                            Next Question
                                            <span aria-hidden="true">→</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={submitTest}
                                            disabled={loading}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {loading
                                                ? "Submitting Assessment..."
                                                : "Submit Assessment ✓"}
                                        </button>
                                    )}
                                </div>

                                {currentQuestion === questions.length - 1 && (
                                    <p className="mt-4 text-right text-xs text-slate-500">
                                        {answeredCount === questions.length
                                            ? "All questions answered. You are ready to submit."
                                            : `${
                                                  questions.length -
                                                  answeredCount
                                              } question(s) still unanswered.`}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Results */}
                {result && (
                    <section>
                        <div className="overflow-hidden rounded-3xl border border-emerald-800/60 bg-slate-900">
                            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 sm:p-9">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-3xl">
                                    🏆
                                </div>

                                <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-emerald-400">
                                    Assessment Completed
                                </p>

                                <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                                    Your Results
                                </h2>

                                <p className="mt-3 text-sm text-slate-300">
                                    Review your performance and learn from
                                    every answer.
                                </p>

                                <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
                                    {[
                                        {
                                            label: "Final Score",
                                            value: `${result.correctCount}/${result.totalQuestions}`,
                                            icon: "🎯"
                                        },
                                        {
                                            label: "Percentage",
                                            value: `${result.percentage}%`,
                                            icon: "📊"
                                        },
                                        {
                                            label: "Correct Answers",
                                            value: result.correctCount,
                                            icon: "✓"
                                        },
                                        {
                                            label: "Incorrect Answers",
                                            value: result.wrongCount,
                                            icon: "↻"
                                        }
                                    ].map((item) => (
                                        <div
                                            key={item.label}
                                            className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4 sm:p-5"
                                        >
                                            <span className="text-xl">
                                                {item.icon}
                                            </span>

                                            <p className="mt-3 text-xs text-slate-400 sm:text-sm">
                                                {item.label}
                                            </p>

                                            <p className="mt-1 text-2xl font-extrabold sm:text-3xl">
                                                {item.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={restartTest}
                                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500"
                                >
                                    ↻ Try Another Assessment
                                </button>
                            </div>
                        </div>

                        {/* Answer review */}
                        <div className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Answer Review
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Check your responses and understand the
                                    correct solutions.
                                </p>
                            </div>

                            <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
                                {result.review?.length || 0} Questions
                            </span>
                        </div>

                        <div className="space-y-4">
                            {result.review?.map((item, index) => (
                                <div
                                    key={item.questionId || index}
                                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <span className="text-sm font-semibold text-indigo-300">
                                            Question {index + 1}
                                            {item.category
                                                ? ` · ${item.category}`
                                                : ""}
                                        </span>

                                        <span
                                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                item.isCorrect
                                                    ? "bg-emerald-950 text-emerald-300"
                                                    : "bg-red-950 text-red-300"
                                            }`}
                                        >
                                            {item.isCorrect
                                                ? "✓ Correct"
                                                : "✕ Incorrect"}
                                        </span>
                                    </div>

                                    <h3 className="mt-4 font-semibold leading-7 sm:text-lg">
                                        {item.question}
                                    </h3>

                                    <p className="mt-4 text-sm leading-6 text-slate-400">
                                        Your answer:
                                        <span
                                            className={`ml-2 font-medium ${
                                                item.isCorrect
                                                    ? "text-emerald-300"
                                                    : "text-red-300"
                                            }`}
                                        >
                                            {item.options?.[
                                                item.selectedAnswer
                                            ] ?? "Not answered"}
                                        </span>
                                    </p>

                                    {!item.isCorrect && (
                                        <p className="mt-2 text-sm leading-6 text-slate-300">
                                            Correct answer:
                                            <span className="ml-2 font-semibold text-emerald-300">
                                                {item.options?.[
                                                    item.correctAnswer
                                                ] ?? "Not available"}
                                            </span>
                                        </p>
                                    )}

                                    {item.explanation && (
                                        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
                                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                                                Explanation
                                            </p>

                                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                                {item.explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="mt-10 border-t border-slate-800 py-6 text-center">
                    <p className="text-xs leading-6 text-slate-500">
                        AI Career Copilot · Build confidence through consistent practice.
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default InterviewPreparation;