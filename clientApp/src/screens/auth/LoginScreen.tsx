import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, Switch } from 'react-native-paper';
import { Formik } from 'formik';
import * as yup from 'yup';

import AppButton from '../../components/AppButton';
import FormInput from '../../components/FormInput';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { COLORS } from '../../utils/theme';
import useAuth from '../../hooks/useAuth';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const loginSchema = yup.object().shape({
  emailOrPhone: yup.string().required('Email or phone number is required'),
  password: yup.string().required('Password is required'),
});

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [useEmail, setUseEmail] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const auth = useAuth();

  const handleLogin = async (values: { emailOrPhone: string; password: string }) => {
    try {
      setErrorMsg('');
      await auth.login(values.emailOrPhone, values.password, useEmail);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setErrorMsg('Connection timeout. Please check your internet connection and try again.');
      } else {
        setErrorMsg(
          error.response?.data?.message || 
          'Failed to login. Please check your credentials and try again.'
        );
      }
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Welcome Back</Text>
        <Text style={styles.subHeaderText}>Sign in to your account</Text>
      </View>

      <Formik
        initialValues={{ emailOrPhone: '', password: '' }}
        validationSchema={loginSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View style={styles.formContainer}>
            <View style={styles.toggleContainer}>
              <Text>Phone</Text>
              <Switch
                value={useEmail}
                onValueChange={setUseEmail}
                color={COLORS.primary}
                style={styles.toggle}
              />
              <Text>Email</Text>
            </View>

            <FormInput
              label={useEmail ? 'Email' : 'Phone Number'}
              value={values.emailOrPhone}
              onChangeText={handleChange('emailOrPhone')}
              onBlur={handleBlur('emailOrPhone')}
              error={touched.emailOrPhone && errors.emailOrPhone ? errors.emailOrPhone : undefined}
              keyboardType={useEmail ? 'email-address' : 'phone-pad'}
              icon={useEmail ? 'email' : 'phone'}
            />

            <FormInput
              label="Password"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              error={touched.password && errors.password ? errors.password : undefined}
              secureTextEntry
              icon="lock"
            />

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <AppButton
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={isSubmitting || auth.isLoading}
              disabled={isSubmitting || auth.isLoading}
            >
              Login
            </AppButton>

            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>

      <View style={styles.footer}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subHeaderText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 5,
  },
  formContainer: {
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggle: {
    marginHorizontal: 10,
  },
  button: {
    marginTop: 10,
  },
  errorText: {
    color: COLORS.error,
    marginTop: 10,
    textAlign: 'center',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  forgotPasswordText: {
    color: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;