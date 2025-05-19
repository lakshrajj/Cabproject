// A minimal theme definition with just the required properties

// Light theme colors
export const LIGHT_COLORS = {
  primary: '#1E88E5',
  accent: '#FF5722',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#212121',
  disabled: '#9E9E9E',
  placeholder: '#757575',
  notification: '#FF5722',
  card: '#FFFFFF',
  border: '#BDBDBD',
  subtext: '#616161',
  success: '#388E3C',
  error: '#D32F2F',
  warning: '#FFA000',
  info: '#1976D2',
  divider: '#E0E0E0',
  shadow: '#000000',
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
  notification: '#FF7043',
  card: '#1E1E1E',
  border: '#616161',
  subtext: '#B0BEC5',
  success: '#66BB6A',
  error: '#EF5350',
  warning: '#FFB74D',
  info: '#42A5F5',
  divider: '#424242',
  shadow: '#000000',
};

// Basic light theme
export const LightTheme = {
  dark: false,
  colors: {
    primary: LIGHT_COLORS.primary,
    background: LIGHT_COLORS.background,
    card: LIGHT_COLORS.card,
    text: LIGHT_COLORS.text,
    border: LIGHT_COLORS.border,
    notification: LIGHT_COLORS.notification,
    // Additional Paper properties
    accent: LIGHT_COLORS.accent,
    surface: LIGHT_COLORS.surface,
    disabled: LIGHT_COLORS.disabled,
    placeholder: LIGHT_COLORS.placeholder,
    backdrop: 'rgba(0,0,0,0.5)',
    onSurface: LIGHT_COLORS.text,
  },
  // Common props
  roundness: 4,
  animation: {
    scale: 1.0,
  },
};

// Basic dark theme
export const DarkTheme = {
  dark: true,
  colors: {
    primary: DARK_COLORS.primary,
    background: DARK_COLORS.background,
    card: DARK_COLORS.card,
    text: DARK_COLORS.text,
    border: DARK_COLORS.border,
    notification: DARK_COLORS.notification,
    // Additional Paper properties
    accent: DARK_COLORS.accent,
    surface: DARK_COLORS.surface,
    disabled: DARK_COLORS.disabled,
    placeholder: DARK_COLORS.placeholder,
    backdrop: 'rgba(0,0,0,0.8)',
    onSurface: DARK_COLORS.text,
  },
  // Common props
  roundness: 4,
  animation: {
    scale: 1.0,
  },
};