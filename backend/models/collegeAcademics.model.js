import { pool } from "../config/db.js";

export const getAcademicPerformance = async (studentId) => {
  const query = `
    SELECT id, semester, academic_year, sgpa, cgpa_till_date, attendance_percentage, subjects, created_at, updated_at
    FROM academic_records
    WHERE student_id = $1
    ORDER BY semester ASC
  `;
  const { rows } = await pool.query(query, [studentId]);
  return rows;
};

export const getSemesterResults = async (studentId, semester) => {
  const query = `
    SELECT id, semester, academic_year, sgpa, cgpa_till_date, attendance_percentage, subjects, created_at, updated_at
    FROM academic_records
    WHERE student_id = $1 AND semester = $2
  `;
  const { rows } = await pool.query(query, [studentId, semester]);
  return rows[0] || null;
};

export const getCGPATrend = async (studentId) => {
  const query = `
    SELECT semester, cgpa_till_date
    FROM academic_records
    WHERE student_id = $1
    ORDER BY semester ASC
  `;
  const { rows } = await pool.query(query, [studentId]);
  return rows;
};

export const getAttendance = async (studentId) => {
  const query = `
    SELECT semester, attendance_percentage
    FROM academic_records
    WHERE student_id = $1
    ORDER BY semester ASC
  `;
  const { rows } = await pool.query(query, [studentId]);
  return rows;
};
