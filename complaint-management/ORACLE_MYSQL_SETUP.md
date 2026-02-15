# Oracle Cloud MySQL Setup Guide

## Step 1: SSH into Oracle Cloud Instance

```bash
ssh -i "ssh-key-2025-12-05.key" ubuntu@140.245.253.253
```

## Step 2: Install MySQL Server

```bash
# Update system
sudo apt update

# Install MySQL Server
sudo apt install mysql-server -y

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Check MySQL status
sudo systemctl status mysql
```

## Step 3: Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

When prompted:
- **Validate password component**: NO
- **Set root password**: YES → Use: `CoReMSRoot@2026`
- **Remove anonymous users**: YES
- **Disallow root login remotely**: NO (we need remote access)
- **Remove test database**: YES
- **Reload privilege tables**: YES

## Step 4: Create Database and User

```bash
# Login to MySQL as root
sudo mysql -u root -p
# Enter password: CoReMSRoot@2026
```

Then run these SQL commands:

```sql
-- Create database
CREATE DATABASE corems_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user that can connect remotely
CREATE USER 'corems_user'@'%' IDENTIFIED BY 'CoReMSPass@2026';

-- Grant all privileges on corems_db
GRANT ALL PRIVILEGES ON corems_db.* TO 'corems_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify user created
SELECT User, Host FROM mysql.user WHERE User = 'corems_user';

-- Switch to the database
USE corems_db;

-- Show current database
SELECT DATABASE();

-- Exit MySQL
EXIT;
```

## Step 5: Configure MySQL for Remote Connections

```bash
# Edit MySQL config
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Find the line:
```
bind-address = 127.0.0.1
```

Change it to:
```
bind-address = 0.0.0.0
```

Save and exit (Ctrl+X, Y, Enter)

```bash
# Restart MySQL
sudo systemctl restart mysql

# Verify MySQL is listening on all interfaces
sudo netstat -tuln | grep 3306
```

## Step 6: Configure Firewall (Oracle Cloud)

```bash
# Allow MySQL port in UFW
sudo ufw allow 3306/tcp

# Check UFW status
sudo ufw status
```

**Also configure Oracle Cloud Security List:**
1. Go to Oracle Cloud Console
2. Navigate to: Networking → Virtual Cloud Networks → Your VCN → Security Lists
3. Add Ingress Rule:
   - **Source CIDR**: `0.0.0.0/0` (or your specific IP for security)
   - **IP Protocol**: TCP
   - **Destination Port Range**: `3306`
   - **Description**: MySQL Remote Access

## Step 7: Import Database Schema

```bash
# Download the SQL file to Oracle instance (if not already there)
# Or create it directly:
nano fresh_database_setup.sql
```

Paste the contents from `fresh_database_setup.sql`, then:

```bash
# Import the schema
mysql -u corems_user -p corems_db < fresh_database_setup.sql
# Enter password: CoReMSPass@2026

# Verify tables created
mysql -u corems_user -p corems_db -e "SHOW TABLES;"
```

## Step 8: Test Remote Connection (From Local)

```bash
# Test from your local Windows machine (using WSL or Git Bash)
mysql -h 140.245.253.253 -u corems_user -p corems_db
# Enter password: CoReMSPass@2026

# If connected successfully, run:
SHOW TABLES;
SELECT * FROM CoReMScategories;
EXIT;
```

## Database Credentials

```
Host: 140.245.253.253
Port: 3306
Database: corems_db
Username: corems_user
Password: CoReMSPass@2026
```

## Troubleshooting

### Cannot connect remotely?

1. **Check MySQL is listening:**
```bash
sudo netstat -tuln | grep 3306
# Should show: 0.0.0.0:3306
```

2. **Check firewall:**
```bash
sudo ufw status
telnet 140.245.253.253 3306
```

3. **Check Oracle Security List** in the console

4. **Verify user can connect remotely:**
```sql
SELECT User, Host FROM mysql.user WHERE User = 'corems_user';
# Should show: corems_user | %
```

### Lost root password?

```bash
# Stop MySQL
sudo systemctl stop mysql

# Start in safe mode
sudo mysqld_safe --skip-grant-tables &

# Login without password
mysql -u root

# Reset password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'CoReMSRoot@2026';
FLUSH PRIVILEGES;
EXIT;

# Restart MySQL normally
sudo systemctl restart mysql
```

---

**Next**: Update your `.env` files with these credentials.
