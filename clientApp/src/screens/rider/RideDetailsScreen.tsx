import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, Card, Divider, Button, Portal, Dialog, TextInput } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';

import MapView from '../../components/MapView';
import { COLORS } from '../../utils/theme';
import { RiderStackParamList } from '../../navigation/RiderNavigator';
import { getRideById, Ride } from '../../api/rides';
import { createBooking } from '../../api/bookings';
import { formatDate, formatTime, formatCurrency, calculateDistance } from '../../utils/formatters';
import useAuth from '../../hooks/useAuth';

type RideDetailsRouteProp = RouteProp<RiderStackParamList, 'RideDetails'>;
type RideDetailsNavigationProp = NativeStackNavigationProp<RiderStackParamList, 'RideDetails'>;

const RideDetailsScreen = () => {
  const route = useRoute<RideDetailsRouteProp>();
  const navigation = useNavigation<RideDetailsNavigationProp>();
  const { rideId } = route.params;
  const { user } = useAuth();
  
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDialogVisible, setBookingDialogVisible] = useState(false);
  const [seats, setSeats] = useState('1');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropCoords, setDropCoords] = useState<[number, number] | null>(null);
  const [creatingBooking, setCreatingBooking] = useState(false);

  useEffect(() => {
    loadRideDetails();
  }, [rideId]);

  const loadRideDetails = async () => {
    try {
      setLoading(true);
      const response = await getRideById(rideId);
      setRide(response.data);
      
      // Pre-fill pickup and drop locations with ride's start and end locations
      setPickupAddress(response.data.startLocation.address);
      setDropAddress(response.data.endLocation.address);
      setPickupCoords(response.data.startLocation.coordinates.coordinates);
      setDropCoords(response.data.endLocation.coordinates.coordinates);
    } catch (error) {
      console.error('Error loading ride details:', error);
      Alert.alert('Error', 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    if (!ride) return;
    
    // Check if the ride is still available
    if (ride.status !== 'scheduled') {
      Alert.alert('Cannot Book', 'This ride is no longer available for booking');
      return;
    }
    
    // Check if there are available seats
    if (ride.availableSeats <= 0) {
      Alert.alert('Fully Booked', 'Sorry, this ride has no more available seats');
      return;
    }
    
    setBookingDialogVisible(true);
  };

  const handleAddressChange = async (text: string, isPickup: boolean) => {
    if (isPickup) {
      setPickupAddress(text);
    } else {
      setDropAddress(text);
    }
    
    try {
      if (text.length > 3) {
        const geocoded = await Location.geocodeAsync(text);
        if (geocoded.length > 0) {
          const { latitude, longitude } = geocoded[0];
          const coords: [number, number] = [longitude, latitude];
          
          if (isPickup) {
            setPickupCoords(coords);
          } else {
            setDropCoords(coords);
          }
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleCurrentLocation = async () => {
    try {
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
        setPickupAddress(formattedAddress);
        setPickupCoords([longitude, latitude]);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get your current location');
    }
  };

  const handleConfirmBooking = async () => {
    if (!ride || !pickupCoords || !dropCoords) return;
    
    try {
      setCreatingBooking(true);
      
      // Calculate total fare based on distance
      const bookingDistance = calculateDistance(
        pickupCoords[1],
        pickupCoords[0],
        dropCoords[1],
        dropCoords[0]
      );
      
      // Basic formula for fare calculation: base fare + distance adjustment
      const baseFare = ride.fare;
      const distanceAdjustment = bookingDistance * 0.5; // $0.50 per kilometer
      const totalFare = (baseFare + distanceAdjustment) * parseInt(seats);
      
      const bookingData = {
        ride: ride._id,
        seats: parseInt(seats),
        pickupLocation: {
          address: pickupAddress,
          coordinates: {
            coordinates: pickupCoords,
          },
        },
        dropLocation: {
          address: dropAddress,
          coordinates: {
            coordinates: dropCoords,
          },
        },
      };
      
      const response = await createBooking(bookingData);
      
      Alert.alert(
        'Booking Successful',
        'Your ride has been booked! The driver will review your request.',
        [
          {
            text: 'View Booking',
            onPress: () => navigation.navigate('BookingDetails', { bookingId: response.data._id }),
          },
          {
            text: 'OK',
            onPress: () => navigation.navigate('RiderHome'),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Booking Failed', 'Failed to create booking. Please try again.');
    } finally {
      setCreatingBooking(false);
      setBookingDialogVisible(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.errorContainer}>
        <Text>Ride not found</Text>
      </View>
    );
  }

  // Check if the user is the driver of this ride
  const isDriver = user?.id === ride.driver;
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          startLocation={ride.startLocation.coordinates.coordinates}
          endLocation={ride.endLocation.coordinates.coordinates}
        />
      </View>

      <Card style={styles.driverCard}>
        <Card.Content style={styles.driverContent}>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Icon name="account" size={40} color={COLORS.background} />
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{ride.driver.name || 'Driver'}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.ratingText}>4.8</Text>
                <Text style={styles.tripCount}>(120 trips)</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleLabel}>Vehicle</Text>
            <Text style={styles.vehicleText}>
              {ride.driver.driverDetails?.carColor || 'Blue'} {ride.driver.driverDetails?.carModel || 'Sedan'}
            </Text>
            <Text style={styles.licensePlate}>
              {ride.driver.driverDetails?.licensePlate || 'ABC123'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Ride Details</Text>
          
          <View style={styles.locationContainer}>
            <Icon name="map-marker" size={20} color={COLORS.primary} style={styles.locationIcon} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>From</Text>
              <Text style={styles.locationText}>{ride.startLocation.address}</Text>
            </View>
          </View>
          
          <View style={styles.locationLine} />
          
          <View style={styles.locationContainer}>
            <Icon name="map-marker-check" size={20} color={COLORS.success} style={styles.locationIcon} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>To</Text>
              <Text style={styles.locationText}>{ride.endLocation.address}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Icon name="calendar" size={20} color={COLORS.text} />
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(ride.departureTime)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="clock-outline" size={20} color={COLORS.text} />
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{formatTime(ride.departureTime)}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="account-multiple" size={20} color={COLORS.text} />
              <Text style={styles.detailLabel}>Seats</Text>
              <Text style={styles.detailValue}>{ride.availableSeats} available</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="cash" size={20} color={COLORS.text} />
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={styles.detailValue}>{formatCurrency(ride.fare)}</Text>
            </View>
          </View>
          
          {ride.description && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <Text style={styles.descriptionText}>{ride.description}</Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {!isDriver && ride.status === 'scheduled' && ride.availableSeats > 0 && (
        <Button
          mode="contained"
          onPress={handleBook}
          style={styles.bookButton}
          icon="book-plus"
        >
          Book This Ride
        </Button>
      )}

      {isDriver && (
        <Button
          mode="contained"
          onPress={() => navigation.navigate('DriverApp', { screen: 'RideDetails', params: { rideId: ride._id } })}
          style={styles.manageButton}
          icon="account-cog"
        >
          Manage Your Ride
        </Button>
      )}

      <Portal>
        <Dialog
          visible={bookingDialogVisible}
          onDismiss={() => setBookingDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Booking Details</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogLabel}>Number of Seats</Text>
            <TextInput
              mode="outlined"
              value={seats}
              onChangeText={setSeats}
              keyboardType="numeric"
              style={styles.dialogInput}
              right={<TextInput.Icon icon="seat" />}
            />
            
            <Text style={styles.dialogLabel}>Pickup Location</Text>
            <TextInput
              mode="outlined"
              value={pickupAddress}
              onChangeText={(text) => handleAddressChange(text, true)}
              style={styles.dialogInput}
              left={<TextInput.Icon icon="map-marker" />}
              right={
                <TextInput.Icon
                  icon="crosshairs-gps"
                  onPress={handleCurrentLocation}
                />
              }
            />
            
            <Text style={styles.dialogLabel}>Drop-off Location</Text>
            <TextInput
              mode="outlined"
              value={dropAddress}
              onChangeText={(text) => handleAddressChange(text, false)}
              style={styles.dialogInput}
              left={<TextInput.Icon icon="map-marker-check" />}
            />
            
            <View style={styles.fareContainer}>
              <Text style={styles.fareLabel}>Total Fare:</Text>
              <Text style={styles.fareValue}>
                {formatCurrency(ride.fare * parseInt(seats || '1'))}
              </Text>
            </View>
            
            <Text style={styles.fareNote}>
              * Final fare may be adjusted based on exact pickup and drop-off locations
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setBookingDialogVisible(false)}
              disabled={creatingBooking}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleConfirmBooking}
              loading={creatingBooking}
              disabled={creatingBooking || !pickupCoords || !dropCoords}
              mode="contained"
            >
              Confirm Booking
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: 200,
    width: '100%',
  },
  map: {
    flex: 1,
  },
  driverCard: {
    margin: 16,
    marginTop: -20,
    borderRadius: 10,
    elevation: 4,
  },
  driverContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  driverDetails: {
    justifyContent: 'center',
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontWeight: 'bold',
  },
  tripCount: {
    marginLeft: 5,
    color: COLORS.placeholder,
    fontSize: 12,
  },
  vehicleInfo: {
    alignItems: 'flex-end',
  },
  vehicleLabel: {
    fontSize: 12,
    color: COLORS.placeholder,
  },
  vehicleText: {
    fontWeight: 'bold',
  },
  licensePlate: {
    marginTop: 2,
    fontSize: 12,
  },
  detailsCard: {
    margin: 16,
    borderRadius: 10,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationIcon: {
    marginTop: 3,
    marginRight: 10,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  locationText: {
    fontSize: 14,
  },
  locationLine: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.divider,
    marginLeft: 10,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 15,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.placeholder,
    marginTop: 5,
  },
  detailValue: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  descriptionContainer: {
    marginBottom: 5,
  },
  descriptionLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  descriptionText: {
    lineHeight: 20,
  },
  bookButton: {
    margin: 16,
    marginTop: 0,
    paddingVertical: 8,
  },
  manageButton: {
    margin: 16,
    marginTop: 0,
    paddingVertical: 8,
    backgroundColor: COLORS.secondary,
  },
  dialog: {
    backgroundColor: COLORS.background,
  },
  dialogLabel: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
  },
  dialogInput: {
    backgroundColor: COLORS.background,
    marginBottom: 10,
  },
  fareContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  fareLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fareValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  fareNote: {
    fontSize: 12,
    color: COLORS.placeholder,
    fontStyle: 'italic',
  },
});

export default RideDetailsScreen;