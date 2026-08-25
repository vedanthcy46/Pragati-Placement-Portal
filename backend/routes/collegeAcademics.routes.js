import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireStudentRole.js";

import {
  getAcademicPerformance,
  getSemesterResults,
  getCGPATrend,
  getAttendance,
} from "../controllers/collegeAcademics.controller.js";

import { validateSemesterQuery } from "../validators/collegeAcademics.validator.js";

const router = express.Router();
router.use(authMiddleware);
router.use(requireRole("student", "college"));

router.get("/student-profile/academics", getAcademicPerformance);
router.get("/student-profile/academics/semester", validateSemesterQuery, getSemesterResults);
router.get("/student-profile/academics/cgpa-trend", getCGPATrend);
router.get("/student-profile/attendance", getAttendance);


export default router;
