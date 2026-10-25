import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const DashboardBody = ({ firstName }) => {
  const [dashboardData, setDashboardData] = useState({
    profileCompletion: 0,
    careerProgress: 0,
    skillsCompleted: 0,
    completedSkills: [],
    learningHours: "0 min",
    assessmentCompleted: false,
    careerRoadmap: [],
    recommendedCareers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const loggedUser = JSON.parse(localStorage.getItem("user")) || {};

      if (!loggedUser._id) {
        setError("User not found");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/api/dashboard/${loggedUser._id}`
        );

        if (response.data.status === 1) {
          setDashboardData(response.data.data);
        } else {
          setError(
            response.data.message || "Unable to load dashboard"
          );
        }
      } catch (err) {
        console.log("Dashboard Error:", err);
        setError("Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const completedSkills = dashboardData.completedSkills || [];
  const careerRoadmap = dashboardData.careerRoadmap || [];
  const recommendedCareers = dashboardData.recommendedCareers || [];

  const isCompleted = (skill) => {
    return completedSkills.some(
      item =>
        String(item).toLowerCase() ===
        String(skill).toLowerCase()
    );
  };

  const skillData = [
    {
      name: "JavaScript",
      value: isCompleted("JavaScript") ? 100 : 0
    },
    {
      name: "React",
      value: isCompleted("React") ? 100 : 0
    },
    {
      name: "Node.js",
      value:
        isCompleted("Node.js") || isCompleted("Node")
          ? 100
          : 0
    },
    {
      name: "MongoDB",
      value: isCompleted("MongoDB") ? 100 : 0
    }
  ];

  const getSkillColor = (value) => {
    if (value >= 80) return "bg-emerald-500";
    if (value >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="p-8 bg-slate-950 text-slate-100 min-h-[calc(100vh-73px)] selection:bg-indigo-500 selection:text-white">
      {loading ? (
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">
              Loading dashboard...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
            <p className="text-red-400 font-semibold">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Welcome Section */}
          <section className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-8 text-white mb-8 border border-slate-800/80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
              <div>
                <p className="text-indigo-400 mb-2 font-semibold text-sm tracking-wider uppercase">
                  Welcome back 👋
                </p>

                <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
                  Hello, {firstName}!
                </h1>

                <p className="text-slate-300 max-w-xl text-sm md:text-base leading-relaxed">
                  Continue your career journey and take the next step toward
                  becoming a successful Full Stack Developer.
                </p>
              </div>

              <Link
                to="/career-assessment"
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/30 transition-all duration-300 text-center transform hover:-translate-y-0.5"
              >
                Take Career Assessment
              </Link>
            </div>
          </section>

          {/* STAT CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm">
                Career Progress
              </p>

              <div className="flex items-end justify-between mt-3">
                <h2 className="text-3xl font-black">
                  {dashboardData.careerProgress}%
                </h2>

                <span className="text-indigo-400 text-sm font-semibold">
                  Progress
                </span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2 mt-4">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${dashboardData.careerProgress}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm">
                Skills Completed
              </p>

              <h2 className="text-3xl font-black mt-3">
                {dashboardData.skillsCompleted}
              </h2>

              <p className="text-emerald-400 text-sm mt-2">
                Skills learned
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm">
                Learning Hours
              </p>

              <h2 className="text-3xl font-black mt-3">
                {dashboardData.learningHours}
              </h2>

              <p className="text-blue-400 text-sm mt-2">
                Completed learning
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm">
                Profile Completion
              </p>

              <h2 className="text-3xl font-black mt-3">
                {dashboardData.profileCompletion}%
              </h2>

              <div className="w-full bg-slate-800 rounded-full h-2 mt-4">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${dashboardData.profileCompletion}%`
                  }}
                ></div>
              </div>
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <Link
              to="/career-assessment"
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition"
            >
              <h3 className="text-lg font-bold">
                Career Assessment
              </h3>

              <p className="text-slate-400 text-sm mt-2">
                Find career paths based on your interests,
                skills and goals.
              </p>

              <span className="text-indigo-400 text-sm font-semibold inline-block mt-4">
                {dashboardData.assessmentCompleted
                  ? "Update Assessment →"
                  : "Start Assessment →"}
              </span>
            </Link>

            <Link
              to="/career-recommendations"
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition"
            >
              <h3 className="text-lg font-bold">
                Career Recommendations
              </h3>

              <p className="text-slate-400 text-sm mt-2">
                Explore career paths matched with your profile.
              </p>

              <span className="text-purple-400 text-sm font-semibold inline-block mt-4">
                Explore Careers →
              </span>
            </Link>

            <Link
              to="/ai-career-advisor"
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-pink-500/50 transition"
            >
              <h3 className="text-lg font-bold">
                AI Career Adviser
              </h3>

              <p className="text-slate-400 text-sm mt-2">
                Ask questions and get personalized career guidance.
              </p>

              <span className="text-pink-400 text-sm font-semibold inline-block mt-4">
                Ask AI →
              </span>
            </Link>
          </section>

          {/* CAREER ROADMAP + SKILL GAP */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Career Roadmap */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">
                    Career Roadmap
                  </h2>

                  <p className="text-slate-400 text-sm mt-1">
                    Your personalized learning journey
                  </p>
                </div>

                <span className="text-indigo-400 text-sm font-semibold">
                  {careerRoadmap.length} Steps
                </span>
              </div>

              {careerRoadmap.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-slate-400">
                    Complete your career assessment to generate your roadmap.
                  </p>

                  <Link
                    to="/career-assessment"
                    className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl text-sm font-semibold"
                  >
                    Take Assessment
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {careerRoadmap.map((step, index) => (
                    <div
                      key={step.order || index}
                      className="flex items-center gap-4"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          step.status === "Completed"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : step.status === "Currently Learning"
                              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {step.status === "Completed"
                          ? "✓"
                          : step.order || index + 1}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-slate-200">
                          {step.name}
                        </p>

                        <p
                          className={`text-xs mt-1 ${
                            step.status === "Completed"
                              ? "text-emerald-400"
                              : step.status === "Currently Learning"
                                ? "text-indigo-400"
                                : "text-slate-500"
                          }`}
                        >
                          {step.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skill Gap */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold">
                  Skill Progress
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Track your technical skills
                </p>
              </div>

              <div className="space-y-5">
                {skillData.map(skill => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-300">
                        {skill.name}
                      </span>

                      <span className="text-sm text-slate-400">
                        {skill.value}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getSkillColor(
                          skill.value
                        )}`}
                        style={{
                          width: `${skill.value}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RECOMMENDED CAREERS */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  Recommended Careers
                </h2>

                <p className="text-slate-400 text-sm mt-1">
                  Career paths matched with your assessment
                </p>
              </div>

              <Link
                to="/career-recommendations"
                className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
              >
                View All →
              </Link>
            </div>

            {recommendedCareers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400">
                  Complete your career assessment to get career recommendations.
                </p>

                <Link
                  to="/career-assessment"
                  className="inline-block mt-4 bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl text-sm font-semibold"
                >
                  Take Assessment
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {recommendedCareers.map(item => (
                  <div
                    key={item.career._id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-white">
                        {item.career.title}
                      </h3>

                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                        {item.compatibility}%
                      </span>
                    </div>

                    <p className="text-slate-400 text-sm mt-3 line-clamp-3">
                      {item.career.description}
                    </p>

                    <div className="mt-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        Matched Skills
                      </p>

                      {item.matchedSkills &&
                      item.matchedSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.matchedSkills
                            .slice(0, 4)
                            .map(skill => (
                              <span
                                key={skill}
                                className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-lg text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-xs mt-2">
                          No skills matched yet
                        </p>
                      )}
                    </div>

                    <Link
                      to="/career-recommendations"
                      className="inline-block mt-5 text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
                    >
                      View Career →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* AI ADVISOR */}
          <section className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-indigo-400 text-sm font-semibold uppercase tracking-wider mb-2">
                AI Career Adviser
              </p>

              <h2 className="text-2xl md:text-3xl font-black">
                Have a career question?
              </h2>

              <p className="text-slate-300 max-w-2xl mt-3 text-sm md:text-base">
                Get personalized guidance about skills, careers,
                placements, interviews and your learning journey.
              </p>

              <Link
                to="/ai-career-advisor"
                className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Ask AI Adviser →
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default DashboardBody;