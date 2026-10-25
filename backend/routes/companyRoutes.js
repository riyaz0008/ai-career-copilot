
import express from "express";

import {
    registerCompany,
    loginCompany,
    getAllCompanies,
    updateCompanyVerification,
    getCompanyProfile,
    updateCompanyProfile
} from "../controllers/companyController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
// Logged-in Company Profile
router.get(
    "/api/company/profile",
    authMiddleware,
    getCompanyProfile
);

router.put(
    "/api/company/profile",
    authMiddleware,
    updateCompanyProfile
);

// Company Registration
router.post("/api/company/register", registerCompany);

// Company Login
router.post("/api/company/login", loginCompany);

// Admin Role Verification Middleware
const adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required",
            status: 0
        });
    }

    next();
};

// Get All Companies (Admin Only)
router.get(
    "/api/admin/companies",
    authMiddleware,
    adminOnly,
    getAllCompanies
);

// Approve or Reject Company (Admin Only)
router.put(
    "/api/admin/companies/:id/verification",
    authMiddleware,
    adminOnly,
    updateCompanyVerification
);

export default router;