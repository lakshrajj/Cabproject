import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, Divider } from 'react-native-paper';
import { Formik } from 'formik';
import * as yup from 'yup';

import AppButton from '../../components/AppButton';
import FormInput from '../../components/FormInput';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { COLORS } from '../../utils/theme';
import useAuth from '../../hooks/useAuth';

type RegisterDriverScreenProps = NativeStackScreenProps<AuthStackParamList, 'RegisterDriver'>;

const registerDriverSchema = yup.object().shape({
  // User information
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
  
  // Driver information
  carModel: yup.string().required('Car model is required'),
  carColor: yup.string().required('Car color is required'),
  licensePlate: yup.string().required('License plate is required'),
  licenseNumber: yup.string().required('Driver license number is required'),
});

const RegisterDriverScreen: React.FC<RegisterDriverScreenProps> = ({ navigation }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const auth = useAuth();

  const handleRegisterDriver = async (values: {
    name: string;
    email: string;
    phone: string;
    password: string;
    carModel: string;
    carColor: string;
    licensePlate: string;
    licenseNumber: string;
  }) => {
    try {
      setErrorMsg('');
      
      // Register the user as a driver
      await auth.register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: 'driver',
      });
      
      // Update driver details
      await auth.updateDriverDetails({
        carModel: values.carModel,
        carColor: values.carColor,
        licensePlate: values.licensePlate,
        licenseNumber: values.licenseNumber,
      });
    } catch (error: any) {
      console.error('Driver registration error:', error);
      setErrorMsg(
        error.response?.data?.message || 
        'Failed to register. Please try again later.'
      );
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Become a Driver</Text>
        <Text style={styles.subHeaderText}>Create an account to start sharing rides</Text>
      </View>

      <Formik
        initialValues={{
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          carModel: '',
          carColor: '',
          licensePlate: '',
          licenseNumber: '',
        }}
        validationSchema={registerDriverSchema}
        onSubmit={handleRegisterDriver}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
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

            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            
            <FormInput
              label="Car Model"
              value={values.carModel}
              onChangeText={handleChange('carModel')}
              onBlur={handleBlur('carModel')}
              error={touched.carModel && errors.carModel ? errors.carModel : undefined}
              icon="car"
              autoCapitalize="words"
            />

            <FormInput
              label="Car Color"
              value={values.carColor}
              onChangeText={handleChange('carColor')}
              onBlur={handleBlur('carColor')}
              error={touched.carColor && errors.carColor ? errors.carColor : undefined}
              icon="palette"
              autoCapitalize="words"
            />

            <FormInput
              label="License Plate"
              value={values.licensePlate}
              onChangeText={handleChange('licensePlate')}
              onBlur={handleBlur('licensePlate')}
              error={touched.licensePlate && errors.licensePlate ? errors.licensePlate : undefined}
              icon="card-account-details"
              autoCapitalize="characters"
            />

            <FormInput
              label="Driver License Number"
              value={values.licenseNumber}
              onChangeText={handleChange('licenseNumber')}
              onBlur={handleBlur('licenseNumber')}
              error={
                touched.licenseNumber && errors.licenseNumber ? errors.licenseNumber : undefined
              }
              icon="card-account-details-outline"
            />

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <AppButton
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={isSubmitting || auth.isLoading}
              disabled={isSubmitting || auth.isLoading}
              color={COLORS.secondary}
            >
              Register as Driver
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
  },
  headerContainer: {
    marginVertical: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  subHeaderText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 5,
  },
  formContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.text,
  },
  divider: {
    marginVertical: 20,
  },
  button: {
    marginTop: 20,
  },
  errorText: {
    color: COLORS.error,
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loginText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
});

export default RegisterDriverScreen;