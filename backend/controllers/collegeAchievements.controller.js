import * as achievementsService from "../services/collegeAchievements.service.js";
import { getPagination } from "../utils/pagination.js";

export const getAchievements = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { achievements, meta } = await achievementsService.getAchievements(req.user.userId, { page, limit, offset });
    res.status(200).json({ success: true, data: achievements, meta });
  } catch (error) {
    next(error);
  }
};

export const createAchievement = async (req, res, next) => {
  try {
    const data = await achievementsService.addAchievement(req.user.userId, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateAchievement = async (req, res, next) => {
  try {
    const data = await achievementsService.updateAchievement(req.user.userId, req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteAchievement = async (req, res, next) => {
  try {
    await achievementsService.deleteAchievement(req.user.userId, req.params.id);
    res.status(200).json({ success: true, message: "Achievement deleted successfully" });
  } catch (error) {
    next(error);
  }
};
