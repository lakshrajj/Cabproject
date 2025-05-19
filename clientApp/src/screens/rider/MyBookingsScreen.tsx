import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS } from '../../utils/theme';
import { RiderStackParamList } from '../../navigation/RiderNavigator';
import { getMyBookings, Booking } from '../../api/bookings';
import BookingCard from '../../components/BookingCard';

type MyBookingsNavigationProp = NativeStackNavigationProp<RiderStackParamList, 'MyBookings'>;

const MyBookingsScreen = () => {
  const navigation = useNavigation<MyBookingsNavigationProp>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

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
      const response = await getMyBookings();
      setBookings(response.data.docs);
      setFilteredBookings(response.data.docs);
    } catch (error) {
      console.error('Error loading bookings:', error);
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
    navigation.navigate('BookingDetails', { bookingId: booking._id });
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status === statusFilter ? null : status);
  };

  const getActiveBookingsCount = () => {
    return bookings.filter(
      booking => booking.status === 'pending' || booking.status === 'accepted'
    ).length;
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getActiveBookingsCount()}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

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
            selected={statusFilter === 'completed'}
            onPress={() => handleStatusFilter('completed')}
            style={[styles.chip, statusFilter === 'completed' && styles.selectedChip]}
            textStyle={statusFilter === 'completed' ? styles.selectedChipText : undefined}
          >
            Completed
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
            selected={statusFilter === 'rejected'}
            onPress={() => handleStatusFilter('rejected')}
            style={[styles.chip, statusFilter === 'rejected' && styles.selectedChip]}
            textStyle={statusFilter === 'rejected' ? styles.selectedChipText : undefined}
          >
            Rejected
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
            <Icon name="book-off" size={60} color={COLORS.disabled} />
            <Text style={styles.emptyText}>No bookings found</Text>
            <Text style={styles.emptySubtext}>
              {statusFilter
                ? `You don't have any ${statusFilter} bookings.`
                : 'You haven\'t made any bookings yet.'}
            </Text>
          </View>
        )}
      </ScrollView>
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
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.background,
    opacity: 0.8,
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
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
    marginTop: 10,
    marginBottom: 10,
  },
  emptySubtext: {
    textAlign: 'center',
    color: COLORS.placeholder,
  },
});

export default MyBookingsScreen;