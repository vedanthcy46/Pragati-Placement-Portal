import * as achievementsModel from "../models/collegeAchievements.model.js";
import * as studentProfileModel from "../models/collegeStudentProfiles.model.js";
import { httpError } from "../utils/httpError.js";
import { buildPaginationMeta } from "../utils/pagination.js";

const resolveStudentId = async (userId) => {
  const profile = await studentProfileModel.findByUserId(userId);
  if (!profile) throw httpError(404, "Student profile not found");
  return profile.id;
};

export const getAchievements = async (userId, { page, limit, offset }) => {
  const studentId = await resolveStudentId(userId);
  const { achievements, total } = await achievementsModel.findAllByStudentId(studentId, { limit, offset });
  return { achievements, meta: buildPaginationMeta(total, page, limit) };
};

export const addAchievement = async (userId, data) => {
  const studentId = await resolveStudentId(userId);
  return achievementsModel.create(studentId, data);
};

export const updateAchievement = async (userId, achievementId, data) => {
  const studentId = await resolveStudentId(userId);
  const existing = await achievementsModel.findById(achievementId, studentId);
  if (!existing) throw httpError(404, "Achievement not found");
  return achievementsModel.update(achievementId, studentId, data);
};

export const deleteAchievement = async (userId, achievementId) => {
  const studentId = await resolveStudentId(userId);
  const deleted = await achievementsModel.remove(achievementId, studentId);
  if (!deleted) throw httpError(404, "Achievement not found");
  return deleted;
};
