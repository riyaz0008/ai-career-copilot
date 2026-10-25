import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Forgetpass = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Step 1: Send OTP to registered email
    const handleSendOtp = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail) {
            setError("Please enter your registered email.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/forgot-password/send-otp",
                {
                    email: cleanEmail
                }
            );

            if (response.data.status === 1) {
                setEmail(cleanEmail);
                setStep(2);
                setSuccess(
                    response.data.message ||
                    "OTP sent successfully to your registered email."
                );
            } else {
                setError(
                    response.data.message || "Unable to send OTP."
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to send OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!/^\d{6}$/.test(otp.trim())) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/forgot-password/verify-otp",
                {
                    email: email.trim().toLowerCase(),
                    otp: otp.trim(),
                    password: password
                }
            );

            if (response.data.status === 1) {
                alert("Password updated successfully. Please sign in.");
                navigate("/login");
            } else {
                setError(
                    response.data.message ||
                    "Unable to reset password."
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "OTP verification failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Return to email step
    const handleChangeEmail = () => {
        setStep(1);
        setOtp("");
        setPassword("");
        setConfirmPassword("");
        setError("");
        setSuccess("");
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Navbar />

            <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl">
                        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mb-7" />

                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-indigo-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>

                            <h1 className="text-3xl font-black text-white">
                                {step === 1
                                    ? "Forgot Password?"
                                    : "Verify OTP"}
                            </h1>

                            <p className="mt-2 text-sm text-slate-400">
                                {step === 1
                                    ? "Enter your registered email to receive a password reset OTP."
                                    : "Enter the OTP sent to your registered email and choose a new password."}
                            </p>
                        </div>

                        {error && (
                            <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                                {success}
                            </div>
                        )}

                        {step === 1 ? (
                            <form
                                onSubmit={handleSendOtp}
                                className="mt-7 space-y-5"
                            >
                                <div>
                                    <label className="block mb-2 text-sm font-semibold">
                                        Registered Email
                                    </label>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="Enter your registered email"
                                        autoComplete="email"
                                        required
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 font-bold text-white transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading
                                        ? "Sending OTP..."
                                        : "Send OTP"}
                                </button>
                            </form>
                        ) : (
                            <form
                                onSubmit={handleResetPassword}
                                className="mt-7 space-y-5"
                            >
                                <div>
                                    <label className="block mb-2 text-sm font-semibold">
                                        Registered Email
                                    </label>

                                    <input
                                        type="email"
                                        value={email}
                                        readOnly
                                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3.5 text-slate-300 outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleChangeEmail}
                                        className="mt-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                                    >
                                        Change email
                                    </button>
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-semibold">
                                        6-Digit OTP
                                    </label>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(
                                                e.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 6)
                                            )
                                        }
                                        placeholder="Enter OTP"
                                        maxLength={6}
                                        pattern="[0-9]{6}"
                                        required
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-center text-xl font-bold tracking-[0.5em] text-white outline-none focus:border-indigo-500"
                                    />

                                    <p className="mt-2 text-xs text-slate-500">
                                        Your OTP expires in 10 minutes.
                                    </p>
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-semibold">
                                        New Password
                                    </label>

                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter new password"
                                        autoComplete="new-password"
                                        minLength={6}
                                        required
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm font-semibold">
                                        Confirm New Password
                                    </label>

                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        placeholder="Confirm new password"
                                        autoComplete="new-password"
                                        minLength={6}
                                        required
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-white outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 font-bold text-white transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading
                                        ? "Verifying OTP..."
                                        : "Verify OTP & Reset Password"}
                                </button>
                            </form>
                        )}

                        <p className="mt-7 text-center text-sm text-slate-400">
                            Remember your password?{" "}
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

export default Forgetpass;