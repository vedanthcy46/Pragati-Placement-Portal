import { pool } from "../config/db.js";

export const findAllByStudentId = async (studentId, { limit, offset }) => {
  const dataQuery = `
    SELECT id, student_id, title, description, tech_stack, project_url, github_url, start_date, end_date, created_at, updated_at
    FROM projects
    WHERE student_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const countQuery = `SELECT COUNT(*) FROM projects WHERE student_id = $1`;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, [studentId, limit, offset]),
    pool.query(countQuery, [studentId]),
  ]);

  return {
    projects: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
};

export const findById = async (id, studentId) => {
  const query = `SELECT * FROM projects WHERE id = $1 AND student_id = $2`;
  const { rows } = await pool.query(query, [id, studentId]);
  return rows[0] || null;
};

export const create = async (studentId, { title, description, tech_stack, project_url, github_url, start_date, end_date }) => {
  const query = `
    INSERT INTO projects (student_id, title, description, tech_stack, project_url, github_url, start_date, end_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [
    studentId, title, description || null, tech_stack || null,
    project_url || null, github_url || null, start_date || null, end_date || null,
  ]);
  return rows[0];
};

export const update = async (id, studentId, fields) => {
  const allowed = ["title", "description", "tech_stack", "project_url", "github_url", "start_date", "end_date"];
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
    UPDATE projects
    SET ${setClauses.join(", ")}
    WHERE id = $${idx} AND student_id = $${idx + 1}
    RETURNING *
  `;
  const { rows } = await pool.query(query, values);
  return rows[0] || null;
};

export const remove = async (id, studentId) => {
  const query = `DELETE FROM projects WHERE id = $1 AND student_id = $2 RETURNING id`;
  const { rows } = await pool.query(query, [id, studentId]);
  return rows[0] || null;
};
