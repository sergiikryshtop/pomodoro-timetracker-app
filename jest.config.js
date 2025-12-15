module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|victory-native|react-native-paper)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!src/theme.js'
  ],
  coverageThreshold: {
    global: {
      statements: 15,
      branches: 8,
      functions: 20,
      lines: 15
    },
    // Per-file thresholds for tested files
    './src/utils/storage.js': {
      statements: 70,
      branches: 75,
      functions: 100,
      lines: 70
    },
    './src/components/CircularTimer.js': {
      statements: 100,
      branches: 75,
      functions: 100,
      lines: 100
    }
  }
};
