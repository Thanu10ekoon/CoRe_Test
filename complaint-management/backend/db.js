const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: 'bp2juxysn0nszxvmkkzj-mysql.services.clever-cloud.com',  // Update with Clever Cloud host
    user: 'udflccbdblfustx7',  // Your MySQL username
    password: 'qgnCvYDdKjXJIfaLe8hL',  // Your MySQL password
    database: 'bp2juxysn0nszxvmkkzj'
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to database.");
});

module.exports = db;
