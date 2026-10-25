import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">

      {/* ================= HERO ================= */}

      <section
        className="relative min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: "url('/career-bg.png')",
        }}
      >

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"></div>

        {/* ================= NAVBAR ================= */}
        <div className="relative z-50">
          <Navbar />
        </div>

        {/* ================= HERO CONTENT ================= */}
        <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center">

          <div className="max-w-7xl mx-auto px-6 py-20 w-full">

            <div className="max-w-3xl">

              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider shadow-sm">
                AI-Powered Career Platform
              </div>

              {/* Heading */}
              <h1 className="mt-7 text-5xl md:text-7xl font-black leading-tight tracking-tight text-white">
                Build Your Career.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mt-2">
                  Prepare for Success.
                </span>
              </h1>

              {/* Description */}
              <p className="mt-7 text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl">
                AI Career Copilot helps you discover career opportunities,
                develop the right skills, prepare for interviews and get
                placement-ready with intelligent career guidance.
              </p>

              {/* Buttons */}
              <div className="mt-9 flex flex-col sm:flex-row gap-4">

                <Link
                  to="/login"
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-8 py-4 rounded-2xl text-center font-bold transition shadow-lg shadow-indigo-600/30 text-white transform hover:-translate-y-0.5"
                >
                  Get Started
                </Link>

                <Link
                  to="/features"
                  className="border border-slate-700 hover:bg-slate-900 px-8 py-4 rounded-2xl text-center font-bold transition text-slate-200 hover:text-white shadow-sm"
                >
                  Explore Features
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= HIGHLIGHTS ================= */}

      <section className="py-20 border-b border-slate-800/80 bg-slate-950">

        <div className="max-w-7xl mx-auto px-6">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            {/* Card 1 */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 text-center shadow-xl">

              <div className="text-3xl font-black text-indigo-400">
                AI
              </div>

              <p className="mt-2 text-slate-400 text-sm font-medium">
                Powered Career Guidance
              </p>

            </div>


            {/* Card 2 */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 text-center shadow-xl">

              <div className="text-3xl font-black text-indigo-400">
                24/7
              </div>

              <p className="mt-2 text-slate-400 text-sm font-medium">
                Career Assistance
              </p>

            </div>


            {/* Card 3 */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 text-center shadow-xl">

              <div className="text-3xl font-black text-indigo-400">
                One
              </div>

              <p className="mt-2 text-slate-400 text-sm font-medium">
                Complete Career Platform
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= WHY US ================= */}

      <section className="py-24 bg-slate-950">

        <div className="max-w-7xl mx-auto px-6">

          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto">

            <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 inline-block mb-3">
              Why AI Career Copilot
            </p>

            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Your Career Journey, Simplified
            </h2>

            <p className="mt-5 text-slate-400 text-lg leading-relaxed">
              Everything you need to understand your career path,
              improve your skills and prepare for opportunities.
            </p>

          </div>


          {/* Cards */}
          <div className="mt-14 grid md:grid-cols-3 gap-6">

            {/* Card 1 */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 hover:border-indigo-500/50 transition shadow-xl">

              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-lg font-bold">
                01
              </div>

              <h3 className="mt-6 text-xl font-bold text-white">
                Personalized Guidance
              </h3>

              <p className="mt-3 text-slate-400 leading-relaxed text-sm">
                Get career guidance based on your interests,
                skills, goals and career direction.
              </p>

            </div>


            {/* Card 2 */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 hover:border-indigo-500/50 transition shadow-xl">

              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-lg font-bold">
                02
              </div>

              <h3 className="mt-6 text-xl font-bold text-white">
                Smarter Preparation
              </h3>

              <p className="mt-3 text-slate-400 leading-relaxed text-sm">
                Prepare for interviews, placements and
                career challenges with structured guidance.
              </p>

            </div>


            {/* Card 3 */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 hover:border-indigo-500/50 transition shadow-xl">

              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-lg font-bold">
                03
              </div>

              <h3 className="mt-6 text-xl font-bold text-white">
                Career Readiness
              </h3>

              <p className="mt-3 text-slate-400 leading-relaxed text-sm">
                Identify skill gaps and work towards becoming
                more confident and placement-ready.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}

      <section className="py-24 bg-slate-900/40 border-y border-slate-800/80">

        <div className="max-w-7xl mx-auto px-6">

          {/* Heading */}
          <div className="text-center">

            <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 inline-block mb-3">
              How It Works
            </p>

            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Start Your Career Journey
            </h2>

          </div>


          {/* Steps */}
          <div className="mt-14 grid md:grid-cols-3 gap-8">

            {/* Step 1 */}
            <div className="text-center bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-xl">

              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-indigo-500/30">
                1
              </div>

              <h3 className="mt-6 text-xl font-bold text-white">
                Create Your Account
              </h3>

              <p className="mt-3 text-slate-400 leading-relaxed text-sm">
                Register and create your personalized profile.
              </p>

            </div>


            {/* Step 2 */}
            <div className="text-center bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-xl">

              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-indigo-500/30">
                2
              </div>

              <h3 className="mt-6 text-xl font-bold text-white">
                Explore Your Career
              </h3>

              <p className="mt-3 text-slate-400 leading-relaxed text-sm">
                Understand your skills, interests and career goals.
              </p>

            </div>


            {/* Step 3 */}
            <div className="text-center bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-xl">

              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-indigo-500/30">
                3
              </div>

              <h3 className="mt-6 text-xl font-bold text-white">
                Prepare for Success
              </h3>

              <p className="mt-3 text-slate-400 leading-relaxed text-sm">
                Use AI-powered guidance to prepare for your career.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= CAREER AREAS ================= */}

      <section className="py-24 bg-slate-950">

        <div className="max-w-7xl mx-auto px-6">

          {/* Heading */}
          <div className="text-center">

            <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 inline-block mb-3">
              Career Preparation
            </p>

            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Everything You Need to Move Forward
            </h2>

          </div>


          {/* Career Cards */}
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Career Planning */}
            <div className="border border-slate-800/80 bg-slate-900/90 backdrop-blur-xl rounded-3xl p-7 hover:border-indigo-500/50 transition shadow-xl">

              <h3 className="font-bold text-lg text-white">
                Career Planning
              </h3>

              <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                Explore suitable career paths and opportunities.
              </p>

            </div>


            {/* Skill Development */}
            <div className="border border-slate-800/80 bg-slate-900/90 backdrop-blur-xl rounded-3xl p-7 hover:border-indigo-500/50 transition shadow-xl">

              <h3 className="font-bold text-lg text-white">
                Skill Development
              </h3>

              <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                Identify and improve skills required for your goals.
              </p>

            </div>


            {/* Resume Preparation */}
            <div className="border border-slate-800/80 bg-slate-900/90 backdrop-blur-xl rounded-3xl p-7 hover:border-indigo-500/50 transition shadow-xl">

              <h3 className="font-bold text-lg text-white">
                Resume Preparation
              </h3>

              <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                Build a stronger resume for placement opportunities.
              </p>

            </div>


            {/* Interview Preparation */}
            <div className="border border-slate-800/80 bg-slate-900/90 backdrop-blur-xl rounded-3xl p-7 hover:border-indigo-500/50 transition shadow-xl">

              <h3 className="font-bold text-lg text-white">
                Interview Preparation
              </h3>

              <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                Practice technical and HR interview preparation.
              </p>

            </div>


            {/* Placement Preparation */}
            <div className="border border-slate-800/80 bg-slate-900/90 backdrop-blur-xl rounded-3xl p-7 hover:border-indigo-500/50 transition shadow-xl">

              <h3 className="font-bold text-lg text-white">
                Placement Preparation
              </h3>

              <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                Prepare for aptitude, technical and HR rounds.
              </p>

            </div>


            {/* AI Career Assistant */}
            <div className="border border-slate-800/80 bg-slate-900/90 backdrop-blur-xl rounded-3xl p-7 hover:border-indigo-500/50 transition shadow-xl">

              <h3 className="font-bold text-lg text-white">
                AI Career Assistant
              </h3>

              <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                Get intelligent answers to career-related questions.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="py-24 bg-slate-950">

        <div className="max-w-5xl mx-auto px-6">

          <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 px-8 py-16 md:px-16 text-center border border-slate-800/80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Ready to Build Your Future?
            </h2>

            <p className="mt-5 text-indigo-200/80 text-lg max-w-2xl mx-auto leading-relaxed">
              Take the next step in your career with
              AI-powered guidance and preparation.
            </p>
<div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="inline-block mt-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
            
            <Link
              to="/company-login"
              className="inline-block mt-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              For Employers
            </Link>
</div>
          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <Footer />

    </div>
  );
};

export default Home;