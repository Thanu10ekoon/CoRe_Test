// server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

// Import routes
const authRoutes = require("./routes/authRoutes");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'complaint-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin, like mobile apps or curl requests
    if (!origin) return callback(null, true);
    // For all origins, dynamically allow them
    callback(null, true);
  },
  credentials: true
}));

// Database connection - import from db.js
const db = require('./db');

// Mount routes
app.use("/api", authRoutes);

// API Routes

// Login route moved to authRoutes.js

// Complaint submission with photo upload
app.post("/api/complaints", upload.single('photo'), (req, res) => {
  const { user_id, title, description, category } = req.body;
  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }
  
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
  const sql = `INSERT INTO CoReMScomplaints (user_id, title, description, category, photo_url, status, created_at)
               VALUES (?, ?, ?, ?, ?, 'Pending', NOW())`;

  db.query(sql, [user_id, title, description, category, photoUrl], (err, result) => {
    if (err) {
      // Delete uploaded file if database insert fails
      if (req.file) {
        fs.unlink(path.join(uploadsDir, req.file.filename), () => {});
      }
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ 
      message: "Complaint added successfully",
      complaint_id: result.insertId,
      photo_url: photoUrl
    });
  });
});

// GET complaint details by complaint id with admin details.
app.get("/api/complaints/:id", (req, res) => {
  const sql = `SELECT c.*, u.username AS admin_username, u.subrole AS admin_subrole 
               FROM CoReMScomplaints c
               LEFT JOIN CoReMSusers u ON c.updated_by_admin = u.user_id
               WHERE c.complaint_id = ?`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error('Error fetching complaint:', err);
      return res.status(500).json({ error: "Database error" });
    }
    console.log('Complaint details:', results[0]);
    res.json(results[0] || {});
  });
});

// GET complaints for an admin or full list if not filtered.
app.get("/api/complaints", (req, res) => {
  const adminId = req.query.admin_id;
  
  // Default full query including JOIN to get admin details
  const sqlAll = `SELECT c.*, u.username AS admin_username, u.subrole AS admin_subrole
                  FROM CoReMScomplaints c
                  LEFT JOIN CoReMSusers u ON c.updated_by_admin = u.user_id
                  ORDER BY c.created_at DESC`;
  
  if (adminId) {
    // Lookup the admin info first to check role.
    const getAdminSql = "SELECT * FROM CoReMSusers WHERE user_id = ?";
    db.query(getAdminSql, [adminId], (err, adminResults) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!adminResults || adminResults.length === 0) {
        return res.status(400).json({ error: "Invalid admin" });
      }
      const admin = adminResults[0];
      
      // Superadmin and Observer can see all complaints
      if (admin.role === "superadmin" || admin.role === "observer") {
        db.query(sqlAll, (err, results) => {
          if (err) return res.status(500).json({ error: "Database error" });
          res.json(results);
        });
      } else if (admin.role === "admin") {
        // Regular admin sees only complaints from their assigned categories
        const catQuery = `SELECT c.name FROM CoReMSadmin_categories ac 
                          JOIN CoReMScategories c ON ac.category_id = c.category_id 
                          WHERE ac.user_id = ?`;
        db.query(catQuery, [adminId], (err, categories) => {
          if (err) return res.status(500).json({ error: "Database error" });
          if (!categories || categories.length === 0) {
            return res.json([]); // No categories assigned
          }
          const categoryNames = categories.map(c => c.name);
          const placeholders = categoryNames.map(() => '?').join(',');
          const filteredSql = `SELECT c.*, u.username AS admin_username, u.subrole AS admin_subrole
                               FROM CoReMScomplaints c
                               LEFT JOIN CoReMSusers u ON c.updated_by_admin = u.user_id
                               WHERE c.category IN (${placeholders}) ORDER BY c.created_at DESC`;
          db.query(filteredSql, categoryNames, (err, results) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json(results);
          });
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

// ==================== CATEGORIES ROUTES ====================

// GET all categories
app.get("/api/categories", (req, res) => {
  const sql = "SELECT * FROM CoReMScategories ORDER BY name ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// POST create new category (superadmin only)
app.post("/api/categories", (req, res) => {
  const { name, description, admin_id } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "Category name is required" });
  }

  // Verify superadmin
  const checkAdminSql = "SELECT role FROM CoReMSusers WHERE user_id = ?";
  db.query(checkAdminSql, [admin_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!results[0] || results[0].role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmins can create categories" });
    }

    const insertSql = "INSERT INTO CoReMScategories (name, description) VALUES (?, ?)";
    db.query(insertSql, [name, description || null], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: "Category already exists" });
        }
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ 
        message: "Category created successfully",
        category_id: result.insertId 
      });
    });
  });
});

// DELETE category (superadmin only)
app.delete("/api/categories/:id", (req, res) => {
  const { admin_id } = req.body;
  
  // Verify superadmin
  const checkAdminSql = "SELECT role FROM CoReMSusers WHERE user_id = ?";
  db.query(checkAdminSql, [admin_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!results[0] || results[0].role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmins can delete categories" });
    }

    const deleteSql = "DELETE FROM CoReMScategories WHERE category_id = ?";
    db.query(deleteSql, [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    });
  });
});

// ==================== USER MANAGEMENT ROUTES ====================

// GET all users (superadmin only)
app.get("/api/users", (req, res) => {
  const admin_id = req.query.admin_id;
  
  // Verify superadmin
  const checkAdminSql = "SELECT role FROM CoReMSusers WHERE user_id = ?";
  db.query(checkAdminSql, [admin_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!results[0] || results[0].role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmins can view users" });
    }

    const sql = `SELECT u.user_id, u.username, u.role, u.subrole, u.created_at,
                 GROUP_CONCAT(c.name) AS categories
                 FROM CoReMSusers u
                 LEFT JOIN CoReMSadmin_categories ac ON u.user_id = ac.user_id
                 LEFT JOIN CoReMScategories c ON ac.category_id = c.category_id
                 GROUP BY u.user_id
                 ORDER BY u.created_at DESC`;
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results);
    });
  });
});

// PUT update user role (superadmin only)
app.put("/api/users/:id/role", (req, res) => {
  const { role, categories, admin_id } = req.body;
  const userId = req.params.id;
  
  const validRoles = ["user", "observer", "admin", "superadmin"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  // Verify superadmin
  const checkAdminSql = "SELECT role FROM CoReMSusers WHERE user_id = ?";
  db.query(checkAdminSql, [admin_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!results[0] || results[0].role !== "superadmin") {
      return res.status(403).json({ error: "Only superadmins can change user roles" });
    }

    // Update user role
    const updateSql = "UPDATE CoReMSusers SET role = ?, subrole = ? WHERE user_id = ?";
    const subroleValue = role === "admin" ? "CategoryAdmin" : role;
    
    db.query(updateSql, [role, subroleValue, userId], (err) => {
      if (err) return res.status(500).json({ error: "Database error" });

      // Clear existing category assignments
      const deleteCatSql = "DELETE FROM CoReMSadmin_categories WHERE user_id = ?";
      db.query(deleteCatSql, [userId], (err) => {
        if (err) return res.status(500).json({ error: "Database error" });

        // If admin, assign new categories
        if (role === "admin" && categories && categories.length > 0) {
          const categoryInserts = categories.map(catId => [userId, catId]);
          const catInsertSql = "INSERT INTO CoReMSadmin_categories (user_id, category_id) VALUES ?";
          
          db.query(catInsertSql, [categoryInserts], (err) => {
            if (err) {
              console.error("Error assigning categories:", err);
            }
            res.json({ message: "User role updated successfully" });
          });
        } else {
          res.json({ message: "User role updated successfully" });
        }
      });
    });
  });
});

// GET user's assigned categories
app.get("/api/users/:id/categories", (req, res) => {
  const sql = `SELECT c.category_id, c.name 
               FROM CoReMSadmin_categories ac 
               JOIN CoReMScategories c ON ac.category_id = c.category_id 
               WHERE ac.user_id = ?`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Export for Vercel
module.exports = app;

// Start server (unless running on Vercel)
// Vercel will not have PORT defined and will handle the app itself
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
