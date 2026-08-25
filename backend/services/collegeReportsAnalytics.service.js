import * as model from '../models/collegeReportsAnalytics.model.js';
import { generatePdfBuffer } from '../utils/exportHelper.js';

const getCompaniesAnalytics = async () => {
  return model.getCompaniesAnalytics();
};

const getDepartmentsAnalytics = async () => {
  return model.getDepartmentsAnalytics();
};

const getStudentsAnalytics = async () => {
  return model.getStudentsAnalytics();
};

const exportAnalyticsPdf = async (type) => {
  const reportType = type ? type.toLowerCase() : 'all';
  let title = 'Analytics Export';
  let data = {};

  if (reportType === 'companies') {
    title = 'Companies Analytics';
    data = await getCompaniesAnalytics();
  } else if (reportType === 'departments') {
    title = 'Departments Analytics';
    data = await getDepartmentsAnalytics();
  } else if (reportType === 'students') {
    title = 'Students Analytics';
    data = await getStudentsAnalytics();
  } else {
    title = 'Full Analytics Report';
    data = {
      companies: await getCompaniesAnalytics(),
      departments: await getDepartmentsAnalytics(),
      students: await getStudentsAnalytics(),
    };
  }

  const buffer = await generatePdfBuffer({ title, type: reportType, content: data });
  return {
    content: {
      contentType: 'application/pdf',
      extension: 'pdf',
      buffer,
    },
    filename: `analytics_${reportType}.pdf`,
  };
};

export {
  getCompaniesAnalytics,
  getDepartmentsAnalytics,
  getStudentsAnalytics,
  exportAnalyticsPdf,
};
