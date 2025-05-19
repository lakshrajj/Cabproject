import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, Card, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';

import MapView from '../../components/MapView';
import { COLORS } from '../../utils/theme';
import { RiderStackParamList } from '../../navigation/RiderNavigator';
import { formatDate, formatTime } from '../../utils/formatters';

type SearchRidesNavigationProp = NativeStackNavigationProp<RiderStackParamList, 'SearchRides'>;

const SearchRidesScreen = () => {
  const navigation = useNavigation<SearchRidesNavigationProp>();
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [endCoords, setEndCoords] = useState<[number, number] | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Please allow location access to use this feature',
        [{ text: 'OK' }]
      );
    }
  };

  const getLocationCoordinates = async (address: string, isStart = true) => {
    try {
      const geocoded = await Location.geocodeAsync(address);
      if (geocoded.length > 0) {
        const { latitude, longitude } = geocoded[0];
        const coords: [number, number] = [longitude, latitude];
        
        if (isStart) {
          setStartCoords(coords);
        } else {
          setEndCoords(coords);
        }
        
        return coords;
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to use this feature');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const formattedAddress = `${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`;
        setStartLocation(formattedAddress);
        setStartCoords([longitude, latitude]);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get your current location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleStartLocationChange = async (text: string) => {
    setStartLocation(text);
    if (text.length > 3) {
      await getLocationCoordinates(text, true);
    }
  };

  const handleEndLocationChange = async (text: string) => {
    setEndLocation(text);
    if (text.length > 3) {
      await getLocationCoordinates(text, false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSearch = async () => {
    // Validate inputs
    if (!startLocation) {
      Alert.alert('Error', 'Please enter a start location');
      return;
    }

    if (!endLocation) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    // Make sure we have coordinates
    if (!startCoords) {
      const coords = await getLocationCoordinates(startLocation, true);
      if (!coords) {
        Alert.alert('Error', 'Could not find coordinates for the start location');
        return;
      }
    }

    if (!endCoords) {
      const coords = await getLocationCoordinates(endLocation, false);
      if (!coords) {
        Alert.alert('Error', 'Could not find coordinates for the destination');
        return;
      }
    }

    // Navigate to results screen with search parameters
    navigation.navigate('RideSearchResults', {
      startCoords: startCoords!,
      endCoords: endCoords!,
      startAddress: startLocation,
      endAddress: endLocation,
      date: date.toISOString(),
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          showUserLocation
          startLocation={startCoords ?? undefined}
          endLocation={endCoords ?? undefined}
        />
      </View>

      <Card style={styles.searchCard}>
        <Card.Content>
          <Text style={styles.title}>Find a Ride</Text>

          <View style={styles.inputContainer}>
            <TextInput
              label="Start Location"
              value={startLocation}
              onChangeText={handleStartLocationChange}
              style={styles.input}
              left={<TextInput.Icon icon="map-marker" />}
              right={
                <TextInput.Icon
                  icon="crosshairs-gps"
                  disabled={isGettingLocation}
                  onPress={getCurrentLocation}
                />
              }
            />
            {isGettingLocation && (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={styles.activityIndicator}
              />
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Destination"
              value={endLocation}
              onChangeText={handleEndLocationChange}
              style={styles.input}
              left={<TextInput.Icon icon="map-marker-check" />}
            />
          </View>

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateLabel}>Date and Time</Text>
            <Text style={styles.dateValue}>
              {formatDate(date.toISOString())} at {formatTime(date.toISOString())}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          <Button
            mode="contained"
            onPress={handleSearch}
            style={styles.searchButton}
            disabled={!startLocation || !endLocation}
          >
            Search Available Rides
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.tipsCard}>
        <Card.Content>
          <Text style={styles.tipsTitle}>Search Tips</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>1.</Text>
            <Text style={styles.tipText}>
              Enter specific addresses for more accurate results
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>2.</Text>
            <Text style={styles.tipText}>
              Use the GPS icon to quickly set your current location
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>3.</Text>
            <Text style={styles.tipText}>
              Adjust the date and time to find rides at your preferred departure
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  mapContainer: {
    height: 200,
    width: '100%',
  },
  map: {
    flex: 1,
  },
  searchCard: {
    margin: 16,
    elevation: 4,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    backgroundColor: COLORS.background,
  },
  activityIndicator: {
    position: 'absolute',
    right: 50,
    top: 20,
  },
  datePickerButton: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  dateLabel: {
    fontSize: 12,
    color: COLORS.placeholder,
    marginBottom: 5,
  },
  dateValue: {
    fontSize: 16,
  },
  searchButton: {
    marginTop: 10,
  },
  tipsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
    borderRadius: 10,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  tipNumber: {
    fontWeight: 'bold',
    marginRight: 5,
    color: COLORS.primary,
  },
  tipText: {
    flex: 1,
  },
});

export default SearchRidesScreen;