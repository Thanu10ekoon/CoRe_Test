# Oracle Cloud Always Free Deployment Guide

This guide provides step-by-step instructions to deploy both the frontend and backend of the Complaint Management System on Oracle Cloud Infrastructure (OCI) Always Free tier.

## Table of Contents
1. [Create Oracle Cloud Account](#1-create-oracle-cloud-account)
2. [Set Up Compute Instance](#2-set-up-compute-instance)
3. [Configure Instance Security](#3-configure-instance-security)
4. [Connect to Your Instance](#4-connect-to-your-instance)
5. [Install Required Software](#5-install-required-software)
6. [Set Up MySQL Database](#6-set-up-mysql-database)
7. [Deploy Backend](#7-deploy-backend)
8. [Deploy Frontend](#8-deploy-frontend)
9. [Configure Nginx as Reverse Proxy](#9-configure-nginx-as-reverse-proxy)
10. [Set Up SSL Certificate](#10-set-up-ssl-certificate)
11. [Configure PM2 for Process Management](#11-configure-pm2-for-process-management)
12. [Troubleshooting](#troubleshooting)

---

## 1. Create Oracle Cloud Account

### Step 1.1: Sign Up
1. Go to [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
2. Click **Start for free** or **Sign up**
3. Fill in your details:
   - Email address
   - Country/Territory
   - First and Last Name
4. Click **Verify my email**

### Step 1.2: Email Verification
1. Check your email for verification code
2. Enter the verification code
3. Create a password for your account

### Step 1.3: Account Details
1. Choose **Account Type**: Individual or Company
2. Enter your address details
3. Enter payment verification details (credit card - you won't be charged for Always Free resources)
4. Accept terms and conditions
5. Click **Start my free trial**

### Step 1.4: Complete Setup
1. Wait for account provisioning (takes 1-2 minutes)
2. You'll be redirected to the OCI Console

---

## 2. Set Up Compute Instance

### Step 2.1: Navigate to Compute
1. From the OCI Console, click the **☰ (hamburger menu)** in the top left
2. Go to **Compute** → **Instances**
3. Make sure you're in your home region (displayed at top right)

### Step 2.2: Create Instance
1. Click **Create Instance**
2. Configure the instance:

   **Name your instance:**
   ```
   complaint-management-server
   ```

   **Placement:**
   - Leave defaults (Availability Domain will be auto-selected)

   **Image and Shape:**
   - Click **Change Image**
   - Select **Canonical Ubuntu** (Ubuntu 22.04 or later recommended)
   - Click **Select Image**
   
   - Click **Change Shape**
   - Select **Ampere** (ARM-based) or **AMD**
   - Choose **VM.Standard.A1.Flex** (Ampere - **HIGHLY recommended** for Always Free)
     - OCPUs: 2 (or up to 4 - you get 4 OCPUs total free)
     - Memory (GB): 12 (or up to 24 - you get 24 GB total free)
     - **Note**: If you get "Out of capacity" error, try a different Availability Domain (AD-2 or AD-3)
   - Or choose **VM.Standard.E2.1.Micro** (AMD - x86) - **Only if A1.Flex unavailable**
     - Fixed: 1 OCPU, 1 GB RAM
     - **Warning**: Very limited RAM - you MUST build frontend locally, not on server
   - Click **Select Shape**

   **Networking:**
   - Create new virtual cloud network (VCN): **Yes** (default)
   - VCN Name: `complaint-management-vcn`
   - Subnet Name: `complaint-management-subnet`
   - **Assign a public IPv4 address**: YES (ensure this is checked)

   **Add SSH Keys:**
   - Choose **Generate a key pair for me**
   - Click **Save Private Key** (download and save securely - you'll need this!)
   - Click **Save Public Key** (optional, for backup)
   - Or if you have your own SSH key, select **Upload public key files** or **Paste public keys**

   **Boot Volume:**
   - Leave defaults (50 GB is included in Always Free)

3. Click **Create**

### Step 2.3: Wait for Instance
1. Instance state will change from **PROVISIONING** to **RUNNING** (takes 1-2 minutes)
2. Note down the **Public IP Address** (you'll need this throughout)

---

## 3. Configure Instance Security

### Step 3.1: Configure Security List (Firewall Rules)
1. On the Instance Details page, scroll to **Instance Information**
2. Click on the **VCN name** (e.g., `complaint-management-vcn`)
3. Under **Resources** on the left, click **Security Lists**
4. Click on **Default Security List for complaint-management-vcn**
5. Click **Add Ingress Rules** and add the following rules:

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

   **Rule 3: Backend API (Port 5000) - Optional for testing**
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: `TCP`
   - Destination Port Range: `5000`
   - Description: `Backend API`
   - Click **Add Ingress Rule**

   **Rule 4: SSH (Should already exist)**
   - Verify port 22 is open for SSH (default)

---

## 4. Connect to Your Instance

### Step 4.1: Prepare SSH Connection

**On Windows (Using PowerShell or CMD):**
1. Move the downloaded private key to a secure location:
   ```powershell
   mkdir $HOME\.ssh
   move Downloads\ssh-key-*.key $HOME\.ssh\oracle-key.key
   ```

2. Connect to instance:
   ```powershell
   ssh -i $HOME\.ssh\oracle-key.key ubuntu@YOUR_PUBLIC_IP
   ```
   Replace `YOUR_PUBLIC_IP` with your instance's public IP

**On Windows (Using PuTTY):**
1. Download and install [PuTTY](https://www.putty.org/)
2. Convert the private key to PuTTY format (.ppk) using PuTTYgen
3. Use PuTTY to connect with the .ppk key

**On Linux/Mac:**
1. Move the key and set permissions:
   ```bash
   mv ~/Downloads/ssh-key-*.key ~/.ssh/oracle-key.key
   chmod 400 ~/.ssh/oracle-key.key
   ```

2. Connect:
   ```bash
   ssh -i ~/.ssh/oracle-key.key ubuntu@YOUR_PUBLIC_IP
   ```

### Step 4.2: First Login
1. Type `yes` when prompted about fingerprint
2. You should now be connected to your Ubuntu instance

---

## 5. Install Required Software

### Step 5.1: Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Step 5.2: Install Node.js and npm
```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 5.3: Install MySQL
```bash
sudo apt install -y mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Step 5.4: Install Nginx
```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 5.5: Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Step 5.6: Install Git
```bash
sudo apt install -y git
```

### Step 5.7: Configure Ubuntu Firewall (UFW)
```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp

# Enable firewall
sudo ufw --force enable
sudo ufw status
```

---

## 6. Set Up MySQL Database

### Step 6.1: Secure MySQL Installation
```bash
sudo mysql_secure_installation
```
- Enter a root password (save this securely!)
- Answer `Y` to all security questions

### Step 6.2: Create Database and User
```bash
sudo mysql -u root -p
```

Enter these SQL commands:
```sql
-- Create database
CREATE DATABASE complaint_management;

-- Create user (change 'your_password' to a strong password)
CREATE USER 'complaint_user'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON complaint_management.* TO 'complaint_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

### Step 6.3: Test Database Connection
```bash
mysql -u complaint_user -p complaint_management
```
Enter the password you set, then type `EXIT;`

---

## 7. Deploy Backend

### Step 7.1: Clone Your Repository
```bash
# Navigate to home directory
cd ~

# Clone your repository (replace with your repo URL)
git clone https://github.com/Thanu10ekoon/CoRe_Test.git

# Or upload your files using SCP/SFTP
```

### Step 7.2: Set Up Backend
```bash
cd ~/CoRe_Test/complaint-management/backend

# Install dependencies
npm install

# Install additional production dependencies
npm install mysql2 dotenv cors express bcryptjs jsonwebtoken multer
```

### Step 7.3: Configure Environment Variables
```bash
# Create .env file
nano .env
```

Add the following (adjust values):
```env
# Database Configuration
DB_HOST=localhost
DB_USER=complaint_user
DB_PASSWORD=your_password
DB_NAME=complaint_management

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret (generate a random strong secret)
JWT_SECRET=your_very_long_random_secret_key_here_change_this

# File Upload
UPLOAD_DIR=./uploads

# CORS (replace with your domain or public IP)
ALLOWED_ORIGINS=http://YOUR_PUBLIC_IP,https://YOUR_PUBLIC_IP,https://yourdomain.com
```

Save (Ctrl+O, Enter) and exit (Ctrl+X)

### Step 7.4: Initialize Database Schema
```bash
# Run the schema migration
mysql -u complaint_user -p complaint_management < migration_add_photo_url.sql

# Or create tables manually by connecting to MySQL
```

### Step 7.5: Test Backend
```bash
# Test run
node server.js
```

If it starts successfully (listening on port 5000), press Ctrl+C to stop it.

### Step 7.6: Start Backend with PM2
```bash
# Start backend
pm2 start server.js --name complaint-backend

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Run the command it outputs (starts with 'sudo env PATH=...')
```

### Step 7.7: Verify Backend is Running
```bash
pm2 status
pm2 logs complaint-backend
```

---

## 8. Deploy Frontend

### Step 8.1: Update Frontend API URL
On your local machine, update the frontend to point to your Oracle server:

Edit `frontend/src/services/api.js` or wherever your API URL is configured:
```javascript
const API_URL = 'http://YOUR_PUBLIC_IP:5000/api';
// Or after setting up nginx: 'https://yourdomain.com/api'
```

### Step 8.2: Build Frontend Locally
On your local machine:
```bash
cd complaint-management/frontend
npm install
npm run build
```

### Step 8.3: Upload Build to Server

**IMPORTANT: If using VM.Standard.E2.1.Micro (1GB RAM), you MUST build locally and upload. Do NOT build on the server.**

**Using SCP (from your local machine):**

Windows PowerShell:
```powershell
scp -i $HOME\.ssh\oracle-key.key -r build ubuntu@YOUR_PUBLIC_IP:~/
```

Linux/Mac:
```bash
scp -i ~/.ssh/oracle-key.key -r build ubuntu@YOUR_PUBLIC_IP:~/
```

**Or build directly on server (ONLY if you have VM.Standard.A1.Flex with 6GB+ RAM):**
```bash
cd ~/CoRe_Test/complaint-management/frontend
npm install
npm run build
```

### Step 8.4: Move Build to Web Directory
```bash
# Create web directory
sudo mkdir -p /var/www/complaint-management

# Move build files
sudo cp -r ~/build/* /var/www/complaint-management/

# Set permissions
sudo chown -R www-data:www-data /var/www/complaint-management
sudo chmod -R 755 /var/www/complaint-management
```

---

## 9. Configure Nginx as Reverse Proxy

### Step 9.1: Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/complaint-management
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name YOUR_PUBLIC_IP;  # Replace with your domain or IP

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

    # Uploads directory (if serving uploaded files)
    location /uploads {
        proxy_pass http://localhost:5000/uploads;
    }

    client_max_body_size 10M;
}
```

Save and exit.

### Step 9.2: Enable Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/complaint-management /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 9.3: Test Your Application
Open a browser and go to:
```
http://YOUR_PUBLIC_IP
```

You should see your frontend, and it should be able to communicate with the backend.

---

## 10. Set Up SSL Certificate

### Step 10.1: Get a Domain Name (Optional but Recommended)
- Purchase a domain from providers like Namecheap, GoDaddy, Google Domains, etc.
- Point the domain's A record to your Oracle instance's public IP
- Wait for DNS propagation (5 minutes to 48 hours)

### Step 10.2: Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Step 10.3: Obtain SSL Certificate
**If you have a domain:**
```bash
# Replace yourdomain.com with your actual domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**If using IP address only (not recommended for production):**
You'll need to use self-signed certificates or skip SSL for now.

### Step 10.4: Configure Auto-Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up auto-renewal
```

### Step 10.5: Update Frontend API URL
After SSL is set up, update your frontend API URL to use HTTPS:
```javascript
const API_URL = 'https://yourdomain.com/api';
```

Rebuild and redeploy frontend.

---

## 11. Configure PM2 for Process Management

### Step 11.1: View Running Processes
```bash
pm2 status
pm2 logs
pm2 monit
```

### Step 11.2: Manage Processes
```bash
# Restart
pm2 restart complaint-backend

# Stop
pm2 stop complaint-backend

# Delete
pm2 delete complaint-backend

# View logs
pm2 logs complaint-backend --lines 100
```

### Step 11.3: Update Backend Code
```bash
cd ~/CoRe_Test/complaint-management/backend
git pull origin main
npm install
pm2 restart complaint-backend
```

---

## Troubleshooting

### Issue: Cannot connect to instance via SSH
- **Solution**: Check security list has port 22 open
- Verify you're using the correct private key
- Ensure public IP is correct

### Issue: Website not accessible
- **Solution**: 
  ```bash
  sudo nginx -t  # Check Nginx config
  sudo systemctl status nginx  # Check Nginx status
  sudo ufw status  # Check firewall
  pm2 status  # Check backend is running
  ```

### Issue: Database connection errors
- **Solution**:
  ```bash
  sudo systemctl status mysql  # Check MySQL is running
  mysql -u complaint_user -p complaint_management  # Test connection
  # Verify .env file has correct credentials
  ```

### Issue: Backend not starting
- **Solution**:
  ```bash
  pm2 logs complaint-backend  # Check logs for errors
  # Check .env file exists and has correct values
  # Ensure all npm packages are installed
  ```

### Issue: File upload not working
- **Solution**:
  ```bash
  # Create uploads directory
  mkdir -p ~/CoRe_Test/complaint-management/backend/uploads
  chmod 755 ~/CoRe_Test/complaint-management/backend/uploads
  
  # Check Nginx client_max_body_size is set appropriately
  ```

### Issue: 502 Bad Gateway
- **Solution**:
  ```bash
  # Backend is not running
  pm2 restart complaint-backend
  
  # Check backend logs
  pm2 logs complaint-backend
  ```

### Check Logs
```bash
# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# PM2 logs
pm2 logs

# System logs
sudo journalctl -xe
```

---

## Useful Commands Reference

```bash
# System
sudo reboot                    # Restart server
sudo shutdown -h now          # Shutdown server
df -h                         # Check disk space
free -h                       # Check memory
top                           # Monitor processes

# MySQL
sudo systemctl status mysql   # Check MySQL status
sudo systemctl restart mysql  # Restart MySQL

# Nginx
sudo systemctl status nginx   # Check Nginx status
sudo systemctl restart nginx  # Restart Nginx
sudo nginx -t                 # Test Nginx config

# PM2
pm2 status                    # List all processes
pm2 restart all               # Restart all processes
pm2 logs                      # View all logs
pm2 flush                     # Clear logs

# Firewall
sudo ufw status               # Check firewall status
sudo ufw allow PORT/tcp       # Open port
```

---

## Security Best Practices

1. **Change Default Passwords**: Always change default passwords for MySQL and create strong passwords
2. **Use SSH Keys**: Never use password authentication for SSH
3. **Keep System Updated**: Regularly run `sudo apt update && sudo apt upgrade`
4. **Enable Firewall**: Ensure UFW is enabled and only necessary ports are open
5. **Use HTTPS**: Always use SSL certificates in production
6. **Backup Regularly**: Set up automated backups of your database
7. **Monitor Logs**: Regularly check logs for suspicious activity
8. **Limit Access**: Use security groups to restrict access to specific IPs if possible

---

## Next Steps

1. Set up automated database backups
2. Configure monitoring and alerts
3. Set up CI/CD pipeline for automated deployments
4. Implement additional security measures (fail2ban, etc.)
5. Consider using Oracle Cloud Load Balancer for high availability

---

## Additional Resources

- [Oracle Cloud Documentation](https://docs.oracle.com/en-us/iaas/Content/home.htm)
- [Oracle Always Free Services](https://www.oracle.com/cloud/free/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

**Congratulations!** Your Complaint Management System should now be running on Oracle Cloud Infrastructure's Always Free tier.
