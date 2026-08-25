import * as academicModel from "../models/collegeAcademics.model.js";
import * as studentProfileModel from "../models/collegeStudentProfiles.model.js";
import { httpError } from "../utils/httpError.js";

const resolveStudentId = async (userId) => {
  const profile = await studentProfileModel.findByUserId(userId);
  if (!profile) throw httpError(404, "Student profile not found");
  return profile.id;
};

export const getAcademicPerformance = async (userId) => {
  const studentId = await resolveStudentId(userId);
  return academicModel.getAcademicPerformance(studentId);
};

export const getSemesterPerformance = async (userId, semester) => {
  const studentId = await resolveStudentId(userId);
  const record = await academicModel.getSemesterResults(studentId, semester);
  if (!record) throw httpError(404, "No academic record found for this semester");
  return record;
};

export const getCGPATrend = async (userId) => {
  const studentId = await resolveStudentId(userId);
  const trend = await academicModel.getCGPATrend(studentId);
  return trend.map((row) => ({
    semester: row.semester,
    cgpa: row.cgpa_till_date !== null ? parseFloat(row.cgpa_till_date) : null,
  }));
};

export const getAttendance = async (userId) => {
  const studentId = await resolveStudentId(userId);
  const records = await academicModel.getAttendance(studentId);
  const withData = records.filter((r) => r.attendance_percentage !== null);
  const overallAverage = withData.length
    ? (withData.reduce((sum, r) => sum + parseFloat(r.attendance_percentage), 0) / withData.length).toFixed(2)
    : null;

  return {
    overallAverage,
    bySemester: records.map((row) => ({
      semester: row.semester,
      attendancePercentage: row.attendance_percentage !== null ? parseFloat(row.attendance_percentage) : null,
    })),
  };
};
