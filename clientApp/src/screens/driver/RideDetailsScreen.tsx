import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, Card, Divider, List, Button, Menu } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import MapView from '../../components/MapView';
import AppButton from '../../components/AppButton';
import { COLORS } from '../../utils/theme';
import { DriverStackParamList } from '../../navigation/DriverNavigator';
import { getRideById, updateRideStatus, deleteRide } from '../../api/rides';
import { Ride } from '../../api/rides';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';

type RideDetailsRouteProp = RouteProp<DriverStackParamList, 'RideDetails'>;
type RideDetailsNavigationProp = NativeStackNavigationProp<DriverStackParamList, 'RideDetails'>;

const RideDetailsScreen = () => {
  const route = useRoute<RideDetailsRouteProp>();
  const navigation = useNavigation<RideDetailsNavigationProp>();
  const { rideId } = route.params;
  
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadRideDetails();
  }, [rideId]);

  const loadRideDetails = async () => {
    try {
      setLoading(true);
      const response = await getRideById(rideId);
      setRide(response.data);
    } catch (error) {
      console.error('Error loading ride details:', error);
      Alert.alert('Error', 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRide = async () => {
    if (!ride) return;
    
    try {
      setUpdating(true);
      await updateRideStatus(ride._id, 'in-progress');
      
      Alert.alert(
        'Ride Started',
        'Your ride has started. You can now track progress and receive updates.',
        [
          {
            text: 'Open Live View',
            onPress: () => navigation.navigate('ActiveRide', { rideId: ride._id }),
          },
          {
            text: 'OK',
            onPress: () => loadRideDetails(),
          },
        ]
      );
    } catch (error) {
      console.error('Error starting ride:', error);
      Alert.alert('Error', 'Failed to start the ride');
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteRide = async () => {
    if (!ride) return;
    
    try {
      setUpdating(true);
      await updateRideStatus(ride._id, 'completed');
      Alert.alert('Success', 'Ride has been marked as completed');
      loadRideDetails();
    } catch (error) {
      console.error('Error completing ride:', error);
      Alert.alert('Error', 'Failed to complete the ride');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelRide = async () => {
    if (!ride) return;
    
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride? This cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          onPress: async () => {
            try {
              setUpdating(true);
              await updateRideStatus(ride._id, 'cancelled');
              Alert.alert('Success', 'Ride has been cancelled');
              loadRideDetails();
            } catch (error) {
              console.error('Error cancelling ride:', error);
              Alert.alert('Error', 'Failed to cancel the ride');
            } finally {
              setUpdating(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDeleteRide = async () => {
    if (!ride) return;
    
    Alert.alert(
      'Delete Ride',
      'Are you sure you want to delete this ride? This cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Delete',
          onPress: async () => {
            try {
              setUpdating(true);
              await deleteRide(ride._id);
              Alert.alert('Success', 'Ride has been deleted');
              navigation.navigate('DriverHome');
            } catch (error) {
              console.error('Error deleting ride:', error);
              Alert.alert('Error', 'Failed to delete the ride');
            } finally {
              setUpdating(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleViewBookings = () => {
    if (!ride) return;
    navigation.navigate('RideBookings', { rideId: ride._id });
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

  // Disable actions based on ride status
  const canStart = ride.status === 'scheduled';
  const canComplete = ride.status === 'in-progress';
  const canCancel = ride.status === 'scheduled';
  const canDelete = ride.status === 'scheduled' || ride.status === 'cancelled';
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          startLocation={ride.startLocation.coordinates.coordinates}
          endLocation={ride.endLocation.coordinates.coordinates}
        />
      </View>

      <Card style={styles.statusCard}>
        <Card.Content style={styles.statusContent}>
          <View>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{ride.status.toUpperCase()}</Text>
            </View>
          </View>
          
          <Menu
            visible={statusMenuVisible}
            onDismiss={() => setStatusMenuVisible(false)}
            anchor={
              <Button
                mode="contained"
                onPress={() => setStatusMenuVisible(true)}
                loading={updating}
                disabled={updating}
                style={styles.updateStatusButton}
              >
                Update Status
              </Button>
            }
          >
            {canStart && (
              <Menu.Item 
                title="Start Ride" 
                onPress={() => {
                  setStatusMenuVisible(false);
                  handleStartRide();
                }}
                leadingIcon="play-circle"
              />
            )}
            {canComplete && (
              <Menu.Item 
                title="Complete Ride" 
                onPress={() => {
                  setStatusMenuVisible(false);
                  handleCompleteRide();
                }} 
                leadingIcon="check-circle"
              />
            )}
            {canCancel && (
              <Menu.Item 
                title="Cancel Ride" 
                onPress={() => {
                  setStatusMenuVisible(false);
                  handleCancelRide();
                }} 
                leadingIcon="cancel"
              />
            )}
          </Menu>
        </Card.Content>
      </Card>

      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Ride Details</Text>
          
          <List.Item
            title="From"
            description={ride.startLocation.address}
            left={props => <List.Icon {...props} icon="map-marker" color={COLORS.primary} />}
          />
          
          <Divider />
          
          <List.Item
            title="To"
            description={ride.endLocation.address}
            left={props => <List.Icon {...props} icon="map-marker-check" color={COLORS.success} />}
          />
          
          <Divider />
          
          <View style={styles.rowDetails}>
            <View style={styles.halfDetail}>
              <List.Item
                title="Date"
                description={formatDate(ride.departureTime)}
                left={props => <List.Icon {...props} icon="calendar" color={COLORS.text} />}
              />
            </View>
            
            <View style={styles.halfDetail}>
              <List.Item
                title="Time"
                description={formatTime(ride.departureTime)}
                left={props => <List.Icon {...props} icon="clock-outline" color={COLORS.text} />}
              />
            </View>
          </View>
          
          <Divider />
          
          <View style={styles.rowDetails}>
            <View style={styles.halfDetail}>
              <List.Item
                title="Seats"
                description={`${ride.availableSeats} available`}
                left={props => <List.Icon {...props} icon="seat" color={COLORS.text} />}
              />
            </View>
            
            <View style={styles.halfDetail}>
              <List.Item
                title="Fare"
                description={formatCurrency(ride.fare)}
                left={props => <List.Icon {...props} icon="cash" color={COLORS.text} />}
              />
            </View>
          </View>
          
          {ride.description && (
            <>
              <Divider />
              <List.Item
                title="Description"
                description={ride.description}
                left={props => <List.Icon {...props} icon="text" color={COLORS.text} />}
              />
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.bookingsCard}>
        <Card.Content>
          <View style={styles.bookingsHeader}>
            <Text style={styles.sectionTitle}>Bookings</Text>
            <Text style={styles.bookingsCount}>{ride.bookings.length} bookings</Text>
          </View>
          
          <AppButton
            mode="outlined"
            icon="book-open"
            onPress={handleViewBookings}
            style={styles.viewBookingsButton}
          >
            View All Bookings
          </AppButton>
        </Card.Content>
      </Card>

      {ride.status === 'in-progress' && (
        <AppButton
          mode="contained"
          icon="map-marker-path"
          onPress={() => navigation.navigate('ActiveRide', { rideId: ride._id })}
          style={styles.actionButton}
          color={COLORS.success}
        >
          Continue Ride
        </AppButton>
      )}

      {canDelete && (
        <AppButton
          mode="outlined"
          icon="delete"
          onPress={handleDeleteRide}
          style={[styles.actionButton, styles.deleteButton]}
          color={COLORS.error}
        >
          Delete Ride
        </AppButton>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
  },
  statusBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 5,
  },
  statusText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  updateStatusButton: {
    marginVertical: 0,
  },
  detailsCard: {
    margin: 16,
    borderRadius: 10,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rowDetails: {
    flexDirection: 'row',
  },
  halfDetail: {
    flex: 1,
  },
  bookingsCard: {
    margin: 16,
    borderRadius: 10,
    elevation: 4,
  },
  bookingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingsCount: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  viewBookingsButton: {
    marginTop: 10,
  },
  actionButton: {
    margin: 16,
  },
  deleteButton: {
    marginTop: 0,
  },
});

export default RideDetailsScreen;