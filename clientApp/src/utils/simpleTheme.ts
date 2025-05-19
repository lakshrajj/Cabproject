import { DefaultTheme as PaperDefaultTheme, MD3DarkTheme as PaperDarkTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

// Light theme colors
export const LIGHT_COLORS = {
  primary: '#1E88E5',
  accent: '#FF5722',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#212121',
  disabled: '#9E9E9E',
  placeholder: '#757575',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#FF5722',
};

// Dark theme colors
export const DARK_COLORS = {
  primary: '#42A5F5',
  accent: '#FF7043',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  disabled: '#757575',
  placeholder: '#9E9E9E',
  backdrop: 'rgba(0, 0, 0, 0.8)',
  notification: '#FF7043',
};

// Combine Paper and Navigation themes for light mode
export const DefaultTheme = {
  ...NavigationDefaultTheme,
  ...PaperDefaultTheme,
  colors: {
    ...(NavigationDefaultTheme.colors || {}),
    ...(PaperDefaultTheme.colors || {}),
    primary: LIGHT_COLORS.primary,
    accent: LIGHT_COLORS.accent,
    background: LIGHT_COLORS.background,
    surface: LIGHT_COLORS.surface,
    text: LIGHT_COLORS.text,
    disabled: LIGHT_COLORS.disabled,
    placeholder: LIGHT_COLORS.placeholder,
    notification: LIGHT_COLORS.notification,
    // Add React Navigation specific color properties
    card: LIGHT_COLORS.background,
    border: LIGHT_COLORS.disabled,
  },
};

// Combine Paper and Navigation themes for dark mode
export const DarkTheme = {
  ...NavigationDarkTheme,
  ...PaperDarkTheme,
  colors: {
    ...(NavigationDarkTheme.colors || {}),
    ...(PaperDarkTheme.colors || {}),
    primary: DARK_COLORS.primary,
    accent: DARK_COLORS.accent,
    background: DARK_COLORS.background,
    surface: DARK_COLORS.surface, 
    text: DARK_COLORS.text,
    disabled: DARK_COLORS.disabled,
    placeholder: DARK_COLORS.placeholder,
    notification: DARK_COLORS.notification,
    // Add React Navigation specific color properties
    card: DARK_COLORS.background,
    border: DARK_COLORS.disabled,
  },
};