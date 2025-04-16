// botserver.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const { NlpManager } = require('node-nlp');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Create connection pool for complaints database
const pool = mysql.createPool({
  host: "bp2juxysn0nszxvmkkzj-mysql.services.clever-cloud.com",
  user: "udflccbdblfustx7",
  password: "qgnCvYDdKjXJIfaLe8hL",
  database: "bp2juxysn0nszxvmkkzj",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verify database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Database connected via pool");
  connection.release();
});

// -------------------------
// Set up NLP Manager
// -------------------------
const manager = new NlpManager({ languages: ['en'], forceNER: true });
const modelFilePath = path.join(__dirname, 'model.nlp');

// Load pre-trained NLP model from file if it exists
if (fs.existsSync(modelFilePath)) {
  manager.load(modelFilePath);
  console.log("Loaded pre-trained NLP model from model.nlp");
} else {
  console.error("Pre-trained NLP model not found. Run train-model.js first to create model.nlp.");
  process.exit(1);
}

// -------------------------
// Complaint Management Endpoints
// -------------------------

// Add a new complaint
app.post("/api/complaints", (req, res) => {
  const { user_id, title, description } = req.body;
  if (!user_id || !title || !description) {
    return res.status(400).json({ error: "All fields are required" });
  }

  pool.query(
    "INSERT INTO CoReMScomplaints SET ?",
    {
      user_id,
      title,
      description,
      status: "Pending",
      date: mysql.raw("NOW()"),
      created_at: mysql.raw("NOW()")
    },
    (err, result) => {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).json({ error: "Database error", details: err.message });
      }
      res.status(201).json({ message: "Complaint added", complaint_id: result.insertId });
    }
  );
});

// Search complaints
app.get("/api/complaints/search", (req, res) => {
  const { q } = req.query;
  
  if (!q || q.trim() === "") {
    return res.status(200).json([]);
  }

  const searchTerms = q.trim().split(/\s+/);
  const conditions = [];
  const params = [];

  searchTerms.forEach(term => {
    const likeTerm = `%${term}%`;
    conditions.push("(title LIKE ? OR description LIKE ?)");
    params.push(likeTerm, likeTerm);
  });

  const sql = `
    SELECT complaint_id, title, description, status, created_at
    FROM CoReMScomplaints
    WHERE ${conditions.join(" OR ")}
    ORDER BY created_at DESC
    LIMIT 5
  `;

  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error("Search failed:", {
        error: err,
        sql: sql,
        params: params
      });
      return res.status(500).json({ 
        error: "Database error",
        message: err.message
      });
    }
    res.json(results);
  });
});

// Fetch a specific complaint by ID
app.get("/api/complaints/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT c.*, u.username AS admin_username
    FROM CoReMScomplaints c
    LEFT JOIN users u ON c.updated_by_admin = u.user_id
    WHERE c.complaint_id = ?`;
  pool.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Fetch error:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json(results[0]);
  });
});

// Fetch all complaints for a specific user
app.get("/api/complaints/user/:userId", (req, res) => {
  const { userId } = req.params;
  const sql = "SELECT * FROM CoReMScomplaints WHERE user_id = ? ORDER BY date DESC";
  pool.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Fetch error:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json(results);
  });
});

// -------------------------
// NLP Processing Endpoint
// -------------------------
app.post('/api/nlp', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }
  try {
    const result = await manager.process('en', text);
    res.json(result);
  } catch(err) {
    res.status(500).json({ error: "NLP processing error", details: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Chatbot backend running on port ${PORT}`));
