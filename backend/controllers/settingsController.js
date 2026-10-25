import User from "../models/User.js";
import bcrypt from "bcrypt";

export const getSettings = async (req, res) => {
    try {
        const user = await User.findById(req.params.uid).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User Not Found",
                status: 0
            });
        }
        res.status(200).json({
            message: "Settings Fetched Successfully",
            status: 1,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const { firstname, lastname, email, education, career } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.uid,
            {
                firstname,
                lastname,
                email,
                education,
                career
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User Not Found",
                status: 0
            });
        }

        res.status(200).json({
            message: "Account Settings Updated Successfully",
            status: 1,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "All password fields are required",
                status: 0
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "New password and confirm password do not match",
                status: 0
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters",
                status: 0
            });
        }

        const user = await User.findById(req.params.uid);

        if (!user) {
            return res.status(404).json({
                message: "User Not Found",
                status: 0
            });
        }

        const passwordMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!passwordMatch) {
            return res.status(400).json({
                message: "Current password is incorrect",
                status: 0
            });
        }

        const samePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (samePassword) {
            return res.status(400).json({
                message: "New password must be different from current password",
                status: 0
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            message: "Password Changed Successfully",
            status: 1
        });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};