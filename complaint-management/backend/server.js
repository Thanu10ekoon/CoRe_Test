// server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require("dotenv").config();
const { google } = require('googleapis');

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

// Multer configuration: we'll use memory storage when Google Drive integration
// is enabled so we can stream the file to Drive. Otherwise, we save to disk
// (development fallback) and serve from /uploads.
let upload;
const useDrive = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT && process.env.DRIVE_FOLDER_ID);
if (useDrive) {
  // memory storage to get file.buffer
  const memoryStorage = multer.memoryStorage();
  upload = multer({ storage: memoryStorage });
} else {
  // disk storage fallback (development/local)
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
  upload = multer({ storage });
}

// Helper: initialize Google Drive client if configured
let driveClient = null;
if (useDrive) {
  try {
    // GOOGLE_SERVICE_ACCOUNT should be a JSON string (service account key)
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const jwtClient = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    driveClient = google.drive({ version: 'v3', auth: jwtClient });
    console.log('Google Drive client initialized');
  } catch (err) {
    console.error('Failed to initialize Google Drive client:', err.message);
    driveClient = null;
  }
}

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
/*
  /api/upload

  Behavior:
  - If GOOGLE_SERVICE_ACCOUNT and DRIVE_FOLDER_ID env vars are set (and valid),
    the server will upload the incoming file field `photo` to the specified
    Google Drive folder and return the Google Drive file's webViewLink.
    NOTE: For files to be viewable via the returned link, the Drive folder
    must be shared appropriately (see instructions below). Easiest is to
    share the folder with the service account email and then programmatically
    set the file's permissions to allow anyone with link to view.

  - If Drive is not configured, the server falls back to saving the file
    in the local `uploads/` directory and returns a static URL under /uploads.

  Required environment variables when using Drive:
  - GOOGLE_SERVICE_ACCOUNT: the full service account JSON (stringified)
    Example: set this in Vercel as the JSON contents of the service account key.
  - DRIVE_FOLDER_ID: the id of the Google Drive folder where files should be saved.

  Important setup steps (summary):
  1) Create a Google Cloud service account, enable Drive API, and create a
     JSON key. Keep the JSON contents confidential.
  2) In Google Drive, create (or use) the target folder and share it with
     the service account's client_email (found inside the JSON key). Give Editor rights.
  3) Set the two environment variables on Vercel (or your hosting):
     - GOOGLE_SERVICE_ACCOUNT (value = JSON key contents)
     - DRIVE_FOLDER_ID (value = folder id, e.g. '1RP8tltwXzZfvdlKDeCx2ukq1-a1tUmmM')
  4) Deploy. The server will upload to Drive and return a shareable link.

*/
app.post('/api/upload', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  // If Drive is configured and client initialized, upload to Drive
  if (driveClient) {
    try {
      const fileName = req.file.originalname.replace(/[^a-z0-9_.-]/ig, '_');
      const bufferStream = require('stream').Readable.from(req.file.buffer);

      // Create the file on Drive in the target folder
      const createRes = await driveClient.files.create({
        requestBody: {
          name: `${Date.now()}-${fileName}`,
          parents: [process.env.DRIVE_FOLDER_ID]
        },
        media: {
          mimeType: req.file.mimetype,
          body: bufferStream
        },
        fields: 'id, name'
      });

      const fileId = createRes.data.id;

      // Make the file readable by anyone with the link
      await driveClient.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });

      // Get a webViewLink for the file
      const meta = await driveClient.files.get({ fileId, fields: 'webViewLink, webContentLink' });

      // Prefer webContentLink if available (direct download), otherwise webViewLink
      const fileUrl = meta.data.webContentLink || meta.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;
      return res.json({ fileUrl });
    } catch (err) {
      console.error('Drive upload failed:', err);
      // fall through to disk fallback below if configured
    }
  }

  // Fallback: write to disk (uploads/) and return local URL
  if (req.file.path) {
    // multer diskStorage sets req.file.path
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(req.file.path)}`;
    return res.json({ fileUrl });
  } else if (req.file && req.file.buffer) {
    // If we were using memory storage but Drive failed, persist to disk now
    try {
      const ext = path.extname(req.file.originalname);
      const basename = path.basename(req.file.originalname, ext).replace(/[^a-z0-9_-]/ig, '_');
      const filename = `${Date.now()}-${basename}${ext}`;
      const outPath = path.join(uploadsDir, filename);
      fs.writeFileSync(outPath, req.file.buffer);
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
      return res.json({ fileUrl });
    } catch (err) {
      console.error('Disk fallback write failed:', err);
      return res.status(500).json({ error: 'File upload failed' });
    }
  }

  return res.status(500).json({ error: 'File upload failed' });
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
