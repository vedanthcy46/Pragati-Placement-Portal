import * as placementModel from "../models/collegePlacementHistories.model.js";
import * as studentProfileModel from "../models/collegeStudentProfiles.model.js";
import { httpError } from "../utils/httpError.js";

const resolveStudentId = async (userId) => {
  const profile = await studentProfileModel.findByUserId(userId);
  if (!profile) throw httpError(404, "Student profile not found");
  return profile.id;
};

export const getPlacementHistory = async (userId) => {
  const studentId = await resolveStudentId(userId);
  return placementModel.getPlacementHistory(studentId);
};

export const getAppliedCompanies = async (userId) => {
  const studentId = await resolveStudentId(userId);
  return placementModel.getAppliedCompanies(studentId);
};

export const getInterviewHistory = async (userId) => {
  const studentId = await resolveStudentId(userId);
  return placementModel.getInterviewHistory(studentId);
};

export const getOfferHistory = async (userId) => {
  const studentId = await resolveStudentId(userId);
  return placementModel.getOfferHistory(studentId);
};
