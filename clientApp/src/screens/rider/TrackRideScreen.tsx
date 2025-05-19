import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Linking } from 'react-native';
import { Text, Button, Portal, Dialog, ActivityIndicator } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import MapView from '../../components/MapView';
import RatingStars from '../../components/RatingStars';
import { COLORS } from '../../utils/theme';
import { RiderStackParamList } from '../../navigation/RiderNavigator';
import { getBookingById, Booking } from '../../api/bookings';
import { getRideById, Ride } from '../../api/rides';
import { formatTime, formatDistance, formatETA } from '../../utils/formatters';

type TrackRideRouteProp = RouteProp<RiderStackParamList, 'TrackRide'>;
type TrackRideNavigationProp = NativeStackNavigationProp<RiderStackParamList, 'TrackRide'>;

const TrackRideScreen = () => {
  const route = useRoute<TrackRideRouteProp>();
  const navigation = useNavigation<TrackRideNavigationProp>();
  const { bookingId } = route.params;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [ride, setRide] = useState<Ride | null>(null);
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratingDialogVisible, setRatingDialogVisible] = useState(false);
  const [rating, setRating] = useState(0);
  
  // Polling interval for driver location updates
  const locationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadBookingAndRideDetails();
    
    // Set up polling for driver location
    locationInterval.current = setInterval(fetchDriverLocation, 10000); // every 10 seconds
    
    return () => {
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, [bookingId]);

  const loadBookingAndRideDetails = async () => {
    try {
      setLoading(true);
      
      // Get booking details
      const bookingResponse = await getBookingById(bookingId);
      setBooking(bookingResponse.data);
      
      // Get ride details
      const rideResponse = await getRideById(bookingResponse.data.ride);
      setRide(rideResponse.data);
      
      // Fetch driver location
      fetchDriverLocation();
    } catch (error) {
      console.error('Error loading booking and ride details:', error);
      Alert.alert('Error', 'Failed to load ride tracking information');
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverLocation = async () => {
    try {
      // In a real app, this would call an API to get the driver's current location
      // For this demo, we'll simulate driver movement with slightly modified coordinates
      if (ride && ride.startLocation.coordinates.coordinates) {
        const startCoords = ride.startLocation.coordinates.coordinates;
        
        // Simulate driver's location by adding a small random offset to the start location
        const jitter = 0.005 * Math.random(); // small random value for movement simulation
        const driverLng = startCoords[0] + jitter * (Math.random() > 0.5 ? 1 : -1);
        const driverLat = startCoords[1] + jitter * (Math.random() > 0.5 ? 1 : -1);
        
        setDriverLocation([driverLng, driverLat]);
      }
    } catch (error) {
      console.error('Error fetching driver location:', error);
    }
  };

  const handleCallDriver = () => {
    // In a real app, this would use the driver's actual phone number
    Linking.openURL('tel:+1234567890');
  };

  const handleSubmitRating = async () => {
    // In a real app, this would call an API to save the rating
    Alert.alert(
      'Rating Submitted',
      'Thank you for your feedback!',
      [{ text: 'OK', onPress: () => {
        setRatingDialogVisible(false);
        navigation.navigate('RiderHome');
      }}]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!booking || !ride) {
    return (
      <View style={styles.errorContainer}>
        <Text>Ride information not found</Text>
      </View>
    );
  }

  // Calculate distance and ETA from driver to pickup
  let distanceToPickup = '';
  let etaToPickup = '';
  
  if (driverLocation && booking.pickupLocation.coordinates.coordinates) {
    const pickupCoords = booking.pickupLocation.coordinates.coordinates;
    
    // Calculate distance between driver and pickup
    const distance = calculateDistance(
      driverLocation[1], 
      driverLocation[0], 
      pickupCoords[1], 
      pickupCoords[0]
    );
    distanceToPickup = formatDistance(distance);
    
    // Calculate ETA
    const eta = calculateETA(
      driverLocation[1], 
      driverLocation[0], 
      pickupCoords[1], 
      pickupCoords[0]
    );
    etaToPickup = `ETA: ${formatETA(eta)}`;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        showUserLocation
        pickupLocation={booking.pickupLocation.coordinates.coordinates}
        dropLocation={booking.dropLocation.coordinates.coordinates}
        driverLocation={driverLocation ?? undefined}
      />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={COLORS.background} />
      </TouchableOpacity>
      
      <View style={styles.infoCard}>
        <View style={styles.driverInfo}>
          <View style={styles.driverAvatar}>
            <Icon name="account" size={32} color={COLORS.background} />
          </View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{ride.driver.name || 'Driver'}</Text>
            <Text style={styles.vehicleInfo}>
              {ride.driver.driverDetails?.carColor || 'Blue'} {ride.driver.driverDetails?.carModel || 'Sedan'} · {ride.driver.driverDetails?.licensePlate || 'ABC123'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.callButton}
            onPress={handleCallDriver}
          >
            <Icon name="phone" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tripProgress}>
          <View style={styles.progressLine}>
            <View style={styles.progressCircle}>
              <Icon name="circle" size={12} color={COLORS.primary} />
            </View>
            <View style={styles.progressBar} />
            <View style={styles.progressCircle}>
              <Icon name="map-marker" size={16} color={COLORS.accent} />
            </View>
          </View>
          
          <View style={styles.progressLabels}>
            <View style={styles.progressLabelItem}>
              <Text style={styles.progressLabel}>Driver is on the way</Text>
              <Text style={styles.progressSubLabel}>{etaToPickup || 'Calculating...'}</Text>
            </View>
            <View style={styles.progressLabelItem}>
              <Text style={styles.progressLabel}>Pickup location</Text>
              <Text style={styles.progressSubLabel} numberOfLines={1}>
                {booking.pickupLocation.address.split(',')[0]}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Icon name="map-marker-distance" size={24} color={COLORS.primary} />
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{distanceToPickup || 'Calculating...'}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Icon name="seat-passenger" size={24} color={COLORS.primary} />
            <Text style={styles.statLabel}>Seats</Text>
            <Text style={styles.statValue}>{booking.seats}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Icon name="clock-outline" size={24} color={COLORS.primary} />
            <Text style={styles.statLabel}>Pickup</Text>
            <Text style={styles.statValue}>{formatTime(ride.departureTime)}</Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="message-text"
            style={styles.messageButton}
          >
            Message
          </Button>
          
          <Button
            mode="outlined"
            icon="share-variant"
            style={styles.shareButton}
          >
            Share ETA
          </Button>
        </View>
      </View>
      
      <Portal>
        <Dialog
          visible={ratingDialogVisible}
          onDismiss={() => setRatingDialogVisible(false)}
        >
          <Dialog.Title>Rate Your Trip</Dialog.Title>
          <Dialog.Content>
            <Text>How was your experience with this ride?</Text>
            <RatingStars
              defaultRating={rating}
              onRatingChange={setRating}
              size={40}
              label="Rate your experience"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRatingDialogVisible(false)}>
              Skip
            </Button>
            <Button
              onPress={handleSubmitRating}
              mode="contained"
              disabled={rating === 0}
            >
              Submit
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

// Function to calculate distance between coordinates
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

// Helper function: Convert degrees to radians
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Helper function: Calculate ETA in minutes based on distance and average speed
const calculateETA = (
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  avgSpeedKmh: number = 30
): number => {
  const distanceKm = calculateDistance(startLat, startLon, endLat, endLon);
  const timeHours = distanceKm / avgSpeedKmh;
  return Math.round(timeHours * 60); // ETA in minutes
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
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 8,
    elevation: 5,
  },
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    elevation: 10,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  vehicleInfo: {
    fontSize: 12,
    color: COLORS.placeholder,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripProgress: {
    marginBottom: 20,
  },
  progressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  progressCircle: {
    zIndex: 1,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.divider,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelItem: {
    flex: 1,
    paddingHorizontal: 5,
  },
  progressLabel: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 2,
  },
  progressSubLabel: {
    fontSize: 12,
    color: COLORS.placeholder,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.placeholder,
    marginTop: 5,
    marginBottom: 2,
  },
  statValue: {
    fontWeight: 'bold',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.divider,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messageButton: {
    flex: 1,
    marginRight: 10,
  },
  shareButton: {
    flex: 1,
  },
});

export default TrackRideScreen;