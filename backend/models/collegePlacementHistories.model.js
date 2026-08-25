import { pool } from "../config/db.js";

export const getPlacementHistory = async (studentId) => {
  const query = `
    SELECT id, company_name, role_applied, application_date, status, interview_date, offer_package, offer_date, remarks, created_at, updated_at
    FROM placement_history
    WHERE student_id = $1
    ORDER BY application_date DESC
  `;
  const { rows } = await pool.query(query, [studentId]);
  return rows;
};

export const getAppliedCompanies = async (studentId) => {
  const query = `
    SELECT id, company_name, role_applied, application_date, status
    FROM placement_history
    WHERE student_id = $1
    ORDER BY application_date DESC
  `;
  const { rows } = await pool.query(query, [studentId]);
  return rows;
};

export const getInterviewHistory = async (studentId) => {
  const query = `
    SELECT id, company_name, role_applied, interview_date, status
    FROM placement_history
    WHERE student_id = $1 AND interview_date IS NOT NULL
    ORDER BY interview_date DESC
  `;
  const { rows } = await pool.query(query, [studentId]);
  return rows;
};

export const getOfferHistory = async (studentId) => {
  const query = `
    SELECT id, company_name, role_applied, offer_date, offer_package, status
    FROM placement_history
    WHERE student_id = $1 AND (status IN ('Offered', 'Accepted') OR offer_date IS NOT NULL)
    ORDER BY offer_date DESC
  `;
  const { rows } = await pool.query(query, [studentId]);
  return rows;
};

export const updateOfferStatus = async (studentId, recordId, status) => {
  const query = `
    UPDATE placement_history
    SET status = $3, updated_at = NOW()
    WHERE id = $2 AND student_id = $1 AND status = 'Offered'
    RETURNING id, company_name, role_applied, offer_date, offer_package, status
  `;
  const { rows } = await pool.query(query, [studentId, recordId, status]);
  return rows[0] || null;
};
