import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Booking } from '../../api/bookings';
import { getMyBookings } from '../../api/bookings';
import { COLORS } from '../../utils/theme';
import { RiderStackParamList } from '../../navigation/RiderNavigator';
import useAuth from '../../hooks/useAuth';
import BookingCard from '../../components/BookingCard';
import MapView from '../../components/MapView';

type RiderHomeNavigationProp = NativeStackNavigationProp<RiderStackParamList, 'RiderHome'>;

const RiderHomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<RiderHomeNavigationProp>();
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings();
      
      // Filter bookings by status
      const activeBookings = response.data.docs.filter(
        (booking: Booking) => booking.status === 'accepted' || booking.status === 'pending'
      );
      
      const completedBookings = response.data.docs.filter(
        (booking: Booking) => booking.status === 'completed'
      );
      
      setActiveBooking(activeBookings.length > 0 ? activeBookings[0] : null);
      setRecentBookings(completedBookings.slice(0, 3)); // Show only the 3 most recent completed bookings
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

  const handleSearch = () => {
    navigation.navigate('SearchRides');
  };

  const handleViewBookingDetails = (booking: Booking) => {
    navigation.navigate('BookingDetails', { bookingId: booking._id });
  };

  const handleTrackRide = () => {
    if (activeBooking) {
      navigation.navigate('TrackRide', { bookingId: activeBooking._id });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>Hello, {user?.name}!</Text>
          <Text style={styles.subtitleText}>Where are you going today?</Text>
        </View>

        <View style={styles.searchSection}>
          <Card style={styles.searchCard}>
            <Card.Content>
              <TouchableOpacity onPress={handleSearch}>
                <Searchbar
                  placeholder="Where to?"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchbar}
                  iconColor={COLORS.primary}
                  onPressIn={handleSearch}
                  editable={false}
                />
              </TouchableOpacity>
              
              <View style={styles.quickDestinations}>
                <TouchableOpacity style={styles.quickDestItem} onPress={handleSearch}>
                  <Icon name="briefcase" size={24} color={COLORS.primary} />
                  <Text style={styles.quickDestText}>Work</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.quickDestItem} onPress={handleSearch}>
                  <Icon name="home" size={24} color={COLORS.primary} />
                  <Text style={styles.quickDestText}>Home</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.quickDestItem} onPress={handleSearch}>
                  <Icon name="shopping" size={24} color={COLORS.primary} />
                  <Text style={styles.quickDestText}>Shopping</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        </View>

        {activeBooking ? (
          <Card style={styles.activeBookingCard} onPress={handleTrackRide}>
            <Card.Content>
              <View style={styles.activeBookingHeader}>
                <Text style={styles.activeBookingTitle}>Current Booking</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {activeBooking.status === 'accepted' ? 'ACCEPTED' : 'PENDING'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.locationContainer}>
                <Icon name="circle" size={10} color={COLORS.primary} style={styles.locationIcon} />
                <Text style={styles.locationText}>{activeBooking.pickupLocation.address}</Text>
              </View>
              
              <View style={styles.locationLine} />
              
              <View style={styles.locationContainer}>
                <Icon name="map-marker" size={16} color={COLORS.accent} style={styles.locationIcon} />
                <Text style={styles.locationText}>{activeBooking.dropLocation.address}</Text>
              </View>

              <Button
                mode="contained"
                onPress={handleTrackRide}
                style={styles.trackButton}
                icon="map-marker-path"
              >
                {activeBooking.status === 'accepted' ? 'Track Ride' : 'View Details'}
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.mapPreview}>
            <MapView showUserLocation style={styles.map} />
            <View style={styles.mapOverlay}>
              <Text style={styles.mapText}>Ready to book a ride?</Text>
              <Button
                mode="contained"
                onPress={handleSearch}
                style={styles.findRideButton}
                icon="magnify"
              >
                Find Rides Near You
              </Button>
            </View>
          </View>
        )}

        <View style={styles.recentBookingsSection}>
          <Text style={styles.sectionTitle}>Recent Rides</Text>
          
          {recentBookings.length > 0 ? (
            recentBookings.map((booking) => (
              <BookingCard 
                key={booking._id} 
                booking={booking} 
                onPress={() => handleViewBookingDetails(booking)}
                showRideDetails={false}
              />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyCardContent}>
                <Icon name="history" size={48} color={COLORS.disabled} />
                <Text style={styles.emptyText}>No recent rides</Text>
                <Text style={styles.emptySubtext}>
                  Your completed rides will appear here
                </Text>
              </Card.Content>
            </Card>
          )}
          
          {recentBookings.length > 0 && (
            <Button
              mode="text"
              onPress={() => navigation.navigate('MyBookings')}
              style={styles.viewAllButton}
            >
              View All Bookings
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  subtitleText: {
    fontSize: 16,
    color: COLORS.background,
    opacity: 0.8,
  },
  searchSection: {
    marginTop: -20,
    paddingHorizontal: 16,
  },
  searchCard: {
    borderRadius: 10,
    elevation: 4,
  },
  searchbar: {
    borderRadius: 8,
    elevation: 0,
    backgroundColor: COLORS.surface,
  },
  quickDestinations: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  quickDestItem: {
    alignItems: 'center',
    padding: 10,
  },
  quickDestText: {
    marginTop: 5,
    fontSize: 12,
  },
  activeBookingCard: {
    margin: 16,
    borderRadius: 10,
    elevation: 4,
  },
  activeBookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  activeBookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationIcon: {
    marginTop: 4,
    marginRight: 10,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
  },
  locationLine: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.divider,
    marginLeft: 5,
    marginBottom: 8,
  },
  trackButton: {
    marginTop: 15,
  },
  mapPreview: {
    height: 200,
    margin: 16,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    elevation: 4,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  mapText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  findRideButton: {
    width: '100%',
  },
  recentBookingsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyCard: {
    borderRadius: 10,
    marginVertical: 10,
  },
  emptyCardContent: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  emptySubtext: {
    textAlign: 'center',
    marginTop: 5,
    color: COLORS.placeholder,
  },
  viewAllButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default RiderHomeScreen;