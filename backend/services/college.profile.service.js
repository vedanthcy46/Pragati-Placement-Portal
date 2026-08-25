import { pool } from '../config/db.js';

export const getProfile = async (id) => { 
  const result = await pool.query(
    `SELECT * FROM colleges WHERE user_id = $1;`,
    [id]
  );
  return result.rows[0];
};

export const updateProfile = async (id, data) => {
  const existing = await getProfile(id);

  // Map input values to match PostgreSQL column names: `name`, `email`, `phone`, `address`
  const collegeName = data.name || data.college_name || null;
  const email = data.email || data.contact_email || null;
  const phone = data.phone || data.contact_phone || null;
  const address = data.address || null;

  if (!existing) {
    const insertQuery = `
      INSERT INTO colleges (user_id, name, email, phone, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const insertRes = await pool.query(insertQuery, [id, collegeName, email, phone, address]);
    return insertRes.rows[0];
  }

  const updateQuery = `
    UPDATE colleges
    SET 
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      phone = COALESCE($3, phone),
      address = COALESCE($4, address)
    WHERE user_id = $5
    RETURNING *;
  `;

  const updateRes = await pool.query(updateQuery, [collegeName, email, phone, address, id]);
  return updateRes.rows[0];
};

export const createProfile = async (data) => {
  const sanitizedData = {};
  for (const key in data) {
    sanitizedData[key] = data[key] === "" ? null : data[key];
  }

  const fields = Object.keys(sanitizedData);
  const values = Object.values(sanitizedData);
  const placeholders = values.map((_, index) => `$${index + 1}`);

  const query = `
    INSERT INTO colleges (${fields.map(f => `"${f}"`).join(", ")})
    VALUES (${placeholders.join(", ")})
    RETURNING *;
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};