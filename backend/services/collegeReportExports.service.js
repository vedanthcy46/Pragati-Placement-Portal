import * as model from '../models/collegeReportExports.model.js';
import * as reportModel from '../models/collegeReports.model.js';
import { convertToCSV, getExportContent, normalizeExportFormat } from '../utils/exportHelper.js';
import { REPORT_FORMATS, EXPORT_STATUSES } from '../constants/collegeReportsGeneration.constants.js';

const listExports = async (filters = {}) => {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const [exportsData, total] = await Promise.all([
        model.getExports({
            ...filters,
            page,
            limit,
            offset,
        }),
        model.countExports({
            status: filters.status,
            collegeId: filters.collegeId,
        }),
    ]);

    return {
        exports: exportsData,
        page,
        limit,
        total,
    };
};

const createExport = async (payload = {}, collegeId = null) => {
    if (collegeId !== undefined && collegeId !== null) {
        const reportId = payload.reportId || payload.report_id || null;
        const report = await reportModel.getReportById(reportId, collegeId);

        if (!report) {
            const error = new Error('Report not found');
            error.status = 404;
            throw error;
        }
    }

    return model.createExport(payload);
};

const getExportById = async (id, collegeId = null) => {
    return model.getExportById(id, collegeId);
};

const exportReport = async (reportId, format = REPORT_FORMATS.PDF, collegeId = null) => {
    const normalizedFormat = normalizeExportFormat(format);
    const report = await reportModel.getReportById(reportId, collegeId);

    if (!report) {
        const error = new Error('Report not found');
        error.status = 404;
        throw error;
    }

    const exportRecord = await model.createExport({
        reportId,
        format: normalizedFormat,
        status: EXPORT_STATUSES.COMPLETED,
    });

    const content = await getExportContent(report, normalizedFormat);
    const filename = `report_${reportId}.${content.extension}`;

    if (normalizedFormat === REPORT_FORMATS.CSV || normalizedFormat === REPORT_FORMATS.EXCEL) {
        const exportPayload = typeof report.content === 'string' ? JSON.parse(report.content || '{}') : (report.content || {});
        const records = Array.isArray(exportPayload.records) ? exportPayload.records : (Array.isArray(exportPayload) ? exportPayload : []);
        const csv = convertToCSV(records, Object.keys(records[0] || {}), Object.keys(records[0] || {}));
        content.buffer = Buffer.from(csv || '', 'utf8');
        content.contentType = 'text/csv';
    }

    return {
        exportRecord,
        content,
        filename,
    };
};

export {
    listExports,
    createExport,
    getExportById,
    exportReport,
};

export default {
    listExports,
    createExport,
    getExportById,
    exportReport,
};
