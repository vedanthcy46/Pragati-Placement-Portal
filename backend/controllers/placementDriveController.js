import * as DriveService from "../services/placementDriveService.js";
import { resolveCollegeId } from "../services/collegeContext.service.js";

// Get all placement drives
export const getPlacementDrives = async (req, res, next) => {
  try {
    const collegeId = await resolveCollegeId(req.user);
    const drives = await DriveService.getPlacementDrives(collegeId);
    res.status(200).json(drives);
  } catch (error) {
    next(error);
  }
};

// Get placement drive by ID
export const getPlacementDriveById = async (req, res, next) => {
  try {
    const collegeId = await resolveCollegeId(req.user);
    const drive = await DriveService.getPlacementDrive(req.params.id, collegeId);
    res.status(200).json(drive);
  } catch (error) {
    next(error);
  }
};

// Create placement drive
export const createPlacementDrive = async (req, res, next) => {
  try {
    const collegeId = await resolveCollegeId(req.user);
    if (!collegeId) {
      return res.status(403).json({ success: false, message: "College profile not found." });
    }
    const newDrive = await DriveService.addPlacementDrive({ ...req.body, college_id: collegeId });
    res.status(201).json(newDrive);
  } catch (error) {
    next(error);
  }
};

// Update placement drive
export const updatePlacementDrive = async (req, res, next) => {
  try {
    const collegeId = await resolveCollegeId(req.user);
    const updatedDrive = await DriveService.editPlacementDrive(
      req.params.id,
      req.body,
      collegeId
    );
    res.status(200).json(updatedDrive);
  } catch (error) {
    next(error);
  }
};

// Delete placement drive
export const deletePlacementDrive = async (req, res, next) => {
  try {
    const collegeId = await resolveCollegeId(req.user);
    const deletedDrive = await DriveService.removePlacementDrive(req.params.id, collegeId);

    res.status(200).json({
      success: true,
      message: "Placement Drive deleted successfully",
      data: deletedDrive,
    });
  } catch (error) {
    next(error);
  }
};

// Search placement drives
export const searchPlacementDrives = async (req, res, next) => {
  try {
    const collegeId = await resolveCollegeId(req.user);
    const { query } = req.query;

    const results = await DriveService.searchPlacementDrives(query, collegeId);

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

// Get placement drive statistics
export const getDriveStatistics = async (req, res, next) => {
  try {
    const collegeId = await resolveCollegeId(req.user);
    const stats = await DriveService.getDriveStatistics(collegeId);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};