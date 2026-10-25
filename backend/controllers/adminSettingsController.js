import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";

export const getAdminSettings = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.uid).select("-password");

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found",
                status: 0
            });
        }

        res.status(200).json({
            message: "Admin settings fetched successfully",
            status: 1,
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const updateAdminSettings = async (req, res) => {
    try {
        const updateData = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email
        };

        const updatedAdmin = await Admin.findByIdAndUpdate(
            req.params.uid,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!updatedAdmin) {
            return res.status(404).json({
                message: "Admin not found",
                status: 0
            });
        }

        res.status(200).json({
            message: "Admin profile updated successfully",
            status: 1,
            data: updatedAdmin
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

export const changeAdminPassword = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.uid);

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found",
                status: 0
            });
        }

        const comparePassword = await bcrypt.compare(
            req.body.currentPassword,
            admin.password
        );

        if (!comparePassword) {
            return res.status(200).json({
                message: "Current password is incorrect",
                status: 0
            });
        }

        if (req.body.newPassword !== req.body.confirmPassword) {
            return res.status(200).json({
                message: "New password and confirm password do not match",
                status: 0
            });
        }

        const newPassword = await bcrypt.hash(
            req.body.newPassword,
            10
        );

        admin.password = newPassword;

        await admin.save();

        res.status(200).json({
            message: "Password changed successfully",
            status: 1
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};