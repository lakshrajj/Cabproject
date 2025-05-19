import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton, useTheme as usePaperTheme } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

interface AppButtonProps {
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  onPress: () => void;
  style?: object;
  labelStyle?: object;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  uppercase?: boolean;
  children: React.ReactNode;
  color?: string;
  textColor?: string;
  elevation?: number;
}

const AppButton: React.FC<AppButtonProps> = ({
  mode = 'contained',
  onPress,
  style,
  labelStyle,
  disabled = false,
  loading = false,
  icon,
  uppercase = false,
  children,
  color,
  textColor,
  elevation,
}) => {
  const { colors, isDarkTheme } = useTheme();
  const paperTheme = usePaperTheme();
  
  // Dynamic styles based on theme and props
  const buttonStyles = StyleSheet.create({
    button: {
      borderRadius: 10,
      paddingVertical: 8,
      marginVertical: 10,
      elevation: elevation !== undefined ? elevation : isDarkTheme ? 0 : 2,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      color: textColor,
    },
  });
  
  // Use the provided color or fall back to theme colors
  const buttonColor = color || (mode === 'outlined' ? undefined : colors.primary);
  
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      style={[buttonStyles.button, style]}
      labelStyle={[buttonStyles.label, labelStyle]}
      disabled={disabled}
      loading={loading}
      icon={icon}
      uppercase={uppercase}
      buttonColor={buttonColor}
      textColor={textColor}
    >
      {children}
    </PaperButton>
  );
};

// Removed static styles as we now use dynamic styles

export default AppButton;