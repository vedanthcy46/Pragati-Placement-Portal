import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getPerformanceAnalytics } from "../controllers/collegePerformanceAnalytics.controller.js";
import { requireRole } from "../middleware/requireStudentRole.js";

const router = express.Router();
router.use(authMiddleware);
router.use(requireRole("student", "college"));
router.get("/student-profile/performance-analytics", getPerformanceAnalytics);

export default router;
