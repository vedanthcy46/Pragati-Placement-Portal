import { pool } from '../config/db.js';

// ─── Get all nominations (paginated, filterable) ──────────────────────────────
// eligible_students is a VIEW over students, so the JOIN works automatically.
// collegeId scopes results to a specific college's students.
export const getAllNominations = async ({ status, company_id, college_id, limit, offset }) => {
  const params = [];
  let idx = 0;
  const conditions = ['1=1'];

  if (status) {
    idx++;
    conditions.push(`n.status = $${idx}`);
    params.push(status);
  }

  if (company_id) {
    idx++;
    conditions.push(`n.company_id = $${idx}`);
    params.push(company_id);
  }

  if (college_id) {
    idx++;
    conditions.push(`e.college_id = $${idx}`);
    params.push(college_id);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await pool.query(
    `SELECT COUNT(*)
     FROM student_nominations n
     JOIN eligible_students e ON e.id = n.student_id
     ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  const dataParams = [...params, limit, offset];

  const result = await pool.query(
    `SELECT
       n.*,
       e.name           AS student_name,
       e.enrollment_no,
       e.department,
       e.course,
       e.cgpa,
       e.batch,
       e.email,
       e.college_id
     FROM student_nominations n
     JOIN eligible_students e ON e.id = n.student_id
     ${whereClause}
     ORDER BY n.nomination_date DESC
     LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams
  );

  return { rows: result.rows, total };
};

// ─── Get single nomination by id ──────────────────────────────────────────────
export const getNominationById = async (id) => {
  const result = await pool.query(
    `SELECT
       n.*,
       e.name           AS student_name,
       e.enrollment_no,
       e.department,
       e.course,
       e.cgpa,
       e.email,
       e.college_id
     FROM student_nominations n
     JOIN eligible_students e ON e.id = n.student_id
     WHERE n.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

// ─── Create a nomination ──────────────────────────────────────────────────────
export const createNomination = async ({
  student_id,
  company_id,
  company_name,
  role,
  package: pkg,
  nominated_by,
  remarks,
}) => {
  const result = await pool.query(
    `INSERT INTO student_nominations
       (student_id, company_id, company_name, role, package, nominated_by, remarks)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [student_id, company_id, company_name, role, pkg ?? 0, nominated_by, remarks]
  );
  return result.rows[0];
};

// ─── Update nomination status / remarks ──────────────────────────────────────
export const updateNomination = async (id, { status, remarks, company_name, role, package: pkg }) => {
  const fields = []
  const values = []
  let paramCount = 0

  if (status !== undefined) {
    paramCount++
    fields.push(`status = $${paramCount}`)
    values.push(status)
  }

  if (remarks !== undefined) {
    paramCount++
    fields.push(`remarks = $${paramCount}`)
    values.push(remarks)
  }

  if (company_name !== undefined) {
    paramCount++
    fields.push(`company_name = $${paramCount}`)
    values.push(company_name)
  }

  if (role !== undefined) {
    paramCount++
    fields.push(`role = $${paramCount}`)
    values.push(role)
  }

  if (pkg !== undefined) {
    paramCount++
    fields.push(`package = $${paramCount}`)
    values.push(pkg)
  }

  if (fields.length === 0) throw new Error('No fields to update')

  paramCount++
  fields.push(`updated_at = CURRENT_TIMESTAMP`)
  values.push(id)

  const result = await pool.query(
    `UPDATE student_nominations
     SET ${fields.join(', ')}
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  )
  return result.rows[0] || null
}

// ─── Delete a nomination ──────────────────────────────────────────────────────
export const deleteNomination = async (id) => {
  const result = await pool.query(
    'DELETE FROM student_nominations WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
};

// ─── Get all nominations for a company ───────────────────────────────────────
export const getNominatedStudents = async (company_id) => {
  const result = await pool.query(
    `SELECT
       n.*,
       e.name           AS student_name,
       e.enrollment_no,
       e.department,
       e.cgpa,
       e.college_id
     FROM student_nominations n
     JOIN eligible_students e ON e.id = n.student_id
     WHERE n.company_id = $1
     ORDER BY e.cgpa DESC`,
    [company_id]
  );
  return result.rows;
};
