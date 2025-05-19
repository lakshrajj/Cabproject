import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

// Font configuration
const fontConfig = {
  fontFamily: 'System',
  fontWeight: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
};

// Light theme colors
export const LIGHT_COLORS = {
  primary: '#1E88E5',           // Blue
  primaryContainer: '#E3F2FD',  // Light Blue
  secondary: '#26A69A',         // Teal
  secondaryContainer: '#B2DFDB',// Light Teal
  accent: '#FF5722',            // Deep Orange
  error: '#D32F2F',             // Red
  warning: '#FFA000',           // Amber
  success: '#388E3C',           // Green
  info: '#1976D2',              // Dark Blue
  background: '#FFFFFF',        // White
  surface: '#F5F5F5',           // Light Grey
  surfaceVariant: '#EEEEEE',    // Grey 200
  onSurface: '#212121',         // Grey 900
  text: '#212121',              // Grey 900
  subtext: '#616161',           // Grey 700
  disabled: '#9E9E9E',          // Grey 500
  placeholder: '#757575',       // Grey 600
  backdrop: 'rgba(0, 0, 0, 0.5)',
  divider: '#E0E0E0',           // Grey 300
  border: '#BDBDBD',            // Grey 400
  card: '#FFFFFF',              // White
  shadow: '#000000',            // Black
  notification: '#FF5722',      // Deep Orange
  statusBar: '#1976D2',         // Dark Blue
};

// Dark theme colors
export const DARK_COLORS = {
  primary: '#42A5F5',           // Lighter Blue
  primaryContainer: '#1565C0',  // Darker Blue
  secondary: '#4DB6AC',         // Lighter Teal
  secondaryContainer: '#00796B',// Darker Teal
  accent: '#FF7043',            // Lighter Deep Orange
  error: '#EF5350',             // Lighter Red
  warning: '#FFB74D',           // Lighter Amber
  success: '#66BB6A',           // Lighter Green
  info: '#42A5F5',              // Lighter Blue
  background: '#121212',        // Very Dark Grey
  surface: '#1E1E1E',           // Dark Grey
  surfaceVariant: '#2C2C2C',    // Grey 800
  onSurface: '#FFFFFF',         // White
  text: '#FFFFFF',              // White
  subtext: '#B0BEC5',           // Blue Grey 200
  disabled: '#757575',          // Grey 600
  placeholder: '#9E9E9E',       // Grey 500
  backdrop: 'rgba(0, 0, 0, 0.8)',
  divider: '#424242',           // Grey 800
  border: '#616161',            // Grey 700
  card: '#1E1E1E',              // Dark Grey
  shadow: '#000000',            // Black
  notification: '#FF7043',      // Lighter Deep Orange
  statusBar: '#0D47A1',         // Very Dark Blue
};

// Create Paper theme for light mode
export const PaperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: LIGHT_COLORS.primary,
    onPrimary: '#FFFFFF',
    primaryContainer: LIGHT_COLORS.primaryContainer,
    onPrimaryContainer: '#004D87',
    secondary: LIGHT_COLORS.secondary,
    onSecondary: '#FFFFFF', 
    secondaryContainer: LIGHT_COLORS.secondaryContainer,
    onSecondaryContainer: '#00352C',
    error: LIGHT_COLORS.error,
    background: LIGHT_COLORS.background,
    onBackground: LIGHT_COLORS.text,
    surface: LIGHT_COLORS.surface,
    onSurface: LIGHT_COLORS.text,
    surfaceVariant: LIGHT_COLORS.surfaceVariant,
    onSurfaceVariant: LIGHT_COLORS.subtext,
    outline: LIGHT_COLORS.border,
    elevation: {
      level0: 'transparent',
      level1: LIGHT_COLORS.surface,  // Cards, Searchbars
      level2: '#F6F6F6',  // Menus, FAB when pressed
      level3: '#EFEFEF',  // Navigation drawer
      level4: '#ECECEC',  // FAB at rest
      level5: '#E8E8E8',  // Modal sheets
    },
  },
  fonts: configureFonts({ config: fontConfig }),
  mode: 'exact',
};

// Create Paper theme for dark mode
export const PaperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: DARK_COLORS.primary,
    onPrimary: '#212121',
    primaryContainer: DARK_COLORS.primaryContainer,
    onPrimaryContainer: '#E3F2FD',
    secondary: DARK_COLORS.secondary,
    onSecondary: '#212121',
    secondaryContainer: DARK_COLORS.secondaryContainer,
    onSecondaryContainer: '#B2DFDB',
    error: DARK_COLORS.error,
    background: DARK_COLORS.background,
    onBackground: DARK_COLORS.text,
    surface: DARK_COLORS.surface,
    onSurface: DARK_COLORS.text,
    surfaceVariant: DARK_COLORS.surfaceVariant,
    onSurfaceVariant: DARK_COLORS.subtext,
    outline: DARK_COLORS.border,
    elevation: {
      level0: 'transparent',
      level1: DARK_COLORS.surface,        // Cards, Searchbars
      level2: '#2C2C2C',                   // Menus, FAB when pressed
      level3: '#2D2D2D',                   // Navigation drawer  
      level4: '#323232',                   // FAB at rest
      level5: '#353535',                   // Modal sheets
    }
  },
  fonts: configureFonts({ config: fontConfig }),
  mode: 'exact',
};

// Create Navigation theme for light mode
export const CustomNavigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: LIGHT_COLORS.primary,
    background: LIGHT_COLORS.background,
    card: LIGHT_COLORS.card,
    text: LIGHT_COLORS.text,
    border: LIGHT_COLORS.border,
    notification: LIGHT_COLORS.notification,
  },
};

// Create Navigation theme for dark mode
export const CustomNavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: DARK_COLORS.primary,
    background: DARK_COLORS.background,
    card: DARK_COLORS.card,
    text: DARK_COLORS.text,
    border: DARK_COLORS.border,
    notification: DARK_COLORS.notification,
  },
};

// Combined themes for the app
export const CombinedDefaultTheme = {
  ...CustomNavigationLightTheme,
  ...PaperLightTheme,
  colors: {
    ...CustomNavigationLightTheme.colors,
    ...PaperLightTheme.colors,
  },
};

export const CombinedDarkTheme = {
  ...CustomNavigationDarkTheme,
  ...PaperDarkTheme,
  colors: {
    ...CustomNavigationDarkTheme.colors,
    ...PaperDarkTheme.colors,
  },
};

// App-specific component styling
export const AppStyles = {
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
  },
  inputStyle: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 16,
  },
};