const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

// Signup route
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters long" });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters long" });
  }

  try {
    // Check if username already exists
    const checkQuery = "SELECT username FROM CoReMSusers WHERE username = ?";
    db.query(checkQuery, [username], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length > 0) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user (default role: user, subrole: user)
      const insertQuery = "INSERT INTO CoReMSusers (username, password, role, subrole) VALUES (?, ?, 'user', 'user')";
      
      db.query(insertQuery, [username, hashedPassword], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Failed to create account" });
        }

        res.json({ 
          message: "Account created successfully",
          user_id: result.insertId 
        });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login route with username and password
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Query to get user by username
  const query = "SELECT user_id, username, password, role, subrole FROM CoReMSusers WHERE username = ?";
  
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = results[0];
    
    // Compare password with hashed password
    try {
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Send back user details and role (don't send password)
      res.json({
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        subrole: user.subrole
      });
    } catch (error) {
      console.error("Error comparing passwords:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
});

module.exports = router;
