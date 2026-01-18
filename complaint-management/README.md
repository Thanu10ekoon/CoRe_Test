# CoRe Complaint Management System (CoreMS)

A comprehensive complaint management system with web frontend, mobile app, and backend API for efficient complaint tracking and resolution.

🌐 **Live Application**: [http://www.corems.abrdns.com/](http://www.corems.abrdns.com/)

## Project Overview

CoreMS is a full-stack complaint management solution designed for educational institutions, enabling students to submit complaints and administrators to efficiently manage and resolve them through a role-based access control system.

## Architecture

### Components

1. **Frontend (React)** - Web-based user interface
2. **Backend (Node.js/Express)** - RESTful API server
3. **Mobile App (Flutter)** - Cross-platform mobile application
4. **Database (MySQL)** - Data persistence layer

### Technology Stack

- **Frontend**: React, Bootstrap, Axios
- **Backend**: Node.js, Express, MySQL2, Multer
- **Mobile**: Flutter 3.0+, Dart
- **Database**: MySQL
- **Hosting**: Oracle Cloud Infrastructure (OCI)

## Features

### Core Functionality
- ✅ User registration and authentication
- ✅ Role-based access control (User/Admin with subroles)
- ✅ Complaint submission with photo upload
- ✅ Real-time complaint status tracking
- ✅ Category-based complaint management
- ✅ Status update timeline with admin notes
- ✅ Advanced search and filtering
- ✅ Dark/Light mode support (Mobile)

### User Features
- Create and submit complaints with photo evidence
- Track complaint status in real-time
- View complaint history
- Search and filter complaints
- Receive status updates

### Admin Features
- View complaints based on subrole permissions
- Update complaint status with comments
- Filter complaints by category and status
- Manage complaints across different departments
- Add detailed status updates

## Mobile Application

### Overview
Native mobile experience built with Flutter for both iOS and Android platforms.

### Features
- 📱 Native mobile UI with Material Design
- 🎨 Custom theming with dark mode support
- 📸 Camera integration for photo uploads
- 📊 Timeline view for status updates
- 🔍 Advanced search and filtering
- 🔔 Real-time complaint tracking
- 🎯 Role-based dashboards

### Color Palette

#### Light Mode
- **Primary (Maroon)**: `#5F0A0C`
- **Secondary (Golden)**: `#FDC134`
- **Background**: White / `#FAFAFA`
- **Text**: `#212121`

#### Dark Mode
- **Primary (Lighter Maroon)**: `#8B1214`
- **Secondary (Lighter Golden)**: `#FFD666`
- **Background**: `#121212` / `#1E1E1E`
- **Text**: `#E0E0E0`

### Installation & Setup

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
flutter pub get

# Run the app
flutter run

# Build for production
flutter build apk --release  # Android
flutter build ios --release  # iOS
```

### Requirements
- Flutter SDK 3.0 or higher
- Dart SDK (bundled with Flutter)
- Android Studio / VS Code with Flutter extensions
- iOS development setup (for iOS builds)

## Backend Infrastructure

### Oracle Cloud Infrastructure (OCI)

- **Host**: Oracle Cloud Compute Instance
- **IP Address**: `54.220.183.213`
- **API Endpoint**: `http://54.220.183.213:5000/api`
- **Web URL**: [http://www.corems.abrdns.com/](http://www.corems.abrdns.com/)
- **Database**: MySQL hosted on OCI
- **Architecture**: Node.js/Express REST API

### API Endpoints

```
POST   /api/login              - User authentication
POST   /api/signup             - User registration
GET    /api/complaints         - Get complaints (role-based)
POST   /api/complaints         - Create new complaint
GET    /api/complaints/:id     - Get complaint details
PUT    /api/complaints/:id/status - Update complaint status
GET    /api/complaints/:id/updates - Get status update history
```

### Setup & Deployment

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start server
node server.js

# Or use PM2 for production
pm2 start ecosystem.config.js
```

## User Roles & Permissions

### Regular Users
- Create and submit complaints
- View own complaint history
- Upload supporting photos
- Track complaint status updates

### Admin Users
Admin access is controlled by subroles with specific category permissions:

- **Dean & ComplaintsManager**: Full access to all complaints
- **Warden**: Hostel-related complaints
- **CanteenCordinator**: Canteen-related complaints
- **AcademicCordinator**: Academic-related complaints
- **SportCordinator**: Sports-related complaints
- **MaintainanceCordinator**: Maintenance-related complaints
- **Librarian**: Library-related complaints
- **SecurityCordinator**: Security-related complaints
- **AR (Academic Registrar)**: Documentation-related complaints
- **HOD_DEIE, HOD_DMME, HOD_DIS, HOD_DMENA, HOD_DCEE**: Department-specific complaints

## Complaint Categories

- **Hostel** - Dormitory and accommodation issues
- **Canteen** - Food service and cafeteria concerns
- **Academic** - Educational and classroom matters
- **Sports** - Athletic facilities and equipment
- **Maintenance** - Infrastructure and facility repairs
- **Library** - Library services and resources
- **Security** - Campus safety and security
- **Documentation** - Administrative paperwork

## Project Structure

```
complaint-management/
├── backend/               # Node.js/Express API server
│   ├── routes/           # API route handlers
│   ├── uploads/          # Uploaded complaint photos
│   ├── server.js         # Main server file
│   ├── db.js            # Database configuration
│   └── package.json     # Backend dependencies
├── frontend/             # React web application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── App.js       # Main app component
│   ├── build/           # Production build
│   └── package.json     # Frontend dependencies
├── mobile/               # Flutter mobile application
│   ├── lib/
│   │   ├── screens/     # UI screens
│   │   ├── services/    # Business logic
│   │   ├── models/      # Data models
│   │   └── main.dart    # App entry point
│   ├── android/         # Android-specific files
│   ├── ios/             # iOS-specific files
│   └── pubspec.yaml     # Flutter dependencies
└── README.md            # This file
```

## Getting Started

### Prerequisites
- Node.js 14+ and npm
- MySQL 8.0+
- Flutter SDK 3.0+ (for mobile)
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd complaint-management
```

2. **Setup Backend**
```bash
cd backend
npm install
# Configure database in db.js
node server.js
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm start
```

4. **Setup Mobile App**
```bash
cd mobile
flutter pub get
flutter run
```

### Environment Variables

Create a `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=corems
PORT=5000
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_BASE_URL=http://54.220.183.213:5000/api
```

## Database Schema

### Users Table
- `user_id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `role` - User role (user/admin)
- `subrole` - Admin subrole

### Complaints Table
- `complaint_id` - Primary key
- `user_id` - Foreign key to users
- `title` - Complaint title
- `description` - Detailed description
- `category` - Complaint category
- `status` - Current status
- `photo_url` - Uploaded photo path
- `created_at` - Timestamp
- `updated_by_admin` - Admin who last updated

### Status Updates Table
- `update_id` - Primary key
- `complaint_id` - Foreign key to complaints
- `admin_id` - Admin who made update
- `update_text` - Status update text
- `update_date` - Timestamp

## Security Features

- 🔒 Password hashing with bcrypt
- 🔑 Token-based authentication
- 🛡️ Role-based access control
- 📷 Secure file upload validation
- 🔐 SQL injection prevention
- 🚫 XSS protection

## Performance & Optimization

- ⚡ Optimized API calls
- 💾 Strategic caching
- 🖼️ Image compression for uploads
- 📦 Lazy loading for data
- 🔄 Efficient state management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support, please contact the development team or create an issue in the repository.

## License

This project is licensed under the MIT License.

---

## Credits

**Developed by**: Scorpion X  
**Backend Infrastructure**: Oracle Cloud Infrastructure (OCI)  
**Platforms**: Web (React), Mobile (Flutter - iOS & Android)  
**Last Updated**: January 2026

**Live Application**: [http://www.corems.abrdns.com/](http://www.corems.abrdns.com/)
