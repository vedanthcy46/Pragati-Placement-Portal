import * as DriveModel from "../models/placementDriveModel.js";

export const getPlacementDrives = async (collegeId) => {
  return await DriveModel.getAllPlacementDrives(collegeId);
};

export const getPlacementDrive = async (id, collegeId) => {
  const drive = await DriveModel.getPlacementDriveById(id, collegeId);
  if (!drive) {
    const error = new Error("Placement Drive not found");
    error.statusCode = 404;
    throw error;
  }
  return drive;
};

export const addPlacementDrive = async (data) => {
  return await DriveModel.createPlacementDrive(data);
};

export const editPlacementDrive = async (id, data, collegeId) => {
  const drive = await DriveModel.getPlacementDriveById(id, collegeId);
  if (!drive) {
    const error = new Error("Placement Drive not found");
    error.statusCode = 404;
    throw error;
  }
  return await DriveModel.updatePlacementDrive(id, data, collegeId);
};

export const removePlacementDrive = async (id, collegeId) => {
  const drive = await DriveModel.getPlacementDriveById(id, collegeId);
  if (!drive) {
    const error = new Error("Placement Drive not found");
    error.statusCode = 404;
    throw error;
  }
  return await DriveModel.deletePlacementDrive(id, collegeId);
};

export const searchPlacementDrives = async (query, collegeId) => {
  if (!query) return await DriveModel.getAllPlacementDrives(collegeId);
  return await DriveModel.searchPlacementDrives(query, collegeId);
};

export const getDriveStatistics = async (collegeId) => {
  return await DriveModel.getDriveStatistics(collegeId);
};
