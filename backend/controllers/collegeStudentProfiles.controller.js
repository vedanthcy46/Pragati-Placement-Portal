import * as studentProfileService from "../services/collegeStudentProfiles.service.js";

export const getStudentProfile = async (req, res, next) => {
  try {
    const data = await studentProfileService.getProfile(req.user.userId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudentProfile = async (req, res, next) => {
  try {
    const data = await studentProfileService.updateProfile(req.user.userId, req.body);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentOverview = async (req, res, next) => {
  try {
    const data = await studentProfileService.getOverview(req.user.userId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentStatistics = async (req, res, next) => {
  try {
    const data = await studentProfileService.getStatistics(req.user.userId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};