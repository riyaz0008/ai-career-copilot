import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const CareerAssessment = () => {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({
        interest: "",
        experience: "",
        skills: [],
        workStyle: "",
        goal: ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await api.get("/api/assessment-questions");
                const data = response.data?.data || response.data || [];
                const activeQuestions = data
                    .filter(question => question.active !== false)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                setQuestions(activeQuestions);
            } catch (error) {
                console.error("Error fetching assessment questions:", error);
                setError("Unable to load assessment questions.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    const getCategory = (question) => {
        const category = String(question?.category || "").toLowerCase().trim();
        if (category.includes("interest")) return "interest";
        if (category.includes("experience")) return "experience";
        if (category.includes("skill")) return "skills";
        if (category.includes("work")) return "workStyle";
        if (category.includes("goal")) return "goal";
        return "";
    };

    const handleSingleChange = (category, value) => {
        setAnswers(prev => ({
            ...prev,
            [category]: value,
            ...(category === "interest" ? { skills: [] } : {})
        }));
    };

    const handleSkillChange = (skill) => {
        setAnswers(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(item => item !== skill)
                : [...prev.skills, skill]
        }));
    };

    const normalizeCategory = (value) =>
        String(value || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ");

    const getSkillCategories = (option) => {
        if (!option || typeof option === "string") return [];
        const categories = option.categories ?? option.category;
        if (Array.isArray(categories)) return categories;
        if (typeof categories === "string" && categories.trim()) return [categories];
        return [];
    };

    const currentQuestion = questions[currentStep];
    const currentCategory = getCategory(currentQuestion);

    const currentOptions = currentCategory === "skills"
        ? (currentQuestion?.options || []).filter(option => {
            const skillCategories = getSkillCategories(option);
            if (skillCategories.length === 0) return true;
            return skillCategories.some(category =>
                normalizeCategory(category) === normalizeCategory(answers.interest)
            );
        })
        : (currentQuestion?.options || []);

    useEffect(() => {
        if (currentCategory !== "skills") return;

        const validSkills = new Set(
            currentOptions
                .map(option =>
                    typeof option === "string"
                        ? option
                        : option?.name || ""
                )
                .filter(Boolean)
        );

        setAnswers(prev => {
            const filteredSkills = prev.skills.filter(skill => validSkills.has(skill));
            if (filteredSkills.length === prev.skills.length) return prev;
            return { ...prev, skills: filteredSkills };
        });
    }, [currentCategory, currentQuestion, answers.interest]);

    const isAnswered = () => {
        if (!currentCategory) return false;
        if (currentCategory === "skills") {
            return answers.skills.length > 0;
        }
        return Boolean(answers[currentCategory]);
    };

    const handleSubmit = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const userId = user?._id;

            if (!userId) {
                setError("User not found. Please login again.");
                return;
            }

            const response = await api.post(
                `/api/career-assessment/${userId}`,
                {
                    interest: answers.interest,
                    experience: answers.experience,
                    skills: answers.skills,
                    workStyle: answers.workStyle,
                    goal: answers.goal
                }
            );

            if (response.data?.status === 1) {
                navigate("/career-recommendations");
            } else {
                setError(response.data?.message || "Failed to save assessment.");
            }
        } catch (error) {
            console.error("Error saving assessment:", error);
            setError(
                error.response?.data?.message ||
                "Something went wrong while saving assessment."
            );
        }
    };

    const handleNext = () => {
        if (!isAnswered()) {
            setError("Please select an answer before continuing.");
            return;
        }

        setError("");

        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        setError("");

        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <p className="text-slate-400">Loading assessment...</p>
            </div>
        );
    }

    if (error && questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    if (!questions.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <p className="text-slate-400">No assessment questions available.</p>
            </div>
        );
    }

    const progress = ((currentStep + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <header className="bg-slate-900/90 backdrop-blur-2xl border-b border-slate-800/80">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-white">
                            AI Career Copilot
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            Career Assessment
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/user-dashboard")}
                        className="px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900 text-slate-300 text-sm font-medium hover:bg-slate-800 hover:text-white transition"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 md:px-8 py-10">
                <div className="mb-8">
                    <p className="text-indigo-400 text-sm font-bold uppercase tracking-wider mb-2">
                        Career Assessment
                    </p>

                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                        Discover Your Career Path
                    </h1>

                    <p className="text-slate-400 mt-2 max-w-2xl">
                        Answer a few questions to help us understand your career
                        interests, skills and goals.
                    </p>
                </div>

                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm text-slate-400">
                                Question {currentStep + 1} of {questions.length}
                            </span>

                            <span className="text-sm font-semibold text-indigo-400">
                                {Math.round(progress)}%
                            </span>
                        </div>

                        <div className="w-full bg-slate-800 rounded-full h-2 mb-8">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <h2 className="text-xl md:text-2xl font-semibold text-white mb-6">
                            {currentQuestion?.question}
                        </h2>

                        {currentCategory === "skills" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {currentOptions.map((option, index) => {
                                    const skill =
                                        typeof option === "string"
                                            ? option
                                            : option?.name || "";

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleSkillChange(skill)}
                                            className={`p-4 rounded-xl border text-left transition ${
                                                answers.skills.includes(skill)
                                                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-lg shadow-indigo-500/5"
                                                    : "border-slate-700/80 bg-slate-950/70 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{skill}</span>

                                                {answers.skills.includes(skill) && (
                                                    <span className="text-indigo-400 font-bold">
                                                        ✓
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {currentOptions.map((option, index) => {
                                    const value =
                                        typeof option === "string"
                                            ? option
                                            : option?.name || "";

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() =>
                                                handleSingleChange(
                                                    currentCategory,
                                                    value
                                                )
                                            }
                                            className={`w-full p-4 rounded-xl border text-left transition ${
                                                answers[currentCategory] === value
                                                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-lg shadow-indigo-500/5"
                                                    : "border-slate-700/80 bg-slate-950/70 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{value}</span>

                                                {answers[currentCategory] === value && (
                                                    <span className="text-indigo-400 font-bold">
                                                        ✓
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {error && (
                            <p className="text-red-400 text-sm mt-5">
                                {error}
                            </p>
                        )}

                        <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className={`px-5 py-3 rounded-xl font-medium transition ${
                                    currentStep === 0
                                        ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                                        : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                                }`}
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition"
                            >
                                {currentStep === questions.length - 1
                                    ? "Complete Assessment"
                                    : "Continue"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CareerAssessment;