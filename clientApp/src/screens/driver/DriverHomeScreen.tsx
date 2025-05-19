import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Button, FAB, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Ride } from '../../api/rides';
import { getMyRides } from '../../api/rides';
import { COLORS } from '../../utils/theme';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { DriverStackParamList } from '../../navigation/DriverNavigator';
import useAuth from '../../hooks/useAuth';
import RideCard from '../../components/RideCard';

type DriverHomeNavigationProp = NativeStackNavigationProp<DriverStackParamList, 'DriverHome'>;

const DriverHomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<DriverHomeNavigationProp>();
  const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      setLoading(true);
      const response = await getMyRides();
      
      // Filter rides by status
      const activeRides = response.data.docs.filter(
        (ride: Ride) => ride.status === 'in-progress'
      );
      
      const scheduledRides = response.data.docs.filter(
        (ride: Ride) => ride.status === 'scheduled'
      );
      
      setActiveRide(activeRides.length > 0 ? activeRides[0] : null);
      setUpcomingRides(scheduledRides);
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRides();
  };

  const handleCreateRide = () => {
    navigation.navigate('CreateRide');
  };

  const handleViewRideDetails = (ride: Ride) => {
    navigation.navigate('RideDetails', { rideId: ride._id });
  };

  const handleViewActiveRide = () => {
    if (activeRide) {
      navigation.navigate('ActiveRide', { rideId: activeRide._id });
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
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome, {user?.name}!</Text>
          <Text style={styles.subtitleText}>Manage your rides and bookings</Text>
        </View>

        {activeRide ? (
          <Card style={styles.activeRideCard} onPress={handleViewActiveRide}>
            <Card.Content>
              <View style={styles.activeRideHeader}>
                <Text style={styles.activeRideTitle}>Active Ride</Text>
                <Icon name="circle" size={12} color={COLORS.success} />
              </View>
              
              <View style={styles.activeRideDetails}>
                <Icon name="map-marker" size={20} color={COLORS.primary} />
                <Text style={styles.activeRideText}>
                  {activeRide.startLocation.address.split(',')[0]} to{' '}
                  {activeRide.endLocation.address.split(',')[0]}
                </Text>
              </View>

              <View style={styles.activeRideInfo}>
                <Text>
                  {formatDate(activeRide.departureTime)} | {activeRide.bookings.length} bookings
                </Text>
              </View>

              <Button
                mode="contained"
                style={styles.viewActiveRideButton}
                onPress={handleViewActiveRide}
              >
                Continue Ride
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.createRideCard}>
            <Card.Content>
              <Text style={styles.createRideTitle}>Ready to start driving?</Text>
              <Text style={styles.createRideText}>
                Create a new ride and start earning by sharing your journey with others.
              </Text>
              <Button
                mode="contained"
                style={styles.createRideButton}
                onPress={handleCreateRide}
                icon="plus"
              >
                Create New Ride
              </Button>
            </Card.Content>
          </Card>
        )}

        <View style={styles.upcomingRidesSection}>
          <Text style={styles.sectionTitle}>Your Upcoming Rides</Text>
          
          {upcomingRides.length > 0 ? (
            upcomingRides.map((ride) => (
              <RideCard 
                key={ride._id} 
                ride={ride} 
                onPress={() => handleViewRideDetails(ride)}
              />
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyCardContent}>
                <Icon name="car-off" size={48} color={COLORS.disabled} />
                <Text style={styles.emptyText}>No upcoming rides</Text>
                <Text style={styles.emptySubtext}>
                  Create a new ride to start sharing your journey
                </Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="plus"
        label="New Ride"
        onPress={handleCreateRide}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
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
  activeRideCard: {
    margin: 16,
    borderRadius: 10,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.success,
  },
  activeRideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeRideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  activeRideDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  activeRideText: {
    fontSize: 16,
    marginLeft: 10,
  },
  activeRideInfo: {
    marginVertical: 5,
  },
  viewActiveRideButton: {
    marginTop: 10,
    backgroundColor: COLORS.success,
  },
  createRideCard: {
    margin: 16,
    borderRadius: 10,
    elevation: 4,
  },
  createRideTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  createRideText: {
    marginBottom: 15,
  },
  createRideButton: {
    marginTop: 10,
  },
  upcomingRidesSection: {
    padding: 16,
    paddingTop: 0,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default DriverHomeScreen;