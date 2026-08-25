import * as service from '../services/collegeReportsAnalytics.service.js';

const getCompaniesAnalytics = async (req, res, next) => {
  try {
    const data = await service.getCompaniesAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getDepartmentsAnalytics = async (req, res, next) => {
  try {
    const data = await service.getDepartmentsAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getStudentsAnalytics = async (req, res, next) => {
  try {
    const data = await service.getStudentsAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const exportAnalyticsPdf = async (req, res, next) => {
  try {
    const type = req.query.type;
    const exportResult = await service.exportAnalyticsPdf(type);
    res.setHeader('Content-Type', exportResult.content.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
    res.status(200).send(exportResult.content.buffer);
  } catch (error) {
    next(error);
  }
};

export {
  getCompaniesAnalytics,
  getDepartmentsAnalytics,
  getStudentsAnalytics,
  exportAnalyticsPdf,
};
