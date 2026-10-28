import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-950 text-slate-200 hidden md:flex flex-col fixed h-screen border-r border-slate-800/80">

      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-xl">
        <h1 className="text-xl font-extrabold text-white tracking-tight">
          AI Career Copilot
        </h1>

        <p className="text-xs text-indigo-400 mt-1 font-medium">
          Smart Career Guidance
        </p>
      </div>


      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        <Link
          to="/user-dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-600/25"
        >
          <span>🏠</span>
          <span>Dashboard</span>
        </Link>


        <Link
          to="/my-profile"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
        >
          <span>👤</span>
          <span>My Profile</span>
        </Link>


        <Link
          to="/career-assessment"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
        >
          <span>🎯</span>
          <span>Career Assessment</span>
        </Link>


        <Link
          to="/ai-career-advisor"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
        >
          <span>🤖</span>
          <span>AI Career Advisor</span>
        </Link>


        <Link
          to="/career-recommendations"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
        >
          <span>💡</span>
          <span>Career Recommendations</span>
        </Link>


        <Link
          to="/career-roadmap"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
        >
          <span>🗺️</span>
          <span>Career Roadmap</span>
        </Link>


        <Link
          to="/skill-gap"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
        >
          <span>📊</span>
          <span>Skill Gap Analysis</span>
        </Link>


<Link 
  to="/learning-resources" 
  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition" 
> 
  <span>📚</span> 
  <span>Learning</span> 
</Link>


        <Link
          to="/browse-jobs"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
        >
          <span>💼</span>
          <span>Jobs & Internships</span>
        </Link>

<Link
    to="/my-job-offers"
    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
>
    <span>🤝</span>
    <span>My Job Offers</span>
</Link>
        <Link
          to="/resume"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
        >
          <span>📄</span>
          <span>Resume</span>
        </Link>


        <Link
          to="/interview-preparation"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
        >
          <span>🎤</span>
          <span>Interview Prep</span>
        </Link>


        <Link
          to="/progress"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
        >
          <span>📈</span>
          <span>My Progress</span>
        </Link>


        <Link
          to="/notifications"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
        >
          <span>🔔</span>
          <span>Notifications</span>
        </Link>


        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition"
        >
          <span>⚙️</span>
          <span>Settings</span>
        </Link>

      </nav>

    </aside>
  );
};

export default Sidebar;