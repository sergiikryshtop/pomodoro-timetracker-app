# Installation Guide

## Downloading the App

### From GitHub Releases (Recommended)

1. **Visit the Releases page**: 
   - Go to [https://github.com/sergiikryshtop/pomodoro-timetracker-app/releases](https://github.com/sergiikryshtop/pomodoro-timetracker-app/releases)
   - Or navigate to the repository and click "Releases" on the right sidebar

2. **Download the latest APK**:
   - Find the latest release version (e.g., `v1.0.0`)
   - Under "Assets", download the file ending in `.apk`
   - Example: `pomodoro-timer-v1.0.0-android.apk`

### From GitHub Actions Artifacts

If you need a build from a specific commit:

1. Go to the [Actions tab](https://github.com/sergiikryshtop/pomodoro-timetracker-app/actions)
2. Click on the "CD - Android Build" workflow
3. Select the successful workflow run
4. Scroll down to "Artifacts" section
5. Download the APK artifact

## Installing on Android

### Prerequisites
- Android device running Android 6.0 (Marshmallow) or higher
- ~50 MB of free storage space

### Installation Steps

#### Option 1: Direct Installation on Device

1. **Transfer the APK** to your Android device:
   - Via USB cable
   - Via email attachment
   - Via cloud storage (Google Drive, Dropbox)
   - Via direct download on device browser

2. **Enable installation from unknown sources**:
   - **Android 8.0+**: 
     - When you tap the APK, Android will prompt you
     - Tap "Settings" → Enable "Install unknown apps" for your browser/file manager
   - **Android 7.x and below**:
     - Settings → Security → Enable "Unknown sources"
     - Accept the warning

3. **Install the app**:
   - Tap the downloaded `.apk` file
   - Tap "Install"
   - Wait for installation to complete
   - Tap "Open" to launch the app

4. **Grant permissions**:
   - When prompted, allow notifications (for timer alerts)
   - Allow vibration (for haptic feedback)

#### Option 2: Installation via ADB (For Developers)

1. **Enable USB Debugging** on your device:
   - Settings → About phone → Tap "Build number" 7 times
   - Settings → Developer options → Enable "USB debugging"

2. **Connect your device** to computer via USB

3. **Install using ADB**:
   ```bash
   adb install pomodoro-timer-v1.0.0-android.apk
   ```

## Updating the App

When a new version is released:

1. Download the new APK from GitHub Releases
2. Install it over the existing app (your data will be preserved)
3. Your timer settings and session history will remain intact

**Note**: You may see a warning about updating an existing app. This is normal - tap "Update" or "Install anyway"

## Uninstalling

To remove the app:

1. Settings → Apps → Pomodoro Timer
2. Tap "Uninstall"

Or long-press the app icon and drag to "Uninstall"

## Troubleshooting

### "App not installed" Error

**Possible causes:**
- **Insufficient storage**: Free up at least 100 MB
- **Corrupted download**: Re-download the APK
- **Incompatible architecture**: Ensure your device is ARM/ARM64 compatible (most Android devices)

### Installation Blocked

**Solution:**
- Ensure "Install unknown apps" is enabled for your file manager/browser
- Try installing from a different file manager app

### App Crashes on Launch

**Solution:**
- Clear app data: Settings → Apps → Pomodoro Timer → Storage → Clear data
- Reinstall the app
- Ensure Android version is 6.0 or higher

### Notifications Not Working

**Solution:**
- Settings → Apps → Pomodoro Timer → Notifications → Enable all
- Disable battery optimization for the app
- Settings → Battery → Battery optimization → Pomodoro Timer → Don't optimize

### Timer Stops in Background

**Solution:**
- Disable battery optimization (see above)
- Settings → Apps → Pomodoro Timer → Battery → Unrestricted

## Version History

Check the [Releases page](https://github.com/sergiikryshtop/pomodoro-timetracker-app/releases) for:
- Version changelog
- Release notes
- Bug fixes and improvements
- New features

## Support

If you encounter issues:

1. **Check Releases page** for known issues
2. **Create an issue** on GitHub with:
   - Device model and Android version
   - Steps to reproduce the problem
   - Screenshots if applicable

## Security

- ✅ The APK is built automatically via GitHub Actions
- ✅ Source code is open and auditable
- ✅ No external servers - all data stored locally on your device
- ✅ SHA256 checksums available on release page (if signed)

## Privacy

- 📱 All data is stored locally on your device
- 🔒 No data collection or telemetry
- 🚫 No internet connection required
- 🔐 Settings stored in secure storage

## System Requirements

- **OS**: Android 6.0 (API 23) or higher
- **RAM**: 2 GB minimum
- **Storage**: 50 MB
- **Permissions**:
  - Notifications (for timer alerts)
  - Vibration (for haptic feedback)
  - Boot completed (to maintain timer accuracy)

## Building from Source

To build the APK yourself:

1. Clone the repository
2. Install dependencies: `npm install`
3. Build for Android: `npx expo prebuild --platform android`
4. Navigate to android folder: `cd android`
5. Build APK: `./gradlew assembleRelease`
6. Find APK in: `android/app/build/outputs/apk/release/`

For detailed instructions, see [README.md](README.md).
