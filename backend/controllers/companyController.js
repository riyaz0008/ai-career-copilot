import Company from "../models/Company.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/jwtutils.js";
import { sendEmail } from "../utils/emailService.js";

const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const sendCompanyEmail = async (company, subject, heading, message) => {
    await sendEmail({
        to: company.email,
        subject,
        text: `Hello ${company.contactName},\n\n${message}\n\nAI Career Copilot Team`,
        html: `
            <div style="font-family:Arial,sans-serif;padding:24px;color:#1e293b">
                <h2 style="color:#4f46e5">AI Career Copilot</h2>
                <h3>${heading}</h3>
                <p>Hello ${company.contactName},</p>
                <p>${message}</p>
                <p><strong>AI Career Copilot Team</strong></p>
            </div>
        `
    });
};

// Register Company
export const registerCompany = async (req, res) => {
    try {
        const {
            companyName,
            contactName,
            password,
            website,
            phone,
            description
        } = req.body;

        const email = req.body.email?.trim().toLowerCase();

        if (!companyName || !contactName || !email || !password) {
            return res.status(400).json({
                message: "Company name, contact name, email and password are required.",
                status: 0
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address.",
                status: 0
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters.",
                status: 0
            });
        }

        const existingCompany = await Company.findOne({ email });

        if (existingCompany) {
            return res.status(409).json({
                message: "A company account with this email already exists.",
                status: 0
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const company = await Company.create({
            companyName,
            contactName,
            email,
            password: hashedPassword,
            website,
            phone,
            description,
            loginEmailSent: false
        });

        // Send registration email for every successful new registration.
        try {
            await sendCompanyEmail(
                company,
                "Company Registration - AI Career Copilot",
                "Registration Successful",
                "Your company account has been registered successfully. Your company verification is pending."
            );
        } catch (emailError) {
            console.error(
                "Company registration email failed:",
                emailError.message
            );
        }

        const safeCompany = await Company.findById(company._id)
            .select("-password");

        return res.status(201).json({
            message: "Company registered successfully. Verification is pending.",
            status: 1,
            data: safeCompany
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This company email is already registered.",
                status: 0
            });
        }

        console.error("Company registration error:", error.message);

        return res.status(500).json({
            message: "Company registration failed.",
            status: 0
        });
    }
};

// Company Login
export const loginCompany = async (req, res) => {
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

        const company = await Company.findOne({ email });

        if (!company) {
            return res.status(401).json({
                message: "Invalid email or password.",
                status: 0
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            company.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password.",
                status: 0
            });
        }

        if (company.verificationStatus === "rejected") {
            return res.status(403).json({
                message: "Company verification was rejected. Please contact the platform administrator.",
                status: 0
            });
        }

        let emailSent = false;

        if (!company.loginEmailSent) {
            try {
                await sendCompanyEmail(
                    company,
                    "New Login - AI Career Copilot",
                    "Login Successful",
                    "You have successfully logged in to your AI Career Copilot company account. If this was not you, please secure your account."
                );

                company.loginEmailSent = true;
                await company.save();

                emailSent = true;
            } catch (emailError) {
                console.error(
                    "Company login email failed:",
                    emailError.message
                );
            }
        }

        const token = generateToken(company, "recruiter");

        const safeCompany = await Company.findById(company._id)
            .select("-password");

        return res.status(200).json({
            message: company.verificationStatus === "approved"
                ? "Company login successful."
                : "Login successful. Company verification is pending.",
            status: 1,
            token,
            data: safeCompany,
            emailSent
        });
    } catch (error) {
        console.error("Company login error:", error.message);

        return res.status(500).json({
            message: "Company login failed.",
            status: 0
        });
    }
};

// Get all registered companies for Admin
export const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find()
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Companies fetched successfully.",
            status: 1,
            data: companies
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

// Approve or reject a company
export const updateCompanyVerification = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected.",
                status: 0
            });
        }

        const company = await Company.findByIdAndUpdate(
            req.params.id,
            { verificationStatus: status },
            { new: true, runValidators: true }
        ).select("-password");

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                status: 0
            });
        }

        return res.status(200).json({
            message: `Company ${status} successfully.`,
            status: 1,
            data: company
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

// Get logged-in company's profile
export const getCompanyProfile = async (req, res) => {
    try {
        if (req.user?.role !== "recruiter" || !req.user?.id) {
            return res.status(403).json({
                message: "Company access required.",
                status: 0
            });
        }

        const company = await Company.findById(req.user.id)
            .select("-password");

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                status: 0
            });
        }

        return res.status(200).json({
            message: "Company profile fetched successfully.",
            status: 1,
            data: company
        });
    } catch (error) {
        console.error("Get Company Profile Error:", error);

        return res.status(500).json({
            message: "Failed to fetch company profile.",
            status: 0
        });
    }
};

// Update logged-in company's profile
export const updateCompanyProfile = async (req, res) => {
    try {
        if (req.user?.role !== "recruiter" || !req.user?.id) {
            return res.status(403).json({
                message: "Company access required.",
                status: 0
            });
        }

        const {
            companyName,
            contactName,
            email,
            website,
            phone,
            description
        } = req.body;

        const normalizedEmail = String(email || "").trim().toLowerCase();

        if (
            !companyName?.trim() ||
            !contactName?.trim() ||
            !normalizedEmail
        ) {
            return res.status(400).json({
                message: "Company name, contact name and email are required.",
                status: 0
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address.",
                status: 0
            });
        }

        const existingCompany = await Company.findOne({
            email: normalizedEmail,
            _id: { $ne: req.user.id }
        });

        if (existingCompany) {
            return res.status(409).json({
                message: "This email is already registered with another company.",
                status: 0
            });
        }

        const company = await Company.findById(req.user.id);

        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                status: 0
            });
        }

        company.companyName = companyName.trim();
        company.contactName = contactName.trim();
        company.email = normalizedEmail;
        company.website = String(website || "").trim();
        company.phone = String(phone || "").trim();
        company.description = String(description || "").trim();

        await company.save();

        const safeCompany = await Company.findById(company._id)
            .select("-password");

        return res.status(200).json({
            message: "Company profile updated successfully.",
            status: 1,
            data: safeCompany
        });
    } catch (error) {
        console.error("Update Company Profile Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "This email is already registered.",
                status: 0
            });
        }

        return res.status(500).json({
            message: "Failed to update company profile.",
            status: 0
        });
    }
};