import * as model from '../models/collegeReportHistory.model.js';

const listHistory = async (filters = {}) => {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const [history, total] = await Promise.all([
        model.getHistory({
            ...filters,
            page,
            limit,
            offset,
        }),
        model.countHistory(filters.collegeId),
    ]);

    return {
        history,
        page,
        limit,
        total,
    };
};

const getHistoryById = async (id, collegeId = null) => {
    return model.getHistoryById(id, collegeId);
};

const deleteHistoryById = async (id, collegeId = null) => {
    return model.deleteHistoryById(id, collegeId);
};

export {
    listHistory,
    getHistoryById,
    deleteHistoryById,
};
