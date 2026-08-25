import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireStudentRole.js";

import {
  getInternships,
  createInternship,
  updateInternship,
  deleteInternship,
} from "../controllers/collegeInternships.controller.js";

import { validateCreateInternship, validateUpdateInternship } from "../validators/collegeInternships.validator.js";
import { validateIdParam } from "../validators/collegeRequests.validator.js";

const router = express.Router();
router.use(authMiddleware);
router.use(requireRole("student", "college"));
router.get("/student-profile/internships", getInternships);
router.post("/student-profile/internships", validateCreateInternship, createInternship);
router.put("/student-profile/internships/:id", validateIdParam, validateUpdateInternship, updateInternship);
router.delete("/student-profile/internships/:id", validateIdParam, deleteInternship);

export default router;
