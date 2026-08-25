/* college.profile.model.js - Handles college profile data operations */

import { pool } from '../config/db.js';

// TODO: Add proper validation for college-specific fields

/**
 * Finds college profile by user ID
 */
export const findByUserId = async (authUuid) => {
  const query = `SELECT * FROM college_profiles WHERE auth_uuid = $1`;
  const { rows } = await pool.query(query, [authUuid]);
  return rows[0] || null;
};

/**
 * Updates college profile fields
 */
export const updateByUserId = async (authUuid, fields) => {
  // Implement column-specific validation
  const query = `UPDATE college_profiles SET $1, $2, $3, $4, $5, $6 WHERE auth_uuid = $7`;
  // (Add actual field mapping and bind variables here)
  const { rows } = await pool.query(query, [fields.name, fields.dept, ...values, authUuid]);
  return rows[0] || null;
};

/**
 * Gets overview data for a profile
 */
export const getOverviewByUserId = async (authUuid) => {
  const query = `SELECT * FROM college_profiles v
  LEFT JOIN enrollment e ON e.student_id = v.id
  WHERE v.auth_uuid = $1`;
  const { rows } = await pool.query(query, [authUuid]);
  return rows[0] || null;
};

/**
 * Gets statistics for a student
 */
export const getStatisticsByUserId = async (userId) => {
  const query = `SELECT * FROM college_stats WHERE student_id = $1`;
  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
};
