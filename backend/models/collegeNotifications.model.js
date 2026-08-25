import { pool } from "../config/db.js";
import {
  NOTIFICATION_UPDATE_COLUMNS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from "../constants/collegeCommunication.constants.js";

// Fetch notifications with Pagination, Search, and Filtering (B2-N1)
export const getAllNotifications = async (queryParams = {}) => {
  const {
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    search,
    audience,
    status,
  } = queryParams;

  // Sanitize & Clamp pagination parameters
  const pageNum = Math.max(1, parseInt(page, 10) || DEFAULT_PAGE);
  const limitNum = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT)
  );
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const values = [];
  let paramIndex = 1;

  // Filter: Search (title or message)
  if (search) {
    conditions.push(
      `(title ILIKE $${paramIndex} OR message ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  // Filter: Audience
  if (audience) {
    conditions.push(`audience = $${paramIndex++}`);
    values.push(audience);
  }

  // Filter: Status
  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(status);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(limitNum, offset);
  const limitIndex = paramIndex++;
  const offsetIndex = paramIndex++;

  const query = `
    SELECT
        *,
        COUNT(*) OVER() AS total_count
     FROM announcement_notifications
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${limitIndex} OFFSET $${offsetIndex};
  `;

  const { rows } = await pool.query(query, values);

  const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
  const totalPages = Math.ceil(total / limitNum) || 0;

  return {
    rows,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
  };
};

// Get notification by ID
export const getNotificationById = async (id) => {
  const { rows } = await pool.query(
    `SELECT *
     FROM announcement_notifications
     WHERE id = $1`,
    [id]
  );

  return rows[0];
};

// Create notification
export const createNotification = async ({
  announcement_id,
  title,
  message,
  audience,
  scheduled_at,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO announcement_notifications
      (announcement_id, title, message, audience, scheduled_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      announcement_id,
      title,
      message,
      audience,
      scheduled_at,
    ]
  );

  return rows[0];
};

// Update notification (Protected against SQL Column Injection - B1 & B1-FIX)
export const updateNotification = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && NOTIFICATION_UPDATE_COLUMNS.has(key)) {
      fields.push(`${key} = $${index++}`);
      values.push(value);
    }
  });

  if (fields.length === 0) {
    const err = new Error("No valid or editable fields provided for update.");
    err.statusCode = 400;
    throw err;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE announcement_notifications
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *;
  `;

  const { rows } = await pool.query(query, values);
  return rows[0];
};

// Delete notification
export const deleteNotification = async (id) => {
  const { rows } = await pool.query(
    `DELETE FROM announcement_notifications
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return rows[0];
};

// Send notification
export const sendNotification = async (id) => {
  const { rows } = await pool.query(
    `UPDATE announcement_notifications
     SET status = 'Sent',
         sent_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return rows[0];
};

// Notification history
export const getNotificationHistory = async () => {
  const { rows } = await pool.query(
    `SELECT *
     FROM announcement_notifications
     ORDER BY sent_at DESC NULLS LAST`
  );

  return rows;
};

export default {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  sendNotification,
  getNotificationHistory,
};