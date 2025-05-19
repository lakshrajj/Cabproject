import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Divider, TextInput, HelperText } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppButton from '../../components/AppButton';
import FormInput from '../../components/FormInput';
import MapView from '../../components/MapView';
import { COLORS } from '../../utils/theme';
import { createRideSchema } from '../../utils/validationSchemas';
import { createRide } from '../../api/rides';
import { DriverStackParamList } from '../../navigation/DriverNavigator';
import { formatDateTime } from '../../utils/formatters';
import * as Location from 'expo-location';

type CreateRideNavigationProp = NativeStackNavigationProp<DriverStackParamList, 'CreateRide'>;

const CreateRideScreen = () => {
  const navigation = useNavigation<CreateRideNavigationProp>();
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startLocationCoords, setStartLocationCoords] = useState<[number, number] | null>(null);
  const [endLocationCoords, setEndLocationCoords] = useState<[number, number] | null>(null);

  const initialValues = {
    startLocation: {
      address: '',
      coordinates: {
        coordinates: [0, 0], // [longitude, latitude]
      },
    },
    endLocation: {
      address: '',
      coordinates: {
        coordinates: [0, 0], // [longitude, latitude]
      },
    },
    departureTime: new Date().toISOString(),
    availableSeats: '1',
    fare: '',
    description: '',
  };

  const handleCreateRide = async (values: any) => {
    try {
      setError('');

      // Ensure start location coordinates are set
      if (!startLocationCoords) {
        Alert.alert('Error', 'Please set the start location on the map');
        return;
      }

      // Ensure end location coordinates are set
      if (!endLocationCoords) {
        Alert.alert('Error', 'Please set the end location on the map');
        return;
      }

      // Format the ride data
      const rideData = {
        startLocation: {
          address: values.startLocation.address,
          coordinates: {
            coordinates: startLocationCoords,
          },
        },
        endLocation: {
          address: values.endLocation.address,
          coordinates: {
            coordinates: endLocationCoords,
          },
        },
        departureTime: selectedDate.toISOString(),
        availableSeats: parseInt(values.availableSeats),
        fare: parseFloat(values.fare),
        description: values.description,
      };

      // Create the ride
      const response = await createRide(rideData);
      
      Alert.alert(
        'Success',
        'Your ride has been created successfully',
        [
          {
            text: 'View Details',
            onPress: () => navigation.navigate('RideDetails', { rideId: response.data._id }),
          },
          {
            text: 'Back to Home',
            onPress: () => navigation.navigate('DriverHome'),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Create ride error:', error);
      setError('Failed to create ride. Please try again.');
    }
  };

  const getLocationCoordinates = async (address: string, isStart = true) => {
    try {
      const geocoded = await Location.geocodeAsync(address);
      if (geocoded.length > 0) {
        const { latitude, longitude } = geocoded[0];
        const coords: [number, number] = [longitude, latitude];
        
        if (isStart) {
          setStartLocationCoords(coords);
        } else {
          setEndLocationCoords(coords);
        }
        
        return coords;
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create a New Ride</Text>
        <Text style={styles.headerSubtitle}>Share your journey with others</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          showUserLocation
          startLocation={startLocationCoords ?? undefined}
          endLocation={endLocationCoords ?? undefined}
        />
      </View>

      <Formik
        initialValues={initialValues}
        validationSchema={createRideSchema}
        onSubmit={handleCreateRide}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Ride Details</Text>

            <FormInput
              label="Start Location"
              value={values.startLocation.address}
              onChangeText={async (text) => {
                setFieldValue('startLocation.address', text);
                if (text.length > 3) {
                  const coords = await getLocationCoordinates(text, true);
                  if (coords) {
                    setFieldValue('startLocation.coordinates.coordinates', coords);
                  }
                }
              }}
              onBlur={handleBlur('startLocation.address')}
              error={
                touched.startLocation?.address && errors.startLocation?.address
                  ? errors.startLocation.address
                  : undefined
              }
              icon="map-marker"
            />

            <FormInput
              label="End Location"
              value={values.endLocation.address}
              onChangeText={async (text) => {
                setFieldValue('endLocation.address', text);
                if (text.length > 3) {
                  const coords = await getLocationCoordinates(text, false);
                  if (coords) {
                    setFieldValue('endLocation.coordinates.coordinates', coords);
                  }
                }
              }}
              onBlur={handleBlur('endLocation.address')}
              error={
                touched.endLocation?.address && errors.endLocation?.address
                  ? errors.endLocation.address
                  : undefined
              }
              icon="map-marker-check"
            />

            <View style={styles.dateTimeContainer}>
              <Text style={styles.inputLabel}>Departure Time</Text>
              <TouchableOpacity
                style={styles.dateTimePicker}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{formatDateTime(selectedDate.toISOString())}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="datetime"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <Divider style={styles.divider} />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <FormInput
                  label="Available Seats"
                  value={values.availableSeats}
                  onChangeText={handleChange('availableSeats')}
                  onBlur={handleBlur('availableSeats')}
                  error={
                    touched.availableSeats && errors.availableSeats
                      ? errors.availableSeats
                      : undefined
                  }
                  keyboardType="numeric"
                  icon="seat"
                />
              </View>

              <View style={styles.halfInput}>
                <FormInput
                  label="Fare ($)"
                  value={values.fare}
                  onChangeText={handleChange('fare')}
                  onBlur={handleBlur('fare')}
                  error={touched.fare && errors.fare ? errors.fare : undefined}
                  keyboardType="numeric"
                  icon="cash"
                />
              </View>
            </View>

            <FormInput
              label="Description (Optional)"
              value={values.description}
              onChangeText={handleChange('description')}
              onBlur={handleBlur('description')}
              error={
                touched.description && errors.description ? errors.description : undefined
              }
              multiline
              numberOfLines={3}
              icon="text"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <AppButton
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.submitButton}
            >
              Create Ride
            </AppButton>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.background,
    opacity: 0.8,
  },
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
  },
  map: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: COLORS.text,
  },
  dateTimeContainer: {
    marginBottom: 10,
  },
  dateTimePicker: {
    padding: 15,
    backgroundColor: COLORS.surface,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  divider: {
    marginVertical: 15,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  errorText: {
    color: COLORS.error,
    marginTop: 10,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 30,
  },
});

export default CreateRideScreen;