
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CompanyLogin = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!formData.email.trim() || !formData.password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            
const response = await api.post(
    "/api/company/login",
    {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
    }
);


            if (response.data.status === 1) {
                // Company session ko User/Admin sessions se alag rakhein.
                localStorage.setItem("companyToken", response.data.token);
                localStorage.setItem(
                    "company",
                    JSON.stringify(response.data.data)
                );

                if (
                    response.data.data?.verificationStatus === "approved"
                ) {
                    navigate("/company-dashboard");
                } else {
                    setMessage(
                        "Login successful. Your company account is waiting for Admin verification."
                    );
                }
            } else {
                setError(response.data.message || "Company login failed.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to login. Please check your backend connection."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Navbar />

            <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-12">
                <div className="w-full max-w-md">
                    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl sm:p-10">
                        <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500" />

                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="30"
                                    height="30"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="3" y="7" width="18" height="14" rx="2" />
                                    <path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" />
                                </svg>
                            </div>

                            <h1 className="text-3xl font-black text-white">
                                Company Login
                            </h1>

                            <p className="mt-2 text-sm text-slate-400">
                                Sign in to manage your company and hiring activities.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-xl border border-rose-800 bg-rose-950/40 p-3 text-sm text-rose-300">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="mb-5 rounded-xl border border-amber-700 bg-amber-950/30 p-3 text-sm text-amber-200">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="company-email"
                                    className="mb-2 block text-sm font-semibold text-slate-200"
                                >
                                    Company Email
                                </label>

                                <input
                                    id="company-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="hr@company.com"
                                    autoComplete="username"
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="company-password"
                                    className="mb-2 block text-sm font-semibold text-slate-200"
                                >
                                    Password
                                </label>

                                <input
                                    id="company-password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Signing In..." : "Company Sign In"}
                            </button>
                        </form>

                        <div className="mt-7 border-t border-slate-800 pt-6 text-center">
                            <p className="text-sm text-slate-400">
                                Don't have a company account?
                            </p>

                            <Link
                                to="/company-register"
                                className="mt-2 inline-block font-bold text-indigo-400 hover:text-indigo-300"
                            >
                                Register Your Company
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CompanyLogin;