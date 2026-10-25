import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link to="/" className="text-2xl font-black text-white tracking-tight flex items-center gap-1">
          <span className="text-indigo-400">AI</span> Career Copilot
        </Link>

        <div className="hidden md:flex items-center gap-8">

          <Link
            to="/"
            className="text-slate-300 hover:text-indigo-400 text-sm font-semibold transition"
          >
            Home
          </Link>

          <Link
            to="/about"
            className="text-slate-300 hover:text-indigo-400 text-sm font-semibold transition"
          >
            About
          </Link>

          <Link
            to="/features"
            className="text-slate-300 hover:text-indigo-400 text-sm font-semibold transition"
          >
            Features
          </Link>

          <Link
            to="/contact"
            className="text-slate-300 hover:text-indigo-400 text-sm font-semibold transition"
          >
            Contact
          </Link>

          <Link
            to="/login"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
          >
            Get Started
          </Link>

          <Link
            to="/company-login"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
          >
            For Employers
          </Link>

        </div>

      </div>
    </nav>
  );
};

export default Navbar;