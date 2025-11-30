# Pomodoro Timer & Focus Booster

A modern mobile application implementing the Pomodoro Technique for improved productivity and focus.

## Features

- ⏱️ **Circular Timer**: Beautiful animated circular timer that fills/empties as time passes
- 📝 **Task Management**: Associate tasks with each Pomodoro session
- 🔍 **Autosuggestion**: Smart task name suggestions based on previous entries
- 💬 **Comments**: Add notes to completed sessions
- 📊 **Reports**: Daily, Weekly, and Monthly analytics with charts
- ⚙️ **Customizable Settings**: Configure timer durations, notifications, and more
- 🔒 **Secure Storage**: All data stored locally and encrypted
- 📱 **Cross-Platform**: Works on both Android and iOS

## Requirements

- Node.js 16+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS) or Android Emulator/device (for Android)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your device

## Project Structure

```
pomodoro-timetracker-app/
├── src/
│   ├── components/          # Reusable components
│   │   └── CircularTimer.js
│   ├── context/            # React Context providers
│   │   └── TimerContext.js
│   ├── screens/            # Screen components
│   │   ├── TimerScreen.js
│   │   ├── TaskInputScreen.js
│   │   ├── ReportsScreen.js
│   │   └── SettingsScreen.js
│   ├── utils/              # Utility functions
│   │   └── storage.js
│   └── theme.js            # Theme configuration
├── App.js                  # Main app component
├── package.json
└── app.json                # Expo configuration
```

## Key Features Implementation

### Circular Timer
The timer uses React Native Reanimated for smooth animations. The circle fills from full (start) to empty (expired) as time passes.

### Data Storage
- Uses `@react-native-async-storage/async-storage` for regular data
- Uses `expo-secure-store` for sensitive settings
- All sessions, tasks, and settings are stored locally

### Background Timer
The app maintains timer accuracy when minimized using app state listeners and time calculations.

### Reports
- Daily: Shows all sessions for a selected day
- Weekly: Aggregated data with productivity trends
- Monthly: Comprehensive analytics with charts

## Configuration

Default timer settings can be changed in Settings:
- Work Duration: 25 minutes (1-60)
- Short Break: 5 minutes (1-30)
- Long Break: 15 minutes (1-60)
- Pomodoros until long break: 4 (1-10)

## Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

## License

This project is created for educational purposes.

