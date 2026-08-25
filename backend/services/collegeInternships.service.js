import * as internshipsModel from "../models/collegeInternships.model.js";
import * as studentProfileModel from "../models/collegeStudentProfiles.model.js";
import { httpError } from "../utils/httpError.js";
import { buildPaginationMeta } from "../utils/pagination.js";

const resolveStudentId = async (userId) => {
  const profile = await studentProfileModel.findByUserId(userId);
  if (!profile) throw httpError(404, "Student profile not found");
  return profile.id;
};

export const getInternships = async (userId, { page, limit, offset }) => {
  const studentId = await resolveStudentId(userId);
  const { internships, total } = await internshipsModel.findAllByStudentId(studentId, { limit, offset });
  return { internships, meta: buildPaginationMeta(total, page, limit) };
};

export const addInternship = async (userId, data) => {
  const studentId = await resolveStudentId(userId);
  return internshipsModel.create(studentId, data);
};

export const updateInternship = async (userId, internshipId, data) => {
  const studentId = await resolveStudentId(userId);
  const existing = await internshipsModel.findById(internshipId, studentId);
  if (!existing) throw httpError(404, "Internship not found");
  return internshipsModel.update(internshipId, studentId, data);
};

export const deleteInternship = async (userId, internshipId) => {
  const studentId = await resolveStudentId(userId);
  const deleted = await internshipsModel.remove(internshipId, studentId);
  if (!deleted) throw httpError(404, "Internship not found");
  return deleted;
};
