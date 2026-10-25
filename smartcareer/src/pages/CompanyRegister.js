
import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CompanyRegister = () => {
    const [formData, setFormData] = useState({
        companyName: "",
        contactName: "",
        email: "",
        password: "",
        website: "",
        phone: "",
        description: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (
            !formData.companyName.trim() ||
            !formData.contactName.trim() ||
            !formData.email.trim() ||
            !formData.password
        ) {
            setError("Please fill in all required fields.");
            return;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        try {
            setLoading(true);

            
const response = await api.post(
    "/api/company/register",
    {
        ...formData,
        companyName: formData.companyName.trim(),
        contactName: formData.contactName.trim(),
        email: formData.email.trim().toLowerCase()
    }
);


            if (response.data.status === 1) {
                setMessage(
                    response.data.message ||
                    "Registration successful. Verification is pending."
                );

                setFormData({
                    companyName: "",
                    contactName: "",
                    email: "",
                    password: "",
                    website: "",
                    phone: "",
                    description: ""
                });
            } else {
                setError(response.data.message || "Registration failed.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to register. Please check whether the backend is running."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Navbar />

            <main className="flex justify-center px-5 py-12">
                <div className="w-full max-w-2xl">
                    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-10">
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
                                Register Your Company
                            </h1>

                            <p className="mt-2 text-sm text-slate-400">
                                Create an employer account to connect with potential candidates.
                            </p>
                        </div>

                        {message && (
                            <div className="mb-5 rounded-xl border border-emerald-700 bg-emerald-950/40 p-4 text-sm text-emerald-300">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="mb-5 rounded-xl border border-rose-800 bg-rose-950/40 p-4 text-sm text-rose-300">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-200">
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="e.g. ABC Technologies"
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-200">
                                    Contact Person Name *
                                </label>
                                <input
                                    type="text"
                                    name="contactName"
                                    value={formData.contactName}
                                    onChange={handleChange}
                                    placeholder="e.g. Rahul Patel"
                                    className={inputClass}
                                    required
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    Enter the name of the person managing this company account.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-200">
                                    Official Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="hr@company.com"
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-200">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="At least 8 characters"
                                    className={inputClass}
                                    minLength={8}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-200">
                                    Company Website
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    placeholder="https://www.company.com"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-200">
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter contact number"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-200">
                                    About Company
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Briefly describe your company"
                                    rows={4}
                                    className={inputClass}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Registering..." : "Register Company"}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-400">
                           Already have an account?{" "}
                            <Link
                                to="/company-login"
                                className="font-semibold text-indigo-400 hover:text-indigo-300"
                            >
                                Company Login
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CompanyRegister;