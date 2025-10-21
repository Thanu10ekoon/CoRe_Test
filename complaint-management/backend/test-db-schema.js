// Test script to check database schema and photo_url column
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: 'bp2juxysn0nszxvmkkzj-mysql.services.clever-cloud.com',
  user: 'udflccbdblfustx7',
  password: 'qgnCvYDdKjXJIfaLe8hL',
  database: 'bp2juxysn0nszxvmkkzj'
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("✓ Connected to database\n");

  // Check if photo_url column exists
  const checkColumnSql = "DESCRIBE CoReMScomplaints";
  db.query(checkColumnSql, (err, results) => {
    if (err) {
      console.error("Error checking table structure:", err);
      db.end();
      process.exit(1);
    }
    
    console.log("CoReMScomplaints table structure:");
    console.log("=====================================");
    results.forEach(column => {
      console.log(`${column.Field} (${column.Type}) ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log("=====================================\n");

    const hasPhotoUrl = results.some(column => column.Field === 'photo_url');
    
    if (hasPhotoUrl) {
      console.log("✓ photo_url column EXISTS");
      
      // Check recent complaints with photos
      const recentSql = "SELECT complaint_id, title, photo_url FROM CoReMScomplaints ORDER BY created_at DESC LIMIT 5";
      db.query(recentSql, (err, complaints) => {
        if (err) {
          console.error("Error fetching complaints:", err);
        } else {
          console.log("\nRecent complaints:");
          console.log("=====================================");
          complaints.forEach(c => {
            console.log(`ID: ${c.complaint_id} | Title: ${c.title}`);
            console.log(`Photo URL: ${c.photo_url || 'NO PHOTO'}\n`);
          });
        }
        db.end();
      });
    } else {
      console.log("✗ photo_url column DOES NOT EXIST");
      console.log("\nPlease run this SQL command:");
      console.log("ALTER TABLE CoReMScomplaints ADD COLUMN photo_url VARCHAR(255) NULL;");
      db.end();
    }
  });
});
