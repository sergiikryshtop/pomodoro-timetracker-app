import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#E53935',
    secondary: '#FF6B6B',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#212121',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#212121',
    onSurface: '#212121',
    workColor: '#E53935',
    breakColor: '#4CAF50',
    longBreakColor: '#2196F3',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FF6B6B',
    secondary: '#E53935',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    workColor: '#FF6B6B',
    breakColor: '#66BB6A',
    longBreakColor: '#42A5F5',
  },
};

export const theme = lightTheme;

