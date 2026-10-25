import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Features = () => {
  const features = [
    {
      icon: "🎯",
      title: "Career Guidance",
      description:
        "Get personalized career suggestions based on your interests, skills and goals.",
    },
    {
      icon: "🧠",
      title: "Skill Assessment",
      description:
        "Identify your strengths and discover the skills you need to improve.",
    },
    {
      icon: "🚀",
      title: "Placement Preparation",
      description:
        "Prepare for aptitude tests, technical rounds and HR interviews.",
    },
    {
      icon: "📄",
      title: "Resume Assistance",
      description:
        "Build and improve your resume for better placement opportunities.",
    },
    {
      icon: "🎤",
      title: "Interview Preparation",
      description:
        "Practice technical and HR interview questions before your placement.",
    },
    {
      icon: "🤖",
      title: "AI Career Assistant",
      description:
        "Get AI-powered answers and guidance for your career-related questions.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-20">

        <div className="text-center">
          <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs bg-indigo-500/10 px-3.5 py-1 rounded-full border border-indigo-500/20 inline-block mb-3">
            Features
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight text-white">
            Smart Features for Your Career
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-slate-400 text-lg leading-relaxed">
            Everything you need to improve your skills and prepare for your
            dream career.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 hover:border-indigo-500/50 transition shadow-xl group"
            >
              <div className="text-3xl mb-5 p-3.5 bg-indigo-500/10 rounded-2xl w-fit border border-indigo-500/20 group-hover:scale-105 transition">
                {feature.icon}
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                {feature.title}
              </h2>

              <p className="mt-3 text-slate-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}

        </div>

      </main>

      <Footer />

    </div>
  );
};

export default Features;