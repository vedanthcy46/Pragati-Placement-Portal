import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../config/db.js";

dotenv.config();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "No token provided", message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      if (decoded.id !== undefined && decoded.id !== null) {
        const idNum = Number(decoded.id);
        if (Number.isInteger(idNum)) decoded.id = idNum;
      }

      if ((decoded.id === undefined || decoded.id === null) && decoded.userId) {
        if (/^\d+$/.test(String(decoded.userId))) {
          decoded.id = Number(decoded.userId);
        } else {
          decoded.userUuid = decoded.userId;
        }
      }
    }

    req.user = decoded;

    if (decoded.role === "company") {
      const userId = decoded.id || decoded.uid;
      const result = await pool.query("SELECT id FROM companies WHERE user_id = $1", [userId]);
      if (result.rows.length > 0) {
        req.user.companyId = result.rows[0].id;
      }
    }

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token expired", message: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, error: "Invalid token", message: "Invalid token" });
    }

    return res.status(401).json({ success: false, error: "Invalid token", message: "Unauthorized" });
  }
};

export default authMiddleware;
