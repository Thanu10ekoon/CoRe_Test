# CoRe Complaint Management System - Mobile App Setup

## Quick Start

### Prerequisites
1. Install Flutter SDK (latest stable version): https://docs.flutter.dev/get-started/install
2. Install Android Studio (for Android) or Xcode (for iOS)
3. Verify installation: `flutter doctor`

### Installation Steps

1. **Navigate to mobile folder:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   flutter pub get
   ```

3. **Run the app:**
   ```bash
   # For connected device/emulator
   flutter run
   
   # For specific device
   flutter devices  # List available devices
   flutter run -d <device-id>
   ```

## Project Structure

```
mobile/
├── lib/
│   ├── main.dart                      # App entry point & splash screen
│   ├── models/
│   │   └── complaint_model.dart       # Data models
│   ├── screens/
│   │   ├── login_screen.dart          # Login page
│   │   ├── user_dashboard_screen.dart # User complaint list
│   │   ├── admin_dashboard_screen.dart # Admin dashboard
│   │   ├── new_complaint_screen.dart  # Create new complaint
│   │   └── complaint_details_screen.dart # Complaint details & history
│   └── services/
│       └── api_service.dart           # Backend API integration
├── pubspec.yaml                       # Dependencies
└── README.md                          # Documentation
```

## Features Implemented

### User Features
- ✅ Login authentication
- ✅ View personal complaints
- ✅ Create new complaints with categories
- ✅ View complaint details
- ✅ View status update history
- ✅ Pull-to-refresh

### Admin Features
- ✅ Role-based dashboard (filtered by subrole)
- ✅ View all relevant complaints
- ✅ Update complaint status
- ✅ View complaint details
- ✅ Real-time status updates

### Technical Features
- ✅ Persistent login (SharedPreferences)
- ✅ RESTful API integration
- ✅ Material Design 3
- ✅ Responsive UI
- ✅ Error handling
- ✅ Loading states

## API Endpoints Used

All endpoints connect to: `https://co-re-test.vercel.app/api`

- `POST /login` - User authentication
- `GET /complaints/user/:userId` - Get user complaints
- `GET /complaints?admin_id=:adminId` - Get admin complaints
- `GET /complaints/:id` - Get complaint details
- `GET /statusupdates/:complaintId` - Get status history
- `POST /complaints` - Create new complaint
- `PUT /complaints/:id/status` - Update complaint status

## Testing

### Test Accounts
(Use the same accounts as the web version)

### Running Tests
```bash
flutter test
```

## Building for Production

### Android APK
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Android App Bundle (for Play Store)
```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

### iOS (requires macOS)
```bash
flutter build ios --release
```

## Troubleshooting

### Common Issues

1. **Dependencies not installing:**
   ```bash
   flutter clean
   flutter pub get
   ```

2. **Build errors:**
   ```bash
   flutter doctor -v
   # Fix any issues reported
   ```

3. **API connection issues:**
   - Check internet connection
   - Verify backend URL in `lib/services/api_service.dart`
   - Check CORS settings on backend

## Development

### Adding New Features
1. Models go in `lib/models/`
2. Screens go in `lib/screens/`
3. Services/API calls go in `lib/services/`
4. Update `pubspec.yaml` for new dependencies

### Code Style
```bash
# Format code
flutter format .

# Analyze code
flutter analyze
```

## Deployment

The app uses the existing backend at `https://co-re-test.vercel.app/` - no backend changes needed.

---

**Developed by Scorpion X**
