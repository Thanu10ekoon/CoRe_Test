# Role-Based System Deployment Guide

## Overview
This guide walks you through deploying the new 4-role system with dynamic categories. The system now supports:
- **User**: Create and view own complaints
- **Observer**: Create own complaints + view all complaints (read-only)
- **Admin**: Manage complaints in assigned categories
- **Super Admin**: Full system access + manage categories and users

---

## Step 1: Database Migration

### 1.1 Connect to Your MySQL Database
```bash
# Using MySQL CLI
mysql -h <your-database-host> -u <username> -p <database-name>

# For Clever Cloud, get connection details from dashboard
```

### 1.2 Run Migration Script
```bash
# Navigate to backend folder
cd complaint-management/backend

# Run the migration
mysql -h <host> -u <username> -p <database> < migration_roles_categories.sql
```

### 1.3 Verify Migration
```sql
-- Check new tables exist
SHOW TABLES LIKE 'CoReMS%';

-- Expected output:
-- CoReMSadmin_categories
-- CoReMScategories
-- CoReMScomplaints
-- CoReMSstatus
-- CoReMSusers

-- Check role column updated
DESCRIBE CoReMSusers;

-- Check categories table has sample data
SELECT * FROM CoReMScategories;
```

---

## Step 2: Backend Setup

### 2.1 Install Dependencies (if needed)
```bash
cd complaint-management/backend
npm install
```

### 2.2 Verify Environment Variables
Check your `.env` file or environment settings:
```env
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
PORT=5000
```

### 2.3 Start Backend Server
```bash
# Development mode
node server.js

# Or with PM2 (for production)
pm2 start server.js --name "corems-backend"
pm2 save
```

### 2.4 Test Backend Endpoints
```bash
# Test categories endpoint
curl http://localhost:5000/api/categories

# Test signup with new role (observer)
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testobserver","password":"test123","role":"observer"}'
```

---

## Step 3: Frontend Setup

### 3.1 Install Dependencies (if needed)
```bash
cd complaint-management/frontend
npm install
```

### 3.2 Update API URL (if needed)
Check [src/pages/Login.js](frontend/src/pages/Login.js) and other files for API endpoint:
```javascript
const API_URL = 'http://your-backend-url:5000';
```

### 3.3 Build Frontend
```bash
# Production build
npm run build

# Development mode
npm start
```

### 3.4 Test Frontend Locally
1. Open browser to `http://localhost:3000`
2. Test signup for each role:
   - **User**: No special password needed
   - **Observer**: Password = `ObserverPass#2024`
   - **Admin**: Password = `    ` + select categories
   - **Super Admin**: Password = `SuperRuhPass#2024`

---

## Step 4: Mobile App Setup

### 4.1 Update API URL
Edit [mobile/lib/services/api_service.dart](mobile/lib/services/api_service.dart):
```dart
static const String baseUrl = 'http://your-backend-url:5000';
```

### 4.2 Install Dependencies
```bash
cd complaint-management/mobile
flutter pub get
```

### 4.3 Build Mobile App

#### For Android
```bash
# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release

# App Bundle for Play Store
flutter build appbundle --release
```

#### For iOS (Mac only)
```bash
flutter build ios --release
```

### 4.4 Install on Device
```bash
# Install debug APK
flutter install

# Or manually install from
# build/app/outputs/flutter-apk/app-release.apk
```

---

## Step 5: Testing the New System

### 5.1 Create Test Accounts

#### Test User Account
1. Open signup page
2. Username: `testuser`
3. Password: `user1234`
4. Role: **User**
5. Login and verify:
   - ✓ Can create complaints
   - ✓ Can view own complaints only
   - ✗ Cannot see other users' complaints

#### Test Observer Account
1. Signup with:
   - Username: `testobserver`
   - Password: `observer1234`
   - Role: **Observer**
   - Special Password: `ObserverPass#2024`
2. Login and verify:
   - ✓ Can create own complaints
   - ✓ Can view ALL complaints (read-only)
   - ✗ Cannot update status on any complaint

#### Test Admin Account
1. Signup with:
   - Username: `testadmin`
   - Password: `admin1234`
   - Role: **Admin**
   - Special Password: `RuhPass#1999`
   - **Select Categories**: Check "Hostel", "Canteen"
2. Login and verify:
   - ✓ Can view complaints in Hostel category only
   - ✓ Can view complaints in Canteen category only
   - ✓ Can update status on assigned categories
   - ✗ Cannot see complaints in other categories

#### Test Super Admin Account
1. Signup with:
   - Username: `superadmin`
   - Password: `super1234`
   - Role: **Super Admin**
   - Special Password: `SuperRuhPass#2024`
2. Login and verify:
   - ✓ Can view ALL complaints
   - ✓ Can update status on any complaint
   - ✓ Can create/edit/delete categories
   - ✓ Can change user roles
   - ✓ Has "Categories" and "Users" tabs

### 5.2 Test Category Assignment

1. Login as **Super Admin**
2. Go to "Categories" tab
3. Verify sample categories exist:
   - Academic
   - Hostel
   - Canteen
   - Library
   - Sports
   - Maintenance
   - Security
   - Documentation

### 5.3 Test Complaint Flow

1. **User creates complaint**:
   - Login as testuser
   - Create complaint with title "Test Hostel Issue"
   - Select category: "Hostel"

2. **Observer views complaint**:
   - Login as testobserver
   - Go to "All Complaints" tab
   - Verify you can see "Test Hostel Issue"
   - Try to update status → Should NOT have update option

3. **Admin manages complaint**:
   - Login as testadmin (with Hostel category)
   - Verify you can see "Test Hostel Issue"
   - Update status to "Under Review"
   - Try creating complaint in "Library" category
   - Verify you DON'T see complaints from other categories

4. **Super Admin oversight**:
   - Login as superadmin
   - Verify you see ALL complaints
   - Update any status
   - Go to "Users" tab
   - Change testuser role to observer
   - Logout and login as testuser → verify new dashboard

---

## Step 6: Production Deployment

### 6.1 Backend Deployment

#### Option A: PM2 (Recommended)
```bash
cd complaint-management/backend

# Start with PM2
pm2 start server.js --name corems-backend

# Enable startup script
pm2 startup
pm2 save

# Monitor
pm2 monit
```

#### Option B: Vercel/Heroku
Follow existing deployment guides in the backend folder.

### 6.2 Frontend Deployment

```bash
cd complaint-management/frontend

# Build for production
npm run build

# Deploy build folder to:
# - Vercel
# - Netlify
# - Firebase Hosting
# - Or your web server
```

### 6.3 Mobile Deployment

#### Google Play Store
1. Build release bundle:
   ```bash
   flutter build appbundle --release
   ```
2. Upload `build/app/outputs/bundle/release/app-release.aab` to Play Console

#### App Store (iOS)
1. Build release:
   ```bash
   flutter build ios --release
   ```
2. Archive in Xcode and upload to App Store Connect

---

## Step 7: Post-Deployment Checklist

### Database
- [ ] Migration script executed successfully
- [ ] Sample categories created
- [ ] User roles updated to new ENUM values

### Backend
- [ ] Server running without errors
- [ ] `/api/categories` endpoint returns data
- [ ] `/api/auth/signup` accepts new roles
- [ ] `/api/complaints` filters by admin categories

### Frontend
- [ ] All 4 roles visible in signup dropdown
- [ ] Category multi-select shows for admin signup
- [ ] Login redirects to correct dashboard per role
- [ ] SuperAdminDashboard has 3 tabs
- [ ] ObserverDashboard has 2 tabs (My + All)

### Mobile
- [ ] App builds without errors
- [ ] All screens imported in main.dart
- [ ] Login navigation handles 4 roles
- [ ] Category chips display in signup

### Functional Testing
- [ ] User can only see own complaints
- [ ] Observer can view all but not update
- [ ] Admin sees only assigned categories
- [ ] Super Admin has full access
- [ ] Category assignment works
- [ ] User role changes reflect immediately

---

## Special Passwords Reference

| Role | Signup Password |
|------|-----------------|
| User | (none required) |
| Observer | `ObserverPass#2024` |
| Admin | `RuhPass#1999` |
| Super Admin | `SuperRuhPass#2024` |

**Security Note**: In production, consider implementing a proper invite system or admin-controlled user creation instead of hardcoded passwords.

---

## Troubleshooting

### Issue: "Invalid admin password"
**Solution**: Verify you're using the correct password for the selected role (see table above)

### Issue: Categories not loading in signup
**Solution**: 
1. Check backend is running
2. Verify `/api/categories` returns data
3. Check browser console for CORS errors

### Issue: Admin sees all complaints instead of filtered
**Solution**:
1. Verify admin_categories junction table populated
2. Check signup actually saved category selections
3. Query: `SELECT * FROM CoReMSadmin_categories WHERE user_id = <admin_id>`

### Issue: Login redirects to wrong dashboard
**Solution**: Check user role in database matches expected value: `user`, `observer`, `admin`, or `superadmin`

### Issue: Mobile build errors
**Solution**:
```bash
flutter clean
flutter pub get
flutter build apk
```

---

## Rollback Instructions

If you need to revert the changes:

### Database Rollback
```sql
-- Drop new tables
DROP TABLE IF EXISTS CoReMSadmin_categories;
DROP TABLE IF EXISTS CoReMScategories;

-- Revert users table
ALTER TABLE CoReMSusers 
  MODIFY role ENUM('user', 'admin') NOT NULL DEFAULT 'user';

-- Add back subrole if needed
ALTER TABLE CoReMSusers 
  ADD COLUMN subrole VARCHAR(50) DEFAULT 'user';
```

### Code Rollback
```bash
# Use git to revert
git checkout HEAD~1 -- backend/
git checkout HEAD~1 -- frontend/
git checkout HEAD~1 -- mobile/
```

---

## Support

For issues or questions:
1. Check error logs: `pm2 logs corems-backend`
2. Review browser console for frontend errors
3. Check Flutter logs: `flutter logs`

---

**Developed by Scorpion X**  
Last Updated: February 15, 2026
