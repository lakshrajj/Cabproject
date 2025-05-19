import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, DarkTheme, LIGHT_COLORS, DARK_COLORS } from '../utils/simpleTheme';

// Simple theme context for our app
export const ThemeContext = createContext({
  isDarkMode: false,
  theme: DefaultTheme,
  colors: LIGHT_COLORS,
  toggleTheme: () => {},
});

// Provider component that wraps our app
export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  // Load theme preference from AsyncStorage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const themePreference = await AsyncStorage.getItem('isDarkMode');
        if (themePreference !== null) {
          setIsDarkMode(themePreference === 'true');
        } else {
          // Use system preference if no saved preference
          setIsDarkMode(colorScheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };

    loadThemePreference();
  }, [colorScheme]);

  // Save theme preference when it changes
  useEffect(() => {
    AsyncStorage.setItem('isDarkMode', isDarkMode.toString())
      .catch(error => console.error('Failed to save theme preference', error));
  }, [isDarkMode]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Get current theme
  const theme = isDarkMode ? DarkTheme : DefaultTheme;
  console.log('Theme object:', JSON.stringify(theme ? 'Theme is valid' : 'Theme is null or undefined'));
  
  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  console.log('Colors object:', JSON.stringify(colors ? 'Colors are valid' : 'Colors are null or undefined'));

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);