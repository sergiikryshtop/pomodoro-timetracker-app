// Polyfill setImmediate for React Native
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));

// Suppress act() warnings - these are expected in React Native Paper animations
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update') &&
      args[0].includes('was not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

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
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
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

// Mock @expo/vector-icons to prevent native module resolution issues
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: () => null,
  AntDesign: () => null,
  Entypo: () => null,
  EvilIcons: () => null,
  Feather: () => null,
  FontAwesome: () => null,
  FontAwesome5: () => null,
  FontAwesome6: () => null,
  Fontisto: () => null,
  Foundation: () => null,
  Ionicons: () => null,
  MaterialIcons: () => null,
  Octicons: () => null,
  SimpleLineIcons: () => null,
  Zocial: () => null,
  createIconSet: jest.fn(() => () => null),
}));

// Mock expo-font to prevent EventEmitter resolution issues
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
  isLoading: jest.fn(() => false),
}));

