import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const CareerRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        const getRecommendations = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                const userId = user?._id || user?.id;
                if (!userId) {
                    setError("User session not found. Please login again.");
                    setLoading(false);
                    return;
                }
                const response = await api.get(
    `/api/career-recommendations/${userId}`
);
                if (response.data.status === 1) {
                    setRecommendations(response.data.data);
                } else {
                    setError(response.data.message);
                }
            } catch (error) {
                console.log("Recommendation Error:", error);
                setError(
                    error.response?.data?.message ||
                    "Unable to load career recommendations."
                );
            } finally {
                setLoading(false);
            }
        };
        getRecommendations();
    }, []);
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
                <div className="text-center p-8 bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl">
                    <div className="w-14 h-14 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto shadow-lg"></div>
                    <h2 className="text-xl font-bold text-white mt-6 tracking-wide">
                        Preparing your career recommendations
                    </h2>
                    <p className="text-sm text-slate-400 mt-2">
                        Analyzing your assessment results...
                    </p>
                </div>
            </div>
        );
    }
    if (error || recommendations.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-6">
                <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl p-10 text-center max-w-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-4xl shadow-inner">
                        🎯
                    </div>
                    <h2 className="text-2xl font-extrabold text-white mt-6 tracking-tight">
                        No Career Recommendation
                    </h2>
                    <p className="text-slate-400 mt-3 leading-relaxed text-sm">
                        {error ||
                            "Complete your career assessment to receive personalized career recommendations."}
                    </p>
                    <Link
                        to="/career-assessment"
                        className="inline-block mt-8 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        Take Assessment
                    </Link>
                </div>
            </div>
        );
    }
    const primaryCareer = recommendations[0];
    const otherCareers = recommendations.slice(1);
    const compatibility = primaryCareer.compatibility;
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            <header className="bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/80 sticky top-0 z-30 transition-all">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 text-sm font-bold">
                CR
            </div>

            <div>
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-none">
                    Career Recommendations
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    Personalized results from your career assessment
                </p>
            </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-xs font-semibold text-emerald-400 tracking-wide">
                    Assessment Completed
                </span>
            </div>

            <Link
                to="/user-dashboard"
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 text-sm font-medium hover:bg-slate-800 hover:text-white hover:border-indigo-500/40 transition-all duration-200 shadow-sm"
            >
                <span className="transition-transform group-hover:-translate-x-0.5">
                    ←
                </span>
                Back to Dashboard
            </Link>
        </div>
    </div>
</header>            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="mb-10 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        Career paths based on your profile
                    </h2>
                    <p className="text-slate-400 mt-2 max-w-2xl text-sm md:text-base leading-relaxed">
                        These recommendations are calculated using your interests, experience, skills, work style and career goal.
                    </p>
                </div>
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border-b border-slate-800/80 px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
                                🎯
                            </div>
                            <div>
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                                    Top Career Match
                                </span>
                                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                                    {primaryCareer.career.title}
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="flex items-start gap-5">
                                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-3xl shadow-inner">
                                        💻
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                                            {primaryCareer.career.category}
                                        </span>
                                        <h3 className="text-3xl font-extrabold text-white mt-3 tracking-tight">
                                            {primaryCareer.career.title}
                                        </h3>
                                        <p className="text-slate-300 mt-3 leading-relaxed text-sm md:text-base">
                                            {primaryCareer.career.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 transition hover:border-slate-600">
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Experience
                                        </p>
                                        <p className="font-semibold text-slate-200 mt-1.5 text-sm">
                                            {primaryCareer.career.experience}
                                        </p>
                                    </div>
                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 transition hover:border-slate-600">
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Education
                                        </p>
                                        <p className="font-semibold text-slate-200 mt-1.5 text-sm">
                                            {primaryCareer.career.education}
                                        </p>
                                    </div>
                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 transition hover:border-slate-600">
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            Career Scope
                                        </p>
                                        <p className="font-semibold text-slate-200 mt-1.5 text-sm">
                                            {primaryCareer.career.scope}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-b from-slate-800/60 to-slate-900/80 border border-slate-700/50 rounded-3xl p-6 flex flex-col justify-center shadow-inner text-center">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Compatibility Score
                                </p>
                                <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 mt-3 tracking-tight">
                                    {compatibility}%
                                </p>
                                <div className="w-full h-2.5 bg-slate-800 rounded-full mt-6 overflow-hidden p-0.5 border border-slate-700/50">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/50"
                                        style={{
                                            width: `${compatibility}%`
                                        }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-400 mt-4">
                                    Based on your complete assessment
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-slate-800 mt-10 pt-8">
                            <div className="text-center">
                                <h3 className="text-xl font-extrabold text-white tracking-tight">
                                    Why this career matches
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    Your recommendation is calculated from five assessment areas.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-center hover:bg-slate-800/70 transition">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Interest</p>
                                    <p className="text-2xl font-black text-indigo-400 mt-2">
                                        {primaryCareer.breakdown?.interest ?? 0}<span className="text-xs text-slate-500 font-normal">/25</span>
                                    </p>
                                </div>
                                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-center hover:bg-slate-800/70 transition">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Experience</p>
                                    <p className="text-2xl font-black text-indigo-400 mt-2">
                                        {primaryCareer.breakdown?.experience ?? 0}<span className="text-xs text-slate-500 font-normal">/20</span>
                                    </p>
                                </div>
                                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-center hover:bg-slate-800/70 transition">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Skills</p>
                                    <p className="text-2xl font-black text-indigo-400 mt-2">
                                        {primaryCareer.breakdown?.skills ?? 0}<span className="text-xs text-slate-500 font-normal">/35</span>
                                    </p>
                                </div>
                                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-center hover:bg-slate-800/70 transition">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Work Style</p>
                                    <p className="text-2xl font-black text-indigo-400 mt-2">
                                        {primaryCareer.breakdown?.workStyle ?? 0}<span className="text-xs text-slate-500 font-normal">/10</span>
                                    </p>
                                </div>
                                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-center hover:bg-slate-800/70 transition col-span-2 md:col-span-1">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Goal</p>
                                    <p className="text-2xl font-black text-indigo-400 mt-2">
                                        {primaryCareer.breakdown?.goal ?? 0}<span className="text-xs text-slate-500 font-normal">/10</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-slate-800 mt-10 pt-8">
                            <h3 className="text-xl font-extrabold text-white tracking-tight">
                                Your Matching Skills
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Skills from your assessment that match this career.
                            </p>
                            <div className="flex flex-wrap gap-2.5 mt-4">
                                {primaryCareer.matchedSkills?.length > 0 ? (
                                    primaryCareer.matchedSkills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-sm font-semibold shadow-sm flex items-center gap-1.5"
                                        >
                                            <span className="text-emerald-400 font-bold">✓</span>
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 italic">
                                        No matching skills found.
                                    </p>
                                )}
                            </div>
                        </div>
                        {primaryCareer.missingSkills?.length > 0 && (
                            <div className="border-t border-slate-800 mt-8 pt-8">
                                <h3 className="text-xl font-extrabold text-white tracking-tight">
                                    Skills You Can Develop
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    Skills associated with this career that were not selected in your assessment.
                                </p>
                                <div className="flex flex-wrap gap-2.5 mt-4">
                                    {primaryCareer.missingSkills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-xl text-sm font-semibold shadow-sm flex items-center gap-1.5"
                                        >
                                            <span className="text-amber-400 font-bold">+</span>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-800/30 p-6 rounded-2xl border-slate-700/50">
                            <div>
                                <p className="text-base font-bold text-white">
                                    Ready to explore this career?
                                </p>
                                <p className="text-sm text-slate-400 mt-0.5">
                                    View the complete career path and roadmap.
                                </p>
                            </div>
                            <Link
                                to={`/career-path/${primaryCareer.career._id}`}
                                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:from-indigo-500 hover:to-violet-500 transition-all duration-300 text-center transform hover:-translate-y-0.5"
                            >
                                View Career Path →
                            </Link>
                        </div>
                    </div>
                </div>
                {otherCareers.length > 0 && (
                    <section className="mt-14">
                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold text-white tracking-tight">
                                Other Career Paths
                            </h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Other active career paths based on your assessment.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherCareers.map((item) => (
                                <div
                                    key={item.career._id}
                                    className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl hover:shadow-indigo-500/10 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                                                    {item.career.category}
                                                </span>
                                                <h3 className="text-xl font-extrabold text-white mt-3 group-hover:text-indigo-300 transition">
                                                    {item.career.title}
                                                </h3>
                                            </div>
                                            <div className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-sm font-extrabold shrink-0 shadow-inner">
                                                {item.compatibility}%
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-4 leading-relaxed line-clamp-3">
                                            {item.career.description}
                                        </p>
                                        <div className="mt-6 pt-4 border-t border-slate-800/80">
                                            <div className="flex justify-between text-xs mb-2 font-medium">
                                                <span className="text-slate-400">
                                                    Compatibility
                                                </span>
                                                <span className="font-bold text-slate-200">
                                                    {item.compatibility}%
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/40">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${item.compatibility}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        {item.matchedSkills?.length > 0 && (
                                            <div className="mt-5">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                                                    MATCHED SKILLS
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {item.matchedSkills
                                                        .slice(0, 5)
                                                        .map((skill, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2.5 py-1 bg-slate-800/80 text-slate-300 border border-slate-700/60 rounded-lg text-xs font-medium"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        to={`/career-path/${item.career._id}`}
                                        className="block text-center mt-8 px-4 py-3 bg-slate-800/60 hover:bg-indigo-600 border border-slate-700/60 hover:border-indigo-500 text-slate-200 hover:text-white rounded-xl font-bold transition-all duration-300 shadow-sm"
                                    >
                                        Explore Career
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};
export default CareerRecommendations;