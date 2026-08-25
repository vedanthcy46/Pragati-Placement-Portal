import { pool } from "../config/db.js";

// JWT payload's "userId" is actually auth_users.uuid_id, NOT users.id or
// students.user_id. Chain: auth_users.uuid_id -> users.auth_user_id -> users.id
// -> students.user_id. Every query below joins through that chain.

export const findByUserId = async (authUuid) => {
  const query = `
    SELECT s.id, s.user_id, s.name, s.email, s.phone, s.enrollment_no, s.department, s.semester,
           s.cgpa, s.placement_status, s.profile_image, s.bio, s.created_at
    FROM student_profiles s
    JOIN users u ON u.id = s.user_id
    JOIN auth_users au ON au.id = u.auth_user_id
    WHERE au.uuid_id = $1
  `;
  const { rows } = await pool.query(query, [authUuid]);
  return rows[0] || null;
};

export const updateByUserId = async (authUuid, fields) => {
  const allowedFields = ["name", "department", "semester", "cgpa", "phone", "profile_image", "bio"];
  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const key of allowedFields) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = $${idx}`);
      values.push(fields[key]);
      idx += 1;
    }
  }

  if (setClauses.length === 0) return null;

  values.push(authUuid);

  const query = `
    UPDATE student_profiles
    SET ${setClauses.join(", ")}
    WHERE user_id = (
      SELECT u.id FROM users u
      JOIN auth_users au ON au.id = u.auth_user_id
      WHERE au.uuid_id = $${idx}
    )
    RETURNING *
  `;
  const { rows } = await pool.query(query, values);
  return rows[0] || null;
};

export const getOverviewByUserId = async (authUuid) => {
  const query = `
    SELECT
      s.id, s.name, s.enrollment_no, s.department, s.cgpa, s.placement_status,
      (SELECT COUNT(*) FROM student_skills WHERE student_id = s.id)       AS total_skills,
      (SELECT COUNT(*) FROM certifications WHERE student_id = s.id)       AS total_certifications,
      (SELECT COUNT(*) FROM internships WHERE student_id = s.id)          AS total_internships,
      (SELECT COUNT(*) FROM projects WHERE student_id = s.id)             AS total_projects,
      (SELECT COUNT(*) FROM achievements WHERE student_id = s.id)         AS total_achievements,
      (SELECT COUNT(*) FROM placement_history
        WHERE student_id = s.id AND status = 'Offered')                   AS total_offers
    FROM student_profiles s
    JOIN users u ON u.id = s.user_id
    JOIN auth_users au ON au.id = u.auth_user_id
    WHERE au.uuid_id = $1
  `;
  const { rows } = await pool.query(query, [authUuid]);
  return rows[0] || null;
};

export const getStatisticsByStudentId = async (studentId) => {
  const query = `
    SELECT
      (SELECT AVG(sgpa) FROM academic_records WHERE student_id = $1)                 AS average_sgpa,
      (SELECT AVG(attendance_percentage) FROM academic_records WHERE student_id = $1) AS average_attendance,
      (SELECT COUNT(*) FROM placement_history WHERE student_id = $1)                 AS total_applications,
      (SELECT COUNT(*) FROM placement_history WHERE student_id = $1 AND status = 'Offered') AS total_offers
  `;
  const { rows } = await pool.query(query, [studentId]);
  return rows[0] || null;
};
