import * as service from '../services/collegeReportExports.service.js';
import { resolveCollegeForUser } from '../utils/collegeResolver.js';

const sendExportFile = (res, exportResult) => {
    const { content, filename } = exportResult;

    if (!content || !content.buffer) {
        const error = new Error('Export content generation failed');
        error.status = 500;
        throw error;
    }

    res.setHeader('Content-Type', content.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(content.buffer);
};

const getExports = async (req, res, next) => {
    try {
        const filters = { ...req.query };

        if (req.user?.role === 'college') {
            const college = await resolveCollegeForUser(req.user?.userId);
            if (!college) {
                return res.status(403).json({ success: false, message: 'Forbidden: college profile required' });
            }
            filters.collegeId = college.id;
        }

        const exportsData = await service.listExports(filters);

        res.status(200).json({
            success: true,
            data: exportsData,
        });
    } catch (error) {
        next(error);
    }
};

const createExport = async (req, res, next) => {
    try {
        let collegeId = null;
        if (req.user?.role === 'college') {
            const college = await resolveCollegeForUser(req.user?.userId);
            if (!college) {
                return res.status(403).json({ success: false, message: 'Forbidden: college profile required' });
            }
            collegeId = college.id;
        }

        const exportRecord = await service.createExport(req.body, collegeId);

        res.status(201).json({
            success: true,
            data: exportRecord,
        });
    } catch (error) {
        next(error);
    }
};

const getExportById = async (req, res, next) => {
    try {
        let collegeId = null;
        if (req.user?.role === 'college') {
            const college = await resolveCollegeForUser(req.user?.userId);
            if (!college) {
                return res.status(403).json({ success: false, message: 'Forbidden: college profile required' });
            }
            collegeId = college.id;
        }

        const exportRecord = await service.getExportById(req.params.id, collegeId);

        if (!exportRecord) {
            return res.status(404).json({
                success: false,
                message: 'Export record not found',
                data: null,
            });
        }

        res.status(200).json({
            success: true,
            data: exportRecord,
        });
    } catch (error) {
        next(error);
    }
};

const streamExport = async (req, res, next, format) => {
    try {
        let collegeId = null;
        if (req.user?.role === 'college') {
            const college = await resolveCollegeForUser(req.user?.userId);
            if (!college) {
                return res.status(403).json({ success: false, message: 'Forbidden: college profile required' });
            }
            collegeId = college.id;
        }

        const exportResult = await service.exportReport(req.params.id, format, collegeId);
        sendExportFile(res, exportResult);
    } catch (error) {
        next(error);
    }
};

const exportReportPdf = (req, res, next) => streamExport(req, res, next, 'pdf');
const exportReportExcel = (req, res, next) => streamExport(req, res, next, 'excel');
const exportReportCsv = (req, res, next) => streamExport(req, res, next, 'csv');

export {
    getExports,
    createExport,
    getExportById,
    exportReportPdf,
    exportReportExcel,
    exportReportCsv,
};

export default {
    getExports,
    createExport,
    getExportById,
    exportReportPdf,
    exportReportExcel,
    exportReportCsv,
};
