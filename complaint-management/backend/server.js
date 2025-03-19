const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection (Clever Cloud credentials)
const db = mysql.createConnection({
  host: "bp2juxysn0nszxvmkkzj-mysql.services.clever-cloud.com",
  user: "udflccbdblfustx7",
  password: "qgnCvYDdKjXJIfaLe8hL",
  database: "bp2juxysn0nszxvmkkzj",
});

db.connect((err) => {
  if (err) console.error("Database connection failed:", err);
  else console.log("Database connected.");
});

// ----- LOGIN ROUTE -----
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0 || results[0].password !== password) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    const user = results[0];
    res.json({ user_id: user.user_id, type: user.role, username: user.username });
  });
});

// ----- ADD NEW COMPLAINT -----
app.post("/api/complaints", (req, res) => {
  const { user_id, title, description } = req.body;
  if (!user_id || !title || !description) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const sql = "INSERT INTO complaints (user_id, title, description, status, date, created_at) VALUES (?, ?, ?, 'Pending', NOW(), NOW())";
  db.query(sql, [user_id, title, description], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Complaint added successfully", complaint_id: result.insertId });
  });
});

// ----- FETCH ALL COMPLAINTS (Admin) -----
app.get("/api/complaints", (req, res) => {
  const sql = "SELECT * FROM complaints ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// ----- FETCH COMPLAINTS FOR A SPECIFIC USER -----
app.get("/api/complaints/user/:user_id", (req, res) => {
  const { user_id } = req.params;
  const sql = "SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC";
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// ----- FETCH A SPECIFIC COMPLAINT -----
app.get("/api/complaints/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT c.*, u.username AS admin_username
    FROM complaints c
    LEFT JOIN users u ON c.updated_by_admin = u.user_id
    WHERE c.complaint_id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ message: "Complaint not found" });
    res.json(results[0]);
  });
});

// ----- UPDATE COMPLAINT STATUS -----
app.put("/api/complaints/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, admin_id } = req.body;
  if (!status || !admin_id) return res.status(400).json({ error: "Status and admin_id are required" });

  const updateComplaint = "UPDATE complaints SET status = ?, updated_by_admin = ? WHERE complaint_id = ?";
  const insertStatusUpdate = "INSERT INTO status_updates (complaint_id, admin_id, update_text, update_date) VALUES (?, ?, ?, NOW())";

  db.query(updateComplaint, [status, admin_id, id], (err) => {
    if (err) return res.status(500).json({ error: "Database error while updating complaint" });

    db.query(insertStatusUpdate, [id, admin_id, status], (err) => {
      if (err) return res.status(500).json({ error: "Database error while inserting status update" });

      res.json({ message: "Complaint status updated successfully" });
    });
  });
});

// ----- FETCH STATUS UPDATES -----
app.get("/api/statusupdates/:complaintId", (req, res) => {
  const { complaintId } = req.params;
  const sql = `
    SELECT su.*, u.username AS admin_username
    FROM status_updates su
    LEFT JOIN users u ON su.admin_id = u.user_id
    WHERE su.complaint_id = ?
    ORDER BY su.update_date ASC`;
  db.query(sql, [complaintId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
