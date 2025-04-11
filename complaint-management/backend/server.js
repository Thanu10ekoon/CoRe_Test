const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
<<<<<<< HEAD
  origin: function(origin, callback) {
    // Allow requests with no origin, like mobile apps or curl requests
    if (!origin) return callback(null, true);
    // For all origins, dynamically allow them
    callback(null, true);
  },
=======
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
>>>>>>> 2c2fac00acf9e8fbf7b626b5bc9bdaebabef8dc2
  credentials: true
}));


// Database connection
const db = mysql.createConnection({
    host: 'bp2juxysn0nszxvmkkzj-mysql.services.clever-cloud.com',  // Update with Clever Cloud host
    user: 'udflccbdblfustx7',  // Your MySQL username
    password: 'qgnCvYDdKjXJIfaLe8hL',  // Your MySQL password
    database: 'bp2juxysn0nszxvmkkzj'
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("Connected to database");
});


// API Routes
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ?";
  
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0 || results[0].password !== password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const user = results[0];
    res.json({ 
      user_id: user.user_id,
      type: user.role,
      username: user.username
    });
  });
});

app.post("/api/complaints", (req, res) => {
  const { user_id, title, description } = req.body;
  const sql = `INSERT INTO complaints (user_id, title, description, status, created_at)
               VALUES (?, ?, ?, 'Pending', NOW())`;
  
  db.query(sql, [user_id, title, description], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ 
      message: "Complaint added successfully",
      complaint_id: result.insertId
    });
  });
});

app.get("/api/complaints", (req, res) => {
  const sql = "SELECT * FROM complaints ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

app.get("/api/complaints/user/:user_id", (req, res) => {
  const sql = "SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC";
  db.query(sql, [req.params.user_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

app.get("/api/complaints/:id", (req, res) => {
  const sql = `SELECT c.*, u.username AS admin_username 
               FROM complaints c
               LEFT JOIN users u ON c.updated_by_admin = u.user_id
               WHERE c.complaint_id = ?`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results[0] || {});
  });
});

app.put("/api/complaints/:id/status", (req, res) => {
  const { status, admin_id } = req.body;
  const updateComplaint = `UPDATE complaints 
                           SET status = ?, updated_by_admin = ?
                           WHERE complaint_id = ?`;
  const insertUpdate = `INSERT INTO status_updates 
                        (complaint_id, admin_id, update_text, update_date)
                        VALUES (?, ?, ?, NOW())`;

  db.query(updateComplaint, [status, admin_id, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Update failed" });
    
    db.query(insertUpdate, [req.params.id, admin_id, status], (err) => {
      if (err) return res.status(500).json({ error: "History update failed" });
      res.json({ message: "Status updated successfully" });
    });
  });
});

app.get("/api/statusupdates/:complaintId", (req, res) => {
  const sql = `SELECT su.*, u.username AS admin_username
               FROM status_updates su
               LEFT JOIN users u ON su.admin_id = u.user_id
               WHERE su.complaint_id = ?
               ORDER BY su.update_date ASC`;
  db.query(sql, [req.params.complaintId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Vercel deployment requirements
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Export for Vercel
module.exports = app;

// Local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Local server running on port ${PORT}`));
}
