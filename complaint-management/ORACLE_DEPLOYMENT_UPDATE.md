# Oracle Cloud Deployment Update with Signup Feature

## Changes Made
1. **Added Signup functionality** (web app only)
   - New `/signup` route in frontend
   - `/api/signup` endpoint in backend
   - Password hashing with bcrypt

2. **Updated authentication**
   - Login now uses username/password with bcrypt verification
   - Removed old plain-text password comparison

3. **Database users reset** (CleverCloud)
   - `EG225364` (password: `4635`) - Regular user
   - `Dean` (password: `dean_01`) - Admin

## Deployment Steps

### 1. Push to GitHub
```powershell
cd "d:\Coding\Web Dev\CoRe_Test\CoRe_Test"
git add .
git commit -m "Add signup feature with bcrypt authentication"
git push origin main
```

### 2. SSH to Oracle Cloud Server
```powershell
ssh -i "ssh-key-2025-12-05.key" ubuntu@140.245.253.253
```

### 3. Update Backend Code
```bash
cd ~/CoRe_Test/complaint-management/backend

# Create .env file with database credentials
cat > .env << 'EOF'
DB_HOST=bp2juxysn0nszxvmkkzj-mysql.services.clever-cloud.com
DB_USER=udflccbdblfustx7
DB_PASSWORD=qgnCvYDdKjXJIfaLe8hL
DB_NAME=bp2juxysn0nszxvmkkzj
PORT=5000
EOF

git pull origin main
npm install
pm2 restart complaint-backend
pm2 save
```

### 4. Update Frontend Code
```bash
cd ~/CoRe_Test/complaint-management/frontend
git pull origin main
npm install
npm run build
sudo rm -rf /var/www/complaint-management/*
sudo cp -r build/* /var/www/complaint-management/
```

### 5. Verify Deployment
- Frontend: http://140.245.253.253
- Backend API: http://140.245.253.253/api
- Test signup: Create a new user
- Test login: Use EG225364 / 4635 or Dean / dean_01

## Notes
- Backend now uses .env file for database credentials (must be created on server)
- Frontend .env files now point to Oracle Cloud (http://140.245.253.253/api)
- Nginx configured to proxy /api and /uploads correctly
- Mobile app still uses Oracle Cloud backend
- Signup feature is web-only (mobile app uses existing login)
