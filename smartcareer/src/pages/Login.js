
import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";

const Login = () => {
  const emailref = useRef();
  const passwordref = useRef();
  const navigate = useNavigate();
  const [error, seterror] = useState({});

 const Handlesubmit = async (e) => {
    e.preventDefault();

    const email = emailref.current.value.trim().toLowerCase();
    const password = passwordref.current.value.trim();
    const newerror = {};

    if (!email) {
        newerror.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newerror.email = "Please enter a valid email";
    }

    if (!password) {
        newerror.password = "Password is required";
    } else if (password.length < 6) {
        newerror.password = "Password must be at least 6 characters";
    }

    seterror(newerror);

    if (newerror.email) {
        emailref.current.focus();
        return;
    }

    if (newerror.password) {
        passwordref.current.focus();
        return;
    }

    const formData = { email, password };

    // First, check Admin Login
    try {
        const adminResponse = await axios.post(
            "http://localhost:5000/api/admin-login",
            formData
        );

        if (adminResponse.data.status === 1) {
            localStorage.setItem("adminToken", adminResponse.data.token);
            localStorage.setItem(
                "adminUser",
                JSON.stringify(adminResponse.data.data)
            );

            navigate("/admin-dashboard");
            return;
        }
    } catch (adminError) {
        // Admin login failed; continue to normal user login.
        console.log("Admin login unsuccessful. Checking user login.");
    }

    // Then, check normal User Login
    try {
        const response = await axios.post(
            "http://localhost:5000/api/login",
            formData
        );

        if (response.data.status === 1) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.data)
            );

            navigate("/user-dashboard");
        } else {
            alert(response.data.message || "Invalid email or password.");
        }
    } catch (err) {
        console.log("USER LOGIN ERROR:", err);
        console.log("RESPONSE:", err.response?.data);

        alert(
            err.response?.data?.message ||
            "Unable to login. Please try again."
        );
    }
};

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            <div className="text-center">
              <h1 className="text-3xl font-black text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Sign in to continue your career journey
              </p>
            </div>

            <form onSubmit={Handlesubmit} className="mt-8 space-y-5 text-left">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-semibold text-slate-200"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  ref={emailref}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner text-sm"
                />

                {error.email && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">
                    {error.email}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-200"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <input
                  id="password"
                  type="password"
                  ref={passwordref}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3.5 text-white placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner text-sm"
                />

                {error.password && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">
                    {error.password}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 py-1">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                />

                <label
                  htmlFor="remember"
                  className="text-sm text-slate-400 font-medium"
                >
                  Remember me
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 py-4 font-bold text-white transition shadow-lg shadow-indigo-600/30 transform hover:-translate-y-0.5"
              >
                Sign In
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-bold text-indigo-400 hover:text-indigo-300"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;