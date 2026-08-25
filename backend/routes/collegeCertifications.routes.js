import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireStudentRole.js";

import {
  getCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
} from "../controllers/collegeCertifications.controller.js";

import { validateCreateCertification, validateUpdateCertification } from "../validators/collegeCertifications.validator.js";
import { validateIdParam } from "../validators/collegeRequests.validator.js";

const router = express.Router();
router.use(authMiddleware);
router.use(requireRole("student", "college"));
router.get("/student-profile/certifications", getCertifications);
router.post("/student-profile/certifications", validateCreateCertification, createCertification);
router.put("/student-profile/certifications/:id", validateIdParam, validateUpdateCertification, updateCertification);
router.delete("/student-profile/certifications/:id", validateIdParam, deleteCertification);

export default router;
