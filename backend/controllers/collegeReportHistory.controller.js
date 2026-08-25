import * as service from '../services/collegeReportHistory.service.js';
import { resolveCollegeForUser } from '../utils/collegeResolver.js';

const getHistory = async (req, res, next) => {
    try {
        const filters = { ...req.query };
        if (req.user?.role === 'college') {
            const college = await resolveCollegeForUser(req.user?.userId);
            if (!college) return res.status(403).json({ success: false, message: 'Forbidden: college profile required' });
            filters.collegeId = college.id;
        }

        const history = await service.listHistory(filters);

        res.status(200).json({
            success: true,
            data: history,
        });
    } catch (error) {
        next(error);
    }
};

const getHistoryById = async (req, res, next) => {
    try {
        let collegeId = null;
        if (req.user?.role === 'college') {
            const college = await resolveCollegeForUser(req.user?.userId);
            if (!college) return res.status(403).json({ success: false, message: 'Forbidden: college profile required' });
            collegeId = college.id;
        }

        const historyItem = await service.getHistoryById(req.params.id, collegeId);

        if (!historyItem) {
            return res.status(404).json({
                success: false,
                message: 'History record not found',
            });
        }

        res.status(200).json({
            success: true,
            data: historyItem,
        });
    } catch (error) {
        next(error);
    }
};

const deleteHistoryById = async (req, res, next) => {
    try {
        let collegeId = null;
        if (req.user?.role === 'college') {
            const college = await resolveCollegeForUser(req.user?.userId);
            if (!college) return res.status(403).json({ success: false, message: 'Forbidden: college profile required' });
            collegeId = college.id;
        }

        const deleted = await service.deleteHistoryById(req.params.id, collegeId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'History record not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'History record deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

export {
    getHistory,
    getHistoryById,
    deleteHistoryById,
};
