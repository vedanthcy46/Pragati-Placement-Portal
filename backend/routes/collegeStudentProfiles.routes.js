import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireStudentRole.js";
// NOTE: your repo has TWO auth middlewares (auth.js exports verifyToken,
// authMiddleware.js exports this default). Confirm with your lead which
// one is the actual one in use, and swap the import below if needed:
// import { verifyToken as authMiddleware } from "../middleware/auth.js";

import {
  getStudentProfile,
  updateStudentProfile,
  getStudentOverview,
  getStudentStatistics,
} from "../controllers/collegeStudentProfiles.controller.js";

import { validateUpdateStudentProfile } from "../validators/collegeStudentProfiles.validator.js";

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole("student", "college"));
router.get("/student-profile", getStudentProfile);
router.put("/student-profile", validateUpdateStudentProfile, updateStudentProfile);
router.get("/student-profile/overview", getStudentOverview);
router.get("/student-profile/statistics", getStudentStatistics);

export default router;
