import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, Card, Divider, Button, Portal, Dialog } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import MapView from '../../components/MapView';
import RatingStars from '../../components/RatingStars';
import { COLORS } from '../../utils/theme';
import { RiderStackParamList } from '../../navigation/RiderNavigator';
import { getBookingById, cancelBooking, Booking } from '../../api/bookings';
import { getRideById, Ride } from '../../api/rides';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';

type BookingDetailsRouteProp = RouteProp<RiderStackParamList, 'BookingDetails'>;
type BookingDetailsNavigationProp = NativeStackNavigationProp<RiderStackParamList, 'BookingDetails'>;

const BookingDetailsScreen = () => {
  const route = useRoute<BookingDetailsRouteProp>();
  const navigation = useNavigation<BookingDetailsNavigationProp>();
  const { bookingId } = route.params;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(false);
  const [ratingDialogVisible, setRatingDialogVisible] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      
      // Get booking details
      const bookingResponse = await getBookingById(bookingId);
      setBooking(bookingResponse.data);
      
      // Get ride details
      const rideResponse = await getRideById(bookingResponse.data.ride);
      setRide(rideResponse.data);
    } catch (error) {
      console.error('Error loading booking details:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    try {
      setCancellingBooking(true);
      await cancelBooking(booking._id);
      
      Alert.alert(
        'Booking Cancelled',
        'Your booking has been cancelled successfully',
        [{ text: 'OK', onPress: () => loadBookingDetails() }]
      );
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking');
    } finally {
      setCancellingBooking(false);
      setCancelDialogVisible(false);
    }
  };

  const handleTrackRide = () => {
    if (!booking) return;
    navigation.navigate('TrackRide', { bookingId: booking._id });
  };

  const handleSubmitRating = async () => {
    // In a real app, this would call an API to save the rating
    Alert.alert(
      'Rating Submitted',
      'Thank you for your feedback!',
      [{ text: 'OK', onPress: () => setRatingDialogVisible(false) }]
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
        <Text>Booking not found</Text>
      </View>
    );
  }

  // Determine if actions are available based on status
  const canCancel = booking.status === 'pending' || booking.status === 'accepted';
  const canTrack = booking.status === 'accepted' && ride.status === 'in-progress';
  const canRate = booking.status === 'completed';
  
  // Get status color
  const getStatusColor = () => {
    switch (booking.status) {
      case 'pending': return COLORS.warning;
      case 'accepted': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'cancelled':
      case 'rejected': return COLORS.error;
      default: return COLORS.placeholder;
    }
  };

  // Get status description
  const getStatusDescription = () => {
    switch (booking.status) {
      case 'pending': return 'Waiting for driver approval';
      case 'accepted': return 'Your booking has been accepted';
      case 'completed': return 'Your trip has been completed';
      case 'cancelled': return 'You cancelled this booking';
      case 'rejected': return 'The driver rejected this booking';
      default: return '';
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          pickupLocation={booking.pickupLocation.coordinates.coordinates}
          dropLocation={booking.dropLocation.coordinates.coordinates}
        />
      </View>

      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <View>
            <Text style={styles.bookingId}>Booking #{booking._id.slice(-6)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{booking.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <Text style={styles.statusDescription}>{getStatusDescription()}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.rideCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          
          <View style={styles.locationContainer}>
            <Icon name="map-marker" size={20} color={COLORS.primary} style={styles.locationIcon} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Pickup</Text>
              <Text style={styles.locationText}>{booking.pickupLocation.address}</Text>
            </View>
          </View>
          
          <View style={styles.locationLine} />
          
          <View style={styles.locationContainer}>
            <Icon name="map-marker-check" size={20} color={COLORS.success} style={styles.locationIcon} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Drop-off</Text>
              <Text style={styles.locationText}>{booking.dropLocation.address}</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Icon name="calendar" size={18} color={COLORS.text} />
              <Text style={styles.detailText}>
                {formatDate(ride.departureTime)}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="clock-outline" size={18} color={COLORS.text} />
              <Text style={styles.detailText}>
                {formatTime(ride.departureTime)}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Icon name="account-multiple" size={18} color={COLORS.text} />
              <Text style={styles.detailText}>
                {booking.seats} {booking.seats === 1 ? 'seat' : 'seats'}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="cash" size={18} color={COLORS.text} />
              <Text style={styles.detailText}>
                {formatCurrency(booking.totalFare)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.driverCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Driver</Text>
          
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Icon name="account" size={40} color={COLORS.background} />
            </View>
            
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{ride.driver.name || 'Driver'}</Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.ratingText}>4.8</Text>
              </View>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.vehicleContainer}>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleLabel}>Vehicle</Text>
              <Text style={styles.vehicleValue}>
                {ride.driver.driverDetails?.carColor || 'Blue'} {ride.driver.driverDetails?.carModel || 'Sedan'}
              </Text>
            </View>
            
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleLabel}>License Plate</Text>
              <Text style={styles.vehicleValue}>
                {ride.driver.driverDetails?.licensePlate || 'ABC123'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actionsContainer}>
        {canTrack && (
          <Button
            mode="contained"
            onPress={handleTrackRide}
            style={styles.actionButton}
            icon="map-marker-path"
            labelStyle={styles.actionButtonLabel}
          >
            Track Ride
          </Button>
        )}
        
        {canRate && (
          <Button
            mode="contained"
            onPress={() => setRatingDialogVisible(true)}
            style={[styles.actionButton, { backgroundColor: COLORS.warning }]}
            icon="star"
            labelStyle={styles.actionButtonLabel}
          >
            Rate This Trip
          </Button>
        )}
        
        {canCancel && (
          <Button
            mode="outlined"
            onPress={() => setCancelDialogVisible(true)}
            style={styles.cancelButton}
            icon="close-circle"
            textColor={COLORS.error}
          >
            Cancel Booking
          </Button>
        )}
      </View>

      <Portal>
        <Dialog
          visible={cancelDialogVisible}
          onDismiss={() => setCancelDialogVisible(false)}
        >
          <Dialog.Title>Cancel Booking</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to cancel this booking?</Text>
            <Text style={styles.dialogSubtext}>
              Cancellation policy may apply depending on how close it is to the departure time.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setCancelDialogVisible(false)}
              disabled={cancellingBooking}
            >
              Keep Booking
            </Button>
            <Button
              onPress={handleCancelBooking}
              loading={cancellingBooking}
              disabled={cancellingBooking}
              textColor={COLORS.error}
            >
              Cancel Booking
            </Button>
          </Dialog.Actions>
        </Dialog>

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
  statusCard: {
    margin: 16,
    marginTop: -20,
    borderRadius: 10,
    elevation: 4,
  },
  statusContent: {
    alignItems: 'center',
  },
  bookingId: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'center',
  },
  statusText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  statusDescription: {
    marginTop: 10,
    color: COLORS.placeholder,
    textAlign: 'center',
  },
  rideCard: {
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
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailText: {
    marginLeft: 8,
  },
  driverCard: {
    margin: 16,
    borderRadius: 10,
    elevation: 4,
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
    marginRight: 15,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
  },
  vehicleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleLabel: {
    fontSize: 12,
    color: COLORS.placeholder,
    marginBottom: 2,
  },
  vehicleValue: {
    fontWeight: 'bold',
  },
  actionsContainer: {
    padding: 16,
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 10,
    paddingVertical: 8,
  },
  actionButtonLabel: {
    fontSize: 16,
  },
  cancelButton: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  dialogSubtext: {
    marginTop: 10,
    color: COLORS.placeholder,
  },
});

export default BookingDetailsScreen;