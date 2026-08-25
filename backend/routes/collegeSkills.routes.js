import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireStudentRole.js";

import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "../controllers/collegeSkills.controller.js";

import { validateCreateSkill, validateUpdateSkill } from "../validators/collegeSkills.validator.js";
import { validateIdParam } from "../validators/collegeRequests.validator.js";

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole("student", "college"));
router.get("/student-profile/skills", getSkills);
router.post("/student-profile/skills", validateCreateSkill, createSkill);
router.put("/student-profile/skills/:id", validateIdParam, validateUpdateSkill, updateSkill);
router.delete("/student-profile/skills/:id", validateIdParam, deleteSkill);

export default router;
