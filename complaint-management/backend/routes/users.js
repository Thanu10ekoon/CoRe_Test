const express = require('express');
const db = require('../db');
const router = express.Router();

// Login (No Registration)
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM CoReMSusers WHERE username = ? AND password = ?';
    
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        res.json({ userId: results[0].user_id, role: results[0].role });
    });
});

module.exports = router;
