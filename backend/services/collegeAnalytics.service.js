/**
 * Location: backend/services/collegeAnalytics.service.js
 */
import * as collegeAnalyticsModel from "../models/collegeAnalytics.model.js";

/**
 * Gets dashboard analytics (high-level KPIs).
 */
export const getDashboardAnalytics = async (collegeId, query = {}) => {
  const data = await collegeAnalyticsModel.getDashboardAnalytics(collegeId);
  return {
    success: true,
    data,
  };
};

/**
 * Gets overview statistics (often mirrors dashboard analytics).
 */
export const getOverviewStatistics = async (collegeId, query = {}) => {
  const data = await collegeAnalyticsModel.getOverviewStatistics(collegeId);
  return {
    success: true,
    data,
  };
};

/**
 * Gets placement analytics details.
 */
export const getPlacementAnalytics = async (collegeId, query = {}) => {
  const data = await collegeAnalyticsModel.getPlacementAnalytics(collegeId);
  return {
    success: true,
    data,
  };
};

/**
 * Gets company-wise placement numbers.
 */
export const getCompanyAnalytics = async (collegeId, query = {}) => {
  const data = await collegeAnalyticsModel.getCompanyAnalytics(collegeId);
  return {
    success: true,
    data,
  };
};

/**
 * Gets department performance metrics.
 */
export const getDepartmentAnalytics = async (collegeId, query = {}) => {
  const data = await collegeAnalyticsModel.getDepartmentAnalytics(collegeId);
  return {
    success: true,
    data,
  };
};

/**
 * Gets distinct filter options (departments, courses, batches, companies).
 */
export const getFilterOptions = async (collegeId) => {
  const data = await collegeAnalyticsModel.getFilterOptions(collegeId);
  return {
    success: true,
    data,
  };
};

export default {
  getDashboardAnalytics,
  getOverviewStatistics,
  getPlacementAnalytics,
  getCompanyAnalytics,
  getDepartmentAnalytics,
  getFilterOptions,
};
