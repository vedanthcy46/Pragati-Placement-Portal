import * as projectsModel from "../models/collegeProjects.model.js";
import * as studentProfileModel from "../models/collegeStudentProfiles.model.js";
import { httpError } from "../utils/httpError.js";
import { buildPaginationMeta } from "../utils/pagination.js";

const resolveStudentId = async (userId) => {
  const profile = await studentProfileModel.findByUserId(userId);
  if (!profile) throw httpError(404, "Student profile not found");
  return profile.id;
};

export const getProjects = async (userId, { page, limit, offset }) => {
  const studentId = await resolveStudentId(userId);
  const { projects, total } = await projectsModel.findAllByStudentId(studentId, { limit, offset });
  return { projects, meta: buildPaginationMeta(total, page, limit) };
};

export const addProject = async (userId, data) => {
  const studentId = await resolveStudentId(userId);
  return projectsModel.create(studentId, data);
};

export const updateProject = async (userId, projectId, data) => {
  const studentId = await resolveStudentId(userId);
  const existing = await projectsModel.findById(projectId, studentId);
  if (!existing) throw httpError(404, "Project not found");
  return projectsModel.update(projectId, studentId, data);
};

export const deleteProject = async (userId, projectId) => {
  const studentId = await resolveStudentId(userId);
  const deleted = await projectsModel.remove(projectId, studentId);
  if (!deleted) throw httpError(404, "Project not found");
  return deleted;
};
