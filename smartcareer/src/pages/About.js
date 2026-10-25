import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">

      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-20">

        <div className="text-center">
          <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs bg-indigo-500/10 px-3.5 py-1 rounded-full border border-indigo-500/20 inline-block mb-3">
            About Us
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-white">
            About AI Career Copilot
          </h1>

          <p className="mt-6 text-slate-300 text-lg leading-relaxed max-w-3xl mx-auto">
            AI Career Copilot is a smart career guidance and placement
            preparation platform designed to help students build successful
            careers.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-8">

          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Our Purpose
            </h2>

            <p className="mt-4 text-slate-400 leading-relaxed text-sm md:text-base">
              Our purpose is to provide students with personalized career
              guidance, skill improvement resources and placement preparation
              tools in one platform.
            </p>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Our Vision
            </h2>

            <p className="mt-4 text-slate-400 leading-relaxed text-sm md:text-base">
              We aim to make career planning and placement preparation easier,
              smarter and more accessible through AI-powered technology.
            </p>
          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
};

export default About;