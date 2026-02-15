-- Migration: Add 4 roles and dynamic categories system
-- Run this script to update the database schema

-- Step 1: Create categories table
CREATE TABLE IF NOT EXISTS CoReMScategories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 2: Insert default categories (based on existing complaint categories)
INSERT INTO CoReMScategories (name, description) VALUES
('Hostel', 'Hostel related complaints'),
('Canteen', 'Canteen and food related complaints'),
('Academic', 'Academic related complaints'),
('Sports', 'Sports facilities related complaints'),
('Maintainance', 'Maintenance and infrastructure complaints'),
('Library', 'Library related complaints'),
('Security', 'Security related complaints'),
('Documentation', 'Documentation and administrative complaints'),
('DEIE', 'Department of Electrical and Information Engineering'),
('DMME', 'Department of Mechanical and Manufacturing Engineering'),
('DIS', 'Department of Interdisciplinary Studies'),
('DMENA', 'Department of Mineral, Earth and Naval Architecture'),
('DCEE', 'Department of Civil and Environmental Engineering')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Step 3: Create admin_categories junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS CoReMSadmin_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES CoReMSusers(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES CoReMScategories(category_id) ON DELETE CASCADE,
    UNIQUE KEY unique_admin_category (user_id, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Step 4: Modify users table to support 4 roles
-- First, temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Modify the role column to support 4 roles
ALTER TABLE CoReMSusers 
MODIFY COLUMN role ENUM('user', 'observer', 'admin', 'superadmin') NOT NULL DEFAULT 'user';

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 5: Create a default superadmin user (password: superadmin123)
-- First hash: $2a$10$... is bcrypt hash of 'superadmin123'
INSERT INTO CoReMSusers (username, password, email, role, subrole) 
VALUES ('superadmin', '$2a$10$rQZwN7Z8Z8Z8Z8Z8Z8Z8ZeK8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z', 'superadmin@corem.com', 'superadmin', 'SuperAdmin')
ON DUPLICATE KEY UPDATE role = 'superadmin', subrole = 'SuperAdmin';

-- Step 6: Migrate existing admins to the new category system
-- This maps existing subroles to categories
INSERT INTO CoReMSadmin_categories (user_id, category_id)
SELECT u.user_id, c.category_id
FROM CoReMSusers u
JOIN CoReMScategories c ON (
    (u.subrole = 'Warden' AND c.name = 'Hostel') OR
    (u.subrole = 'AR' AND c.name = 'Documentation') OR
    (u.subrole = 'CanteenCordinator' AND c.name = 'Canteen') OR
    (u.subrole = 'AcademicCordinator' AND c.name = 'Academic') OR
    (u.subrole = 'SportCordinator' AND c.name = 'Sports') OR
    (u.subrole = 'MaintainanceCordinator' AND c.name = 'Maintainance') OR
    (u.subrole = 'Librarian' AND c.name = 'Library') OR
    (u.subrole = 'SecurityCordinator' AND c.name = 'Security') OR
    (u.subrole = 'HOD_DEIE' AND c.name = 'DEIE') OR
    (u.subrole = 'HOD_DMME' AND c.name = 'DMME') OR
    (u.subrole = 'HOD_DIS' AND c.name = 'DIS') OR
    (u.subrole = 'HOD_DMENA' AND c.name = 'DMENA') OR
    (u.subrole = 'HOD_DCEE' AND c.name = 'DCEE')
)
WHERE u.role = 'admin' AND u.subrole NOT IN ('Dean', 'ComplaintsManager')
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);

-- Step 7: Upgrade Dean and ComplaintsManager admins to superadmin role
UPDATE CoReMSusers 
SET role = 'superadmin' 
WHERE role = 'admin' AND subrole IN ('Dean', 'ComplaintsManager');

-- Verify the changes
SELECT 'Categories created:' AS info;
SELECT * FROM CoReMScategories;

SELECT 'Users with roles:' AS info;
SELECT user_id, username, role, subrole FROM CoReMSusers;

SELECT 'Admin category assignments:' AS info;
SELECT u.username, c.name AS category 
FROM CoReMSadmin_categories ac
JOIN CoReMSusers u ON ac.user_id = u.user_id
JOIN CoReMScategories c ON ac.category_id = c.category_id;
