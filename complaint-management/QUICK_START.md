# Quick Start Guide - Oracle Cloud MySQL + Local Testing

## Overview
This guide sets up a fresh MySQL database on Oracle Cloud and tests locally.

---

## Part 1: Oracle Cloud MySQL Setup

### 1. SSH into Oracle Cloud
```bash
ssh -i "ssh-key-2025-12-05.key" ubuntu@140.245.253.253
```

### 2. Install MySQL (One-Command Setup)
```bash
sudo apt update && sudo apt install mysql-server -y && sudo systemctl start mysql && sudo systemctl enable mysql
```

### 3. Create Database
```bash
sudo mysql
```

```sql
CREATE DATABASE corems_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'corems_user'@'%' IDENTIFIED BY 'CoReMSPass@2026';
GRANT ALL PRIVILEGES ON corems_db.* TO 'corems_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Enable Remote Access
```bash
sudo sed -i 's/bind-address.*=.*127.0.0.1/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf
sudo systemctl restart mysql
sudo ufw allow 3306/tcp
```

### 5. Import Database Schema
```bash
# Create the SQL file
cat > /tmp/fresh_database_setup.sql << 'EOF'
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

CREATE TABLE CoReMScategories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

INSERT INTO CoReMScategories (name, description) VALUES
('Hostel', 'Hostel and accommodation related complaints'),
('Canteen', 'Canteen and food service complaints'),
('Academic', 'Academic and teaching related complaints'),
('Sports', 'Sports facilities and equipment complaints'),
('Maintainance', 'Infrastructure and maintenance complaints'),
('Library', 'Library services and resources complaints'),
('Security', 'Campus security related complaints'),
('Documentation', 'Administrative and documentation complaints'),
('DEIE', 'Electrical and Information Engineering'),
('DMME', 'Mechanical and Manufacturing Engineering'),
('DIS', 'Interdisciplinary Studies'),
('DMENA', 'Mineral, Earth and Naval Architecture'),
('DCEE', 'Civil and Environmental Engineering');
EOF

# Import it
mysql -u corems_user -pCoReMSPass@2026 corems_db < /tmp/fresh_database_setup.sql
```

### 6. Verify Database
```bash
mysql -u corems_user -pCoReMSPass@2026 corems_db -e "SHOW TABLES; SELECT * FROM CoReMScategories;"
```

### 7. Configure Oracle Cloud Security List
**Important**: In Oracle Cloud Console:
1. Go to: **Networking → Virtual Cloud Networks → Your VCN → Security Lists**
2. Click your security list
3. Add Ingress Rule:
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: TCP
   - **Destination Port**: `3306`

---

## Part 2: Local Testing

### 1. Test Database Connection from Local
```powershell
# From PowerShell or WSL
mysql -h 140.245.253.253 -u corems_user -pCoReMSPass@2026 corems_db -e "SHOW TABLES;"
```

If this fails, check Oracle Cloud Security List in Step 7 above.

### 2. Backend Setup
```powershell
# Navigate to backend
cd complaint-management\backend

# Verify .env file has correct credentials
cat .env
# Should show:
# DB_HOST=140.245.253.253
# DB_USER=corems_user
# DB_PASSWORD=CoReMSPass@2026
# DB_NAME=corems_db

# Install dependencies (if needed)
npm install

# Start backend server
node server.js
```

**Expected output:**
```
Server running on http://localhost:5000
Connected to MySQL database
```

### 3. Test Backend API
Open new terminal:
```powershell
# Test categories endpoint
curl http://localhost:5000/api/categories

# Expected response: JSON array with 13 categories
```

### 4. Frontend Setup
```powershell
# Open new terminal
cd complaint-management\frontend

# Verify .env file points to localhost
cat .env
# Should show: REACT_APP_API_BASE_URL=http://localhost:5000/api

# Install dependencies (if needed)
npm install

# Start frontend
npm start
```

**Frontend should open at**: `http://localhost:3000`

---

## Part 3: Test the Application

### Test 1: User Signup
1. Go to `http://localhost:3000`
2. Click "Sign Up"
3. Create regular user:
   - Username: `testuser`
   - Password: `user123`
   - Role: **User**
4. Click Sign Up → Should succeed

### Test 2: Observer Signup
1. Click "Sign Up" again
2. Fill in:
   - Username: `testobserver`
   - Password: `observer123`
   - Role: **Observer**
   - Observer Password: `ObserverPass#2024`
3. Sign Up → Should succeed

### Test 3: Admin Signup
1. Click "Sign Up"
2. Fill in:
   - Username: `testadmin`
   - Password: `admin123`
   - Role: **Admin**
   - Admin Password: `RuhPass#1999`
   - **Select categories**: Check "Hostel" and "Canteen"
3. Sign Up → Should succeed

### Test 4: Super Admin Signup
1. Click "Sign Up"
2. Fill in:
   - Username: `testsuperadmin`
   - Password: `super123`
   - Role: **Super Admin**
   - Super Admin Password: `SuperRuhPass#2024`
3. Sign Up → Should succeed

### Test 5: Login as User
1. Login with `testuser` / `user123`
2. Should see **User Dashboard**
3. Create a complaint
4. Verify you only see your own complaints

### Test 6: Login as Observer
1. Logout and login as `testobserver` / `observer123`
2. Should see **Observer Dashboard** with 2 tabs:
   - My Complaints
   - All Complaints (Read-Only)
3. Create your own complaint
4. Go to "All Complaints" → Should see ALL complaints
5. Verify NO "Update Status" button (read-only)

### Test 7: Login as Admin
1. Logout and login as `testadmin` / `admin123`
2. Should see **Admin Dashboard**
3. Should ONLY see complaints in "Hostel" and "Canteen" categories
4. Can update status on visible complaints
5. Create complaint → Only "Hostel" and "Canteen" should show in dropdown

### Test 8: Login as Super Admin
1. Logout and login as `testsuperadmin` / `super123`
2. Should see **Super Admin Dashboard** with tabs:
   - Complaints (All)
   - Categories
   - Users
3. Go to "Categories" tab → Should see all 13 categories
4. Go to "Users" tab → Should see all users
5. Can update any complaint status

---

## Database Connection Details

```env
Host: 140.245.253.253
Port: 3306
Database: corems_db
Username: corems_user
Password: CoReMSPass@2026
```

---

## Special Passwords for Signup

| Role | Special Password |
|------|------------------|
| User | (none) |
| Observer | `ObserverPass#2024` |
| Admin | `RuhPass#1999` |
| Super Admin | `SuperRuhPass#2024` |

---

## Troubleshooting

### Backend won't connect to database
```bash
# Check if port 3306 is accessible
telnet 140.245.253.253 3306

# If fails, configure Oracle Cloud Security List (Part 1, Step 7)
```

### Categories not loading in frontend
1. Check backend is running: `http://localhost:5000/api/categories`
2. Check browser console for CORS errors
3. Verify .env files point to correct URLs

### "Invalid admin password" error
- Verify you're using correct special password for the role (see table above)

---

## Success Checklist

- [ ] MySQL installed on Oracle Cloud
- [ ] Database `corems_db` created
- [ ] User `corems_user` can connect remotely
- [ ] Schema imported (5 tables + 13 categories)
- [ ] Oracle Security List allows port 3306
- [ ] Backend connects successfully
- [ ] Frontend loads at localhost:3000
- [ ] Can create users for all 4 roles
- [ ] Each role sees appropriate dashboard
- [ ] Admin sees only assigned categories
- [ ] Super Admin has full access

---

**Ready for deployment after successful local testing!**
