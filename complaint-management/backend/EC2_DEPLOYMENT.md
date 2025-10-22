# Backend Deployment on EC2 with PM2

## Prerequisites

1. **EC2 Instance Running:**
   - Ubuntu Server (or similar Linux distribution)
   - Node.js installed
   - MySQL client (if needed for testing)

2. **Repository Cloned:**
   ```bash
   cd /home/ubuntu
   git clone https://github.com/Thanu10ekoon/CoRe_Test.git
   cd CoRe_Test/complaint-management/backend
   ```

## Setup Steps

### 1. Install Dependencies

```bash
cd /home/ubuntu/CoRe_Test/complaint-management/backend
npm install
```

### 2. Install PM2 Globally

```bash
sudo npm install -g pm2
```

### 3. Create Logs Directory

```bash
mkdir -p /home/ubuntu/CoRe_Test/complaint-management/backend/logs
```

### 4. Configure Environment (Optional)

If you want to use `.env` file instead of hardcoded credentials:

```bash
nano .env
```

Add:
```
NODE_ENV=production
PORT=5000
DB_HOST=bp2juxysn0nszxvmkkzj-mysql.services.clever-cloud.com
DB_USER=udflccbdblfustx7
DB_PASSWORD=qgnCvYDdKjXJIfaLe8hL
DB_NAME=bp2juxysn0nszxvmkkzj
```

Then update `server.js` to use `process.env` variables.

### 5. Start Backend with PM2

Using the ecosystem config file:

```bash
cd /home/ubuntu/CoRe_Test/complaint-management/backend
pm2 start ecosystem.config.js
```

Or directly:

```bash
pm2 start server.js --name "complaint-backend" --cwd /home/ubuntu/CoRe_Test/complaint-management/backend
```

### 6. Verify Backend is Running

```bash
pm2 list
pm2 logs complaint-backend
```

Test endpoint:
```bash
curl http://localhost:5000/api/complaints
```

From external:
```bash
curl http://16.171.69.23:5000/api/complaints
```

### 7. Setup PM2 to Start on Boot

```bash
pm2 startup systemd
# Follow the command it outputs (run with sudo)

pm2 save
```

This ensures your backend starts automatically after server reboot.

## PM2 Commands

### View Status
```bash
pm2 list
pm2 status complaint-backend
```

### View Logs
```bash
pm2 logs complaint-backend         # Live logs
pm2 logs complaint-backend --lines 100   # Last 100 lines
pm2 logs complaint-backend --err    # Only errors
```

### Restart/Stop/Reload
```bash
pm2 restart complaint-backend
pm2 stop complaint-backend
pm2 delete complaint-backend
pm2 reload complaint-backend    # Zero-downtime restart
```

### Monitor
```bash
pm2 monit                      # Real-time monitoring
```

### Clear Logs
```bash
pm2 flush complaint-backend    # Clear logs
```

## Updating the Backend

When you push updates to GitHub:

```bash
# SSH into EC2
ssh ubuntu@16.171.69.23

# Pull latest changes
cd /home/ubuntu/CoRe_Test
git pull origin main

# Install any new dependencies
cd complaint-management/backend
npm install

# Restart the backend
pm2 restart complaint-backend
```

## Port Configuration

The backend runs on port **5000**. Ensure EC2 Security Group allows:
- **Inbound Rule:** TCP port 5000 from anywhere (0.0.0.0/0) or your specific IPs

## Firewall (if UFW is enabled)

```bash
sudo ufw allow 5000/tcp
sudo ufw status
```

## Troubleshooting

### Backend not accessible externally:
1. Check security group allows port 5000
2. Verify EC2 public IP: `curl ifconfig.me`
3. Check backend is listening: `netstat -tulpn | grep 5000`
4. Test locally first: `curl http://localhost:5000/api/complaints`

### PM2 process keeps crashing:
```bash
pm2 logs complaint-backend --err
```
Check for:
- Database connection errors
- Missing dependencies
- Port already in use

### Database connection fails:
- Verify Clever Cloud MySQL is accessible from EC2
- Check credentials in server.js
- Test connection: `mysql -h bp2juxysn0nszxvmkkzj-mysql.services.clever-cloud.com -u udflccbdblfustx7 -p`

### Out of memory:
Increase max memory in ecosystem.config.js:
```javascript
max_memory_restart: "2G"
```

## Log Files

Logs are stored in:
- **Error logs:** `/home/ubuntu/CoRe_Test/complaint-management/backend/logs/error.log`
- **Output logs:** `/home/ubuntu/CoRe_Test/complaint-management/backend/logs/output.log`
- **Combined logs:** `/home/ubuntu/CoRe_Test/complaint-management/backend/logs/combined.log`

View logs:
```bash
tail -f /home/ubuntu/CoRe_Test/complaint-management/backend/logs/combined.log
```

## Performance Tuning

For production, you can run multiple instances:

Edit `ecosystem.config.js`:
```javascript
instances: "max",  // Use all CPU cores
exec_mode: "cluster"
```

Then restart:
```bash
pm2 restart complaint-backend
```

## Backup Strategy

### Database:
Clever Cloud handles MySQL backups automatically.

### Uploaded Photos:
```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz /home/ubuntu/CoRe_Test/complaint-management/backend/uploads

# Or setup automatic backup with cron
crontab -e
# Add: 0 2 * * * tar -czf ~/backups/uploads-$(date +\%Y\%m\%d).tar.gz /home/ubuntu/CoRe_Test/complaint-management/backend/uploads
```

---

**Backend URL:** http://16.171.69.23:5000  
**PM2 Config:** `/home/ubuntu/CoRe_Test/complaint-management/backend/ecosystem.config.js`  
**Status:** Ready for production ✅
