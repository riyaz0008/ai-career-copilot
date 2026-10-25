
import userData from '../models/User.js';
import bcrypt from 'bcrypt';
import generateToken from "../utils/jwtutils.js";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService.js";


export const addUser = async (req, res) => {
    try {
        const existingUser = await userData.findOne({
            email: req.body.email
        });

        if (existingUser) {
            return res.status(200).json({
                message: "Email already registered. Please login.",
                status: 0
            });
        }

        const password = await bcrypt.hash(req.body.password, 10);

        const saveuserData = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            education: req.body.education,
            career: req.body.career,
            password: password
        };

        const saveUser = await userData.create(saveuserData);

        let emailSent = true;

        try {
            await sendEmail({
                to: saveUser.email,
                subject: "Registration Successful - AI Career Copilot",
                text: `Hello ${saveUser.firstname},

Your registration with AI Career Copilot was successful.

You can now log in to your account.

Thank you,
AI Career Copilot Team`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b;">
                        <h2 style="color: #4f46e5;">AI Career Copilot</h2>
                        <h3>Registration Successful!</h3>
                        <p>Hello ${saveUser.firstname},</p>
                        <p>Your account has been created successfully.</p>
                        <p>You can now log in to AI Career Copilot.</p>
                        <p>Thank you for joining us!</p>
                        <p><strong>AI Career Copilot Team</strong></p>
                    </div>
                `
            });
        } catch (emailError) {
            emailSent = false;
            console.error(
                "Registration email failed:",
                emailError.message
            );
        }

        return res.status(201).json({
            message: emailSent
                ? "Registration Successfully! Confirmation email sent."
                : "Registration Successfully! But confirmation email could not be sent.",
            status: 1,
            emailSent: emailSent
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};


export const login = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        const uData = await userData.findOne({ email });

        if (!uData) {
            return res.status(200).json({
                message: "User Not Found",
                status: 0
            });
        }

        const comparePassword = await bcrypt.compare(
            req.body.password,
            uData.password
        );

        if (!comparePassword) {
            return res.status(200).json({
                message: "Password do not match",
                status: 0
            });
        }

        if (uData.status === "inactive") {
            return res.status(200).json({
                message: "Your account is inactive. Please contact administrator.",
                status: 0
            });
        }

        let emailSent = false;

        // Send email only on the first successful login
        if (!uData.loginEmailSent) {
            try {
                await sendEmail({
                    to: uData.email,
                    subject: "New Login - AI Career Copilot",

                    text: `Hello ${uData.firstname},

You have successfully logged in to your AI Career Copilot account.

If this was not you, please secure your account.

AI Career Copilot Team`,

                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b;">
                            <h2 style="color: #4f46e5;">AI Career Copilot</h2>
                            <h3>Login Successful</h3>
                            <p>Hello ${uData.firstname},</p>
                            <p>You have successfully logged in to your account.</p>
                            <p>If this was not you, please secure your account.</p>
                            <p><strong>AI Career Copilot Team</strong></p>
                        </div>
                    `
                });

                // Mark as sent only after email succeeds
                uData.loginEmailSent = true;
                await uData.save();

                emailSent = true;

            } catch (emailError) {
                emailSent = false;

                console.error(
                    "Login notification email failed:",
                    emailError.message
                );
            }
        }

        const token = generateToken(uData, "user");

        const user = await userData
            .findById(uData._id)
            .select("-password");

        return res.status(200).json({
            message: "Login Successfully",
            status: 1,
            token,
            data: user,
            emailSent
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Login failed",
            status: 0
        });
    }
};
export const sendPasswordResetOtp = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                status: 0,
                message: "Please enter your email address."
            });
        }

        // Check whether the email is registered
        const user = await userData.findOne({ email }).select(
            "+passwordResetOtpHash +passwordResetOtpExpires +passwordResetOtpAttempts"
        );

        // If email is not registered, do not send OTP
        if (!user) {
            return res.status(404).json({
                status: 0,
                message: "This email is not registered. Please use your registered email."
            });
        }

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 1000000).toString();

        // Save hashed OTP with 10-minute expiry
        user.passwordResetOtpHash = await bcrypt.hash(otp, 10);
        user.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.passwordResetOtpAttempts = 0;

        await user.save();

        try {
            await sendEmail({
                to: user.email,
                subject: "Password Reset OTP - AI Career Copilot",

                text: `Hello ${user.firstname},

Your password reset OTP is ${otp}.

This OTP expires in 10 minutes. Do not share it with anyone.

AI Career Copilot Team`,

                html: `
                    <div style="font-family:Arial,sans-serif;padding:24px;color:#1e293b">
                        <h2 style="color:#4f46e5">AI Career Copilot</h2>
                        <h3>Password Reset OTP</h3>

                        <p>Hello ${user.firstname},</p>
                        <p>Your password reset OTP is:</p>

                        <div style="font-size:30px;font-weight:bold;letter-spacing:8px;padding:16px;background:#f1f5f9;text-align:center">
                            ${otp}
                        </div>

                        <p>This OTP expires in <strong>10 minutes</strong>.</p>
                        <p>Do not share this code with anyone.</p>
                    </div>
                `
            });

        } catch (emailError) {
            // Clear OTP data if the email fails
            user.passwordResetOtpHash = undefined;
            user.passwordResetOtpExpires = undefined;
            user.passwordResetOtpAttempts = 0;

            await user.save();

            console.error("Password reset email failed:", emailError.message);

            return res.status(500).json({
                status: 0,
                message: "Unable to send OTP email. Please try again."
            });
        }

        return res.status(200).json({
            status: 1,
            message: "OTP sent successfully to your registered email."
        });

    } catch (error) {
        console.error("Send OTP error:", error.message);

        return res.status(500).json({
            status: 0,
            message: "Unable to send OTP. Please try again."
        });
    }
};

export const verifyOtpAndResetPassword = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const otp = String(req.body.otp || "").trim();
        const password = req.body.password;

        if (!email || !/^\d{6}$/.test(otp) || !password) {
            return res.status(400).json({
                status: 0,
                message: "Email, valid 6-digit OTP and new password are required."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                status: 0,
                message: "Password must be at least 6 characters."
            });
        }

        const user = await userData.findOne({ email }).select(
            "+passwordResetOtpHash +passwordResetOtpExpires +passwordResetOtpAttempts"
        );

        if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpires) {
            return res.status(400).json({
                status: 0,
                message: "OTP is invalid or expired. Request a new OTP."
            });
        }

        if (user.passwordResetOtpExpires.getTime() < Date.now()) {
            user.passwordResetOtpHash = undefined;
            user.passwordResetOtpExpires = undefined;
            user.passwordResetOtpAttempts = 0;
            await user.save();

            return res.status(400).json({
                status: 400,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        if (user.passwordResetOtpAttempts >= 5) {
            user.passwordResetOtpHash = undefined;
            user.passwordResetOtpExpires = undefined;
            user.passwordResetOtpAttempts = 0;
            await user.save();

            return res.status(429).json({
                status: 0,
                message: "Too many incorrect attempts. Request a new OTP."
            });
        }

        const otpMatches = await bcrypt.compare(
            otp,
            user.passwordResetOtpHash
        );

        if (!otpMatches) {
            user.passwordResetOtpAttempts += 1;
            await user.save();

            return res.status(400).json({
                status: 0,
                message: "Incorrect OTP."
            });
        }

        user.password = await bcrypt.hash(password, 10);
        user.passwordResetOtpHash = undefined;
        user.passwordResetOtpExpires = undefined;
        user.passwordResetOtpAttempts = 0;

        await user.save();

        return res.status(200).json({
            status: 1,
            message: "Password updated successfully."
        });
    } catch (error) {
        console.error("Verify OTP error:", error.message);

        return res.status(500).json({
            status: 0,
            message: "Unable to reset password."
        });
    }
};