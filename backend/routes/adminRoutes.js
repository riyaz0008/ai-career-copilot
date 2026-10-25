import express from "express";
import {
    addAdmin,
    adminLogin
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/api/add-admin", addAdmin);
router.post("/api/admin-login", adminLogin);

export default router;