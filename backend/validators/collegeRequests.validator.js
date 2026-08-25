const validateRequestBody = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            message: 'Request body cannot be empty',
        });
    }

    next();
};

const isEmpty = (value) =>
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '');

const validateIdParam = (req, res, next) => {
    const { id } = req.params;
    if (!id || Number.isNaN(Number(id))) {
        return res.status(400).json({ success: false, errors: ['Invalid id parameter'] });
    }
    next();
};

const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !Number.isNaN(date.getTime());
};

const sanitizeInput = (req, res, next) => {
    const sources = [req.query, req.body, req.params];
    for (const source of sources) {
        if (!source || typeof source !== 'object') continue;
        for (const key of Object.keys(source)) {
            if (typeof source[key] === 'string') {
                source[key] = source[key].trim().replace(/[<>]/g, '');
            }
        }
    }

    next();
};

const validateRequiredFields = (requiredFields) => (req, res, next) => {
    const missing = requiredFields.filter((field) => !req.body[field]);

    if (missing.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missing.join(', ')}`,
        });
    }

    next();
};

const validateRequestId = (req, res, next) => {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({
            error: 'Invalid id parameter.',
        });
    }

    next();
};

const validatePagination = (req, res, next) => {
    const { page, limit } = req.query;

    if (page !== undefined) {
        const parsed = parseInt(page, 10);
        if (Number.isNaN(parsed) || parsed <= 0) {
            return res
                .status(400)
                .json({ success: false, message: 'Page must be a positive integer.' });
        }
    }

    if (limit !== undefined) {
        const parsed = parseInt(limit, 10);
        if (Number.isNaN(parsed) || parsed <= 0) {
            return res
                .status(400)
                .json({ success: false, message: 'Limit must be a positive integer.' });
        }
    }

    next();
};

const validateSchedule = (req, res, next) => {
    const { scheduled_at } = req.body || {};

    if (scheduled_at !== undefined) {
        const date = new Date(scheduled_at);

        if (Number.isNaN(date.getTime())) {
            return res.status(400).json({
                error: 'Invalid scheduled date.',
            });
        }
    }

    next();
};

export {
    isEmpty,
    isValidDate,
    sanitizeInput,
    validateIdParam,
    validatePagination,
    validateRequestBody,
    validateRequiredFields,
    validateRequestId,
    validateSchedule,
};

export default {
    isEmpty,
    isValidDate,
    sanitizeInput,
    validateIdParam,
    validatePagination,
    validateRequestBody,
    validateRequiredFields,
    validateRequestId,
    validateSchedule,
};
