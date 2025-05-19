import React, { useState } from 'react';
import { StyleSheet, TextInput as RNTextInput } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { COLORS } from '../utils/theme';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  icon?: string;
  disabled?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  placeholder,
  multiline = false,
  numberOfLines = 1,
  icon,
  disabled = false,
  autoCapitalize = 'none',
}) => {
  const [hidePassword, setHidePassword] = useState(secureTextEntry);

  return (
    <>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        secureTextEntry={hidePassword}
        style={styles.input}
        mode="outlined"
        error={!!error}
        keyboardType={keyboardType}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        disabled={disabled}
        autoCapitalize={autoCapitalize}
        left={icon ? <TextInput.Icon icon={icon} /> : undefined}
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={hidePassword ? 'eye' : 'eye-off'}
              onPress={() => setHidePassword(!hidePassword)}
            />
          ) : undefined
        }
      />
      {error ? (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.background,
    marginBottom: 4,
  },
});

export default FormInput;