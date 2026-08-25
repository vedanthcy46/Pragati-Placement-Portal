import { pool } from '../config/db.js';

const getHistory = async ({ page = 1, limit = 20, offset = 0, collegeId = null } = {}) => {
    const values = [limit, offset];
    // join generated_reports so we can enforce tenant scoping
    let query = `
        SELECT rh.id, rh.report_id AS "reportId", rh.action, rh.created_at AS "createdAt"
        FROM report_history rh
        JOIN generated_reports gr ON gr.id = rh.report_id
        WHERE 1=1
        `;

    if (typeof collegeId !== 'undefined' && collegeId !== null) {
        values.unshift(collegeId); // put collegeId at position 1 for convenience
        query = query.replace('WHERE 1=1', 'WHERE gr.college_id = $1');
        // adjust limit/offset parameters are now $2 and $3
        values.push(limit, offset);
        query += ` ORDER BY rh.created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`;
    } else {
        // no college scoping
        values[0] = limit; values[1] = offset;
        query += ` ORDER BY rh.created_at DESC LIMIT $1 OFFSET $2`;
    }

    const result = await pool.query(query, values);

    return result.rows;
};

const countHistory = async (collegeId = null) => {
    if (typeof collegeId !== 'undefined' && collegeId !== null) {
        const result = await pool.query(`SELECT COUNT(*)::INTEGER AS total FROM report_history rh JOIN generated_reports gr ON gr.id = rh.report_id WHERE gr.college_id = $1`, [collegeId]);
        return result.rows[0]?.total || 0;
    }

    const result = await pool.query(`SELECT COUNT(*)::INTEGER AS total FROM report_history`);
    return result.rows[0]?.total || 0;
};

const createHistoryEntry = async ({ reportId, action = 'generated' } = {}) => {
    const result = await pool.query(
        `
        INSERT INTO report_history (report_id, action, created_at)
        VALUES ($1, $2, NOW())
        RETURNING id, report_id AS "reportId", action, created_at AS "createdAt"
        `,
        [reportId, action]
    );

    return result.rows[0];
};

const getHistoryById = async (id, collegeId = null) => {
    // join generated_reports to allow tenant scoping
    const values = [id];
    let query = `
        SELECT rh.id, rh.report_id AS "reportId", rh.action, rh.created_at AS "createdAt"
        FROM report_history rh
        JOIN generated_reports gr ON gr.id = rh.report_id
        WHERE rh.id = $1
    `;

    if (typeof collegeId !== 'undefined' && collegeId !== null) {
        values.push(collegeId);
        query += ` AND gr.college_id = $${values.length}`;
    }

    const result = await pool.query(query, values);

    return result.rows[0] || null;
};

const deleteHistoryById = async (id, collegeId = null) => {
    if (typeof collegeId !== 'undefined' && collegeId !== null) {
        const result = await pool.query(`DELETE FROM report_history rh USING generated_reports gr WHERE rh.id = $1 AND gr.id = rh.report_id AND gr.college_id = $2 RETURNING rh.id`, [id, collegeId]);
        return result.rows[0] || null;
    }

    const result = await pool.query(
        `DELETE FROM report_history WHERE id = $1 RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
};

export {
    getHistory,
    countHistory,
    createHistoryEntry,
    getHistoryById,
    deleteHistoryById,
};
