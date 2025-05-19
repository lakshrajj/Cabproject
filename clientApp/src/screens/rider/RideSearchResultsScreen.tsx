import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS } from '../../utils/theme';
import { RiderStackParamList } from '../../navigation/RiderNavigator';
import { getRides, Ride } from '../../api/rides';
import { formatDate, formatCurrency, calculateDistance } from '../../utils/formatters';
import RideCard from '../../components/RideCard';

type RideSearchResultsRouteProp = RouteProp<RiderStackParamList, 'RideSearchResults'>;
type RideSearchResultsNavigationProp = NativeStackNavigationProp<RiderStackParamList, 'RideSearchResults'>;

const RideSearchResultsScreen = () => {
  const route = useRoute<RideSearchResultsRouteProp>();
  const navigation = useNavigation<RideSearchResultsNavigationProp>();
  const { startCoords, endCoords, startAddress, endAddress, date } = route.params;
  
  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'time' | 'price' | 'seats'>('time');

  useEffect(() => {
    loadRides();
  }, []);

  useEffect(() => {
    // Sort rides based on selected criterion
    let sorted = [...rides];
    
    if (sortBy === 'time') {
      sorted.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    } else if (sortBy === 'price') {
      sorted.sort((a, b) => a.fare - b.fare);
    } else if (sortBy === 'seats') {
      sorted.sort((a, b) => b.availableSeats - a.availableSeats);
    }
    
    setFilteredRides(sorted);
  }, [rides, sortBy]);

  const loadRides = async () => {
    try {
      setLoading(true);
      
      // Calculate the start and end dates for filtering
      const searchDate = date ? new Date(date) : new Date();
      const startDate = new Date(searchDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(searchDate);
      endDate.setHours(23, 59, 59, 999);
      
      // Fetch rides with filters
      const response = await getRides({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'scheduled',
        minSeats: 1,
      });
      
      // Filter rides based on proximity to start and end locations
      const nearbyRides = response.data.docs.filter((ride: Ride) => {
        const startLat = ride.startLocation.coordinates.coordinates[1];
        const startLon = ride.startLocation.coordinates.coordinates[0];
        const endLat = ride.endLocation.coordinates.coordinates[1];
        const endLon = ride.endLocation.coordinates.coordinates[0];
        
        // Calculate distances between search coordinates and ride coordinates
        const distanceToStart = calculateDistance(
          startCoords[1],
          startCoords[0],
          startLat,
          startLon
        );
        
        const distanceToEnd = calculateDistance(
          endCoords[1],
          endCoords[0],
          endLat,
          endLon
        );
        
        // Consider rides within 10km of start and end points
        return distanceToStart <= 10 && distanceToEnd <= 10;
      });
      
      setRides(nearbyRides);
      setFilteredRides(nearbyRides);
    } catch (error) {
      console.error('Error loading rides:', error);
      Alert.alert('Error', 'Failed to load available rides');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRides();
  };

  const handleRidePress = (ride: Ride) => {
    navigation.navigate('RideDetails', { rideId: ride._id });
  };

  const handleNewSearch = () => {
    navigation.goBack();
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
      <Card style={styles.searchInfoCard}>
        <Card.Content>
          <View style={styles.locationContainer}>
            <Icon name="map-marker" size={20} color={COLORS.primary} style={styles.locationIcon} />
            <Text style={styles.locationText} numberOfLines={1}>
              From: {startAddress}
            </Text>
          </View>
          
          <View style={styles.locationLine} />
          
          <View style={styles.locationContainer}>
            <Icon name="map-marker-check" size={20} color={COLORS.success} style={styles.locationIcon} />
            <Text style={styles.locationText} numberOfLines={1}>
              To: {endAddress}
            </Text>
          </View>
          
          <View style={styles.dateContainer}>
            <Icon name="calendar" size={18} color={COLORS.text} />
            <Text style={styles.dateText}>
              {date ? formatDate(date) : 'Today'}
            </Text>
          </View>
          
          <Button
            mode="outlined"
            onPress={handleNewSearch}
            style={styles.newSearchButton}
            icon="magnify"
          >
            New Search
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>{filteredRides.length} rides found</Text>
        
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            <Chip
              selected={sortBy === 'time'}
              onPress={() => setSortBy('time')}
              style={[styles.chip, sortBy === 'time' && styles.selectedChip]}
              textStyle={sortBy === 'time' ? styles.selectedChipText : undefined}
            >
              Departure Time
            </Chip>
            <Chip
              selected={sortBy === 'price'}
              onPress={() => setSortBy('price')}
              style={[styles.chip, sortBy === 'price' && styles.selectedChip]}
              textStyle={sortBy === 'price' ? styles.selectedChipText : undefined}
            >
              Price
            </Chip>
            <Chip
              selected={sortBy === 'seats'}
              onPress={() => setSortBy('seats')}
              style={[styles.chip, sortBy === 'seats' && styles.selectedChip]}
              textStyle={sortBy === 'seats' ? styles.selectedChipText : undefined}
            >
              Available Seats
            </Chip>
          </ScrollView>
        </View>
      </View>

      <ScrollView
        style={styles.ridesContainer}
        contentContainerStyle={styles.ridesContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <RideCard key={ride._id} ride={ride} onPress={() => handleRidePress(ride)} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="car-off" size={60} color={COLORS.disabled} />
            <Text style={styles.emptyText}>No rides found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search criteria or check back later for new rides
            </Text>
            <Button
              mode="contained"
              onPress={handleNewSearch}
              style={styles.tryAgainButton}
              icon="refresh"
            >
              Try a Different Search
            </Button>
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
  searchInfoCard: {
    margin: 16,
    borderRadius: 10,
    elevation: 4,
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
  locationText: {
    flex: 1,
    fontSize: 14,
  },
  locationLine: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.divider,
    marginLeft: 10,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
  },
  newSearchButton: {
    marginTop: 10,
  },
  resultHeader: {
    padding: 16,
    paddingBottom: 0,
  },
  resultCount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sortContainer: {
    marginBottom: 10,
  },
  sortLabel: {
    fontSize: 14,
    marginBottom: 5,
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
  ridesContainer: {
    flex: 1,
  },
  ridesContent: {
    paddingBottom: 20,
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
    marginBottom: 20,
  },
  tryAgainButton: {
    marginTop: 10,
  },
});

export default RideSearchResultsScreen;