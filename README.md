# CoRe MS
## Complaints & Requests Management System
<p align="left"><img src="https://i.ibb.co/cXsYwrCh/core-ms-high-resolution-logo.png" width = "300px"></p>


## Overview
The Complaint Management System is a comprehensive multi-platform application that allows users to submit complaints and track their status. The system features a modern web interface with dark mode, a mobile application with photo upload capability, and a sophisticated role-based authentication system with four distinct roles and dynamic category-based access control.

## ⚙️ Tech Stack

- **Web Frontend:** React.js with React-Bootstrap and Dark Mode support
- **Mobile App:** Flutter (Dart) with Material Design 3
- **Backend:** Node.js with Express.js  
- **Database:** MySQL 8.0 (Oracle Cloud Infrastructure)
- **Deployment:** GitHub Actions + PM2 + Nginx
- **Cloud Infrastructure:** Oracle Cloud Infrastructure (OCI)

---

## ✨ Features

### 🎨 UI/UX Features:
- **Dark Mode:** Full dark mode support across all pages with logo inversion
- **Responsive Design:** Bootstrap-based responsive layout for all screen sizes
- **Theme Persistence:** User theme preference saved in localStorage
- **Modern Color Scheme:** Maroon primary (#5F0A0C) and golden secondary (#FDC134)

### 👤 User Features:
- Submit a new complaint with title, description, and category selection
- **Upload photos** with complaints for better documentation (mobile app)
- View a list of previously submitted complaints with status and update history
- View **complete status history** for each complaint
- **Cross-platform access** - Web and Android mobile app

### 👁️ Observer Features:
- **Read-only access** to all complaints across all categories
- View complaint status updates and history
- Cannot modify or update any complaint status
- Ideal for supervisors and monitoring roles

### 🛡️ Admin Features:
- **Category-based access control** - Admins can only see complaints in their assigned categories
- Can be assigned to **multiple categories** (e.g., Hostel + Canteen)
- Update complaint status with custom status text
- Status updates are time-stamped and linked to the admin who made the update
- Full visibility into status update history for assigned complaints

### 🔱 Super Admin Features:
- **Full system access** to all complaints across all categories
- **User Management:** Create, view, and manage users with any role
- **Category Management:** Create, edit, and delete complaint categories
- **Admin Assignment:** Assign/unassign categories to admin users
- System-wide oversight and control

### 🔐 Authentication:
- **Four-role system:** User, Observer, Admin, Super Admin
- Role-based dashboard redirection on login
- Secure JWT-based authentication
- Pre-hashed passwords (bcrypt) for security

---

## 🗃️ Database Schema

### `CoReMSusers` Table
| Column   | Data Type      | Description |
|----------|----------------|-------------|
| id       | INT (AUTO_INCREMENT, PRIMARY KEY) | Unique user ID |
| username | VARCHAR(255) UNIQUE | Unique username |
| password | VARCHAR(255)   | Hashed password (bcrypt) |
| role     | ENUM('user', 'observer', 'admin', 'superadmin') | User role |

### `CoReMScategories` Table
| Column   | Data Type      | Description |
|----------|----------------|-------------|
| id       | INT (AUTO_INCREMENT, PRIMARY KEY) | Unique category ID |
| name     | VARCHAR(100) UNIQUE | Category name |

**Default Categories:**
Academic, Hostel, Canteen, Library, Sports, IT Support, Infrastructure, Transport, Health Services, Security, Maintenance, Administration, Other

### `CoReMSadmin_categories` Table (Junction Table)
| Column      | Data Type      | Description |
|-------------|----------------|-------------|
| id          | INT (AUTO_INCREMENT, PRIMARY KEY) | Unique assignment ID |
| admin_id    | INT (FOREIGN KEY) | FK to CoReMSusers.id |
| category_id | INT (FOREIGN KEY) | FK to CoReMScategories.id |

### `CoReMScomplaints` Table
| Column       | Data Type    | Description |
|--------------|--------------|-------------|
| id           | INT (AUTO_INCREMENT, PRIMARY KEY) | Unique complaint ID |
| user_id      | INT (FOREIGN KEY) | FK to CoReMSusers.id |
| title        | VARCHAR(255) | Complaint title |
| description  | TEXT         | Complaint details |
| category_id  | INT (FOREIGN KEY) | FK to CoReMScategories.id |
| status       | VARCHAR(255) | Default: 'Pending' |
| photo_url    | VARCHAR(500) | URL to uploaded photo (mobile) |
| date         | TIMESTAMP (DEFAULT CURRENT_TIMESTAMP) | Date of submission |
| updated_by_admin | INT (FOREIGN KEY) | Admin who last updated |

### `CoReMSstatus` Table
| Column       | Data Type    | Description |
|--------------|--------------|-------------|
| id           | INT (AUTO_INCREMENT, PRIMARY KEY) | Unique status update ID |
| complaint_id | INT (FOREIGN KEY) | Associated complaint |
| admin_id     | INT (FOREIGN KEY) | Admin who made the update |
| update_text  | TEXT         | Status update description |
| date         | TIMESTAMP (DEFAULT CURRENT_TIMESTAMP) | Timestamp of update |

---

## 🚀 Deployment & Infrastructure

### Backend Hosting
- **Platform:** Oracle Cloud Infrastructure (OCI)
- **Server IP:** `140.245.253.253`
- **Process Manager:** PM2 (ecosystem.config.js)
- **API Endpoint:** `http://140.245.253.253:5000`
- **Database:** MySQL 8.0 on OCI (same server)

### Frontend Hosting
- **Platform:** Nginx on OCI
- **Served via:** Reverse proxy from Nginx
- **Build Output:** `/var/www/complaint-management/`
- **Access URL:** `http://140.245.253.253`

### Deployment Method
- **GitHub Actions:** Automatic deployment on push to `main` branch
- **Workflow:** `.github/workflows/deploy.yml`
- **Process:** Git pull → npm install → build → restart services
- **Guide:** See `GITHUB_DEPLOYMENT_GUIDE.md`

### Mobile Application
- **Framework:** Flutter
- **Platform Support:** Android (primary), Web, Windows
- **Key Features:** 
  - Cross-platform complaint submission
  - Photo upload functionality
  - Real-time status tracking
  - Dark mode support

---

## 🔧 Local Development Setup

### Prerequisites
- Node.js 18.x or higher
- MySQL 8.0
- Git

### Backend Setup
```bash
cd complaint-management/backend
npm install
```

Create `.env` file:
```env
PORT=5000
DB_HOST=140.245.253.253
DB_USER=corems_user
DB_PASSWORD=CoReMSPass@2026
DB_NAME=corems_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Start backend:
```bash
npm start
# or for development
npm run dev
```

### Frontend Setup
```bash
cd complaint-management/frontend
npm install
npm start
```

Frontend will run on `http://localhost:3000`

### Database Setup
```bash
# SSH into OCI instance
ssh -i ssh-key-2025-12-05.key ubuntu@140.245.253.253

# Connect to MySQL
mysql -u corems_user -p corems_db

# Import schema
source fresh_database_setup.sql
```

---

## 🎯 Usage Guide

### For Users:
1. **Sign Up:** Create account with username and password
2. **Login:** Access user dashboard
3. **Submit Complaint:** Fill title, description, select category
4. **Track Status:** View complaint status and update history
5. **Dark Mode:** Toggle theme with sun/moon button

### For Observers:
1. **Login:** Use observer credentials
2. **View Complaints:** Browse all complaints (read-only)
3. **Monitor Status:** Track complaint progress across all categories
4. Cannot modify or update complaints

### For Admins:
1. **Login:** Use admin credentials
2. **View Assigned Complaints:** See only complaints in assigned categories
3. **Update Status:** Add status updates with custom text
4. **Track History:** View complete status update timeline

### For Super Admins:
1. **Login:** Use superadmin credentials
2. **Manage Complaints:** Full access to all complaints
3. **Manage Categories:** Create, edit, delete categories
4. **Manage Users:** Create users, assign roles, assign categories to admins
5. **System Overview:** Complete system control and monitoring

---

## 📋 Role-Based Access Summary

| Feature | User | Observer | Admin | Super Admin |
|---------|------|----------|-------|-------------|
| Submit Complaints | ✅ | ❌ | ✅ | ✅ |
| View Own Complaints | ✅ | - | ✅ | ✅ |
| View All Complaints | ❌ | ✅ | Category-based | ✅ |
| Update Status | ❌ | ❌ | ✅ (assigned) | ✅ |
| Manage Categories | ❌ | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| Assign Admin Categories | ❌ | ❌ | ❌ | ✅ |

---

## 🔒 Security Features

- **Password Hashing:** bcrypt with salt rounds
- **JWT Authentication:** Secure token-based auth
- **Role-Based Access Control:** Enforced at API level
- **Environment Variables:** Sensitive data in .env (not committed)
- **GitHub Secrets:** SSH keys and credentials secured
- **SQL Injection Protection:** Parameterized queries
- **CORS Configuration:** Controlled origin access

---

## 📝 Project Structure

```
CoRe_Test/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions deployment workflow
├── complaint-management/
│   ├── backend/
│   │   ├── routes/                 # API routes
│   │   ├── server.js               # Express server
│   │   ├── db.js                   # MySQL connection
│   │   ├── ecosystem.config.js     # PM2 configuration
│   │   └── fresh_database_setup.sql # Database schema
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/         # Dashboard components
│   │   │   ├── pages/              # Login/Signup pages
│   │   │   ├── contexts/           # ThemeContext
│   │   │   └── App.js
│   │   └── build/                  # Production build
│   └── mobile/
│       ├── lib/
│       │   ├── screens/            # Flutter screens
│       │   ├── models/             # Data models
│       │   └── services/           # API services
│       └── pubspec.yaml
├── GITHUB_DEPLOYMENT_GUIDE.md      # Deployment instructions
├── OCI_DEPLOYMENT_GUIDE.md         # OCI setup guide
└── README.md                       # This file
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Complaints
- `GET /api/complaints` - Get user's complaints (role-based filtering)
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/:id` - Get complaint details

### Status Updates
- `GET /api/status/:complaintId` - Get status history
- `POST /api/status` - Add status update (admin/superadmin only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (superadmin only)
- `PUT /api/categories/:id` - Update category (superadmin only)
- `DELETE /api/categories/:id` - Delete category (superadmin only)

### Users
- `GET /api/users` - Get all users (superadmin only)
- `POST /api/users` - Create user (superadmin only)
- `GET /api/users/:id/categories` - Get admin's assigned categories
- `POST /api/users/:id/categories` - Assign categories (superadmin only)

---

## 📚 Additional Documentation

- **GitHub Deployment:** See `GITHUB_DEPLOYMENT_GUIDE.md`
- **OCI Setup:** See `OCI_DEPLOYMENT_GUIDE.md`
- **Photo Upload:** See `complaint-management/PHOTO_UPLOAD_GUIDE.md`
- **Mobile Setup:** See `complaint-management/mobile/SETUP.md`

---

## 🐛 Known Issues & Limitations

- No email verification implemented
- No forgot password functionality
- Photo upload only available in mobile app
- No complaint filtering/sorting on frontend (shows all assigned)
- Status updates are immutable once submitted

---

## 🔮 Future Enhancements

- Email notifications for status updates
- Real-time updates with WebSocket
- Advanced search and filtering
- Export complaints to PDF/Excel
- Analytics dashboard for super admins
- Multi-language support

---

## 📜 License  
All rights reserved.

---

## 🙌 Credits  
- Developed by **Scorpion X**
- Special thanks to the **University of Ruhuna - Faculty of Engineering**

---
