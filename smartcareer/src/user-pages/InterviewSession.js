
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const questionBank = {
    technical: [
        {
            question: "What is the difference between let, const and var in JavaScript?",
            keywords: ["scope", "reassign", "block"]
        },
        {
            question: "What is React, and why is it used?",
            keywords: ["component", "user interface", "ui"]
        },
        {
            question: "What is the difference between SQL and MongoDB?",
            keywords: ["relational", "document", "database"]
        },
        {
            question: "What is middleware in Express.js?",
            keywords: ["request", "response", "next"]
        },
        {
            question: "What is the purpose of useState in React?",
            keywords: ["state", "component", "update"]
        }
    ],
    hr: [
        {
            question: "Tell me about yourself.",
            keywords: ["education", "skills", "experience"]
        },
        {
            question: "What are your strengths?",
            keywords: ["strength", "example", "improve"]
        },
        {
            question: "Why should we hire you?",
            keywords: ["skills", "contribute", "learn"]
        },
        {
            question: "How do you handle challenges?",
            keywords: ["problem", "solution", "learn"]
        },
        {
            question: "Where do you see yourself in five years?",
            keywords: ["career", "goal", "growth"]
        }
    ],
    aptitude: [
        {
            question: "A number increases from 200 to 250. What is the percentage increase?",
            keywords: ["25"]
        },
        {
            question: "If 5 workers complete a task in 10 days, how many days would 10 equally productive workers take?",
            keywords: ["5"]
        },
        {
            question: "What comes next in the sequence: 2, 4, 8, 16, __?",
            keywords: ["32"]
        },
        {
            question: "What is the average of 10, 20 and 30?",
            keywords: ["20"]
        },
        {
            question: "A product costs ₹800 and has a 10% discount. What is its discounted price?",
            keywords: ["720"]
        }
    ],
    coding: [
        {
            question: "How would you reverse a string in JavaScript?",
            keywords: ["split", "reverse", "join"]
        },
        {
            question: "What is an array, and how can you find its largest number?",
            keywords: ["array", "loop", "maximum"]
        },
        {
            question: "What is the difference between == and === in JavaScript?",
            keywords: ["type", "equality", "strict"]
        },
        {
            question: "What is a function in JavaScript?",
            keywords: ["reusable", "parameter", "return"]
        },
        {
            question: "What is the purpose of a loop?",
            keywords: ["repeat", "iteration", "condition"]
        }
    ]
};

const categoryTitles = {
    technical: "Technical Interview",
    hr: "HR Interview",
    aptitude: "Aptitude Test",
    coding: "Coding Interview"
};

const InterviewSession = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const category = searchParams.get("type") || "technical";
    const questions = questionBank[category] || questionBank.technical;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState(
        Array(questions.length).fill("")
    );
    const [finished, setFinished] = useState(false);

    const currentQuestion = questions[currentIndex];
    const currentAnswer = answers[currentIndex];

    const updateAnswer = (value) => {
        setAnswers((previous) =>
            previous.map((answer, index) =>
                index === currentIndex ? value : answer
            )
        );
    };

    const calculateScore = () => {
        let score = 0;

        questions.forEach((question, index) => {
            const answer = answers[index].trim().toLowerCase();

            if (!answer) return;

            const matchedKeywords = question.keywords.filter((keyword) =>
                answer.includes(keyword.toLowerCase())
            );

            if (matchedKeywords.length > 0) {
                score += 1;
            }
        });

        return score;
    };

    const finishInterview = () => {
        setFinished(true);
    };

    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    if (finished) {
        return (
            <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
                <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center sm:p-10">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/15 text-4xl">
                        {percentage >= 60 ? "🎉" : "📚"}
                    </div>

                    <h1 className="mt-5 text-3xl font-bold">
                        Interview Completed!
                    </h1>

                    <p className="mt-2 text-slate-400">
                        {categoryTitles[category] || "Interview Practice"}
                    </p>

                    <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-6">
                        <p className="text-sm text-slate-400">
                            Practice Score
                        </p>

                        <p className="mt-2 text-5xl font-bold text-indigo-400">
                            {percentage}%
                        </p>

                        <p className="mt-3 text-sm text-slate-300">
                            {score} of {questions.length} answers matched
                            at least one expected keyword.
                        </p>
                    </div>

                    <div className="mt-6 text-left">
                        <h2 className="text-lg font-semibold">
                            Your Answers
                        </h2>

                        <div className="mt-4 space-y-3">
                            {questions.map((question, index) => (
                                <div
                                    key={index}
                                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                                >
                                    <p className="text-sm font-medium">
                                        {index + 1}. {question.question}
                                    </p>

                                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-400">
                                        {answers[index] || "No answer provided."}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="mt-5 text-xs leading-5 text-amber-300">
                        This is a basic keyword-based practice score, not an
                        AI evaluation or a guarantee that an answer is correct.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold hover:bg-indigo-500"
                        >
                            Try Again
                        </button>

                        <button
                            onClick={() => navigate("/interview")}
                            className="rounded-xl border border-slate-700 px-5 py-3 font-semibold hover:bg-slate-800"
                        >
                            Back to Interview Prep
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="border-b border-slate-800 bg-slate-900">
                <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-5">
                    <div>
                        <h1 className="text-xl font-bold">
                            {categoryTitles[category] || "Interview Practice"}
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Take your time and answer in your own words.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/interview")}
                        className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
                    >
                        Exit
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                        Question {currentIndex + 1} of {questions.length}
                    </span>
                    <span className="text-indigo-300">
                        {Math.round(((currentIndex + 1) / questions.length) * 100)}% completed
                    </span>
                </div>

                <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                        style={{
                            width: `${((currentIndex + 1) / questions.length) * 100}%`
                        }}
                    />
                </div>

                <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                    <span className="rounded-full bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                        QUESTION {currentIndex + 1}
                    </span>

                    <h2 className="mt-6 text-2xl font-bold leading-relaxed sm:text-3xl">
                        {currentQuestion.question}
                    </h2>

                    <label
                        htmlFor="interview-answer"
                        className="mt-8 block text-sm font-medium text-slate-300"
                    >
                        Your Answer
                    </label>

                    <textarea
                        id="interview-answer"
                        value={currentAnswer}
                        onChange={(event) => updateAnswer(event.target.value)}
                        placeholder="Write your answer here..."
                        rows={7}
                        className="mt-3 w-full resize-y rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm leading-7 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                        You can go back and edit your previous answers.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-between gap-3">
                        <button
                            onClick={() => setCurrentIndex((index) => index - 1)}
                            disabled={currentIndex === 0}
                            className="rounded-xl border border-slate-700 px-5 py-3 font-semibold transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            ← Previous
                        </button>

                        {currentIndex < questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentIndex((index) => index + 1)}
                                className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-500"
                            >
                                Next Question →
                            </button>
                        ) : (
                            <button
                                onClick={finishInterview}
                                className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold transition hover:bg-emerald-500"
                            >
                                Finish Interview
                            </button>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default InterviewSession;
