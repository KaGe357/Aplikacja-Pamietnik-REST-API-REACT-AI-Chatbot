const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

// 🔸 Register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: "Użytkownik już istnieje" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, hashedPassword]
    );

    res.json({ msg: "✅ Rejestracja udana" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("❌ Błąd serwera");
  }
});

// 🔸 Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ msg: "Nieprawidłowe dane" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Nieprawidłowe dane" });
    }

    const token = jwt.sign({ id: user.rows[0].id }, "sekretnyklucz", {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("❌ Błąd serwera");
  }
});

module.exports = router;
