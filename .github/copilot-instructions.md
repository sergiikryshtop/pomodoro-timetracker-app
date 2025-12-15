# Pomodoro Timetracker App - AI Agent Instructions

## Architecture Overview

This is an Expo/React Native mobile app implementing the Pomodoro Technique with three core layers:

**UI Layer**: Bottom tab navigation with Timer, Reports, and Settings screens. Timer screen has a modal stack for task input.
**State Management**: `TimerContext` (src/context/TimerContext.js) is the single source of truth using React hooks—manages timer state, session data, settings, and app lifecycle.
**Persistence**: Dual storage strategy in [src/utils/storage.js](src/utils/storage.js)—`AsyncStorage` for sessions/tasks, `SecureStore` for sensitive settings.

## Critical Patterns & Conventions

### TimerContext Responsibilities
The context handles:
- Timer interval tick logic with background state detection (`AppState` listener)
- Audio/haptic/notification feedback on completion
- Session persistence with pause duration calculations
- Settings loading and notification configuration

Example: When adding features affecting timer state, update the context's `useEffect` hooks, not individual screens.

### Storage Pattern
Always use domain-specific storage objects:
```javascript
sessionStorage.saveSession()  // For work intervals completed
settingsStorage.setSettings() // For user preferences
taskStorage.saveSuggestion() // For task autosuggest data
```
Never call `AsyncStorage` directly—use the wrapper for consistent error handling and key management.

### Data Models
Sessions store `{id, startTime, endTime, duration, task, comment}`. This schema is critical for Reports screen aggregation by date range. Pause duration must be tracked as `totalPausedTime` during a session (not subtracted post-completion).

### Interval Types
The timer cycles through three states: `'work'` (25 min default) → `'shortBreak'` (5 min) → `'work'` → `'longBreak'` (15 min). This advances after every 4 pomodoros (`completedPomodoros` count). Modify via Settings.

## Developer Workflows

### Development Setup
```bash
npm install
npm start  # Starts Metro bundler
# Then press 'a' for Android, 'i' for iOS simulator, or scan QR code
```

### Debugging
- Use Expo's network/console debugging at http://localhost:19002
- For background timer issues, test with `SETUP.md` guidance: app state transitions when backgrounding
- Check `src/context/TimerContext.js` lines 85-110 for background time recalculation logic

### Build & Deploy
```bash
expo build:android  # Produces APK
expo build:ios     # Requires macOS + Expo account
```

## Integration Points & Dependencies

- **expo-av**: Audio playback (call `Audio.setAudioModeAsync()` before play)
- **expo-notifications**: Push notifications configured in `configureNotifications()`
- **expo-haptics**: Device vibration feedback tied to `settings.vibrationEnabled`
- **react-native-reanimated**: Smooth CircularTimer animation (used in [src/components/CircularTimer.js](src/components/CircularTimer.js))
- **date-fns**: Date formatting for Reports (aggregates sessions by day/week/month)
- **victory-native**: Charting library for report visualizations

Navigation stack: `TimerStack` (stack) inside bottom `Tab.Navigator`—modals always use stack presentation mode.

## Project-Specific Gotchas

1. **App State Subscription Cleanup**: The `AppState.addEventListener` in TimerContext must be removed via `subscription.remove()` to prevent memory leaks on component unmount.
2. **Notification Permissions**: On first run, request notification permissions; the app doesn't auto-request—Settings screen must prompt.
3. **Theme System**: Uses `react-native-paper`'s MD3 theme. Custom colors (`workColor`, `breakColor`, `longBreakColor`) are added to theme object in [src/theme.js](src/theme.js)—reference these, not hardcoded hex values.
4. **Pause Duration Accuracy**: `totalPausedTime` is accumulated during a session, not derived post-completion, because pause may reset if user manually changes interval.

## File Purpose Reference

- [App.js](App.js) - Navigation setup & app entry point
- [src/context/TimerContext.js](src/context/TimerContext.js) - **Core logic**: state, timer interval, background handling
- [src/utils/storage.js](src/utils/storage.js) - Storage abstraction layer (must use, never bypass)
- [src/screens/TimerScreen.js](src/screens/TimerScreen.js) - Timer UI & start/pause/resume controls
- [src/screens/ReportsScreen.js](src/screens/ReportsScreen.js) - Data aggregation by date range using date-fns
- [src/theme.js](src/theme.js) - Centralized color/style constants (dark/light themes)

## Common Tasks

**Add a new timer setting**: Update `settingsStorage` default in storage.js, add field to TimerContext state, expose via useTimer hook, render in SettingsScreen.
**Fix timer accuracy**: Check background time calculation in lines 85-110 of TimerContext or verify `totalPausedTime` math.
**Style changes**: Always use theme colors from [src/theme.js](src/theme.js), not hardcoded values.
