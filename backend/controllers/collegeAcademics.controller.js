import * as academicService from "../services/collegeAcademics.service.js";

export const getAcademicPerformance = async (req, res, next) => {
  try {
    const data = await academicService.getAcademicPerformance(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSemesterResults = async (req, res, next) => {
  try {
    const semester = Number(req.query.semester);
    const data = await academicService.getSemesterPerformance(req.user.userId, semester);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getCGPATrend = async (req, res, next) => {
  try {
    const data = await academicService.getCGPATrend(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAttendance = async (req, res, next) => {
  try {
    const data = await academicService.getAttendance(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
