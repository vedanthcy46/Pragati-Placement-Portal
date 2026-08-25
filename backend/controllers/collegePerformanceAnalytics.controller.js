import * as analyticsService from "../services/collegePerformanceAnalytics.service.js";

export const getPerformanceAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getPerformanceAnalytics(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
