import userData from '../models/User.js';
import bcrypt from 'bcrypt';

// Update User / My Profile API
export const updateUser = async (req, res) => {
    try {
        const id = req.params.uid;
        const saveuserData = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            education: req.body.education,
            career: req.body.career,
            skills: req.body.skills,
            goal: req.body.goal
        };

        const updateUserData = await userData.findByIdAndUpdate(id, saveuserData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ "message": "User Updated Successfully", status: 1, data: updateUserData });
    } catch (error) {
        res.status(500).json({ "message": error.message, status: 0 });
    }
};

// Get Single User by ID (Dashboard par live profile data dikhane ke liye)
export const getUserById = async (req, res) => {
    try {
        const id = req.params.uid;
        const singleUser = await userData.findById(id);
        res.status(200).json({ "message": "User fetched", status: 1, data: singleUser });
    } catch (error) {
        res.status(500).json({ "message": error.message, status: 0 });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await userData.find().select("-password").sort({ _id: -1 });
        res.status(200).json({
            message: "Users fetched successfully",
            status: 1,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

// Get Single User for Admin View
export const getAdminUserById = async (req, res) => {
    try {
        const user = await userData.findById(req.params.uid).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: 0
            });
        }

        res.status(200).json({
            message: "User fetched successfully",
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

// Update User by Admin
export const updateAdminUser = async (req, res) => {
    try {
        const id = req.params.uid;

        const updateData = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    education: req.body.education,
    career: req.body.career,
    skills: req.body.skills,
    goal: req.body.goal,
    status: req.body.status
};

        const updatedUser = await userData.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                status: 0
            });
        }

        res.status(200).json({
            message: "User updated successfully",
            status: 1,
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};

// Delete User by Admin
export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await userData.findByIdAndDelete(req.params.uid);

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found",
                status: 0
            });
        }

        res.status(200).json({
            message: "User deleted successfully",
            status: 1,
            data: deletedUser
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: 0
        });
    }
};