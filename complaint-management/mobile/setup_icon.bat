@echo off
echo Downloading CoreMS logo for app icon...
echo.

powershell -Command "Invoke-WebRequest -Uri 'https://i.ibb.co/cXsYwrCh/core-ms-high-resolution-logo.png' -OutFile 'assets\icon\app_icon.png'"

if exist "assets\icon\app_icon.png" (
    echo.
    echo ✓ Icon downloaded successfully to assets\icon\app_icon.png
    echo.
    echo Now running: flutter pub run flutter_launcher_icons
    echo.
    call flutter pub run flutter_launcher_icons
    echo.
    echo ✓ App icons generated!
    echo.
    echo You can now run: flutter clean && flutter run
) else (
    echo.
    echo × Failed to download icon
    echo Please manually download from: https://i.ibb.co/cXsYwrCh/core-ms-high-resolution-logo.png
    echo Save it as: assets\icon\app_icon.png
)

pause
