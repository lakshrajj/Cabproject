import React, { createContext, useContext, useState } from 'react';

// Very minimal theme with inline defined objects
const LIGHT_THEME = {
  dark: false,
  colors: {
    primary: '#1E88E5',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#212121',
    border: '#BDBDBD',
    notification: '#FF5722',
    surface: '#F5F5F5',
    accent: '#FF5722',
    disabled: '#9E9E9E',
    placeholder: '#757575',
  }
};

const DARK_THEME = {
  dark: true,
  colors: {
    primary: '#42A5F5',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#616161',
    notification: '#FF7043',
    surface: '#1E1E1E',
    accent: '#FF7043',
    disabled: '#757575',
    placeholder: '#9E9E9E',
  }
};

// Minimal theme context
const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: LIGHT_THEME,
});

// Theme provider
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = () => useContext(ThemeContext);