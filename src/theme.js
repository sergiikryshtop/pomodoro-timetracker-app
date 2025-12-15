import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1', // Modern indigo
    secondary: '#8B5CF6', // Vibrant purple
    background: '#F8FAFC', // Soft gray-blue background
    surface: '#FFFFFF',
    text: '#0F172A', // Deep slate text
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#0F172A',
    onSurface: '#0F172A',
    workColor: '#F43F5E', // Modern rose/red for work sessions
    breakColor: '#10B981', // Fresh emerald green for breaks
    longBreakColor: '#3B82F6', // Bright modern blue for long breaks
    accent: '#F59E0B', // Amber accent
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    surfaceVariant: '#F1F5F9',
    outline: '#CBD5E1',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818CF8', // Lighter indigo for dark mode
    secondary: '#A78BFA', // Lighter purple for dark mode
    background: '#0F172A', // Deep slate background
    surface: '#1E293B', // Elevated slate surface
    text: '#F1F5F9', // Light slate text
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#F1F5F9',
    onSurface: '#F1F5F9',
    workColor: '#FB7185', // Softer rose for work in dark mode
    breakColor: '#34D399', // Bright emerald for breaks in dark mode
    longBreakColor: '#60A5FA', // Lighter blue for long breaks in dark mode
    accent: '#FBBF24', // Brighter amber for dark mode
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
    surfaceVariant: '#334155',
    outline: '#475569',
  },
};

export const theme = lightTheme;

