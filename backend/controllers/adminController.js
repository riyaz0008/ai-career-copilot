import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/jwtutils.js";
import { sendEmail } from "../utils/emailService.js";

const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sendAdminEmail = async (admin, subject, heading, message) => {
    await sendEmail({
        to: admin.email,
        subject,
        text: `Hello ${admin.firstname},\n\n${message}\n\nAI Career Copilot Team`,
        html: `
            <div style="font-family:Arial,sans-serif;padding:24px;color:#1e293b">
                <h2 style="color:#4f46e5">AI Career Copilot</h2>
                <h3>${heading}</h3>
                <p>Hello ${admin.firstname},</p>
                <p>${message}</p>
                <p><strong>AI Career Copilot Team</strong></p>
            </div>
        `
    });
};

export const addAdmin = async (req, res) => {
    try {
        const { firstname, lastname, password } = req.body;
        const email = req.body.email?.trim().toLowerCase();

        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({
                message: "All fields are required.",
                status: 0
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address.",
                status: 0
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters.",
                status: 0
            });
        }

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(409).json({
                message: "This admin email is already registered.",
                status: 0
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const savedAdmin = await Admin.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role: "admin",
            loginEmailSent: false
        });

        // Send registration email whenever a new admin is registered.
        try {
            await sendAdminEmail(
                savedAdmin,
                "Admin Registration - AI Career Copilot",
                "Registration Successful",
                "Your AI Career Copilot admin account has been registered successfully."
            );
        } catch (emailError) {
            console.error(
                "Admin registration email failed:",
                emailError.message
            );
        }

        const safeAdmin = await Admin.findById(savedAdmin._id)
            .select("-password");

        return res.status(201).json({
            message: "Admin registration successful!",
            status: 1,
            data: safeAdmin
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This admin email is already registered.",
                status: 0
            });
        }

        console.error("Admin registration error:", error.message);

        return res.status(500).json({
            message: "Admin registration failed.",
            status: 0
        });
    }
};

export const adminLogin = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const { password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required.",
                status: 0
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address.",
                status: 0
            });
        }

        const adminData = await Admin.findOne({ email });

        if (!adminData) {
            return res.status(401).json({
                message: "Invalid email or password.",
                status: 0
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            adminData.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password.",
                status: 0
            });
        }

        let emailSent = false;

        if (!adminData.loginEmailSent) {
            try {
                await sendAdminEmail(
                    adminData,
                    "New Login - AI Career Copilot",
                    "Login Successful",
                    "You have successfully logged in to your AI Career Copilot admin account. If this was not you, please secure your account."
                );

                adminData.loginEmailSent = true;
                await adminData.save();

                emailSent = true;
            } catch (emailError) {
                console.error(
                    "Admin login email failed:",
                    emailError.message
                );
            }
        }

        const token = generateToken(adminData, "admin");

        const safeAdmin = await Admin.findById(adminData._id)
            .select("-password");

        return res.status(200).json({
            message: "Admin login successful.",
            status: 1,
            token,
            data: safeAdmin,
            emailSent
        });
    } catch (error) {
        console.error("Admin login error:", error.message);

        return res.status(500).json({
            message: "Admin login failed.",
            status: 0
        });
    }
};