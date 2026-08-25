import * as skillsModel from "../models/collegeSkills.model.js";
import * as studentProfileModel from "../models/collegeStudentProfiles.model.js";
import { httpError } from "../utils/httpError.js";
import { buildPaginationMeta } from "../utils/pagination.js";

// Every module service resolves user_id -> student_profiles.id first,
// so ownership (a student can only touch their own rows) is enforced
// in one place instead of repeated in every model query.
const resolveStudentId = async (userId) => {
  const profile = await studentProfileModel.findByUserId(userId);
  if (!profile) throw httpError(404, "Student profile not found");
  return profile.id;
};

export const getSkills = async (userId, { page, limit, offset }) => {
  const studentId = await resolveStudentId(userId);
  const { skills, total } = await skillsModel.findAllByStudentId(studentId, { limit, offset });
  return { skills, meta: buildPaginationMeta(total, page, limit) };
};

export const addSkill = async (userId, skillData) => {
  const studentId = await resolveStudentId(userId);
  return skillsModel.create(studentId, skillData);
};

export const updateSkill = async (userId, skillId, skillData) => {
  const studentId = await resolveStudentId(userId);

  const existing = await skillsModel.findById(skillId, studentId);
  if (!existing) throw httpError(404, "Skill not found");

  return skillsModel.update(skillId, studentId, skillData);
};

export const deleteSkill = async (userId, skillId) => {
  const studentId = await resolveStudentId(userId);

  const deleted = await skillsModel.remove(skillId, studentId);
  if (!deleted) throw httpError(404, "Skill not found");

  return deleted;
};
