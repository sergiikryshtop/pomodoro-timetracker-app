# Setup Instructions

## Prerequisites

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/

2. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

3. **Expo Go App** (for testing on physical devices)
   - iOS: Download from App Store
   - Android: Download from Google Play Store

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Run on Device/Emulator**
   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal
   - **Physical Device**: Scan the QR code with Expo Go app

## Asset Files (Optional)

The app will work without these, but for production you should add:

- `assets/icon.png` - App icon (1024x1024)
- `assets/splash.png` - Splash screen (1284x2778)
- `assets/adaptive-icon.png` - Android adaptive icon
- `assets/favicon.png` - Web favicon

## Platform-Specific Setup

### iOS
- Requires macOS with Xcode installed
- Run `npm run ios` or press `i` in Expo CLI

### Android
- Requires Android Studio and Android SDK
- Set up an Android Virtual Device (AVD) or connect a physical device
- Run `npm run android` or press `a` in Expo CLI

## Troubleshooting

### Common Issues

1. **Metro bundler errors**
   - Clear cache: `expo start -c`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

2. **Notification permissions**
   - iOS: Grant notification permissions when prompted
   - Android: Check app settings for notification permissions

3. **Timer not working in background**
   - Ensure app has necessary permissions
   - On iOS, background modes are configured in app.json

## Building for Production

### Android APK
```bash
expo build:android
```

### iOS App
```bash
expo build:ios
```

Note: Building requires Expo account and may have additional requirements.

