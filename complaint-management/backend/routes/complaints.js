const express = require('express');
const db = require('../db');
const router = express.Router();

// Create a new complaint
router.post('/create', (req, res) => {
    const { user_id, title, description } = req.body;
    const sql = 'INSERT INTO CoReMScomplaints (user_id, title, description) VALUES (?, ?, ?)';

    db.query(sql, [user_id, title, description], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Complaint added successfully', complaintId: result.insertId });
    });
});

// Get all complaints for a user
router.get('/user/:userId', (req, res) => {
    const sql = 'SELECT complaint_id, title, date, status FROM CoReMScomplaints WHERE user_id = ?';
    db.query(sql, [req.params.userId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Get full complaint details
router.get('/:complaintId', (req, res) => {
    const sql = 'SELECT * FROM CoReMScomplaints WHERE complaint_id = ?';
    db.query(sql, [req.params.complaintId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
});

module.exports = router;
