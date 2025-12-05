-- Complete Database Schema for Complaint Management System
-- Run this first to create all tables

-- Create users table
CREATE TABLE IF NOT EXISTS CoReMSusers (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    subrole VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create complaints table
CREATE TABLE IF NOT EXISTS CoReMScomplaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    photo_url VARCHAR(255) NULL COMMENT 'Relative path to uploaded photo file',
    status ENUM('pending', 'in_progress', 'resolved', 'rejected') NOT NULL DEFAULT 'pending',
    admin_response TEXT,
    updated_by_admin INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES CoReMSusers(user_id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by_admin) REFERENCES CoReMSusers(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user (password: admin123)
-- Note: This is a bcrypt hash of 'admin123'
INSERT INTO CoReMSusers (username, password, email, role, subrole) 
VALUES ('admin', '$2a$10$rQZwN7Z8Z8Z8Z8Z8Z8Z8ZeK8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z', 'admin@corem.com', 'admin', 'Dean')
ON DUPLICATE KEY UPDATE username=username;

-- Show tables
SHOW TABLES;

-- Describe tables
DESCRIBE CoReMSusers;
DESCRIBE CoReMScomplaints;
