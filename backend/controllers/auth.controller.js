import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const ALLOWED_ROLES = ["student", "mentor", "admin", "college", "company"];

export const login = async (req, res) => {
  try {
    const { email, password, role: requestedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Fetch user details spanning auth_users and users tables
    const result = await pool.query(
      `SELECT a.id AS auth_user_id, a.uuid_id, a.email, a.role, a.password_hash, u.id AS user_id
       FROM auth_users a
       LEFT JOIN users u ON u.auth_user_id = a.id
       WHERE a.email = $1`,
      [email],
    );

    if (!result.rows.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Override role if explicitly requested (e.g., for college module access)
    // This allows college users to get role: 'college' even if DB stores 'student'
    let effectiveRole = user.role;
    if (requestedRole === "college" && ALLOWED_ROLES.includes(user.role)) {
      effectiveRole = "college";
    }

    const token = jwt.sign(
      {
        id: user.user_id,
        uid: user.user_id,
        userId: user.uuid_id,
        authUserId: user.auth_user_id,
        email: user.email,
        role: effectiveRole, // Use effective role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      success: true,
      token,
      userId: user.uuid_id,
      role: effectiveRole, // Return effective role
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed due to an internal server error",
    });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and role are required",
      });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }

    const existing = await pool.query(
      `SELECT id FROM auth_users WHERE email = $1`,
      [email],
    );

    if (existing.rows.length) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const uuid = randomUUID();

    // Initialize DB transaction variables
    const client = await pool.connect();
    let authUserId;
    let userId;
    let companyId = null;

    try {
      await client.query("BEGIN");

      // 1. Insert into auth_users
      const authUserResult = await client.query(
        `INSERT INTO auth_users (email, password_hash, role, uuid_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [email, passwordHash, role, uuid],
      );
      authUserId = authUserResult.rows[0].id;

      // 2. Insert into users
      const userResult = await client.query(
        `INSERT INTO users (auth_user_id, email, role, created_at, phone, username)
         VALUES ($1, $2, $3, NOW(), NULL, $4)
         RETURNING id`,
        [authUserId, email, role, email.split("@")[0]],
      );
      userId = userResult.rows[0].id;

      // 3. Role-specific table insertions
      if (role === "mentor") {
        await client.query(`INSERT INTO mentors (user_id) VALUES ($1)`, [
          userId,
        ]);
      } else if (role === "company") {
        const companyResult = await client.query(
          `INSERT INTO companies (user_id, name, email)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [userId, `${email.split("@")[0]} Corporate`, email],
        );
        companyId = companyResult.rows[0].id;
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err; // Pass to outer catch block
    } finally {
      client.release(); // Crucial: Prevents connection pool leaks
    }

    // Generate Token
    const token = jwt.sign(
      {
        id: userId,
        uid: userId,
        userId: uuid,
        authUserId: authUserId,
        email,
        role,
        companyId, // Null if not a company
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      success: true,
      userId: uuid,
      token,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed due to an internal server error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const authUserId = req.user?.authUserId || req.user?.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // 1. Fetch user authentication record
    const result = await pool.query(
      `SELECT a.id, a.password_hash 
       FROM auth_users a
       LEFT JOIN users u ON u.auth_user_id = a.id
       WHERE a.id = $1 OR u.id = $1`,
      [authUserId]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const user = result.rows[0];

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password",
      });
    }

    // 3. Reject if new password is identical to current password
    const isSameAsOld = await bcrypt.compare(newPassword, user.password_hash);
    if (isSameAsOld) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as your current password",
      });
    }

    // 4. Hash and update new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE auth_users SET password_hash = $1 WHERE id = $2`,
      [newPasswordHash, user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password due to an internal server error",
    });
  }
};