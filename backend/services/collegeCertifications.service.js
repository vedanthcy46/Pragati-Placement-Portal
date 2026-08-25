import * as certificationsModel from "../models/collegeCertifications.model.js";
import * as studentProfileModel from "../models/collegeStudentProfiles.model.js";
import { httpError } from "../utils/httpError.js";
import { buildPaginationMeta } from "../utils/pagination.js";

const resolveStudentId = async (userId) => {
  const profile = await studentProfileModel.findByUserId(userId);
  if (!profile) throw httpError(404, "Student profile not found");
  return profile.id;
};

export const getCertifications = async (userId, { page, limit, offset }) => {
  const studentId = await resolveStudentId(userId);
  const { certifications, total } = await certificationsModel.findAllByStudentId(studentId, { limit, offset });
  return { certifications, meta: buildPaginationMeta(total, page, limit) };
};

export const addCertification = async (userId, data) => {
  const studentId = await resolveStudentId(userId);
  return certificationsModel.create(studentId, data);
};

export const updateCertification = async (userId, certId, data) => {
  const studentId = await resolveStudentId(userId);
  const existing = await certificationsModel.findById(certId, studentId);
  if (!existing) throw httpError(404, "Certification not found");
  return certificationsModel.update(certId, studentId, data);
};

export const deleteCertification = async (userId, certId) => {
  const studentId = await resolveStudentId(userId);
  const deleted = await certificationsModel.remove(certId, studentId);
  if (!deleted) throw httpError(404, "Certification not found");
  return deleted;
};
