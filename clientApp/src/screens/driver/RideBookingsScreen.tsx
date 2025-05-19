import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Chip, Portal, Dialog, Button } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS } from '../../utils/theme';
import { DriverStackParamList } from '../../navigation/DriverNavigator';
import { getBookingsForRide, updateBookingStatus, Booking } from '../../api/bookings';
import BookingCard from '../../components/BookingCard';

type RideBookingsRouteProp = RouteProp<DriverStackParamList, 'RideBookings'>;

const RideBookingsScreen = () => {
  const route = useRoute<RideBookingsRouteProp>();
  const { rideId } = route.params;
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionDialogVisible, setActionDialogVisible] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [rideId]);

  useEffect(() => {
    if (statusFilter) {
      setFilteredBookings(bookings.filter(booking => booking.status === statusFilter));
    } else {
      setFilteredBookings(bookings);
    }
  }, [bookings, statusFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getBookingsForRide(rideId);
      setBookings(response.data.docs);
      setFilteredBookings(response.data.docs);
    } catch (error) {
      console.error('Error loading bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleBookingPress = (booking: Booking) => {
    setSelectedBooking(booking);
    setActionDialogVisible(true);
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status === statusFilter ? null : status);
  };

  const handleAcceptBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      setProcessingAction(true);
      await updateBookingStatus(selectedBooking._id, 'accepted');
      Alert.alert('Success', 'Booking has been accepted');
      await loadBookings();
    } catch (error) {
      console.error('Error accepting booking:', error);
      Alert.alert('Error', 'Failed to accept booking');
    } finally {
      setProcessingAction(false);
      setActionDialogVisible(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      setProcessingAction(true);
      await updateBookingStatus(selectedBooking._id, 'rejected');
      Alert.alert('Success', 'Booking has been rejected');
      await loadBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      Alert.alert('Error', 'Failed to reject booking');
    } finally {
      setProcessingAction(false);
      setActionDialogVisible(false);
    }
  };

  const renderActionDialog = () => {
    if (!selectedBooking) return null;
    
    const isPending = selectedBooking.status === 'pending';
    
    return (
      <Dialog
        visible={actionDialogVisible}
        onDismiss={() => setActionDialogVisible(false)}
        style={styles.dialog}
      >
        <Dialog.Title>Booking Actions</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.dialogText}>
            Booking from {selectedBooking.pickupLocation.address.split(',')[0]} to {selectedBooking.dropLocation.address.split(',')[0]}
          </Text>
          <Text style={styles.dialogSubtext}>
            {selectedBooking.seats} {selectedBooking.seats === 1 ? 'seat' : 'seats'} requested
          </Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.dialogActions}>
          {isPending && (
            <>
              <Button
                onPress={() => setActionDialogVisible(false)}
                style={styles.dialogButton}
                disabled={processingAction}
              >
                Cancel
              </Button>
              <Button
                onPress={handleRejectBooking}
                style={styles.dialogButton}
                disabled={processingAction}
                loading={processingAction}
                mode="outlined"
                textColor={COLORS.error}
              >
                Reject
              </Button>
              <Button
                onPress={handleAcceptBooking}
                style={styles.dialogButton}
                disabled={processingAction}
                loading={processingAction}
                mode="contained"
              >
                Accept
              </Button>
            </>
          )}
          {!isPending && (
            <Button
              onPress={() => setActionDialogVisible(false)}
              style={styles.dialogButton}
              mode="contained"
            >
              Close
            </Button>
          )}
        </Dialog.Actions>
      </Dialog>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter by Status:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          <Chip
            selected={statusFilter === 'pending'}
            onPress={() => handleStatusFilter('pending')}
            style={[styles.chip, statusFilter === 'pending' && styles.selectedChip]}
            textStyle={statusFilter === 'pending' ? styles.selectedChipText : undefined}
          >
            Pending
          </Chip>
          <Chip
            selected={statusFilter === 'accepted'}
            onPress={() => handleStatusFilter('accepted')}
            style={[styles.chip, statusFilter === 'accepted' && styles.selectedChip]}
            textStyle={statusFilter === 'accepted' ? styles.selectedChipText : undefined}
          >
            Accepted
          </Chip>
          <Chip
            selected={statusFilter === 'rejected'}
            onPress={() => handleStatusFilter('rejected')}
            style={[styles.chip, statusFilter === 'rejected' && styles.selectedChip]}
            textStyle={statusFilter === 'rejected' ? styles.selectedChipText : undefined}
          >
            Rejected
          </Chip>
          <Chip
            selected={statusFilter === 'cancelled'}
            onPress={() => handleStatusFilter('cancelled')}
            style={[styles.chip, statusFilter === 'cancelled' && styles.selectedChip]}
            textStyle={statusFilter === 'cancelled' ? styles.selectedChipText : undefined}
          >
            Cancelled
          </Chip>
          <Chip
            selected={statusFilter === 'completed'}
            onPress={() => handleStatusFilter('completed')}
            style={[styles.chip, statusFilter === 'completed' && styles.selectedChip]}
            textStyle={statusFilter === 'completed' ? styles.selectedChipText : undefined}
          >
            Completed
          </Chip>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.bookingsContainer}
        contentContainerStyle={styles.bookingsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onPress={() => handleBookingPress(booking)}
              showRideDetails={true}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookings found</Text>
            <Text style={styles.emptySubtext}>
              {statusFilter
                ? `There are no ${statusFilter} bookings for this ride.`
                : 'There are no bookings for this ride yet.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <Portal>{renderActionDialog()}</Portal>
    </View>
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
  filterContainer: {
    padding: 16,
    backgroundColor: COLORS.background,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: 8,
    backgroundColor: COLORS.surface,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  selectedChipText: {
    color: COLORS.background,
  },
  bookingsContainer: {
    flex: 1,
  },
  bookingsContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    textAlign: 'center',
    color: COLORS.placeholder,
  },
  dialog: {
    backgroundColor: COLORS.background,
  },
  dialogText: {
    fontSize: 16,
    marginBottom: 5,
  },
  dialogSubtext: {
    color: COLORS.placeholder,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dialogButton: {
    marginLeft: 8,
  },
});

export default RideBookingsScreen;