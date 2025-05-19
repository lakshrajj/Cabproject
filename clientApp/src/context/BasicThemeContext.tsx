import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { LightTheme, DarkTheme, LIGHT_COLORS, DARK_COLORS } from '../utils/basicTheme';

// Create the theme context
export const ThemeContext = createContext({
  isDarkMode: false,
  theme: LightTheme,
  colors: LIGHT_COLORS,
  toggleTheme: () => {},
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Get system color scheme
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  
  // Get the appropriate theme
  const theme = isDarkMode ? DarkTheme : LightTheme;
  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  
  // Provide the theme context
  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use the theme context
export const useTheme = () => useContext(ThemeContext);