import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireStudentRole.js";

import {
  getPlacementHistory,
  getAppliedCompanies,
  getInterviewHistory,
  getOfferHistory,
} from "../controllers/collegePlacementHistories.controller.js";

const router = express.Router();
router.use(authMiddleware);
router.use(requireRole("student", "college"));
router.get("/student-profile/placements", getPlacementHistory);
router.get("/student-profile/applied-companies", getAppliedCompanies);
router.get("/student-profile/interviews", getInterviewHistory);
router.get("/student-profile/offers", getOfferHistory);

export default router;
