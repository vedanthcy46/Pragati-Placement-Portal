import * as skillsService from "../services/collegeSkills.service.js";
import { getPagination } from "../utils/pagination.js";

export const getSkills = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { skills, meta } = await skillsService.getSkills(req.user.userId, { page, limit, offset });

    res.status(200).json({
      success: true,
      data: skills,
      meta,
    });
  } catch (error) {
    next(error);
  }
};

export const createSkill = async (req, res, next) => {
  try {
    const data = await skillsService.addSkill(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSkill = async (req, res, next) => {
  try {
    const data = await skillsService.updateSkill(req.user.userId, req.params.id, req.body);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    await skillsService.deleteSkill(req.user.userId, req.params.id);

    res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};