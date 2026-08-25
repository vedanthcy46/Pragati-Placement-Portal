import * as studentProfileModel from "../models/collegeStudentProfiles.model.js";
import { httpError } from "../utils/httpError.js";

export const getProfile = async (userId) => {
  const profile = await studentProfileModel.findByUserId(userId);
  if (!profile) throw httpError(404, "Student profile not found");
  return profile;
};

export const updateProfile = async (userId, updateData) => {
  const existing = await studentProfileModel.findByUserId(userId);
  if (!existing) throw httpError(404, "Student profile not found");

  return studentProfileModel.updateByUserId(userId, updateData);
};

export const getOverview = async (userId) => {
  const overview = await studentProfileModel.getOverviewByUserId(userId);
  if (!overview) throw httpError(404, "Student profile not found");

  // pg returns COUNT(*) as string — normalize to numbers for the frontend
  const numericFields = [
    "total_skills",
    "total_certifications",
    "total_internships",
    "total_projects",
    "total_achievements",
    "total_offers",
  ];
  numericFields.forEach((field) => {
    overview[field] = parseInt(overview[field], 10) || 0;
  });

  return overview;
};

export const getStatistics = async (userId) => {
  const profile = await studentProfileModel.findByUserId(userId);
  if (!profile) throw httpError(404, "Student profile not found");

  const stats = await studentProfileModel.getStatisticsByStudentId(profile.id);

  return {
    averageSGPA: stats.average_sgpa ? parseFloat(stats.average_sgpa).toFixed(2) : null,
    averageAttendance: stats.average_attendance ? parseFloat(stats.average_attendance).toFixed(2) : null,
    totalApplications: parseInt(stats.total_applications, 10) || 0,
    totalOffers: parseInt(stats.total_offers, 10) || 0,
  };
};
