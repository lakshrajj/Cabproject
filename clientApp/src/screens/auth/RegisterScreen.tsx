import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text } from 'react-native-paper';
import { Formik } from 'formik';
import * as yup from 'yup';

import AppButton from '../../components/AppButton';
import FormInput from '../../components/FormInput';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { COLORS } from '../../utils/theme';
import useAuth from '../../hooks/useAuth';

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const registerSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  phone: yup
    .string()
    .matches(
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      'Please enter a valid phone number'
    )
    .required('Phone number is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const auth = useAuth();

  const handleRegister = async (values: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      setErrorMsg('');
      await auth.register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: 'rider',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setErrorMsg('Connection timeout. Please check your internet connection and try again.');
      } else {
        setErrorMsg(
          error.response?.data?.message || 
          'Failed to register. Please try again later.'
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
        <Text style={styles.headerText}>Create Account</Text>
        <Text style={styles.subHeaderText}>Sign up as a rider</Text>
      </View>

      <Formik
        initialValues={{
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={registerSchema}
        onSubmit={handleRegister}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View style={styles.formContainer}>
            <FormInput
              label="Full Name"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              error={touched.name && errors.name ? errors.name : undefined}
              icon="account"
              autoCapitalize="words"
            />

            <FormInput
              label="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              error={touched.email && errors.email ? errors.email : undefined}
              keyboardType="email-address"
              icon="email"
            />

            <FormInput
              label="Phone Number"
              value={values.phone}
              onChangeText={handleChange('phone')}
              onBlur={handleBlur('phone')}
              error={touched.phone && errors.phone ? errors.phone : undefined}
              keyboardType="phone-pad"
              icon="phone"
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

            <FormInput
              label="Confirm Password"
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              error={
                touched.confirmPassword && errors.confirmPassword
                  ? errors.confirmPassword
                  : undefined
              }
              secureTextEntry
              icon="lock-check"
            />

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <AppButton
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={isSubmitting || auth.isLoading}
              disabled={isSubmitting || auth.isLoading}
            >
              Register
            </AppButton>
          </View>
        )}
      </Formik>

      <View style={styles.footer}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Login</Text>
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
  button: {
    marginTop: 10,
  },
  errorText: {
    color: COLORS.error,
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loginText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;