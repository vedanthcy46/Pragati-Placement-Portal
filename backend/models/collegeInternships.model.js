import { pool } from "../config/db.js";

export const findAllByStudentId = async (studentId, { limit, offset }) => {
  const dataQuery = `
    SELECT id, student_id, company_name, role, start_date, end_date, is_ongoing, stipend, description, created_at, updated_at
    FROM internships
    WHERE student_id = $1
    ORDER BY start_date DESC
    LIMIT $2 OFFSET $3
  `;
  const countQuery = `SELECT COUNT(*) FROM internships WHERE student_id = $1`;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [studentId, limit, offset]),
    pool.query(countQuery, [studentId]),
  ]);

  return {
    internships: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
};

export const findById = async (id, studentId) => {
  const query = `SELECT * FROM internships WHERE id = $1 AND student_id = $2`;
  const { rows } = await pool.query(query, [id, studentId]);
  return rows[0] || null;
};

export const create = async (studentId, { company_name, role, start_date, end_date, is_ongoing, stipend, description }) => {
  const query = `
    INSERT INTO internships (student_id, company_name, role, start_date, end_date, is_ongoing, stipend, description)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [
    studentId, company_name, role, start_date,
    end_date || null, is_ongoing || false, stipend || null, description || null,
  ]);
  return rows[0];
};

export const update = async (id, studentId, fields) => {
  const allowed = ["company_name", "role", "start_date", "end_date", "is_ongoing", "stipend", "description"];
  const setClauses = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = $${idx}`);
      values.push(fields[key]);
      idx += 1;
    }
  }

  if (setClauses.length === 0) return findById(id, studentId);

  setClauses.push("updated_at = NOW()");
  values.push(id, studentId);

  const query = `
    UPDATE internships
    SET ${setClauses.join(", ")}
    WHERE id = $${idx} AND student_id = $${idx + 1}
    RETURNING *
  `;
  const { rows } = await pool.query(query, values);
  return rows[0] || null;
};

export const remove = async (id, studentId) => {
  const query = `DELETE FROM internships WHERE id = $1 AND student_id = $2 RETURNING id`;
  const { rows } = await pool.query(query, [id, studentId]);
  return rows[0] || null;
};
