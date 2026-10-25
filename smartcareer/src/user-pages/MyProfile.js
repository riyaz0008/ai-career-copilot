import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const MyProfile = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    education: "",
    career: "",
    skills: "",
    goal: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const loggedUser = JSON.parse(storedUser);
      setUserId(loggedUser._id);
      setFormData({
        firstname: loggedUser.firstname || "",
        lastname: loggedUser.lastname || "",
        email: loggedUser.email || "",
        education: loggedUser.education || "",
        career: loggedUser.career || "",
        skills: loggedUser.skills || "",
        goal: loggedUser.goal || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateCompletion = () => {
    let score = 0;
    const baseFields = ["firstname", "lastname", "email", "education", "career"];

    baseFields.forEach((field) => {
      if (formData[field] && formData[field].trim() !== "") {
        score += 16;
      }
    });

    if (formData.skills && formData.skills.trim() !== "") {
      score += 10;
    }

    if (formData.goal && formData.goal.trim() !== "") {
      score += 10;
    }

    return score;
  };

  const completionPercentage = calculateCompletion();
  const initials = `${formData.firstname.charAt(0) || "U"}${formData.lastname.charAt(0) || ""}`.toUpperCase();

  const Handlesubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.put(
        `/api/update-user/${userId}`,
        formData
      );

      if (response.data.status == 1) {
        alert(response.data.message);
        localStorage.setItem("user", JSON.stringify(response.data.data));
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="h-36 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-slate-800/80"></div>

          <div className="px-8 pb-8">
            <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:space-x-6">
              <div className="w-28 h-28 rounded-3xl border-4 border-slate-900 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-indigo-500/20">
                {initials}
              </div>

              <div className="mt-4 sm:mt-0 text-center sm:text-left flex-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white capitalize tracking-tight">
                  {formData.firstname} {formData.lastname}
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">{formData.email}</p>
              </div>

              <div className="mt-4 sm:mt-0">
                <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 text-xs font-bold px-4 py-2 rounded-xl border border-indigo-500/20 shadow-inner">
                  🎯 {formData.career || "Career Explorer"}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                <span>
                  Profile Completion{" "}
                  {completionPercentage < 100 && (
                    <span className="text-amber-400 font-normal normal-case ml-1">
                      (Add Skills & Goal to reach 100%)
                    </span>
                  )}
                </span>

                <span className={completionPercentage === 100 ? "text-emerald-400 font-black text-sm" : "text-indigo-400 font-black text-sm"}>
                  {completionPercentage}%
                </span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 shadow-lg ${
                    completionPercentage === 100
                      ? "bg-emerald-500 shadow-emerald-500/50"
                      : "bg-gradient-to-r from-indigo-500 to-violet-500 shadow-indigo-500/50"
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={Handlesubmit}
          className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/85 rounded-3xl shadow-2xl p-8 sm:p-10 relative overflow-hidden"
        >
          <div className="mb-10">
            <h2 className="text-lg font-extrabold text-white border-b border-slate-800 pb-3 mb-6 text-left tracking-tight flex items-center gap-2">
              👤 Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm shadow-inner transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm shadow-inner transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm shadow-inner transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Education Level
                </label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm shadow-inner transition"
                  required
                >
                  <option value="" disabled className="bg-slate-950 text-slate-500">
                    Select Education
                  </option>
                  <option value="High School" className="bg-slate-950">
                    High School
                  </option>
                  <option value="Diploma" className="bg-slate-950">
                    Diploma
                  </option>
                  <option value="Bachelor's Degree" className="bg-slate-950">
                    Bachelor's Degree
                  </option>
                  <option value="Master's Degree" className="bg-slate-950">
                    Master's Degree
                  </option>
                  <option value="Other" className="bg-slate-950">
                    Other
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-white border-b border-slate-800 pb-3 mb-6 text-left tracking-tight flex items-center gap-2">
              🚀 Career & Skills Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Career Interest
                </label>
                <select
                  name="career"
                  value={formData.career}
                  onChange={handleChange}
                  className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm shadow-inner transition"
                  required
                >
                  <option value="" disabled className="bg-slate-950 text-slate-500">
                    Select Career Interest
                  </option>
                  <option value="Web Development" className="bg-slate-950">
                    Web Development
                  </option>
                  <option value="Software Development" className="bg-slate-950">
                    Software Development
                  </option>
                  <option value="AI & Machine Learning" className="bg-slate-950">
                    AI & Machine Learning
                  </option>
                  <option value="Data Science" className="bg-slate-950">
                    Data Science
                  </option>
                  <option value="Cyber Security" className="bg-slate-950">
                    Cyber Security
                  </option>
                  <option value="Cloud Computing" className="bg-slate-950">
                    Cloud Computing
                  </option>
                  <option value="UI/UX Design" className="bg-slate-950">
                    UI/UX Design
                  </option>
                  <option value="Other" className="bg-slate-950">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Key Skills
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm shadow-inner transition"
                  placeholder="e.g., React, Node.js, Python"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Career Goal
                </label>
                <textarea
                  name="goal"
                  rows="3"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm shadow-inner transition resize-none"
                  placeholder="Write your future career goal here..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800/85 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/user-dashboard")}
              className="w-full sm:w-auto bg-slate-800/80 text-slate-300 border border-slate-700 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 hover:text-white transition shadow-sm text-center"
            >
              ← Back to Dashboard
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition transform hover:-translate-y-0.5 text-center"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;