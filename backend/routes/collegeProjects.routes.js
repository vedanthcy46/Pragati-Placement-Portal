import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireStudentRole.js";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/collegeProjects.controller.js";

import { validateCreateProject, validateUpdateProject } from "../validators/collegeProjects.validator.js";
import { validateIdParam } from "../validators/collegeRequests.validator.js";

const router = express.Router();
router.use(authMiddleware);
router.use(requireRole("student", "college"));
router.get("/student-profile/projects", getProjects);
router.post("/student-profile/projects", validateCreateProject, createProject);
router.put("/student-profile/projects/:id", validateIdParam, validateUpdateProject, updateProject);
router.delete("/student-profile/projects/:id", validateIdParam, deleteProject);

export default router;
