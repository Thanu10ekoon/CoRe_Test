# Manual Deployment Steps for Oracle Cloud E2.1.Micro

This guide provides step-by-step manual deployment instructions for VM.Standard.E2.1.Micro (1GB RAM).

---

## Phase 1: Create Instance & Initial Setup

### Step 1: Create the Instance
1. Go to Oracle Cloud Console
2. Click **Create Instance** with your current configuration:
   - Name: `complaint-management-server`
   - Shape: VM.Standard.E2.1.Micro
   - VCN: `complaint-management-vcn`
   - Public IP: Yes
   - SSH keys: Already configured
3. Click **Create**
4. Wait for instance to be **RUNNING**
5. **COPY THE PUBLIC IP ADDRESS** - you'll need it throughout

---

## Phase 2: Configure Security Rules

### Step 2: Open Required Ports
1. On the instance details page, click on **VCN name**: `complaint-management-vcn`
2. Click **Security Lists** on the left
3. Click **Default Security List for complaint-management-vcn**
4. Click **Add Ingress Rules** and add these rules ONE BY ONE:

   **Rule 1: HTTP (Port 80)**
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: `TCP`
   - Destination Port Range: `80`
   - Description: `HTTP`
   - Click **Add Ingress Rule**

   **Rule 2: HTTPS (Port 443)**
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: `TCP`
   - Destination Port Range: `443`
   - Description: `HTTPS`
   - Click **Add Ingress Rule**

   **Rule 3: Backend API (Port 5000)**
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: `TCP`
   - Destination Port Range: `5000`
   - Description: `Backend API`
   - Click **Add Ingress Rule**

---

## Phase 3: Connect to Instance

### Step 3: SSH into the Instance

**On Windows PowerShell:**
```powershell
# Navigate to where your SSH key was downloaded
cd Downloads

# Connect (replace YOUR_PUBLIC_IP with actual IP)
ssh -i ssh-key-2025-12-05.key ubuntu@YOUR_PUBLIC_IP
```

**If you get "Permission denied" or "permissions are too open" error on Windows:**

**Method 1: Fix Permissions (GUI)**
1. Right-click `ssh-key-2025-12-05.key` → **Properties**
2. Go to **Security** tab → **Advanced**
3. Click **Disable inheritance** → Choose **"Remove all inherited permissions"**
4. Click **Add** → **Select a principal** → Type your Windows username → **Check Names** → **OK**
5. Check **Full control** → **OK** → **Apply** → **OK**
6. Try SSH again

**Method 2: Fix Permissions (PowerShell - EASIER)**
```powershell
# Run PowerShell as Administrator, navigate to Downloads folder
cd Downloads

# Remove inheritance and set proper permissions
icacls "ssh-key-2025-12-05.key" /inheritance:r
icacls "ssh-key-2025-12-05.key" /grant:r "$($env:USERNAME):(R)"

# Now try SSH
ssh -i ssh-key-2025-12-05.key ubuntu@YOUR_PUBLIC_IP
```

**Method 3: Use WSL (Windows Subsystem for Linux)**
```powershell
# Copy key to WSL
wsl cp /mnt/d/Coding/Web\ Dev/CoRe_Test/CoRe_Test/Downloads/ssh-key-2025-12-05.key ~/oracle-key.key

# Open WSL
wsl

# Set proper permissions in WSL
chmod 400 ~/oracle-key.key

# Connect via SSH
ssh -i ~/oracle-key.key ubuntu@YOUR_PUBLIC_IP
```

Type `yes` when asked about fingerprint.

---

## Phase 4: Install Required Software

### Step 4: Update System and Install Software

Once connected via SSH, run these commands one by one:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

### Step 5: Configure Firewall

```bash
# Allow required ports
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

---

## Phase 5: Set Up MySQL Database

### Step 6: Secure MySQL and Create Database

```bash
# Run MySQL secure installation
sudo mysql_secure_installation
```

When prompted:
- **VALIDATE PASSWORD component?** Press `N` (for simplicity)
- **Set root password?** Press `Y` and enter a password (e.g., `Root@123`)
- **Remove anonymous users?** Press `Y`
- **Disallow root login remotely?** Press `Y`
- **Remove test database?** Press `Y`
- **Reload privilege tables?** Press `Y`

### Step 7: Create Database and User

```bash
# Login to MySQL
sudo mysql -u root -p
```

Enter your root password, then run these SQL commands:

```sql
-- Create database
CREATE DATABASE complaint_management;

-- Create user (change 'ComplaintUser@2024' to your preferred password)
CREATE USER 'complaint_user'@'localhost' IDENTIFIED BY 'ComplaintUser@2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON complaint_management.* TO 'complaint_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

### Step 8: Test Database Connection

```bash
mysql -u complaint_user -p complaint_management
```

Enter password `ComplaintUser@2024`, then type `EXIT;`

---

## Phase 6: Deploy Backend

### Step 9: Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/Thanu10ekoon/CoRe_Test.git

# Navigate to backend
cd CoRe_Test/complaint-management/backend

# Check if files are there
ls -la
```

### Step 10: Install Backend Dependencies

```bash
# Install dependencies (this will take a few minutes with 1GB RAM)
npm install --production

# If npm install fails due to memory, try:
npm install --production --no-optional
```

### Step 11: Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add this content (replace YOUR_PUBLIC_IP with your actual IP):

```env
# Database Configuration
DB_HOST=localhost
DB_USER=complaint_user
DB_PASSWORD=ComplaintUser@2024
DB_NAME=complaint_management

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret (change this to a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_to_random_string_12345

# File Upload
UPLOAD_DIR=./uploads

# CORS (replace YOUR_PUBLIC_IP with actual IP)
ALLOWED_ORIGINS=http://YOUR_PUBLIC_IP,http://YOUR_PUBLIC_IP:5000,http://localhost:3000
```

**To save in nano:**
- Press `Ctrl + O` (to write)
- Press `Enter` (to confirm)
- Press `Ctrl + X` (to exit)

### Step 12: Set Up Database Schema

```bash
# First, check if schema.sql exists, if not create it
ls -la

# Run the schema to create tables
mysql -u complaint_user -p complaint_management < schema.sql
```

Enter password: `ComplaintUser@2024`

**If schema.sql doesn't exist, create it first:**

```bash
nano schema.sql
```

Paste this content:

```sql
-- Complete Database Schema for Complaint Management System

CREATE TABLE IF NOT EXISTS CoReMSusers (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    subrole VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS CoReMScomplaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    photo_url VARCHAR(255) NULL,
    status ENUM('pending', 'in_progress', 'resolved', 'rejected') NOT NULL DEFAULT 'pending',
    admin_response TEXT,
    updated_by_admin INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES CoReMSusers(user_id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by_admin) REFERENCES CoReMSusers(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SHOW TABLES;
```

Save with `Ctrl+O`, `Enter`, `Ctrl+X`, then run the command above.

### Step 13: Create Uploads Directory

```bash
# Create uploads folder
mkdir -p uploads
chmod 755 uploads
```

### Step 14: Test Backend

```bash
# Test run backend
node server.js
```

You should see: `Server running on port 5000` or similar.

**Press `Ctrl + C` to stop the test**

### Step 15: Start Backend with PM2

```bash
# Start backend with PM2
pm2 start server.js --name complaint-backend

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup

# Copy and run the command it outputs (something like):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### Step 16: Verify Backend is Running

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs complaint-backend --lines 20
```

### Step 17: Test Backend from Internet

**On your laptop browser, go to:**
```
http://YOUR_PUBLIC_IP:5000
```

You should see a response (might be "Cannot GET /" or API message).

**Test API endpoint:**
```
http://YOUR_PUBLIC_IP:5000/api/status
```

If you get a response, **BACKEND IS WORKING!** ✅

---

## Phase 7: Prepare Frontend Locally

### Step 18: Update Frontend API URL (On Your Laptop)

On your local machine, open the project:

```bash
cd complaint-management/frontend/src
```

Find where the API URL is configured. It's likely in one of these files:
- `src/components/*.js`
- `src/services/api.js`
- `src/App.js`

Look for lines like:
```javascript
const API_URL = 'http://localhost:5000/api';
// or
axios.defaults.baseURL = 'http://localhost:5000';
```

**Change to:**
```javascript
const API_URL = 'http://YOUR_PUBLIC_IP:5000/api';
// or
axios.defaults.baseURL = 'http://YOUR_PUBLIC_IP:5000';
```

Replace `YOUR_PUBLIC_IP` with your actual Oracle instance IP.

### Step 19: Test Frontend Locally

```bash
# On your laptop, in the frontend folder
cd complaint-management/frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm start
```

Browser should open at `http://localhost:3000`

**Test the application:**
1. Try to login/register
2. Create a complaint
3. Check if data is being sent to Oracle backend

If everything works, **PROCEED TO BUILD!** ✅

Press `Ctrl + C` to stop the dev server.

### Step 20: Build Frontend

```bash
# Still in frontend folder on your laptop
npm run build
```

This creates a `build` folder with optimized production files.

---

## Phase 8: Create Frontend Repo & Deploy

### Step 21: Create New GitHub Repository for Frontend Build

**On GitHub:**
1. Go to [github.com](https://github.com)
2. Click **New repository**
3. Name: `CoRe_Frontend_Build` (or any name you prefer)
4. **Public** or **Private** (your choice)
5. **Do NOT** initialize with README
6. Click **Create repository**

### Step 22: Push Build to GitHub

**On your laptop, in PowerShell:**

```powershell
# Navigate to the build folder
cd complaint-management/frontend/build

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Production build"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/CoRe_Frontend_Build.git

# Push
git branch -M main
git push -u origin main
```

### Step 23: Clone Frontend Build to Oracle Server

**SSH back into your Oracle instance:**

```bash
# Navigate to home
cd ~

# Clone the frontend build repository (replace YOUR_USERNAME)
git clone https://github.com/YOUR_USERNAME/CoRe_Frontend_Build.git

# Check files
cd CoRe_Frontend_Build
ls -la
```

You should see `index.html`, `static/`, etc.

### Step 24: Move Frontend to Web Directory

```bash
# Create web directory
sudo mkdir -p /var/www/complaint-management

# Copy build files
sudo cp -r ~/CoRe_Frontend_Build/* /var/www/complaint-management/

# Set permissions
sudo chown -R www-data:www-data /var/www/complaint-management
sudo chmod -R 755 /var/www/complaint-management

# Verify files are there
ls -la /var/www/complaint-management
```

---

## Phase 9: Configure Nginx

### Step 25: Create Nginx Configuration

```bash
# Create nginx config file
sudo nano /etc/nginx/sites-available/complaint-management
```

Add this content (replace YOUR_PUBLIC_IP with your actual IP):

```nginx
server {
    listen 80;
    server_name YOUR_PUBLIC_IP;

    # Frontend
    location / {
        root /var/www/complaint-management;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads directory
    location /uploads {
        proxy_pass http://localhost:5000/uploads;
    }

    client_max_body_size 10M;
}
```

Save: `Ctrl + O`, `Enter`, `Ctrl + X`

### Step 26: Enable Nginx Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/complaint-management /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# If test is successful, reload nginx
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx
```

Press `q` to exit status view.

---

## Phase 10: Test Complete Application

### Step 27: Access Your Application

**On your laptop browser:**

```
http://YOUR_PUBLIC_IP
```

You should see your frontend application!

**Test everything:**
1. Register a new user
2. Login
3. Create a complaint
4. Upload a photo
5. Check admin dashboard
6. Update complaint status

---

## Phase 11: Update Frontend API URL (Final)

### Step 28: Update API URL to Use Nginx Proxy

Since Nginx is now proxying `/api` to the backend, update your frontend to use relative URLs.

**On your laptop:**

Edit the frontend API URL to:
```javascript
const API_URL = '/api';  // This will use the same domain
// or
axios.defaults.baseURL = '/api';
```

### Step 29: Rebuild and Redeploy Frontend

```bash
# On your laptop
cd complaint-management/frontend

# Rebuild
npm run build

# Navigate to build folder
cd build

# Commit and push to GitHub
git add .
git commit -m "Updated API URL to use proxy"
git push
```

**On Oracle server:**

```bash
# Pull latest changes
cd ~/CoRe_Frontend_Build
git pull

# Copy to web directory
sudo cp -r ~/CoRe_Frontend_Build/* /var/www/complaint-management/

# Test in browser
```

Now your app should work at `http://YOUR_PUBLIC_IP` without port 5000!

---

## Maintenance Commands

### Useful Commands for Managing Your Server

```bash
# Check backend logs
pm2 logs complaint-backend

# Restart backend
pm2 restart complaint-backend

# Stop backend
pm2 stop complaint-backend

# Check nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Restart nginx
sudo systemctl restart nginx

# Check system resources (memory)
free -h
htop  # or top

# Check disk space
df -h

# Restart server
sudo reboot
```

### Updating Your Application

**Backend updates:**
```bash
cd ~/CoRe_Test/complaint-management/backend
git pull
npm install --production
pm2 restart complaint-backend
```

**Frontend updates:**
```bash
# On laptop: rebuild and push to GitHub
# On server:
cd ~/CoRe_Frontend_Build
git pull
sudo cp -r ~/CoRe_Frontend_Build/* /var/www/complaint-management/
```

---

## Troubleshooting

### Backend not starting
```bash
pm2 logs complaint-backend  # Check errors
cd ~/CoRe_Test/complaint-management/backend
node server.js  # Test directly
```

### Frontend shows blank page
```bash
# Check nginx config
sudo nginx -t

# Check if files exist
ls -la /var/www/complaint-management

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Cannot connect to database
```bash
sudo systemctl status mysql
mysql -u complaint_user -p complaint_management
```

### Out of memory errors
```bash
# Check memory usage
free -h

# Restart services
pm2 restart all
sudo systemctl restart mysql
sudo systemctl restart nginx
```

---

## Important Notes

1. **Save your passwords securely:**
   - MySQL root password
   - complaint_user password
   - JWT secret

2. **Your Public IP:** Keep note of it for future access

3. **SSH Key:** Keep your private key file safe - you need it to access the server

4. **Firewall:** Both Oracle Cloud security lists AND Ubuntu UFW must allow ports

5. **Memory Warning:** With 1GB RAM, avoid running memory-intensive operations. If the server becomes unresponsive, restart it from Oracle Cloud Console.

---

**Good luck with your deployment!** 🚀
