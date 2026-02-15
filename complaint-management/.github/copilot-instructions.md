# CoRe Complaint Management System - AI Agent Instructions

## Project Overview

This is a **full-stack complaint management system** with three components:
- **Backend**: Node.js/Express REST API hosted on Vercel
- **Frontend**: React.js web application  
- **Mobile**: Flutter mobile application (iOS/Android)

**Backend URL**: `https://co-re-test.vercel.app/api`

## Architecture & Key Concepts

### Role-Based Access Control
- **Users**: Can create and view their own complaints
- **Admins**: Have subroles that determine complaint visibility
  - `Dean` & `ComplaintsManager`: See all complaints
  - Other subroles (Warden, AR, CanteenCordinator, etc.): See category-specific complaints

### Complaint Category Mapping
```javascript
{
  "Warden": "Hostel",
  "AR": "Documentation",
  "CanteenCordinator": "Canteen",
  "AcademicCordinator": "Academic",
  "SportCordinator": "Sports",
  "MaintainanceCordinator": "Maintainance",
  "Librarian": "Library",
  "SecurityCordinator": "Security"
}
```

### Database Schema (MySQL)
- `CoReMSusers`: `user_id`, `username`, `password`, `role`, `subrole`
- `CoReMScomplaints`: `complaint_id`, `user_id`, `title`, `description`, `category`, `photo_url`, `status`, `created_at`, `updated_by_admin`
- `CoReMSstatus`: `update_id`, `complaint_id`, `admin_id`, `update_text`, `update_date`

### Photo Upload System
- **Storage**: Backend `/uploads` directory (temporary for Vercel)
- **Formats**: JPEG, JPG, PNG, GIF
- **Size Limit**: 5MB per photo
- **Field Name**: `photo` (multipart/form-data)
- **Access**: Photos served at `{BASE_URL}/uploads/{filename}`
- **Mobile**: Uses `image_picker` package for camera/gallery access

## Tech Stack

### Backend (`/backend`)
- **Framework**: Express.js
- **Database**: MySQL (Clever Cloud)
- **File Upload**: Multer middleware for photo uploads
- **Deployment**: Vercel serverless
- **Key Files**:
  - `server.js`: Main API routes, exports Express app, multer configuration
  - `db.js`: Database connection (legacy, credentials in server.js)
  - `vercel.json`: Serverless config
  - `uploads/`: Photo storage directory

### Frontend (`/frontend`)
- **Framework**: React 18 + React Router
- **UI**: React Bootstrap
- **State**: localStorage for auth
- **Key Pattern**: Environment variable `REACT_APP_API_BASE_URL` for API calls
- **Routes**: `/`, `/user-dashboard`, `/admin-dashboard`, `/complaint/:id`, `/complaint/new`
- **Components**: All in `src/components/`, pages in `src/pages/`

### Mobile (`/mobile`)
- **Framework**: Flutter 3.0+
- **State**: SharedPreferences for auth
- **HTTP**: `http` package
- **Image Picker**: `image_picker` package for camera/gallery
- **Key Files**:
  - `lib/main.dart`: Entry point with splash screen
  - `lib/services/api_service.dart`: All API calls including multipart upload
  - `lib/screens/`: All screens (login, dashboards, details, new complaint)
  - `android/app/src/main/AndroidManifest.xml`: Camera/storage permissions

## Critical Workflows

### Running the Project

**Backend (Local):**
```bash
cd backend
npm install
node server.js  # Runs on port 5000
```

**Frontend:**
```bash
cd frontend
npm install
npm start  # Port 3000
# Build: npm run build
```

**Mobile:**
```bash
cd mobile
flutter pub get
flutter run
# Build APK: flutter build apk --release
```

### Authentication Flow
1. User enters username/password
2. `POST /api/login` returns `{user_id, username, role, subrole}`
3. Frontend/Mobile stores in localStorage/SharedPreferences
4. Role determines routing (admin → admin-dashboard, user → user-dashboard)

### Complaint Filtering (Admin)
- Admin requests include `?admin_id=X` query param
- Backend checks admin subrole and filters by category OR returns all if Dean/ComplaintsManager
- Response includes JOIN with admin details: `admin_username`, `admin_subrole`

## Project-Specific Patterns

### API Response Format
All endpoints return JSON. Success responses have data directly or in `message` field.
```javascript
// Login
{user_id: 1, username: "john", role: "admin", subrole: "Dean"}

// Create complaint
{message: "Complaint added successfully", complaint_id: 123}
```

### Frontend API Calls
```javascript
// Pattern used throughout
axios.post(`${process.env.REACT_APP_API_BASE_URL}/complaints`, data)
```

### Mobile API Calls
```dart
// All in ApiService class
static const String baseUrl = 'https://co-re-test.vercel.app/api';
// Methods: login(), getUserComplaints(), createComplaint(), etc.
```

### Status Updates
- Multiple status updates per complaint stored in `CoReMSstatus` table
- When admin updates status:
  1. Update `CoReMScomplaints.status` and `updated_by_admin`
  2. Insert new record in `CoReMSstatus` with update text and admin ID
- History displayed chronologically in ComplaintDetails

### CORS Configuration
Backend allows all origins dynamically:
```javascript
cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  credentials: true
})
```

## Common Pitfalls

1. **Do NOT modify backend/frontend when working on mobile** - They are separate deployments
2. **Category is required** when creating complaints (added in recent update)
3. **Admin filtering is server-side** - don't filter complaints in frontend/mobile
4. **Vercel deployment**: `module.exports = app` in server.js, local dev checks `NODE_ENV`
5. **Status vs StatusUpdate**: `status` is current state, `CoReMSstatus` table is full history

## File References

### Key Configuration Files
- `backend/vercel.json`: Serverless routing
- `frontend/src/App.js`: React routing with AuthGuard
- `mobile/lib/main.dart`: Flutter app structure and routes
- `mobile/pubspec.yaml`: Flutter dependencies

### Important Components
- `frontend/src/components/AdminDashboard.js`: Status update logic, complaint filtering
- `frontend/src/components/NewComplaint.js`: Category dropdown (must match backend mapping)
- `mobile/lib/screens/admin_dashboard_screen.dart`: Status update UI with TextControllers
- `mobile/lib/services/api_service.dart`: Single source of truth for API endpoints

## Development Guidelines

- **Adding new complaint categories**: Update both backend mapping AND frontend/mobile dropdowns
- **Changing API endpoints**: Update `server.js` AND both frontends (React + Flutter)
- **Deployment**: Backend/Frontend are on Vercel, mobile is standalone APK/IPA

---

**Project maintained by Scorpion X**
