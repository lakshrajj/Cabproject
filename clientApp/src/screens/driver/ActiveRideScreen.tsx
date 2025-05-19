import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import { Text, FAB, Portal, Dialog, Button, ActivityIndicator } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import MapView from '../../components/MapView';
import { COLORS } from '../../utils/theme';
import { DriverStackParamList } from '../../navigation/DriverNavigator';
import { getRideById, updateRideStatus } from '../../api/rides';
import { getBookingsForRide, updateBookingStatus } from '../../api/bookings';
import { Ride } from '../../api/rides';
import { Booking } from '../../api/bookings';
import { startLocationTracking, stopLocationTracking, getCurrentLocation } from '../../services/locationService';
import { formatTime, formatDistance, calculateETA } from '../../utils/formatters';

type ActiveRideRouteProp = RouteProp<DriverStackParamList, 'ActiveRide'>;
type ActiveRideNavigationProp = NativeStackNavigationProp<DriverStackParamList, 'ActiveRide'>;

const ActiveRideScreen = () => {
  const route = useRoute<ActiveRideRouteProp>();
  const navigation = useNavigation<ActiveRideNavigationProp>();
  const { rideId } = route.params;
  
  const [ride, setRide] = useState<Ride | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingStarted, setTrackingStarted] = useState(false);
  const [completingRide, setCompletingRide] = useState(false);
  const [completeDialogVisible, setCompleteDialogVisible] = useState(false);
  
  // Track location update interval
  const locationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadRideDetails();
    startTracking();
    
    return () => {
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
      stopLocationTracking().catch(console.error);
    };
  }, [rideId]);

  const loadRideDetails = async () => {
    try {
      setLoading(true);
      const response = await getRideById(rideId);
      setRide(response.data);
      
      // Load bookings for this ride
      const bookingsResponse = await getBookingsForRide(rideId);
      const acceptedBookings = bookingsResponse.data.docs.filter(
        (booking: Booking) => booking.status === 'accepted'
      );
      setBookings(acceptedBookings);
    } catch (error) {
      console.error('Error loading ride details:', error);
      Alert.alert('Error', 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const startTracking = async () => {
    try {
      const success = await startLocationTracking(rideId);
      if (success) {
        setTrackingStarted(true);
        
        // Update driver location immediately
        updateDriverLocation();
        
        // Then update it every 30 seconds
        locationInterval.current = setInterval(updateDriverLocation, 30000);
      } else {
        Alert.alert(
          'Location Permission',
          'Location tracking requires permission to access your location. Please enable it in settings.'
        );
      }
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const updateDriverLocation = async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        const { latitude, longitude } = location.coords;
        setDriverLocation([longitude, latitude]);
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleCompleteRide = async () => {
    if (!ride) return;
    
    try {
      setCompletingRide(true);
      
      // Update all accepted bookings to completed
      const updatePromises = bookings.map(booking => 
        updateBookingStatus(booking._id, 'completed')
      );
      
      await Promise.all(updatePromises);
      
      // Update ride status to completed
      await updateRideStatus(ride._id, 'completed');
      
      // Stop location tracking
      await stopLocationTracking();
      
      // Clear interval
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
      
      Alert.alert(
        'Ride Completed',
        'Your ride has been completed successfully.',
        [{ text: 'OK', onPress: () => navigation.navigate('DriverHome') }]
      );
    } catch (error) {
      console.error('Error completing ride:', error);
      Alert.alert('Error', 'Failed to complete the ride');
    } finally {
      setCompletingRide(false);
      setCompleteDialogVisible(false);
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

  // Calculate distance and ETA from driver to start location
  let distanceToStart = '';
  let etaToStart = '';
  
  if (driverLocation && ride.startLocation.coordinates.coordinates) {
    const startCoords = ride.startLocation.coordinates.coordinates;
    const distance = calculateDistance(
      driverLocation[1], 
      driverLocation[0], 
      startCoords[1], 
      startCoords[0]
    );
    distanceToStart = formatDistance(distance);
    
    const eta = calculateETA(
      driverLocation[1], 
      driverLocation[0], 
      startCoords[1], 
      startCoords[0]
    );
    etaToStart = `ETA: ${formatTime(new Date(Date.now() + eta * 60000).toISOString())}`;
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        showUserLocation
        startLocation={ride.startLocation.coordinates.coordinates}
        endLocation={ride.endLocation.coordinates.coordinates}
        driverLocation={driverLocation ?? undefined}
      />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={COLORS.background} />
      </TouchableOpacity>
      
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Active Ride</Text>
          {trackingStarted ? (
            <View style={styles.trackingIndicator}>
              <View style={styles.pulsingDot} />
              <Text style={styles.trackingText}>Live Tracking</Text>
            </View>
          ) : (
            <Text style={styles.trackingText}>Starting tracking...</Text>
          )}
        </View>
        
        <View style={styles.locationDetails}>
          <Icon name="map-marker" size={20} color={COLORS.primary} style={styles.locationIcon} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>From:</Text>
            <Text numberOfLines={1} style={styles.locationText}>
              {ride.startLocation.address}
            </Text>
          </View>
        </View>
        
        <View style={styles.locationDetails}>
          <Icon name="map-marker-check" size={20} color={COLORS.success} style={styles.locationIcon} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>To:</Text>
            <Text numberOfLines={1} style={styles.locationText}>
              {ride.endLocation.address}
            </Text>
          </View>
        </View>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{distanceToStart || '...'}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Arrival</Text>
            <Text style={styles.statValue}>{etaToStart || '...'}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Passengers</Text>
            <Text style={styles.statValue}>{bookings.length}</Text>
          </View>
        </View>
      </View>
      
      <FAB
        style={styles.fab}
        icon="check"
        label="Complete Ride"
        onPress={() => setCompleteDialogVisible(true)}
      />
      
      <Portal>
        <Dialog
          visible={completeDialogVisible}
          onDismiss={() => setCompleteDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Complete Ride</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to complete this ride?</Text>
            <Text style={styles.dialogSubtext}>
              This will mark all {bookings.length} bookings as completed.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setCompleteDialogVisible(false)} 
              disabled={completingRide}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleCompleteRide} 
              loading={completingRide}
              disabled={completingRide}
              mode="contained"
            >
              Complete
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
  statusCard: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    elevation: 10,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  trackingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
    marginRight: 5,
  },
  trackingText: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  locationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationIcon: {
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
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 10,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.placeholder,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: COLORS.success,
  },
  dialog: {
    backgroundColor: COLORS.background,
  },
  dialogSubtext: {
    marginTop: 10,
    color: COLORS.placeholder,
  },
});

export default ActiveRideScreen;