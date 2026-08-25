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

export const updateOfferDecision = async (userId, recordId, decision) => {
  if (!["Accepted", "Declined"].includes(decision)) {
    throw httpError(400, "Invalid decision. Must be 'Accepted' or 'Declined'.");
  }
  const studentId = await resolveStudentId(userId);
  const updated = await placementModel.updateOfferStatus(studentId, recordId, decision);
  if (!updated) throw httpError(404, "Offer not found or is no longer in 'Offered' state");
  return updated;
};
