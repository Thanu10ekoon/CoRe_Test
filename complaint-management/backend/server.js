// server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin, like mobile apps or curl requests
    if (!origin) return callback(null, true);
    // For all origins, dynamically allow them
    callback(null, true);
  },
  credentials: true
}));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Multer config for handling photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/ig, '_');
    cb(null, `${Date.now()}-${basename}${ext}`);
  }
});
const upload = multer({ storage });

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

// Login route returns user details including subrole.
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM CoReMSusers WHERE username = ?";

  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0 || results[0].password !== password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const user = results[0];
    res.json({ 
      user_id: user.user_id,
      username: user.username,
      role: user.role,
      subrole: user.subrole  // New property
    });
  });
});

// Complaint submission: now expects a "category" field.
// Accept complaint creation with optional photo_url
app.post("/api/complaints", (req, res) => {
  const { user_id, title, description, category, photo_url } = req.body;
  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }
  const sql = `INSERT INTO CoReMScomplaints (user_id, title, description, category, status, created_at, photo_url)
               VALUES (?, ?, ?, ?, 'Pending', NOW(), ?)`;

  db.query(sql, [user_id, title, description, category, photo_url || null], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ 
      message: "Complaint added successfully",
      complaint_id: result.insertId
    });
  });
});

// Photo upload endpoint
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

// GET complaint details by complaint id with admin details.
app.get("/api/complaints/:id", (req, res) => {
  const sql = `SELECT c.*, c.photo_url, u.username AS admin_username, u.subrole AS admin_subrole 
               FROM CoReMScomplaints c
               LEFT JOIN CoReMSusers u ON c.updated_by_admin = u.user_id
               WHERE c.complaint_id = ?`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results[0] || {});
  });
});

// GET complaints for an admin or full list if not filtered.
app.get("/api/complaints", (req, res) => {
  const adminId = req.query.admin_id;
  
  // Default full query including JOIN to get admin details
  const sqlAll = `SELECT c.*, c.photo_url, u.username AS admin_username, u.subrole AS admin_subrole
                  FROM CoReMScomplaints c
                  LEFT JOIN CoReMSusers u ON c.updated_by_admin = u.user_id
                  ORDER BY c.created_at DESC`;
  
  if (adminId) {
    // Lookup the admin info first to check subrole.
    const getAdminSql = "SELECT * FROM CoReMSusers WHERE user_id = ?";
    db.query(getAdminSql, [adminId], (err, adminResults) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!adminResults || adminResults.length === 0) {
        return res.status(400).json({ error: "Invalid admin" });
      }
      const admin = adminResults[0];
      // Full access: Dean or ComplaintsManager should see all complaints.
      if (admin.role === "admin" && (admin.subrole === "Dean" || admin.subrole === "ComplaintsManager")) {
        db.query(sqlAll, (err, results) => {
          if (err) return res.status(500).json({ error: "Database error" });
          res.json(results);
        });
      } else if (admin.role === "admin") {
        // Map admin subrole to the complaint category.
        const categoryMapping = {
          "Warden": "Hostel",
          "AR": "Documentation",
          "CanteenCordinator": "Canteen",
          "AcademicCordinator": "Academic",
          "SportCordinator": "Sports",
          "MaintainanceCordinator": "Maintainance",
          "Librarian": "Library",
          "SecurityCordinator": "Security"
        };
        const complaintCategory = categoryMapping[admin.subrole];
        if (!complaintCategory) {
          return res.status(400).json({ error: "No mapping for admin subrole" });
        }
        const filteredSql = `SELECT c.*, u.username AS admin_username, u.subrole AS admin_subrole
                             FROM CoReMScomplaints c
                             LEFT JOIN CoReMSusers u ON c.updated_by_admin = u.user_id
                             WHERE c.category = ? ORDER BY c.created_at DESC`;
        db.query(filteredSql, [complaintCategory], (err, results) => {
          if (err) return res.status(500).json({ error: "Database error" });
          res.json(results);
        });
      } else {
        return res.status(403).json({ error: "Unauthorized" });
      }
    });
  } else {
    // If admin_id not provided, return full list (or optionally restrict this route to admin-only).
    db.query(sqlAll, (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    });
  }
});

// Get complaints for a particular user remains unchanged.
app.get("/api/complaints/user/:user_id", (req, res) => {
  const sql = "SELECT * FROM CoReMScomplaints WHERE user_id = ? ORDER BY created_at DESC";
  db.query(sql, [req.params.user_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Update complaint status (for admins).
app.put("/api/complaints/:id/status", (req, res) => {
  const { status, admin_id } = req.body;
  const updateComplaint = `UPDATE CoReMScomplaints 
                           SET status = ?, updated_by_admin = ?
                           WHERE complaint_id = ?`;
  const insertUpdate = `INSERT INTO CoReMSstatus 
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

// GET complaint status updates remains unchanged.
app.get("/api/statusupdates/:complaintId", (req, res) => {
  const sql = `SELECT su.*, u.username AS admin_username
               FROM CoReMSstatus su
               LEFT JOIN CoReMSusers u ON su.admin_id = u.user_id
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
