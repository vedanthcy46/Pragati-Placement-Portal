import {
  REPORT_FORMATS,
  REPORT_STATUSES,
  REPORT_TYPES,
} from '../constants/collegeReportsGeneration.constants.js';

/**
 * Enriches report content with the real values captured at generation time.
 * This function NEVER fabricates data: when the source content has no
 * records, chart data, or summary, it returns honest empty values so the
 * preview/PDF/export render "no data" states instead of invented CSE/ECE
 * sample rows.
 */
export const buildDynamicReportContent = (inputContent = {}, type = 'placement', title = '') => {
  const content = typeof inputContent === 'string' ? JSON.parse(inputContent || '{}') : { ...inputContent };

  const dept = content.department || '';
  const comp = content.company || '';
  const batch = content.batch || '';

  const summary = content.summary || {
    totalRegistered: 0,
    totalPlaced: 0,
    placementRate: 0,
    averagePackage: 0,
    highestPackage: 0,
  };

  const filtersApplied = content.filtersApplied || {
    department: dept || 'All Departments',
    company: comp || 'All Companies',
    batch: batch || 'All Batches',
  };

  const records = Array.isArray(content.records) ? content.records : [];

  const chartData = Array.isArray(content.chartData) ? content.chartData : [];

  return {
    ...content,
    department: dept,
    company: comp,
    batch,
    generatedBy: content.generatedBy || 'Placement Officer',
    description: content.description || `Comprehensive ${type} report compiled for the selected parameters.`,
    filtersApplied,
    summary,
    records,
    chartData,
  };
};

const normalizeType = (value) => {
  const normalized = typeof value === 'string' ? value.toLowerCase() : '';
  return Object.values(REPORT_TYPES).includes(normalized) ? normalized : REPORT_TYPES.DASHBOARD;
};

const normalizeFormat = (value) => {
  const normalized = typeof value === 'string' ? value.toLowerCase() : '';
  return Object.values(REPORT_FORMATS).includes(normalized) ? normalized : REPORT_FORMATS.JSON;
};

const buildReportPayload = ({
  title,
  type,
  format,
  content,
  createdBy,
  collegeId,
  status = REPORT_STATUSES.COMPLETED,
} = {}) => {
  const normType = normalizeType(type);
  const enrichedContent = buildDynamicReportContent(content, normType, title);

  return {
    title: title || 'Generated Report',
    type: normType,
    format: normalizeFormat(format),
    content: enrichedContent,
    createdBy,
    collegeId,
    status,
  };
};

const buildReportSummary = (report = {}) => ({
  id: report.id || null,
  title: report.title || 'Generated Report',
  type: normalizeType(report.type),
  status: report.status || REPORT_STATUSES.COMPLETED,
  format: normalizeFormat(report.format),
  generatedAt: report.createdAt || report.created_at || null,
});

export {
  buildReportPayload,
  buildReportSummary,
};