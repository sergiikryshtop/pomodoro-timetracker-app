# Pomodoro Timer & Focus Booster

A modern mobile application implementing the Pomodoro Technique for improved productivity and focus, built with Expo and React Native.

## 📦 Installation

**For end users:** Download the latest Android APK from our [Releases page](https://github.com/sergiikryshtop/pomodoro-timetracker-app/releases) or follow the detailed [Installation Guide](INSTALLATION.md).

**For developers:** See the [Quick Start](#-quick-start) section below.

## ✨ Features

- ⏱️ **Circular Timer**: Animated progress ring that empties clockwise from 12 o'clock as time passes
- 📝 **Task Management**: Associate tasks with each Pomodoro session
- 🔍 **Autosuggestion**: Smart task name suggestions based on previous entries
- 💬 **Comments**: Add notes to completed sessions
- 📊 **Reports**: Daily, Weekly, and Monthly analytics with interactive charts
- ⚙️ **Customizable Settings**: Configure timer durations, notifications, sounds, and vibration
- 🔒 **Secure Storage**: All data stored locally with encryption for sensitive settings
- 🌙 **Dark Mode Support**: Full theme support for light and dark modes
- 📱 **Cross-Platform**: Works seamlessly on Android and iOS

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm/yarn
- **Expo CLI**: `npm install -g expo-cli`
- **Development Environment**:
  - iOS: Xcode and iOS Simulator (macOS only)
  - Android: Android Studio and emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pomodoro-timetracker-app

# Install dependencies
npm install

# Start development server
npm start
```

### Running the App

```bash
# Android
npm run android

# iOS (macOS only)
npm run ios

# Web (for testing UI only)
npm run web
```

Alternatively, scan the QR code with **Expo Go** app on your physical device.

## 📁 Project Structure

```
pomodoro-timetracker-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── CircularTimer.js # Animated progress circle
│   ├── context/            # React Context providers
│   │   └── TimerContext.js  # Global timer state management
│   ├── screens/            # Screen components
│   │   ├── TimerScreen.js   # Main timer interface
│   │   ├── TaskInputScreen.js # Task input modal
│   │   ├── ReportsScreen.js # Analytics & charts
│   │   └── SettingsScreen.js # App configuration
│   ├── utils/              # Utility functions
│   │   └── storage.js       # AsyncStorage & SecureStore wrappers
│   └── theme.js            # Theme colors & styles
├── assets/                 # Images, sounds, fonts
│   └── sounds/            # Notification sounds
├── App.js                 # App entry point & navigation
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## 🏗️ Architecture

### State Management
**TimerContext** (`src/context/TimerContext.js`) is the single source of truth:
- Timer state (running/paused/idle)
- Interval management (work/short break/long break)
- Session persistence
- Background time tracking via `AppState` listener
- Audio, haptic, and notification feedback

### Storage Strategy
Dual storage approach via `src/utils/storage.js`:
- **AsyncStorage**: Sessions, tasks, and general settings
- **SecureStore**: Sensitive user preferences

### Timer Animation
`CircularTimer.js` uses `react-native-reanimated` for 60fps animations:
- Progress value smoothly interpolated with `withTiming`
- Stroke dash offset calculated based on remaining time
- Clockwise emptying from 12 o'clock position
- Dynamic color matching theme

### Navigation
Bottom tab navigation with modal stack for task input:
- **Timer Tab**: Main timer screen with FAB for task entry
- **Reports Tab**: Analytics with date range filters
- **Settings Tab**: Configuration options

## 🎨 Theme System

Modern color palette defined in `src/theme.js`. All components use `theme.colors` - never hardcoded hex values. See Design Details section for color specifications.

## ⚙️ Configuration

Customizable settings available in Settings screen:

### Timer Durations
- **Work Duration**: 1-60 minutes (default: 25)
- **Short Break**: 1-30 minutes (default: 5)
- **Long Break**: 1-60 minutes (default: 15)
- **Pomodoros until Long Break**: 1-10 (default: 4)

### Notifications & Feedback
- Push notifications on completion
- Sound alerts
- Haptic/vibration feedback
- Task name display toggle

## 🔨 Development

### Key Technologies
- **Expo SDK**: Cross-platform mobile framework
- **React Native**: UI framework
- **React Native Paper**: Material Design 3 components
- **React Native Reanimated**: High-performance animations
- **Victory Native**: Chart visualizations
- **Date-fns**: Date formatting and manipulation
- **Expo Notifications**: Push notifications
- **Expo AV**: Audio playback
- **Expo Haptics**: Device vibration

### Background Timer Logic
Timer accuracy is maintained when app is backgrounded:
1. `AppState` listener detects background/foreground transitions
2. Timestamps recorded on state changes
3. Elapsed time recalculated when returning to foreground
4. Pause duration tracked separately

See `src/context/TimerContext.js` lines 85-110 for implementation.

### Adding Features

**New Timer Setting**:
1. Add default to `settingsStorage` in `storage.js`
2. Add state to `TimerContext`
3. Expose via `useTimer` hook
4. Add UI control in `SettingsScreen.js`

**New Screen**:
1. Create component in `src/screens/`
2. Add route to navigation in `App.js`
3. Add tab icon if needed

## 📊 Data Models

### Session
```javascript
{
  id: string,          // Unique identifier
  startTime: number,   // Unix timestamp
  endTime: number,     // Unix timestamp
  duration: number,    // Seconds
  task: string,        // Task name
  comment: string      // Optional notes
}
```

### Settings
```javascript
{
  workDuration: number,       // Minutes
  shortBreakDuration: number, // Minutes
  longBreakDuration: number,  // Minutes
  pomodorosUntilLongBreak: number,
  soundEnabled: boolean,
  vibrationEnabled: boolean,
  notificationsEnabled: boolean,
  showTaskName: boolean
}
```

## 🐛 Troubleshooting

### Timer Stops in Background
Check `AppState` subscription cleanup in `TimerContext.js` - ensure `subscription.remove()` is called.

### Notifications Not Showing
Permissions must be explicitly granted. Settings screen prompts user on first run.

### Animation Performance Issues
Ensure Hermes is enabled in `app.json` for optimal performance.

### Storage Errors
Check AsyncStorage and SecureStore error handling in `storage.js` wrapper functions.

## 📦 Building for Production

### Android APK
```bash
expo build:android
# or with EAS Build
eas build --platform android
```

### iOS IPA
```bash
expo build:ios
# or with EAS Build (requires Apple Developer account)
eas build --platform ios
```

## 📝 Testing

```bash
# Run tests (if implemented)
npm test

# Type checking (if TypeScript is added)
npm run type-check

# Lint code
npm run lint
```

## 🤝 Contributing

This project follows React Native and Expo best practices:
- Use functional components with hooks
- Follow Material Design 3 guidelines
- Maintain theme consistency via `theme.js`
- Never bypass storage wrappers
- Document complex logic with comments

## 📄 License

This project is created for educational purposes.

## 🎨 Design Details

### Modern Color Scheme
Sophisticated indigo-blue color palette for both light and dark modes:

**Light Theme**
- **Primary**: Indigo `#6366F1`
- **Background**: Soft gray-blue `#F8FAFC`
- **Surface**: Pure white `#FFFFFF`
- **Text**: Deep slate `#0F172A`

**Dark Theme**
- **Primary**: Light indigo `#818CF8`
- **Background**: Deep slate `#0F172A`
- **Surface**: Elevated slate `#1E293B`
- **Text**: Light slate `#F1F5F9`

### UI Components
- **Smooth Animations**: Fluid circular progress indicator using React Native Reanimated
- **Intuitive UI**: Material Design 3 components via React Native Paper
- **Accessibility**: High contrast ratios and readable typography

## 🔗 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Pomodoro Technique](https://en.wikipedia.org/wiki/Pomodoro_Technique)

