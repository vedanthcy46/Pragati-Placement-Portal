import express from "express";
import * as PlacementDriveController from "../controllers/placementDriveController.js";
import * as EligibilityController from "../controllers/eligibility.controller.js";
import * as InterviewRoundController from "../controllers/interviewRoundController.js";
import * as ScheduleController from "../controllers/scheduleController.js";
import * as DriveNominationsController from "../controllers/driveNominations.controller.js";
import {
  validatePlacementDrive,
  validateEligibility,
  validateInterviewRound,
  validateSchedule
} from "../validators/requestValidator.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import * as DriveModel from "../models/placementDriveModel.js";
import { resolveCollegeId } from "../services/collegeContext.service.js";

const router = express.Router();

// Optional auth helper for GET endpoints
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authMiddleware(req, res, next);
  }
  next();
};

const authCollege = [authMiddleware, roleMiddleware(["admin", "college", "college_admin"])];

// Ensures the target drive belongs to the authenticated college
const scopedDrive = async (req, res, next) => {
  try {
    const collegeId = await resolveCollegeId(req.user);
    req.collegeId = collegeId || null;
    if (collegeId) {
      const drive = await DriveModel.getPlacementDriveById(req.params.id, collegeId);
      if (!drive) {
        const error = new Error("Placement Drive not found");
        error.statusCode = 404;
        return next(error);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

// ----------------------------------------------------
// SEARCH & STATISTICS (Must be before /:id routes)
// ----------------------------------------------------
router.get("/search", optionalAuth, PlacementDriveController.searchPlacementDrives);
router.get("/statistics", optionalAuth, PlacementDriveController.getDriveStatistics);

// ----------------------------------------------------
// PLACEMENT DRIVES
// ----------------------------------------------------
router.get("/", optionalAuth, PlacementDriveController.getPlacementDrives);
router.get("/:id", optionalAuth, PlacementDriveController.getPlacementDriveById);
router.post(
  "/",
  ...authCollege,
  validatePlacementDrive,
  PlacementDriveController.createPlacementDrive
);
router.put(
  "/:id",
  ...authCollege,
  validatePlacementDrive,
  PlacementDriveController.updatePlacementDrive
);
router.delete(
  "/:id",
  ...authCollege,
  PlacementDriveController.deletePlacementDrive
);

// ----------------------------------------------------
// ELIGIBILITY
// ----------------------------------------------------
router.get("/:id/eligibility", optionalAuth, scopedDrive, EligibilityController.getEligibility);
router.post(
  "/:id/eligibility",
  ...authCollege,
  scopedDrive,
  validateEligibility,
  EligibilityController.createEligibility
);
router.put(
  "/:id/eligibility",
  ...authCollege,
  scopedDrive,
  validateEligibility,
  EligibilityController.updateEligibility
);
router.delete(
  "/:id/eligibility",
  ...authCollege,
  scopedDrive,
  EligibilityController.deleteEligibility
);

// ----------------------------------------------------
// INTERVIEW ROUNDS
// ----------------------------------------------------
router.get("/:id/rounds", optionalAuth, scopedDrive, InterviewRoundController.getInterviewRounds);
router.post(
  "/:id/rounds",
  ...authCollege,
  scopedDrive,
  validateInterviewRound,
  InterviewRoundController.createInterviewRound
);
router.put(
  "/:id/rounds/:roundId",
  ...authCollege,
  scopedDrive,
  validateInterviewRound,
  InterviewRoundController.updateInterviewRound
);
router.delete(
  "/:id/rounds/:roundId",
  ...authCollege,
  scopedDrive,
  InterviewRoundController.deleteInterviewRound
);

// ----------------------------------------------------
// SCHEDULE
// ----------------------------------------------------
router.get("/:id/schedule", optionalAuth, scopedDrive, ScheduleController.getDriveSchedule);
router.put(
  "/:id/schedule",
  ...authCollege,
  scopedDrive,
  validateSchedule,
  ScheduleController.updateSchedule
);

// ----------------------------------------------------
// DRIVE-SCOPED NOMINATIONS (College Placement Module)
// ----------------------------------------------------

// GET  /placement-drives/:id/eligible       — students eligible for this drive
router.get(
  "/:id/eligible",
  authMiddleware,
  scopedDrive,
  DriveNominationsController.getEligibleStudents
);

// GET  /placement-drives/:id/nominees       — students registered/awaiting approval
router.get(
  "/:id/nominees",
  authMiddleware,
  scopedDrive,
  DriveNominationsController.getNominees
);

// GET  /placement-drives/:id/nominations    — all nominations for a drive
router.get(
  "/:id/nominations",
  authMiddleware,
  scopedDrive,
  DriveNominationsController.getDriveNominations
);

// PUT  /placement-drives/:id/eligibility/:sid — approve or reject a student
router.put(
  "/:id/eligibility/:sid",
  ...authCollege,
  scopedDrive,
  DriveNominationsController.setStudentEligibility
);

// POST /placement-drives/:id/nominate       — bulk nominate students
router.post(
  "/:id/nominate",
  ...authCollege,
  scopedDrive,
  DriveNominationsController.nominateStudents
);

// PUT  /placement-drives/:id/shortlist      — bulk shortlist nominated students
router.put(
  "/:id/shortlist",
  ...authCollege,
  scopedDrive,
  DriveNominationsController.shortlistStudents
);
router.put(
  "/:id/select",
  ...authCollege,
  scopedDrive,
  DriveNominationsController.selectStudent
);

// DELETE /placement-drives/:id/nominations/:studentId — withdraw a nomination
router.delete(
  "/:id/nominations/:studentId",
  ...authCollege,
  scopedDrive,
  DriveNominationsController.withdrawNomination
);

export default router;

