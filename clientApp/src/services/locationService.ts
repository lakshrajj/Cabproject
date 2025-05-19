import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/axios';

let locationSubscription: Location.LocationSubscription | null = null;
let backgroundLocationTask: string | null = null;

// Interface for location update
interface LocationUpdate {
  rideId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
}

// Start tracking driver location
export const startLocationTracking = async (rideId: string): Promise<boolean> => {
  try {
    // Request permissions
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.error('Permission to access location was denied');
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.error('Permission to access location in background was denied');
      return false;
    }

    // Store the ride ID for reference
    await AsyncStorage.setItem('activeRideId', rideId);

    // Start location updates
    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10, // Minimum change (in meters) before receiving updates
        timeInterval: 30000, // Update every 30 seconds
      },
      (location) => {
        updateDriverLocation(rideId, location.coords);
      }
    );

    // Define background task
    backgroundLocationTask = await Location.startLocationUpdatesAsync('background-location-task', {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 30000, // Update every 30 seconds
      distanceInterval: 10, // Minimum distance (meters) between updates
      foregroundService: {
        notificationTitle: 'Location Tracking',
        notificationBody: 'Tracking your location for active ride',
        notificationColor: '#1E88E5',
      },
      pausesUpdatesAutomatically: false,
    });

    return true;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    return false;
  }
};

// Stop tracking driver location
export const stopLocationTracking = async (): Promise<void> => {
  try {
    if (locationSubscription) {
      locationSubscription.remove();
      locationSubscription = null;
    }

    if (backgroundLocationTask) {
      await Location.stopLocationUpdatesAsync('background-location-task');
      backgroundLocationTask = null;
    }

    await AsyncStorage.removeItem('activeRideId');
  } catch (error) {
    console.error('Error stopping location tracking:', error);
  }
};

// Update driver location on the server
export const updateDriverLocation = async (
  rideId: string,
  coords: { latitude: number; longitude: number }
): Promise<void> => {
  try {
    const locationUpdate: LocationUpdate = {
      rideId,
      location: {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
      timestamp: Date.now(),
    };

    // Send location update to server
    await apiClient.post('/rides/location-update', locationUpdate);
    
    // Cache the latest location
    await AsyncStorage.setItem('lastKnownLocation', JSON.stringify({
      coords,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Error updating driver location:', error);
    
    // Store failed updates to retry later
    const failedUpdates = await AsyncStorage.getItem('failedLocationUpdates');
    const updates = failedUpdates ? JSON.parse(failedUpdates) : [];
    updates.push({
      rideId,
      location: coords,
      timestamp: Date.now(),
    });
    await AsyncStorage.setItem('failedLocationUpdates', JSON.stringify(updates));
  }
};

// Get the current location
export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return null;
    }

    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

// Calculate distance between two coordinates in kilometers
export const calculateDistance = (
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

// Convert degrees to radians
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Calculate ETA based on distance and average speed
export const calculateETA = (
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  avgSpeedKmh: number = 40
): number => {
  const distanceKm = calculateDistance(startLat, startLon, endLat, endLon);
  const timeHours = distanceKm / avgSpeedKmh;
  return Math.round(timeHours * 60); // ETA in minutes
};