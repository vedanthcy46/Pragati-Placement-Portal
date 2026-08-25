import { pool } from "../config/db.js";

export const findAllByStudentId = async (studentId, { limit, offset }) => {
  const dataQuery = `
    SELECT id, student_id, skill_name, proficiency_level, created_at, updated_at
    FROM student_skills
    WHERE student_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const countQuery = `SELECT COUNT(*) FROM student_skills WHERE student_id = $1`;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [studentId, limit, offset]),
    pool.query(countQuery, [studentId]),
  ]);

  return {
    skills: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
};

export const findById = async (id, studentId) => {
  const query = `SELECT * FROM student_skills WHERE id = $1 AND student_id = $2`;
  const { rows } = await pool.query(query, [id, studentId]);
  return rows[0] || null;
};

export const create = async (studentId, { skill_name, proficiency_level }) => {
  // Duplicate (student_id, skill_name) is caught by the DB's UNIQUE
  // constraint and handled generically by errorMiddleware.js (pg code 23505)
  const query = `
    INSERT INTO student_skills (student_id, skill_name, proficiency_level)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [studentId, skill_name, proficiency_level]);
  return rows[0];
};

export const update = async (id, studentId, { skill_name, proficiency_level }) => {
  const query = `
    UPDATE student_skills
    SET skill_name = COALESCE($1, skill_name),
        proficiency_level = COALESCE($2, proficiency_level),
        updated_at = NOW()
    WHERE id = $3 AND student_id = $4
    RETURNING *
  `;
  const { rows } = await pool.query(query, [skill_name, proficiency_level, id, studentId]);
  return rows[0] || null;
};

export const remove = async (id, studentId) => {
  const query = `DELETE FROM student_skills WHERE id = $1 AND student_id = $2 RETURNING id`;
  const { rows } = await pool.query(query, [id, studentId]);
  return rows[0] || null;
};
