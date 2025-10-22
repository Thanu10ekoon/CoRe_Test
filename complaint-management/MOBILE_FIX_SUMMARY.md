# Mobile App Photo Issue Fix

## Problem
- Mobile app was not loading photos
- Mobile app was not submitting complaints with photos (complaints without photos were working)

## Root Cause
The Android app was missing critical permissions and network configuration:
1. **Missing INTERNET permission** - Required for all HTTP/HTTPS requests
2. **Missing network security configuration** - Android requires explicit configuration to allow HTTP (cleartext) traffic

## Fixes Applied

### 1. AndroidManifest.xml Updates
**Added Internet Permissions:**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

**Enabled Cleartext Traffic:**
```xml
android:usesCleartextTraffic="true"
android:networkSecurityConfig="@xml/network_security_config"
```

### 2. Network Security Configuration
Created `android/app/src/main/res/xml/network_security_config.xml`:
- Allows HTTP traffic to EC2 backend (16.171.69.23)
- Required because Android 9+ blocks cleartext HTTP by default

### 3. Enhanced API Logging
Added debug logging in `api_service.dart` to help troubleshoot:
- Logs photo file path and existence
- Logs request fields and file size
- Logs response status and body
- Better error messages

## Testing Steps

1. **Rebuild the app** (important - manifest changes require rebuild):
   ```bash
   cd mobile
   flutter clean
   flutter pub get
   flutter run
   ```

2. **Test photo upload:**
   - Create a new complaint
   - Add a photo from camera or gallery
   - Submit the complaint
   - Check the Flutter console/logcat for debug logs

3. **Test photo display:**
   - Open a complaint that has a photo
   - Verify the photo loads from: `http://16.171.69.23:5000/uploads/...`

## Important Notes

- **HTTP vs HTTPS**: The EC2 backend uses HTTP (not HTTPS). This is why we needed the network security config.
- **Production Recommendation**: For production, use HTTPS with a proper SSL certificate and remove the cleartext traffic configuration.
- **Debug Logs**: The API service now has extensive logging. Check Flutter console (`flutter run`) or Android logcat to see detailed request/response info.

## Backend Configuration
- Backend URL: `http://16.171.69.23:5000/api`
- Photo endpoint: `POST /api/complaints` with multipart/form-data
- Photo field name: `photo`
- Photos served at: `http://16.171.69.23:5000/uploads/{filename}`

## Files Modified
1. `mobile/android/app/src/main/AndroidManifest.xml` - Added internet permissions and network config
2. `mobile/android/app/src/main/res/xml/network_security_config.xml` - Created new file for HTTP support
3. `mobile/lib/services/api_service.dart` - Added debug logging

---
**Fixed on:** October 21, 2025
