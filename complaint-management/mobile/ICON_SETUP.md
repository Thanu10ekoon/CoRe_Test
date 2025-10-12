# App Icon Setup for CoreMS

## Method 1: Using flutter_launcher_icons (Recommended)

### Step 1: Get the Icon Image
Download or create a 1024x1024 PNG icon for the CoreMS app and save it as:
`assets/icon/app_icon.png`

**Option A - Use the logo from web:**
1. Download the logo from: https://i.ibb.co/cXsYwrCh/core-ms-high-resolution-logo.png
2. Save it as `assets/icon/app_icon.png` (1024x1024 recommended)

**Option B - Create a simple icon:**
Create a simple icon with "CoreMS" text or the complaint icon.

### Step 2: Generate Icons
Run these commands:
```bash
flutter pub get
flutter pub run flutter_launcher_icons
```

This will automatically generate all required icon sizes for Android and iOS.

### Step 3: Rebuild the App
```bash
flutter clean
flutter run
```

---

## Method 2: Manual Icon Replacement (Alternative)

If you prefer to manually replace icons, place PNG files in these directories:

### Android:
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)

### iOS (if building for iOS):
- `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

---

## Quick Online Tool

Use this online tool to generate all icon sizes from one image:
https://appicon.co/

1. Upload your 1024x1024 icon
2. Download the Android package
3. Extract and replace files in the `android/app/src/main/res/mipmap-*` folders

---

## Current Setup

The `pubspec.yaml` is already configured with `flutter_launcher_icons`.
Just add your icon to `assets/icon/app_icon.png` and run the commands in Step 2.
