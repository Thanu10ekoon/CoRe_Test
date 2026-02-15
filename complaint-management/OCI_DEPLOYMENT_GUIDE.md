# Oracle Cloud Infrastructure (OCI) Deployment Guide

## Overview
This guide walks you through deploying the complete CoreMS application (Frontend + Backend + MySQL) on Oracle Cloud Infrastructure.

---

## Prerequisites

- ✅ Oracle Cloud account (Always Free Tier is sufficient)
- ✅ SSH key pair (already have: `ssh-key-2025-12-05.key`)
- ✅ Local development tested and working
- ✅ Frontend built for production
- ✅ Backend configured with environment variables

---

## Architecture Overview

```
Internet
    ↓
OCI Compute Instance (140.245.253.253)
    ├── Node.js Backend (Port 5000)
    ├── React Frontend (Port 80/443 via nginx)
    └── MySQL Database (Port 3306)
```

---

## Part 1: Prepare for Deployment

### 1.1 Build Frontend for Production

```powershell
cd complaint-management\frontend

# Update .env.production with your OCI IP
# REACT_APP_API_BASE_URL=http://140.245.253.253:5000/api

# Build the production bundle
npm run build

# Verify build folder created
ls build
```

### 1.2 Verify Backend Configuration

Check [backend/.env](backend/.env) has Oracle MySQL credentials:
```env
DB_HOST=140.245.253.253
DB_USER=corems_user
DB_PASSWORD=CoReMSPass@2026
DB_NAME=corems_db
PORT=5000
```

---

## Part 2: Backend Deployment

### 2.1 SSH into Oracle Cloud Instance

```bash
ssh -i "ssh-key-2025-12-05.key" ubuntu@140.245.253.253
```

### 2.2 Install Node.js and PM2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 globally (process manager)
sudo npm install -g pm2

# Verify PM2
pm2 --version
```

### 2.3 Upload Backend Code

From your **local machine**:

```powershell
# Navigate to project root
cd "D:\Coding\Web Dev\CoRe_Test\CoRe_Test\complaint-management"

# Upload backend folder to OCI
scp -i "..\ssh-key-2025-12-05.key" -r backend ubuntu@140.245.253.253:~/
```

### 2.4 Setup and Start Backend

Back on **OCI instance**:

```bash
cd ~/backend

# Install dependencies
npm install --production

# Test the backend
node server.js
# Should see: "Server running on http://localhost:5000" and "Connected to MySQL database"
# Press Ctrl+C to stop

# Start with PM2
pm2 start server.js --name corems-backend

# Configure PM2 to start on system boot
pm2 startup
# Copy and run the command it outputs

pm2 save

# Check status
pm2 status
pm2 logs corems-backend

# Monitor in real-time
pm2 monit
```

### 2.5 Configure Firewall for Backend

```bash
# Allow port 5000 for backend API
sudo ufw allow 5000/tcp

# Check firewall status
sudo ufw status
```

**Also add OCI Security List rule:**
1. Go to Oracle Cloud Console
2. Navigate to: **Compute → Instances → Your Instance**
3. Click **Subnet** → **Default Security List**
4. Add Ingress Rule:
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: TCP
   - Destination Port: `5000`

### 2.6 Test Backend API

From your **local machine**:
```powershell
curl http://140.245.253.253:5000/api/categories
```

Should return JSON with 13 categories.

---

## Part 3: Frontend Deployment with Nginx

### 3.1 Install Nginx

On **OCI instance**:

```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 3.2 Upload Frontend Build

From your **local machine**:

```powershell
# Upload the build folder
scp -i "..\ssh-key-2025-12-05.key" -r frontend\build ubuntu@140.245.253.253:~/frontend-build
```

### 3.3 Configure Nginx

On **OCI instance**:

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/corems
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name 140.245.253.253;

    root /var/www/corems;
    index index.html;

    # Frontend - React App
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
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

    # Uploads folder for complaint photos
    location /uploads {
        alias /home/ubuntu/backend/uploads;
        autoindex off;
    }
}
```

Save and exit (Ctrl+X, Y, Enter)

```bash
# Create web root directory
sudo mkdir -p /var/www/corems

# Copy frontend build files
sudo cp -r ~/frontend-build/* /var/www/corems/

# Set correct permissions
sudo chown -R www-data:www-data /var/www/corems
sudo chmod -R 755 /var/www/corems

# Enable the site
sudo ln -s /etc/nginx/sites-available/corems /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3.4 Configure Firewall for HTTP/HTTPS

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check firewall
sudo ufw status
```

**Also add OCI Security List rules** for ports 80 and 443.

### 3.5 Test Frontend

Open browser: `http://140.245.253.253`

Should see the CoreMS login page!

---

## Part 4: SSL/HTTPS Setup (Optional but Recommended)

### 4.1 Get a Domain Name (Optional)

If you have a domain (e.g., `corems.yourdomain.com`):
1. Point an A record to `140.245.253.253`
2. Wait for DNS propagation

### 4.2 Install Certbot for Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (with domain)
sudo certbot --nginx -d your-domain.com

# Or for IP-based (self-signed)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt
```

Then update Nginx config:

```nginx
server {
    listen 443 ssl;
    server_name 140.245.253.253;

    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;

    # ... rest of config same as above
}

server {
    listen 80;
    server_name 140.245.253.253;
    return 301 https://$server_name$request_uri;
}
```

---

## Part 5: Monitoring and Maintenance

### 5.1 PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs corems-backend

# Restart backend
pm2 restart corems-backend

# Stop backend
pm2 stop corems-backend

# Monitor resources
pm2 monit
```

### 5.2 Nginx Commands

```bash
# Check status
sudo systemctl status nginx

# Reload (after config changes)
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### 5.3 MySQL Commands

```bash
# Check status
sudo systemctl status mysql

# Connect to database
mysql -u corems_user -pCoReMSPass@2026 corems_db

# Backup database
mysqldump -u corems_user -pCoReMSPass@2026 corems_db > backup.sql

# Restore database
mysql -u corems_user -pCoReMSPass@2026 corems_db < backup.sql
```

### 5.4 Check Disk Space

```bash
# Check disk usage
df -h

# Check folder sizes
du -h --max-depth=1 /var/www
du -h --max-depth=1 ~/backend
```

---

## Part 6: Updating the Application

### 6.1 Update Backend

From **local machine**:
```powershell
# Upload new backend code
scp -i "..\ssh-key-2025-12-05.key" backend\server.js ubuntu@140.245.253.253:~/backend/
```

On **OCI instance**:
```bash
cd ~/backend
pm2 restart corems-backend
pm2 logs corems-backend
```

### 6.2 Update Frontend

From **local machine**:
```powershell
# Build new frontend
cd complaint-management\frontend
npm run build

# Upload to OCI
scp -i "..\ssh-key-2025-12-05.key" -r build ubuntu@140.245.253.253:~/frontend-build-new
```

On **OCI instance**:
```bash
# Backup old build
sudo mv /var/www/corems /var/www/corems-backup

# Deploy new build
sudo mkdir -p /var/www/corems
sudo cp -r ~/frontend-build-new/* /var/www/corems/
sudo chown -R www-data:www-data /var/www/corems
sudo chmod -R 755 /var/www/corems

# Test
curl http://localhost
```

---

## Part 7: Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs corems-backend

# Check if port 5000 is in use
sudo lsof -i :5000

# Test database connection
mysql -u corems_user -pCoReMSPass@2026 corems_db -e "SELECT 1"

# Restart backend
pm2 restart corems-backend
```

### Frontend Not Loading

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Verify files exist
ls -la /var/www/corems/

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### API Calls Failing

1. Check if backend is running: `pm2 status`
2. Test API directly: `curl http://localhost:5000/api/categories`
3. Check Nginx proxy config
4. Check firewall: `sudo ufw status`
5. Check OCI Security List for port 5000

### Database Connection Issues

```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -h 140.245.253.253 -u corems_user -pCoReMSPass@2026 corems_db

# Check MySQL logs
sudo tail -50 /var/log/mysql/error.log
```

---

## Deployment Checklist

### Infrastructure
- [ ] OCI Compute Instance running
- [ ] MySQL installed and configured
- [ ] Node.js v18 installed
- [ ] PM2 installed globally
- [ ] Nginx installed and configured

### Database
- [ ] Database `corems_db` created
- [ ] User `corems_user` created with correct password
- [ ] Schema imported (5 tables created)
- [ ] Sample categories loaded (13 categories)
- [ ] Remote access configured (bind-address = 0.0.0.0)

### Backend
- [ ] Code uploaded to OCI
- [ ] Dependencies installed
- [ ] `.env` file configured with correct database credentials
- [ ] Backend running with PM2
- [ ] PM2 configured to start on boot
- [ ] Port 5000 accessible (firewall + security list)

### Frontend
- [ ] Production build created
- [ ] `.env.production` has correct API URL
- [ ] Build uploaded to OCI
- [ ] Nginx configured to serve frontend
- [ ] Nginx proxy configured for /api routes
- [ ] Port 80 accessible (firewall + security list)

### Testing
- [ ] Can access frontend at `http://140.245.253.253`
- [ ] Can signup new users (all 4 roles)
- [ ] Can login and see correct dashboard per role
- [ ] Can create complaints
- [ ] Can update complaint status (admin/superadmin)
- [ ] Observer can see all complaints read-only
- [ ] Admin sees only assigned categories
- [ ] Dark mode toggle works
- [ ] Logo inverts in dark mode

### Optional (Production)
- [ ] SSL certificate configured
- [ ] Domain name pointed to OCI instance
- [ ] HTTPS redirect configured
- [ ] Automated backups configured
- [ ] Monitoring setup (PM2 monitoring, CloudWatch, etc.)

---

## URLs After Deployment

- **Frontend**: `http://140.245.253.253`
- **Backend API**: `http://140.245.253.253:5000/api`
- **Direct Backend**: `http://140.245.253.253:5000` (via proxy at /api)

---

## Security Best Practices

1. **Change default MySQL passwords** in production
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** (Let's Encrypt or self-signed)
4. **Configure proper CORS** in backend
5. **Use strong passwords** for admin/superadmin signup
6. **Regular backups** of database
7. **Update system packages** regularly:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
8. **Monitor logs** for suspicious activity
9. **Limit SSH access** to specific IPs if possible
10. **Consider using Oracle Cloud WAF** for additional protection

---

## Cost Estimation (Oracle Cloud Free Tier)

| Resource | Free Tier Allowance | Current Usage |
|----------|---------------------|---------------|
| Compute | 2 VMs (ARM64) | 1 VM |
| Storage | 200 GB block volume | ~10 GB |
| Outbound Transfer | 10 TB/month | < 1 GB/month |
| MySQL | Self-hosted (included in compute) | Self-hosted |

**Total Monthly Cost**: $0 (within Free Tier limits)

---

**Deployment Complete! 🎉**

Your CoreMS Complaint Management System is now live on Oracle Cloud!
