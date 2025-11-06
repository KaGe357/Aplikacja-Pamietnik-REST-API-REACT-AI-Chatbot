import logger from "../config/logger.js";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  validateRegistration,
  validateLogin,
} from "../middleware/validation.js";
import db from "../config/database.js";

const router = express.Router();

//  Register
router.post("/register", validateRegistration, async (req, res) => {
  const { username, password } = req.body;

  try {
    const userExists = await db("users")
      .select("*")
      .where("username", username);

    if (userExists.length > 0) {
      return res.status(400).json({
        msg: "Użytkownik już istnieje",
        timestamp: new Date().toISOString(),
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db("users")
      .insert({
        username,
        password: hashedPassword,
      })
      .returning(["id", "username"]);

    const newUser = result[0];

    logger.info("User registered", {
      userId: newUser.id,
      username: newUser.username,
      ip: req.ip,
    });
    res.status(201).json({ msg: "✅ Rejestracja udana" });
  } catch (err) {
    logger.error("Registration error", {
      error: err.message,
      stack: err.stack,
      username,
      ip: req.ip,
    });
    res.status(500).json({
      msg: "Błąd serwera",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

//  Login
router.post("/login", validateLogin, async (req, res) => {
  const { username, password } = req.body;

  try {
    const users = await db("users").select("*").where("username", username);

    if (users.length === 0) {
      logger.warn("Login failed: user not found", {
        username,
        ip: req.ip,
      });
      return res.status(401).json({
        msg: "Nieprawidłowe dane",
        timestamp: new Date().toISOString(),
      });
    }
    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn("Login failed: invalid password", {
        userId: user.id,
        username: user.username,
        ip: req.ip,
      });
      return res.status(401).json({
        msg: "Nieprawidłowe dane",
        timestamp: new Date().toISOString(),
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    logger.error("Login error", {
      error: error.message,
      stack: error.stack,
      username,
    });
    res.status(500).json({
      msg: "Błąd serwera",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
