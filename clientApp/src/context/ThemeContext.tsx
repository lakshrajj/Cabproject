import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  CombinedDefaultTheme, 
  CombinedDarkTheme, 
  LIGHT_COLORS, 
  DARK_COLORS 
} from '../utils/theme';

// Define the theme context type
export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: typeof CombinedDefaultTheme | typeof CombinedDarkTheme;
  themeType: ThemeType;
  isDarkTheme: boolean;
  colors: typeof LIGHT_COLORS | typeof DARK_COLORS;
  toggleTheme: () => void;
  setThemeType: (type: ThemeType) => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get system color scheme
  const colorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>('system');
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  
  // Determine which theme to use based on themeType and system setting
  const theme = isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme;
  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  // Load saved theme preference on startup
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeType = await AsyncStorage.getItem('themeType');
        if (savedThemeType && ['light', 'dark', 'system'].includes(savedThemeType)) {
          setThemeType(savedThemeType as ThemeType);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };

    loadThemePreference();
  }, []);

  // Update dark mode status when themeType or system theme changes
  useEffect(() => {
    let newIsDarkMode;
    if (themeType === 'system') {
      newIsDarkMode = colorScheme === 'dark';
    } else {
      newIsDarkMode = themeType === 'dark';
    }
    setIsDarkMode(newIsDarkMode);

    // Save theme preference
    AsyncStorage.setItem('themeType', themeType).catch(error => {
      console.error('Failed to save theme preference', error);
    });
  }, [themeType, colorScheme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setThemeType(prevThemeType => {
      // If current theme is system-based, toggle to explicit light/dark
      if (prevThemeType === 'system') {
        return colorScheme === 'dark' ? 'light' : 'dark';
      } else {
        // Otherwise toggle between light and dark
        return prevThemeType === 'dark' ? 'light' : 'dark';
      }
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeType,
        isDarkTheme: isDarkMode,
        colors,
        toggleTheme,
        setThemeType,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};