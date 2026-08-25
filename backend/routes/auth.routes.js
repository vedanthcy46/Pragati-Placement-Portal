import express from "express";
import { login, register, changePassword } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/change-password", authMiddleware, changePassword);

export default router;