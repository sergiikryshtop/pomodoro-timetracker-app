// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

// Mock Notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' }))
}));

// Mock Audio
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({
        sound: { playAsync: jest.fn(), unloadAsync: jest.fn() }
      }))
    },
    setAudioModeAsync: jest.fn()
  }
}));

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success' }
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  default: {
    call: () => {},
  },
  useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
  useAnimatedProps: jest.fn((callback) => callback()),
  withTiming: jest.fn((value) => value),
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    quad: jest.fn(),
  },
  createAnimatedComponent: jest.fn((component) => component),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
