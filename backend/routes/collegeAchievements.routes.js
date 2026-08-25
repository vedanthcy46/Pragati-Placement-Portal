import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireStudentRole.js";

import {
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from "../controllers/collegeAchievements.controller.js";

import { validateCreateAchievement, validateUpdateAchievement } from "../validators/collegeAchievements.validator.js";
import { validateIdParam } from "../validators/collegeRequests.validator.js";

const router = express.Router();
router.use(authMiddleware);
router.use(requireRole("student", "college"));
router.get("/student-profile/achievements", getAchievements);
router.post("/student-profile/achievements", validateCreateAchievement, createAchievement);
router.put("/student-profile/achievements/:id", validateIdParam, validateUpdateAchievement, updateAchievement);
router.delete("/student-profile/achievements/:id", validateIdParam, deleteAchievement);

export default router;
