import express from "express";
import { getSkillGap } from "../controllers/skillGapController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/api/skill-gap/:uid", authMiddleware, getSkillGap);

export default router;