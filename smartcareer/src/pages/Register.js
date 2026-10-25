import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api";

const Register = () => {

  const firstNameref = useRef();
  const lastNameref = useRef();
  const emailref = useRef();
  const passwordref = useRef();
  const confirmpassref = useRef();
  const educationref = useRef();
  const careerref = useRef();

  const navigate = useNavigate();

  const [error, seterror] = useState({});

  const Handlesubmit =  async (e) => {
    e.preventDefault();

    const firstname = firstNameref.current.value;
    const lastname = lastNameref.current.value;
    const email = emailref.current.value;
    const education = educationref.current.value;
    const career = careerref.current.value;
    const password = passwordref.current.value;
    const confirmpass = confirmpassref.current.value;

    const newerror = {};

    if (!firstname || firstname === "") {
      newerror.firstname = "First name is required";
    }


    if (!lastname || lastname === "") {
      newerror.lastname = "Last name is required";
    }

    if (!email || email === "") {
      newerror.email = "Email is required";
    }
    else if (!email.includes("@gmail.com")) {
      newerror.email = "Please enter a valid email";
    }

    if (!education || education === "") {
      newerror.education = "Education level is required";
    }

    if (!career || career === "") {
      newerror.career = "Career interest is required";
    }


    if (!password || password === "") {
      newerror.password = "Password is required";
    }
    else if (password.length < 6) {
      newerror.password =
        "Password must be at least 6 characters";
    }

    if (!confirmpass || confirmpass === "") {
      newerror.confirmpass = "Confirm password is required";
    }
    else if (password !== confirmpass) {
      newerror.confirmpass = "Password do not match";
    }

    seterror(newerror);



    if (newerror.firstname) {
      firstNameref.current.focus();
      return;
    }

    if (newerror.lastname) {
      lastNameref.current.focus();
      return;
    }

    if (newerror.email) {
      emailref.current.focus();
      return;
    }

    if (newerror.education) {
      educationref.current.focus();
      return;
    }

    if (newerror.career) {
      careerref.current.focus();
      return;
    }

    if (newerror.password) {
      passwordref.current.focus();
      return;
    }

    if (newerror.confirmpass) {
      confirmpassref.current.focus();
      return;
    }
     
    const formData = {
      firstname: firstname,
      lastname: lastname,
      email: email,
      education: education,
      career: career,
      password: password
    };
   
    // API calling
    try {
      const response = await api.post("/api/add-user", formData);

      if (response.data.status === 1) {
        alert(response.data.message || "Account created successfully!");
        navigate("/login");
      } else {
        alert(response.data.message || "Registration failed. Please try again.");
      }
        } catch (err) {
      console.log("REGISTER ERROR:", err);
      console.log("RESPONSE:", err.response?.data);

      alert(
        err.response?.data?.message ||
        "Unable to register. Please try again."
      );
    }
  };

  return (    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">

      <Navbar />

      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Register Card */}

          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            {/* Heading */}

            <div className="text-center">

              <h1 className="text-3xl font-black text-white tracking-tight">
                Create Account
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Join now to start your professional career journey
              </p>

            </div>


            {/* Register Form */}

            <form
              onSubmit={Handlesubmit}
              className="mt-8 space-y-4 text-left"
            >

              {/* ================= FIRST NAME ================= */}

              <div>

                <label
                  htmlFor="firstname"
                  className="block mb-2 text-sm font-semibold text-slate-200"
                >
                  First Name *
                </label>

                <input
                  id="firstname"
                  type="text"
                  ref={firstNameref}
                  placeholder="Enter your first name"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                />

                {error.firstname && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">
                    {error.firstname}
                  </p>
                )}

              </div>


              {/* ================= LAST NAME ================= */}

              <div>

                <label
                  htmlFor="lastname"
                  className="block mb-2 text-sm font-semibold text-slate-200"
                >
                  Last Name *
                </label>

                <input
                  id="lastname"
                  type="text"
                  ref={lastNameref}
                  placeholder="Enter your last name"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                />

                {error.lastname && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">
                    {error.lastname}
                  </p>
                )}

              </div>


              {/* ================= EMAIL ================= */}

              <div>

                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-semibold text-slate-200"
                >
                  Email Address *
                </label>

                <input
                  id="email"
                  type="email"
                  ref={emailref}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                />

                {error.email && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">
                    {error.email}
                  </p>
                )}

              </div>


              {/* ================= EDUCATION LEVEL ================= */}

              <div>

                <label
                  htmlFor="education"
                  className="block mb-2 text-sm font-semibold text-slate-200"
                >
                  Education Level *
                </label>

                <select
                  id="education"
                  ref={educationref}
                  defaultValue=""
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                >

                  <option value="" disabled className="bg-slate-950 text-slate-500">
                    Select your education level
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

                {error.education && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">
                    {error.education}
                  </p>
                )}

              </div>


              {/* ================= CAREER INTEREST ================= */}

              <div>

                <label
                  htmlFor="career"
                  className="block mb-2 text-sm font-semibold text-slate-200"
                >
                  Career Interest *
                </label>

                <select
                  id="career"
                  ref={careerref}
                  defaultValue=""
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                >

                  <option value="" disabled className="bg-slate-950 text-slate-500">
                    Select your career interest
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

                {error.career && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">
                    {error.career}
                  </p>
                )}

              </div>


              {/* ================= PASSWORD ================= */}

              <div>

                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-semibold text-slate-200"
                >
                  Password *
                </label>

                <input
                  id="password"
                  type="password"
                  ref={passwordref}
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                />

                {error.password && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">
                    {error.password}
                  </p>
                )}

              </div>


              {/* ================= CONFIRM PASSWORD ================= */}

              <div>

                <label
                  htmlFor="confirmpassword"
                  className="block mb-2 text-sm font-semibold text-slate-200"
                >
                  Confirm Password *
                </label>

                <input
                  id="confirmpassword"
                  type="password"
                  ref={confirmpassref}
                  placeholder="Confirm your password"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                />

                {error.confirmpass && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">
                    {error.confirmpass}
                  </p>
                )}

              </div>


              {/* ================= CREATE ACCOUNT ================= */}

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 py-4 font-bold text-white transition shadow-lg shadow-indigo-600/30 transform hover:-translate-y-0.5 mt-2"
              >
                Create Account
              </button>

            </form>


            {/* ================= LOGIN LINK ================= */}

            <p className="mt-8 text-center text-sm text-slate-400">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-bold text-indigo-400 hover:text-indigo-300"
              >
                Sign In
              </Link>

            </p>

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
  };

export default Register;