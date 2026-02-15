-- Fresh CoreMS Database Setup
-- This creates the complete database schema from scratch

-- Create users table with 4 roles
CREATE TABLE CoReMSusers (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role ENUM('user', 'observer', 'admin', 'superadmin') NOT NULL DEFAULT 'user',
    subrole VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create categories table
CREATE TABLE CoReMScategories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create admin_categories junction table
CREATE TABLE CoReMSadmin_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES CoReMSusers(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES CoReMScategories(category_id) ON DELETE CASCADE,
    UNIQUE KEY unique_admin_category (user_id, category_id),
    INDEX idx_user (user_id),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create complaints table
CREATE TABLE CoReMScomplaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    status VARCHAR(100) DEFAULT 'Pending',
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES CoReMSusers(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create status updates table
CREATE TABLE CoReMSstatus (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    admin_id INT,
    status_update TEXT NOT NULL,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES CoReMScomplaints(complaint_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES CoReMSusers(user_id) ON DELETE SET NULL,
    INDEX idx_complaint (complaint_id),
    INDEX idx_admin (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default categories
INSERT INTO CoReMScategories (name, description) VALUES
('Hostel', 'Hostel and accommodation related complaints'),
('Canteen', 'Canteen and food service complaints'),
('Academic', 'Academic and teaching related complaints'),
('Sports', 'Sports facilities and equipment complaints'),
('Maintainance', 'Infrastructure and maintenance complaints'),
('Library', 'Library services and resources complaints'),
('Security', 'Campus security related complaints'),
('Documentation', 'Administrative and documentation complaints'),
('DEIE', 'Department of Electrical and Information Engineering'),
('DMME', 'Department of Mechanical and Manufacturing Engineering'),
('DIS', 'Department of Interdisciplinary Studies'),
('DMENA', 'Department of Mineral, Earth and Naval Architecture'),
('DCEE', 'Department of Civil and Environmental Engineering');

-- Insert sample admin user (username: admin, password: admin123)
-- BCrypt hash for 'admin123'
INSERT INTO CoReMSusers (username, password, email, role, subrole) VALUES
('admin', '$2a$10$vGkJBOKqZ5xr8ZYE/AxuJO.G7Q3vNsKhWvH5w5yLFKjXk0rIQFWPy', 'admin@corem.com', 'admin', 'Admin');

-- Insert sample superadmin user (username: superadmin, password: super123)
-- BCrypt hash for 'super123'
INSERT INTO CoReMSusers (username, password, email, role, subrole) VALUES
('superadmin', '$2a$10$vGkJBOKqZ5xr8ZYE/AxuJO.G7Q3vNsKhWvH5w5yLFKjXk0rIQFWPy', 'superadmin@corem.com', 'superadmin', 'SuperAdmin');

-- Assign admin to Hostel and Canteen categories
INSERT INTO CoReMSadmin_categories (user_id, category_id) 
SELECT u.user_id, c.category_id 
FROM CoReMSusers u, CoReMScategories c 
WHERE u.username = 'admin' AND c.name IN ('Hostel', 'Canteen');

-- Verify tables created
SELECT 'Database setup complete!' AS status;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME LIKE 'CoReMS%';
