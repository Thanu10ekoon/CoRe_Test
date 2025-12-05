const express = require("express");
const router = express.Router();
const db = require("../db");

// Login route (only checks user_id)
router.post("/login", (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Query to check if user exists
  const query = "SELECT user_id, username, role FROM CoReMSusers WHERE user_id = ?";
  
  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid User ID" });
    }

    const user = results[0];
    
    // Send back user details and role
    res.json({
      user_id: user.user_id,
      username: user.username,
      role: user.role, // "admin" or "user"
    });
  });
});

module.exports = router;
