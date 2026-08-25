import * as analyticsModel from "../models/collegePerformanceAnalytics.model.js";
import * as studentProfileModel from "../models/collegeStudentProfiles.model.js";
import { httpError } from "../utils/httpError.js";

const resolveStudentId = async (userId) => {
  const profile = await studentProfileModel.findByUserId(userId);
  if (!profile) throw httpError(404, "Student profile not found");
  return profile.id;
};

// Simple 0-100 readiness score based on CGPA + activity counts.
// Weights are a starting point -- confirm exact formula/thresholds with
// the reviewer or frontend owner if the frontend expects a specific one.
const calculateReadinessScore = (metrics) => {
  let score = 0;
  const cgpa = parseFloat(metrics.cgpa) || 0;
  score += Math.min((cgpa / 10) * 30, 30);
  score += Math.min(metrics.total_skills * 5, 20);
  score += Math.min(metrics.total_certifications * 5, 15);
  score += Math.min(metrics.total_internships * 10, 15);
  score += Math.min(metrics.total_projects * 5, 10);
  score += Math.min(metrics.total_achievements * 2, 10);
  return Math.round(Math.min(score, 100));
};

export const getPerformanceAnalytics = async (userId) => {
  const studentId = await resolveStudentId(userId);
  const metrics = await analyticsModel.getPerformanceMetrics(studentId);
  if (!metrics) throw httpError(404, "Student profile not found");

  const numericFields = [
    "total_skills", "total_certifications", "total_internships",
    "total_projects", "total_achievements", "total_applications", "total_offers",
  ];
  numericFields.forEach((field) => {
    metrics[field] = parseInt(metrics[field], 10) || 0;
  });

  return {
    cgpa: metrics.cgpa !== null ? parseFloat(metrics.cgpa) : null,
    placementStatus: metrics.placement_status,
    averageAttendance: metrics.average_attendance ? parseFloat(metrics.average_attendance).toFixed(2) : null,
    totalSkills: metrics.total_skills,
    totalCertifications: metrics.total_certifications,
    totalInternships: metrics.total_internships,
    totalProjects: metrics.total_projects,
    totalAchievements: metrics.total_achievements,
    totalApplications: metrics.total_applications,
    totalOffers: metrics.total_offers,
    readinessScore: calculateReadinessScore(metrics),
  };
};
