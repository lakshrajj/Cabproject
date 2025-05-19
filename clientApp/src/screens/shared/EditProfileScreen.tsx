import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { Formik } from 'formik';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

import AppButton from '../../components/AppButton';
import FormInput from '../../components/FormInput';
import { COLORS } from '../../utils/theme';
import useAuth from '../../hooks/useAuth';

const profileSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  phone: yup
    .string()
    .matches(
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      'Please enter a valid phone number'
    )
    .required('Phone number is required'),
});

const driverDetailsSchema = yup.object().shape({
  carModel: yup.string().required('Car model is required'),
  carColor: yup.string().required('Car color is required'),
  licensePlate: yup.string().required('License plate is required'),
  licenseNumber: yup.string().required('License number is required'),
});

const EditProfileScreen = () => {
  const { user, updateProfile, updateDriverDetails } = useAuth();
  const navigation = useNavigation();
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdateProfile = async (values: { name: string; phone: string }) => {
    try {
      setErrorMsg('');
      await updateProfile({
        name: values.name,
        phone: values.phone,
      });
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error: any) {
      console.error('Update profile error:', error);
      setErrorMsg(
        error.response?.data?.message || 
        'Failed to update profile. Please try again later.'
      );
    }
  };

  const handleUpdateDriverDetails = async (values: {
    carModel: string;
    carColor: string;
    licensePlate: string;
    licenseNumber: string;
  }) => {
    try {
      setErrorMsg('');
      await updateDriverDetails(values);
      Alert.alert('Success', 'Driver details updated successfully');
      navigation.goBack();
    } catch (error: any) {
      console.error('Update driver details error:', error);
      setErrorMsg(
        error.response?.data?.message || 
        'Failed to update driver details. Please try again later.'
      );
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Icon name="account" size={60} color={COLORS.background} />
            </View>
          )}
          
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <Formik
          initialValues={{
            name: user.name,
            phone: user.phone,
          }}
          validationSchema={profileSchema}
          onSubmit={handleUpdateProfile}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View>
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
                value={user.email}
                onChangeText={() => {}}
                icon="email"
                disabled
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

              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

              <AppButton
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Update Profile
              </AppButton>
            </View>
          )}
        </Formik>

        {user.role === 'driver' && (
          <>
            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            
            <Formik
              initialValues={{
                carModel: user.driverDetails?.carModel || '',
                carColor: user.driverDetails?.carColor || '',
                licensePlate: user.driverDetails?.licensePlate || '',
                licenseNumber: user.driverDetails?.licenseNumber || '',
              }}
              validationSchema={driverDetailsSchema}
              onSubmit={handleUpdateDriverDetails}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                <View>
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

                  <AppButton
                    mode="contained"
                    onPress={handleSubmit}
                    style={styles.button}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    color={COLORS.secondary}
                  >
                    Update Vehicle Info
                  </AppButton>
                </View>
              )}
            </Formik>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.background,
  },
  profileImageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    marginTop: 10,
  },
  changePhotoText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
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
});

export default EditProfileScreen;