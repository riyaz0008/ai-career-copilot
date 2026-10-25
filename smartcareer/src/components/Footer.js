import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          <Link to="/" className="text-xl font-black text-white tracking-tight">
            <span className="text-indigo-400">AI</span> Career Copilot
          </Link>

          <div className="flex gap-8 text-sm font-medium">
            <Link to="/about" className="hover:text-indigo-400 transition">
              About
            </Link>

            <Link to="/features" className="hover:text-indigo-400 transition">
              Features
            </Link>

            <Link to="/contact" className="hover:text-indigo-400 transition">
              Contact
            </Link>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            © 2026 AI Career Copilot. All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;