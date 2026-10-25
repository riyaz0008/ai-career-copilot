import express from 'express';
import {addUser,login,sendPasswordResetOtp,verifyOtpAndResetPassword} from '../controllers/authController.js';
import { updateUser, getUserById ,getAllUsers,
     getAdminUserById,
    updateAdminUser,
    deleteUser
 } from '../controllers/userDataController.js';
import { saveCareerAssessment, getCareerAssessment } from '../controllers/careerAssessmentController.js';
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/api/add-user', addUser);
router.post('/api/login', login);
router.post(
    "/api/forgot-password/send-otp",
    sendPasswordResetOtp
);

router.post(
    "/api/forgot-password/verify-otp",
    verifyOtpAndResetPassword
);

router.put("/api/update-user/:uid", authMiddleware, updateUser);
router.put("/api/get-user/:uid", authMiddleware, getUserById);
router.get("/api/admin/users", authMiddleware, getAllUsers);
router.get("/api/admin/users/:uid", authMiddleware, getAdminUserById);
router.put("/api/admin/users/:uid", authMiddleware, updateAdminUser);
router.delete("/api/admin/users/:uid", authMiddleware, deleteUser);

router.post("/api/career-assessment/:uid", authMiddleware, saveCareerAssessment);
router.get("/api/career-assessment/:uid", authMiddleware, getCareerAssessment);

export default router;