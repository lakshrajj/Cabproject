import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Chip, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS } from '../../utils/theme';
import { DriverStackParamList } from '../../navigation/DriverNavigator';
import { getMyRides, Ride } from '../../api/rides';
import RideCard from '../../components/RideCard';

type MyRidesNavigationProp = NativeStackNavigationProp<DriverStackParamList, 'MyRides'>;

const MyRidesScreen = () => {
  const navigation = useNavigation<MyRidesNavigationProp>();
  const [rides, setRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    loadRides();
  }, []);

  useEffect(() => {
    if (statusFilter) {
      setFilteredRides(rides.filter(ride => ride.status === statusFilter));
    } else {
      setFilteredRides(rides);
    }
  }, [rides, statusFilter]);

  const loadRides = async () => {
    try {
      setLoading(true);
      const response = await getMyRides();
      setRides(response.data.docs);
      setFilteredRides(response.data.docs);
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

  const handleRidePress = (ride: Ride) => {
    navigation.navigate('RideDetails', { rideId: ride._id });
  };

  const handleCreateRide = () => {
    navigation.navigate('CreateRide');
  };

  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status === statusFilter ? null : status);
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
        <Text style={styles.headerTitle}>My Rides</Text>
        <Text style={styles.ridesCount}>{rides.length} total rides</Text>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter by Status:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          <Chip
            selected={statusFilter === 'scheduled'}
            onPress={() => handleStatusFilter('scheduled')}
            style={[styles.chip, statusFilter === 'scheduled' && styles.selectedChip]}
            textStyle={statusFilter === 'scheduled' ? styles.selectedChipText : undefined}
          >
            Scheduled
          </Chip>
          <Chip
            selected={statusFilter === 'in-progress'}
            onPress={() => handleStatusFilter('in-progress')}
            style={[styles.chip, statusFilter === 'in-progress' && styles.selectedChip]}
            textStyle={statusFilter === 'in-progress' ? styles.selectedChipText : undefined}
          >
            In Progress
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
        </ScrollView>
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
            <Text style={styles.emptyText}>No rides found</Text>
            <Text style={styles.emptySubtext}>
              {statusFilter
                ? `You don't have any ${statusFilter} rides.`
                : 'You haven\'t created any rides yet.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="New Ride"
        onPress={handleCreateRide}
      />
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
    padding: 16,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  ridesCount: {
    fontSize: 14,
    color: COLORS.background,
    opacity: 0.8,
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
  ridesContainer: {
    flex: 1,
  },
  ridesContent: {
    paddingVertical: 8,
    paddingBottom: 80, // To account for the FAB
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default MyRidesScreen;