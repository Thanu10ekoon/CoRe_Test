# CoreMS - Complaint Management Mobile App

A Flutter mobile application for the CoreMS (CoRe Complaint Management System).

## Features

  - Create new complaints with photo upload support
  - View complaints (role-based filtering)
  - Track complaint status updates
  - View detailed complaint history
- Advanced search & filtering (NEW)
  - Search by title, description, status, category, or ID
  - Filter by status (Pending, In Progress, Resolved, Rejected)
  - Filter by category (derived from existing complaints)
  - Clear filters quickly; result count shown

## Technical Stack

- **Framework**: Flutter 3.0+
- **State Management**: SharedPreferences for authentication
- **HTTP Client**: Built-in HTTP package for API communication
- **Image Handling**: image_picker package for camera/gallery access
- **UI Components**: Material Design with custom theming

- Use the search bar and chips on dashboards to narrow results.
## Setup & Installation

### Prerequisites
- Flutter SDK 3.0 or higher: https://flutter.dev/docs/get-started/install
- Dart SDK (bundled with Flutter)
- Android Studio / VS Code with Flutter extensions
- iOS development setup (for iOS builds)

### Installation Steps
1. Clone the repository
2. Navigate to the mobile directory: `cd mobile`
3. Install dependencies: `flutter pub get`
4. Run the app: `flutter run`

### Building for Production
- **Android APK**: `flutter build apk --release`
- **iOS IPA**: `flutter build ios --release`

## Backend Infrastructure

This mobile application connects to a robust backend system hosted on **Oracle Cloud Infrastructure (OCI)**:

- **Host**: Oracle Cloud Infrastructure (OCI)
- **IP Address**: `54.220.183.213`
- **API Endpoint**: `http://54.220.183.213:5000/api`
- **Database**: MySQL hosted on OCI
- **Architecture**: Node.js/Express REST API with MySQL database
- **Features**: File upload support, role-based authentication, complaint management

## User Roles & Permissions

- **Regular Users**: 
  - Create and submit new complaints
  - View their own complaint history
  - Upload supporting photos/documents
  - Track complaint status updates

- **Admin Users**: 
  - View complaints based on subrole permissions
  - Update complaint status and add comments
  - Access complaint analytics and reports
  - Manage user complaints across different categories

### Admin Subroles & Category Access
- **Dean & ComplaintsManager**: Full access to all complaints
- **Warden**: Hostel-related complaints
- **CanteenCordinator**: Canteen-related complaints  
- **AcademicCordinator**: Academic-related complaints
- **SportCordinator**: Sports-related complaints
- **MaintainanceCordinator**: Maintenance-related complaints
- **Librarian**: Library-related complaints
- **SecurityCordinator**: Security-related complaints
- **AR (Academic Registrar)**: Documentation-related complaints

## Complaint Categories

- **Hostel** (Managed by Warden)
- **Canteen** (Managed by CanteenCordinator)
- **Academic** (Managed by AcademicCordinator)
- **Sports** (Managed by SportCordinator)
- **Maintainance** (Managed by MaintainanceCordinator)
- **Library** (Managed by Librarian)
- **Security** (Managed by SecurityCordinator)
- **Documentation** (Managed by AR)

## Mobile App Architecture

### Key Components
- **Authentication Service**: Handles login/logout with secure token management
- **API Service**: Centralized HTTP client for backend communication
- **Photo Upload Service**: Handles image capture and upload functionality
- **State Management**: Efficient app state handling with SharedPreferences

### Screen Structure
- **Login Screen**: User authentication interface
- **User Dashboard**: Personal complaint management for regular users
- **Admin Dashboard**: Administrative complaint oversight with filtering
- **New Complaint Screen**: Complaint creation with photo upload
- **Complaint Details Screen**: Detailed view with status history

## Performance & Optimization

- **Efficient API Calls**: Optimized HTTP requests with proper error handling
- **Image Optimization**: Automatic image compression for uploads
- **Lazy Loading**: Efficient data loading for large complaint lists
- **Cache Management**: Strategic caching for improved performance

## Security Features

- **Secure Authentication**: Token-based authentication system
- **Role-based Access Control**: Strict permission management
- **Data Encryption**: Secure data transmission to OCI backend
- **Photo Security**: Secure image upload and storage

## Development

### Development Environment
- **IDE**: Android Studio / VS Code with Flutter and Dart extensions
- **Testing**: Flutter's built-in testing framework
- **Debugging**: Flutter DevTools for performance monitoring
- **Version Control**: Git with structured commit messages

### Code Structure
```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
│   └── complaint_model.dart  # Complaint data structure
├── screens/                  # UI screens
│   ├── login_screen.dart
│   ├── user_dashboard_screen.dart
│   ├── admin_dashboard_screen.dart
│   ├── new_complaint_screen.dart
│   └── complaint_details_screen.dart
└── services/                 # Business logic
    └── api_service.dart      # Backend communication
```

### API Integration
The mobile app integrates with the OCI-hosted backend through RESTful APIs:
- **Authentication**: POST `/api/login`
- **Complaints**: GET/POST `/api/complaints`
- **Status Updates**: PUT `/api/complaints/:id/status`
- **Photo Upload**: POST `/api/upload` (multipart/form-data)

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## Deployment

### Oracle Cloud Infrastructure (OCI) Backend
- **Infrastructure**: Oracle Cloud Compute Instance
- **Operating System**: Linux-based server
- **Application Server**: Node.js with Express framework
- **Database**: MySQL database service
- **File Storage**: Local storage with backup to OCI Object Storage
- **Monitoring**: OCI monitoring and logging services

---

**Project maintained by Scorpion X**  
**Backend Infrastructure**: Oracle Cloud Infrastructure (OCI)  
**Mobile Platform**: Flutter (iOS & Android)  
**Last Updated**: January 2026
