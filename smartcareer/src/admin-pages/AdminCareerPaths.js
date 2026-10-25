import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const AdminCareerPaths = () => {
    const [careerPaths, setCareerPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [workStyleOptions, setWorkStyleOptions] = useState([]);
    const [goalOptions, setGoalOptions] = useState([]);
    const [careerCategoryOptions, setCareerCategoryOptions] = useState([]);
    const [categorySkills, setCategorySkills] = useState({});
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        description: "",
        skills: "",
        experience: "",
        workStyle: [],
        goal: [],
        education: "",
        scope: "",
        roadmap: [],
        active: true
    });

    const getCareerPaths = async () => {
        try {
            const response = await api.get("/api/admin/career-path");

            if (response.data.status === 1) {
                setCareerPaths(response.data.data);
            }
        } catch (error) {
            console.log("Career Paths Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getAssessmentQuestions = async () => {
        try {
            const response = await api.get("/api/assessment-questions");

            if (response.data.status === 1) {
                const questions = response.data.data || [];

                const workStyleQuestion = questions.find(
                    question =>
                        question.category?.toLowerCase().trim() ===
                        "work style"
                );

                const goalQuestion = questions.find(
                    question =>
                        question.category?.toLowerCase().trim() ===
                        "career goal"
                );

                const optionNames = (options = []) =>
                    options
                        .map(option =>
                            typeof option === "string"
                                ? option
                                : option?.name
                        )
                        .filter(Boolean);

                const skillQuestions = questions.filter(
                    question =>
                        question.category?.toLowerCase().includes("skill")
                );

                const skillCategoryMap = {};

                skillQuestions.forEach(question => {
                    (question.options || []).forEach(option => {
                        const skillName =
                            typeof option === "string"
                                ? option.trim()
                                : String(option?.name || "").trim();

                        if (!skillName) return;

                        const categories =
                            typeof option === "string"
                                ? []
                                : Array.isArray(option?.category)
                                ? option.category
                                : option?.category
                                ? [option.category]
                                : [];

                        categories.forEach(category => {
                            const categoryName = String(
                                category || ""
                            ).trim();

                            if (!categoryName) return;

                            const existingCategory = Object.keys(
                                skillCategoryMap
                            ).find(
                                item =>
                                    item.toLowerCase() ===
                                    categoryName.toLowerCase()
                            );

                            const categoryKey =
                                existingCategory || categoryName;

                            if (!skillCategoryMap[categoryKey]) {
                                skillCategoryMap[categoryKey] = [];
                            }

                            const alreadyExists =
                                skillCategoryMap[
                                    categoryKey
                                ].some(
                                    skill =>
                                        skill.toLowerCase() ===
                                        skillName.toLowerCase()
                                );

                            if (!alreadyExists) {
                                skillCategoryMap[
                                    categoryKey
                                ].push(skillName);
                            }
                        });
                    });
                });

                setWorkStyleOptions(
                    optionNames(workStyleQuestion?.options)
                );

                setGoalOptions(
                    optionNames(goalQuestion?.options)
                );

                setCareerCategoryOptions(
                    Object.keys(skillCategoryMap)
                );

                setCategorySkills(skillCategoryMap);
            }
        } catch (error) {
            console.log(
                "Assessment Questions Error:",
                error
            );
        }
    };

    useEffect(() => {
        getCareerPaths();
        getAssessmentQuestions();
    }, []);

    const getValidSkillsForCategory = (
        category,
        skills = []
    ) => {
        if (!category) return [];

        const availableSkills =
            categorySkills[category] || [];

        return skills.filter(skill =>
            availableSkills.some(
                availableSkill =>
                    availableSkill.toLowerCase() ===
                    String(skill).toLowerCase()
            )
        );
    };

    const getRoadmapSkills = (
        step,
        category
    ) => {
        if (!category) return [];

        const availableSkills =
            categorySkills[category] || [];

        return (step.skills || []).filter(skill =>
            availableSkills.some(
                availableSkill =>
                    availableSkill.toLowerCase() ===
                    String(skill).toLowerCase()
            )
        );
    };

    const handleChange = e => {
        const {
            name,
            value,
            type,
            checked
        } = e.target;

        if (name === "category") {
            setFormData(prev => ({
                ...prev,
                category: value,
                skills: "",
                roadmap: prev.roadmap.map(step => ({
                    ...step,
                    skills: getValidSkillsForCategory(
                        value,
                        step.skills || []
                    )
                }))
            }));

            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));
    };

    const handleSkillSelect = skill => {
        if (!formData.category) return;

        const availableSkills =
            categorySkills[formData.category] || [];

        const isValidSkill =
            availableSkills.some(
                availableSkill =>
                    availableSkill.toLowerCase() ===
                    skill.toLowerCase()
            );

        if (!isValidSkill) return;

        const currentSkills = formData.skills
            ? formData.skills
                  .split(",")
                  .map(item => item.trim())
                  .filter(Boolean)
            : [];

        const exists = currentSkills.some(
            item =>
                item.toLowerCase() ===
                skill.toLowerCase()
        );

        const updatedSkills = exists
            ? currentSkills.filter(
                  item =>
                      item.toLowerCase() !==
                      skill.toLowerCase()
              )
            : [...currentSkills, skill];

        const validUpdatedSkills =
            getValidSkillsForCategory(
                formData.category,
                updatedSkills
            );

        setFormData(prev => ({
            ...prev,
            skills:
                validUpdatedSkills.join(", ")
        }));
    };

    const handleMultiSelect = (
        name,
        value
    ) => {
        setFormData(prev => ({
            ...prev,
            [name]: prev[name].includes(value)
                ? prev[name].filter(
                      item => item !== value
                  )
                : [...prev[name], value]
        }));
    };

    const addRoadmapStep = () => {
        setFormData(prev => ({
            ...prev,
            roadmap: [
                ...prev.roadmap,
                {
                    name: "",
                    skills: []
                }
            ]
        }));
    };

    const removeRoadmapStep = index => {
        setFormData(prev => ({
            ...prev,
            roadmap: prev.roadmap.filter(
                (_, stepIndex) =>
                    stepIndex !== index
            )
        }));
    };

    const handleRoadmapNameChange = (
        index,
        value
    ) => {
        setFormData(prev => ({
            ...prev,
            roadmap: prev.roadmap.map(
                (step, stepIndex) =>
                    stepIndex === index
                        ? {
                              ...step,
                              name: value
                          }
                        : step
            )
        }));
    };

    const handleRoadmapSkillSelect = (
        stepIndex,
        skill
    ) => {
        if (!formData.category) return;

        const currentStep =
            formData.roadmap[stepIndex];

        const currentSkills =
            currentStep?.skills || [];

        const exists = currentSkills.some(
            item =>
                item.toLowerCase() ===
                skill.toLowerCase()
        );

        const updatedSkills = exists
            ? currentSkills.filter(
                  item =>
                      item.toLowerCase() !==
                      skill.toLowerCase()
              )
            : [...currentSkills, skill];

        setFormData(prev => ({
            ...prev,
            roadmap: prev.roadmap.map(
                (step, index) =>
                    index === stepIndex
                        ? {
                              ...step,
                              skills: updatedSkills
                          }
                        : step
            )
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        try {
            const currentSelectedSkills =
                formData.skills
                    ? formData.skills
                          .split(",")
                          .map(item =>
                              item.trim()
                          )
                          .filter(Boolean)
                    : [];

            const validSelectedSkills =
                getValidSkillsForCategory(
                    formData.category,
                    currentSelectedSkills
                );

            const validRoadmap =
                formData.roadmap
                    .filter(
                        step =>
                            step.name?.trim()
                    )
                    .map(step => ({
                        name:
                            step.name.trim(),
                        skills:
                            getValidSkillsForCategory(
                                formData.category,
                                step.skills ||
                                    []
                            )
                    }));

            const data = {
                ...formData,
                skills:
                    validSelectedSkills,
                roadmap:
                    validRoadmap
            };

            if (editId) {
                const response =
                    await api.put(
                        `/api/admin/career-path/${editId}`,
                        data
                    );

                if (
                    response.data.status ===
                    1
                ) {
                    alert(
                        "Career Path Updated Successfully"
                    );
                }
            } else {
                const response =
                    await api.post(
                        "/api/admin/career-path",
                        data
                    );

                if (
                    response.data.status ===
                    1
                ) {
                    alert(
                        "Career Path Added Successfully"
                    );
                }
            }

            resetForm();
            getCareerPaths();
        } catch (error) {
            console.log(
                "Save Career Path Error:",
                error
            );
            alert(
                "Something went wrong"
            );
        }
    };

    const handleEdit = careerPath => {
        const validSkills =
            getValidSkillsForCategory(
                careerPath.category,
                careerPath.skills || []
            );

        const roadmap =
            Array.isArray(
                careerPath.roadmap
            )
                ? careerPath.roadmap.map(
                      step => {
                          if (
                              typeof step ===
                              "string"
                          ) {
                              return {
                                  name: step,
                                  skills: []
                              };
                          }

                          return {
                              name:
                                  step.name ||
                                  "",
                              skills:
                                  getRoadmapSkills(
                                      step,
                                      careerPath.category
                                  )
                          };
                      }
                  )
                : [];

        setEditId(
            careerPath._id
        );

        setFormData({
            title:
                careerPath.title || "",
            category:
                careerPath.category ||
                "",
            description:
                careerPath.description ||
                "",
            skills:
                validSkills.join(", "),
            experience:
                careerPath.experience ||
                "",
            workStyle:
                careerPath.workStyle ||
                [],
            goal:
                careerPath.goal || [],
            education:
                careerPath.education ||
                "",
            scope:
                careerPath.scope || "",
            roadmap,
            active:
                careerPath.active
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleDelete = async id => {
        if (
            !window.confirm(
                "Are you sure you want to delete this Career Path?"
            )
        ) {
            return;
        }

        try {
            const response =
                await api.delete(
                    `/api/admin/career-path/${id}`
                );

            if (
                response.data.status ===
                1
            ) {
                alert(
                    "Career Path Deleted Successfully"
                );

                getCareerPaths();
            }
        } catch (error) {
            console.log(
                "Delete Error:",
                error
            );
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            category: "",
            description: "",
            skills: "",
            experience: "",
            workStyle: [],
            goal: [],
            education: "",
            scope: "",
            roadmap: [],
            active: true
        });

        setEditId(null);
        setShowForm(false);
    };

    const activePaths =
        careerPaths.filter(
            item => item.active
        ).length;

    const inactivePaths =
        careerPaths.filter(
            item => !item.active
        ).length;

    const categories = [
        ...new Set(
            careerPaths.map(
                item => item.category
            )
        )
    ].length;

    const filteredCareerPaths =
        careerPaths.filter(
            careerPath =>
                careerPath.title
                    ?.toLowerCase()
                    .includes(
                        searchTerm.toLowerCase()
                    ) ||
                careerPath.category
                    ?.toLowerCase()
                    .includes(
                        searchTerm.toLowerCase()
                    ) ||
                careerPath.skills?.some(
                    skill =>
                        skill
                            .toLowerCase()
                            .includes(
                                searchTerm.toLowerCase()
                            )
                )
        );

    const currentSelectedSkills =
        formData.skills
            ? formData.skills
                  .split(",")
                  .map(item =>
                      item.trim()
                  )
                  .filter(Boolean)
            : [];

    const selectedSkills =
        getValidSkillsForCategory(
            formData.category,
            currentSelectedSkills
        );

    const availableCategorySkills =
        formData.category
            ? categorySkills[
                  formData.category
              ] || []
            : [];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            <header className="bg-slate-900/90 backdrop-blur-2xl border-b border-slate-800/80">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
                                🧭
                            </div>

                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                    Career Paths
                                </h1>

                                <p className="text-sm text-slate-400 mt-1">
                                    Manage career paths and professional development journeys.
                                </p>
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

            <main className="max-w-7xl mx-auto px-6 md:px-8 py-8">
                {!showForm && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Total Career Paths
                            </p>

                            <div className="flex items-center justify-between mt-3">
                                <h2 className="text-3xl font-black text-white">
                                    {careerPaths.length}
                                </h2>

                                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg">
                                    🧭
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Active Paths
                            </p>

                            <div className="flex items-center justify-between mt-3">
                                <h2 className="text-3xl font-black text-emerald-400">
                                    {activePaths}
                                </h2>

                                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                    ✓
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Categories
                            </p>

                            <div className="flex items-center justify-between mt-3">
                                <h2 className="text-3xl font-black text-purple-400">
                                    {categories}
                                </h2>

                                <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                    ◈
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Inactive Paths
                            </p>

                            <div className="flex items-center justify-between mt-3">
                                <h2 className="text-3xl font-black text-rose-400">
                                    {inactivePaths}
                                </h2>

                                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
                                    !
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!showForm && (
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                        <div className="px-6 md:px-8 py-6 border-b border-slate-800/80">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                                <div>
                                    <h2 className="text-xl font-black text-white tracking-tight">
                                        Career Path Library
                                    </h2>

                                    <p className="text-sm text-slate-400 mt-1">
                                        Review and manage available career journeys.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                            ⌕
                                        </span>

                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={e =>
                                                setSearchTerm(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Search career paths..."
                                            className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm font-medium text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition"
                                        />
                                    </div>

                                    <button
                                        onClick={() =>
                                            setShowForm(true)
                                        }
                                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition"
                                    >
                                        + Add Career Path
                                    </button>

                                    <span className="px-3.5 py-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold tracking-wide uppercase text-center">
                                        {filteredCareerPaths.length} Paths
                                    </span>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-16 text-center">
                                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>

                                <p className="text-slate-400 mt-4 text-sm font-medium">
                                    Loading Career Paths...
                                </p>
                            </div>
                        ) : filteredCareerPaths.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="w-20 h-20 mx-auto bg-slate-800/80 border border-slate-700/60 rounded-3xl flex items-center justify-center text-4xl mb-4">
                                    🧭
                                </div>

                                <h3 className="text-lg font-bold text-white">
                                    {searchTerm
                                        ? "No Career Paths Found"
                                        : "No Career Paths Yet"}
                                </h3>

                                <p className="text-slate-400 mt-1 text-sm">
                                    {searchTerm
                                        ? "Try searching with a different career name or skill."
                                        : "Create your first career path to get started."}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800/80">
                                {filteredCareerPaths.map(
                                    (careerPath, index) => (
                                        <div
                                            key={
                                                careerPath._id
                                            }
                                            className="p-6 md:p-8 hover:bg-slate-800/40 transition"
                                        >
                                            <div className="flex flex-col sm:flex-row gap-6">
                                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shadow-inner">
                                                    {String(
                                                        index + 1
                                                    ).padStart(
                                                        2,
                                                        "0"
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <h3 className="text-xl font-extrabold text-white tracking-tight">
                                                                    {
                                                                        careerPath.title
                                                                    }
                                                                </h3>

                                                                <span
                                                                    className={`px-3 py-1 rounded-xl text-xs font-bold tracking-wide uppercase border ${
                                                                        careerPath.active
                                                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                                    }`}
                                                                >
                                                                    {careerPath.active
                                                                        ? "Active"
                                                                        : "Inactive"}
                                                                </span>
                                                            </div>

                                                            <p className="text-xs font-semibold text-indigo-400 mt-2 uppercase tracking-wider">
                                                                {
                                                                    careerPath.category
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="flex gap-2.5">
                                                            <button
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        careerPath
                                                                    )
                                                                }
                                                                className="px-4 py-2 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-500/20 transition shadow-sm"
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        careerPath._id
                                                                    )
                                                                }
                                                                className="px-4 py-2 border border-rose-500/30 bg-rose-500/10 text-rose-300 rounded-xl text-xs font-bold hover:bg-rose-500/20 transition shadow-sm"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="mt-5 p-5 bg-slate-950/60 border border-slate-800/80 rounded-2xl">
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                            Career Details
                                                        </p>

                                                        <p className="text-sm text-slate-300 leading-relaxed">
                                                            {
                                                                careerPath.description
                                                            }
                                                        </p>
                                                    </div>

                                                    {careerPath.skills?.length >
                                                        0 && (
                                                        <div className="mt-5">
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                                Skills
                                                            </p>

                                                            <div className="flex flex-wrap gap-2">
                                                                {careerPath.skills.map(
                                                                    (
                                                                        skill,
                                                                        skillIndex
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                skillIndex
                                                                            }
                                                                            className="px-3 py-1.5 bg-slate-800/80 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-medium"
                                                                        >
                                                                            {
                                                                                skill
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                )}

                {showForm && (
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl mb-8 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                        <div className="px-8 py-6 border-b border-slate-800/80 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">
                                    {editId
                                        ? "Edit Career Path"
                                        : "Create Career Path"}
                                </h2>

                                <p className="text-xs text-slate-400 mt-0.5">
                                    Add professional information and career roadmap.
                                </p>
                            </div>

                            <button
                                onClick={resetForm}
                                className="text-slate-400 hover:text-white text-xl font-bold transition"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left"
                        >
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Career Title
                                </label>

                                <input
                                    name="title"
                                    value={
                                        formData.title
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Full Stack Developer"
                                    required
                                    className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Category
                                </label>

                                {careerCategoryOptions.length >
                                0 ? (
                                    <select
                                        name="category"
                                        value={
                                            formData.category
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                                    >
                                        <option value="">
                                            Select Category
                                        </option>

                                        {careerCategoryOptions.map(
                                            category => (
                                                <option
                                                    key={
                                                        category
                                                    }
                                                    value={
                                                        category
                                                    }
                                                >
                                                    {
                                                        category
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                ) : (
                                    <input
                                        name="category"
                                        value={
                                            formData.category
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Software Development"
                                        required
                                        className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                                    />
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="3"
                                    placeholder="Describe this career path..."
                                    required
                                    className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner resize-none"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Career Skills
                                </label>

                                {!formData.category ? (
                                    <div className="p-4 border border-slate-800 bg-slate-950 rounded-xl text-xs text-slate-400">
                                        Please select a category first.
                                    </div>
                                ) : availableCategorySkills.length ===
                                  0 ? (
                                    <div className="p-4 border border-slate-800 bg-slate-950 rounded-xl text-xs text-slate-400">
                                        No skills available for this category.
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                        {availableCategorySkills.map(
                                            skill => (
                                                <label
                                                    key={
                                                        skill
                                                    }
                                                    className="flex items-center gap-3 px-4 py-2.5 border border-slate-800 bg-slate-950 rounded-xl cursor-pointer hover:border-indigo-500/40 hover:bg-slate-900 transition"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSkills.some(
                                                            item =>
                                                                item.toLowerCase() ===
                                                                skill.toLowerCase()
                                                        )}
                                                        onChange={() =>
                                                            handleSkillSelect(
                                                                skill
                                                            )
                                                        }
                                                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                                                    />

                                                    <span className="text-xs font-medium text-slate-200">
                                                        {
                                                            skill
                                                        }
                                                    </span>
                                                </label>
                                            )
                                        )}
                                    </div>
                                )}

                                {selectedSkills.length >
                                    0 && (
                                    <div className="mt-3">
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                            Selected Career Skills
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {selectedSkills.map(
                                                skill => (
                                                    <span
                                                        key={
                                                            skill
                                                        }
                                                        className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-medium"
                                                    >
                                                        {
                                                            skill
                                                        }
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Experience
                                </label>

                                <select
                                    name="experience"
                                    value={
                                        formData.experience
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                                >
                                    <option value="">
                                        Select Experience
                                    </option>
                                    <option value="Beginner">
                                        Beginner
                                    </option>
                                    <option value="Intermediate">
                                        Intermediate
                                    </option>
                                    <option value="Advanced">
                                        Advanced
                                    </option>
                                    <option value="Professional">
                                        Professional
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Work Style
                                </label>

                                {workStyleOptions.length ===
                                0 ? (
                                    <div className="p-4 border border-slate-800 bg-slate-950 rounded-xl text-xs text-slate-400">
                                        Work Style options are not available. Please add the Work Style assessment question first.
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {workStyleOptions.map(
                                            style => (
                                                <label
                                                    key={
                                                        style
                                                    }
                                                    className="flex items-center gap-3 px-4 py-2.5 border border-slate-800 bg-slate-950 rounded-xl cursor-pointer hover:border-slate-700 transition"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.workStyle.includes(
                                                            style
                                                        )}
                                                        onChange={() =>
                                                            handleMultiSelect(
                                                                "workStyle",
                                                                style
                                                            )
                                                        }
                                                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                                                    />

                                                    <span className="text-xs font-medium text-slate-200">
                                                        {
                                                            style
                                                        }
                                                    </span>
                                                </label>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Career Goals
                                </label>

                                {goalOptions.length ===
                                0 ? (
                                    <div className="p-4 border border-slate-800 bg-slate-950 rounded-xl text-xs text-slate-400">
                                        Career Goal options are not available. Please add the Career Goal assessment question first.
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {goalOptions.map(
                                            goal => (
                                                <label
                                                    key={
                                                        goal
                                                    }
                                                    className="flex items-center gap-3 px-4 py-2.5 border border-slate-800 bg-slate-950 rounded-xl cursor-pointer hover:border-slate-700 transition"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.goal.includes(
                                                            goal
                                                        )}
                                                        onChange={() =>
                                                            handleMultiSelect(
                                                                "goal",
                                                                goal
                                                            )
                                                        }
                                                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                                                    />

                                                    <span className="text-xs font-medium text-slate-200">
                                                        {
                                                            goal
                                                        }
                                                    </span>
                                                </label>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Education
                                </label>

                                <input
                                    name="education"
                                    value={
                                        formData.education
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="BCA / MCA / B.Tech"
                                    required
                                    className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Career Scope
                                </label>

                                <input
                                    name="scope"
                                    value={
                                        formData.scope
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="High demand in IT industry"
                                    required
                                    className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex items-center justify-between gap-4 mb-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Career Roadmap
                                        </label>

                                        <p className="text-xs text-slate-500 mt-1">
                                            Add roadmap steps and select the skills required to complete each step.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            addRoadmapStep
                                        }
                                        className="px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-500/20 transition"
                                    >
                                        + Add Step
                                    </button>
                                </div>

                                {formData.roadmap.length ===
                                0 ? (
                                    <div className="p-5 border border-slate-800 bg-slate-950 rounded-xl text-xs text-slate-400 text-center">
                                        No roadmap steps added yet. Click "+ Add Step".
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.roadmap.map(
                                            (
                                                step,
                                                index
                                            ) => (
                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className="p-5 border border-slate-800 bg-slate-950 rounded-2xl"
                                                >
                                                    <div className="flex items-center justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                                                                {
                                                                    index +
                                                                    1
                                                                }
                                                            </div>

                                                            <p className="text-sm font-bold text-white">
                                                                Roadmap Step
                                                            </p>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeRoadmapStep(
                                                                    index
                                                                )
                                                            }
                                                            className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-xs font-bold hover:bg-rose-500/20 transition"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>

                                                    <input
                                                        type="text"
                                                        value={
                                                            step.name
                                                        }
                                                        onChange={e =>
                                                            handleRoadmapNameChange(
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="JavaScript Fundamentals"
                                                        className="w-full px-4 py-3 border border-slate-700/80 bg-slate-900 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                                                    />

                                                    <div className="mt-4">
                                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                                            Required Skills
                                                        </p>

                                                        {!formData.category ? (
                                                            <div className="p-4 border border-slate-800 bg-slate-900 rounded-xl text-xs text-slate-500">
                                                                Select a career category first.
                                                            </div>
                                                        ) : availableCategorySkills.length ===
                                                          0 ? (
                                                            <div className="p-4 border border-slate-800 bg-slate-900 rounded-xl text-xs text-slate-500">
                                                                No skills available for this category.
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                                                                {availableCategorySkills.map(
                                                                    skill => {
                                                                        const checked =
                                                                            (
                                                                                step.skills ||
                                                                                []
                                                                            ).some(
                                                                                item =>
                                                                                    item.toLowerCase() ===
                                                                                    skill.toLowerCase()
                                                                            );

                                                                        return (
                                                                            <label
                                                                                key={
                                                                                    skill
                                                                                }
                                                                                className={`flex items-center gap-3 px-3 py-2.5 border rounded-xl cursor-pointer transition ${
                                                                                    checked
                                                                                        ? "border-indigo-500/40 bg-indigo-500/10"
                                                                                        : "border-slate-800 bg-slate-900 hover:border-slate-700"
                                                                                }`}
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={
                                                                                        checked
                                                                                    }
                                                                                    onChange={() =>
                                                                                        handleRoadmapSkillSelect(
                                                                                            index,
                                                                                            skill
                                                                                        )
                                                                                    }
                                                                                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                                                                                />

                                                                                <span className="text-xs font-medium text-slate-200">
                                                                                    {
                                                                                        skill
                                                                                    }
                                                                                </span>
                                                                            </label>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        )}

                                                        {step.skills?.length >
                                                            0 && (
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                {step.skills.map(
                                                                    skill => (
                                                                        <span
                                                                            key={
                                                                                skill
                                                                            }
                                                                            className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-medium"
                                                                        >
                                                                            {
                                                                                skill
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                                <label className="flex items-center gap-3 text-sm font-bold text-slate-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={
                                            formData.active
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                                    />

                                    Active Career Path
                                </label>

                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={
                                            resetForm
                                        }
                                        className="flex-1 sm:flex-none px-6 py-3 border border-slate-700 bg-slate-800/60 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-800 hover:text-white transition"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
                                    >
                                        {editId
                                            ? "Update Path"
                                            : "Create Path"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminCareerPaths;