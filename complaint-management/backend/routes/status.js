const express = require('express');
const db = require('../db');
const router = express.Router();

// Admin updates complaint status
router.put('/update', (req, res) => {
    const { complaint_id, admin_id, status_text } = req.body;

    const sql1 = 'INSERT INTO status_updates (complaint_id, admin_id, update_text) VALUES (?, ?, ?)';
    const sql2 = 'UPDATE complaints SET status = ?, updated_by_admin = ? WHERE complaint_id = ?';

    db.query(sql1, [complaint_id, admin_id, status_text], (err, result) => {
        if (err) return res.status(500).json(err);

        db.query(sql2, [status_text, admin_id, complaint_id], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Status updated successfully' });
        });
    });
});

// Get status history for a complaint
router.get('/:complaintId', (req, res) => {
    const sql = 'SELECT * FROM status_updates WHERE complaint_id = ?';
    db.query(sql, [req.params.complaintId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

module.exports = router;
