const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Create MySQL connection using your Clever Cloud credentials
const db = mysql.createConnection({
  host: "bp2juxysn0nszxvmkkzj-mysql.services.clever-cloud.com",
  user: "udflccbdblfustx7",
  password: "qgnCvYDdKjXJIfaLe8hL",
  database: "bp2juxysn0nszxvmkkzj",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Database connected.");
  }
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
    res.json({
      user_id: user.user_id,
      type: user.role,
      username: user.username,
    });
  });
});

// ----- ADD NEW COMPLAINT ROUTE -----
app.post("/api/complaints", (req, res) => {
  const { user_id, title, description } = req.body;
  if (!user_id || !title || !description) {
    return res.status(400).json({ error: "All fields are required" });
  }
  // Insert complaint; set initial status to 'Pending'
  const sql = "INSERT INTO complaints (user_id, title, description, status, date, created_at) VALUES (?, ?, ?, 'Pending', NOW(), NOW())";
  db.query(sql, [user_id, title, description], (err, result) => {
    if (err) {
      console.error("Error inserting complaint:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ message: "Complaint added successfully", complaint_id: result.insertId });
  });
});

// ----- FETCH ALL COMPLAINTS (for admin) -----
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

// ----- FETCH A SPECIFIC COMPLAINT BY ID WITH ADMIN USERNAME -----
app.get("/api/complaints/:id", (req, res) => {
    const { id } = req.params;
    const sql = `
      SELECT c.*, u.username AS admin_username
      FROM complaints c
      LEFT JOIN users u ON c.updated_by_admin = u.user_id
      WHERE c.complaint_id = ?
    `;
    db.query(sql, [id], (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      res.json(results[0]);
    });
  });
  



// ----- UPDATE COMPLAINT STATUS (and record status update) -----
// This route updates the complaint's status in the complaints table and inserts a record into status_updates.
app.put("/api/complaints/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, admin_id } = req.body;
  if (!status || !admin_id) {
    return res.status(400).json({ error: "Status and admin_id are required" });
  }
  try {
    const [updateResult] = await db.promise().query(
      "UPDATE complaints SET status = ?, updated_by_admin = ? WHERE complaint_id = ?",
      [status, admin_id, id]
    );
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    await db.promise().query(
      "INSERT INTO status_updates (complaint_id, admin_id, update_text, update_date) VALUES (?, ?, ?, NOW())",
      [id, admin_id, status]
    );
    res.json({ message: "Complaint status updated and status update recorded successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Database error while updating status" });
  }
});

// ----- GET STATUS UPDATES FOR A COMPLAINT (with admin username) -----
app.get("/api/statusupdates/:complaintId", (req, res) => {
  const { complaintId } = req.params;
  const sql = `
    SELECT su.*, u.username AS admin_username
    FROM status_updates su
    LEFT JOIN users u ON su.admin_id = u.user_id
    WHERE su.complaint_id = ?
    ORDER BY su.update_date ASC
  `;
  db.query(sql, [complaintId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
