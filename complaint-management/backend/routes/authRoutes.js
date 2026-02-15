const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

// Signup route - supports 4 roles: user, observer, admin, superadmin
router.post("/signup", async (req, res) => {
  const { username, password, role, categories } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters long" });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters long" });
  }

  // Valid roles: user, observer, admin, superadmin
  const validRoles = ["user", "observer", "admin", "superadmin"];
  const userRole = validRoles.includes(role) ? role : "user";

  // Admin must have at least one category
  if (userRole === "admin" && (!categories || categories.length === 0)) {
    return res.status(400).json({ error: "Admin must be assigned to at least one category" });
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

      // Insert new user
      const insertQuery = "INSERT INTO CoReMSusers (username, password, role, subrole) VALUES (?, ?, ?, ?)";
      const subroleValue = userRole === "admin" ? "CategoryAdmin" : userRole;
      
      db.query(insertQuery, [username, hashedPassword, userRole, subroleValue], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Failed to create account" });
        }

        const userId = result.insertId;

        // If admin, assign categories
        if (userRole === "admin" && categories && categories.length > 0) {
          const categoryInserts = categories.map(catId => [userId, catId]);
          const catInsertQuery = "INSERT INTO CoReMSadmin_categories (user_id, category_id) VALUES ?";
          
          db.query(catInsertQuery, [categoryInserts], (err) => {
            if (err) {
              console.error("Error assigning categories:", err);
              // Don't fail the whole signup, just log the error
            }
            res.json({ 
              message: "Account created successfully",
              user_id: userId 
            });
          });
        } else {
          res.json({ 
            message: "Account created successfully",
            user_id: userId 
          });
        }
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

      // If admin, get their assigned categories
      if (user.role === "admin") {
        const catQuery = `SELECT c.category_id, c.name 
                          FROM CoReMSadmin_categories ac 
                          JOIN CoReMScategories c ON ac.category_id = c.category_id 
                          WHERE ac.user_id = ?`;
        db.query(catQuery, [user.user_id], (err, categories) => {
          if (err) {
            console.error("Error fetching categories:", err);
            categories = [];
          }
          res.json({
            user_id: user.user_id,
            username: user.username,
            role: user.role,
            subrole: user.subrole,
            categories: categories
          });
        });
      } else {
        // Send back user details and role (don't send password)
        res.json({
          user_id: user.user_id,
          username: user.username,
          role: user.role,
          subrole: user.subrole
        });
      }
    } catch (error) {
      console.error("Error comparing passwords:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
});

module.exports = router;
