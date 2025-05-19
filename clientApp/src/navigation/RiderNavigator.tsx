import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Rider Screens
import RiderHomeScreen from '../screens/rider/RiderHomeScreen';
import SearchRidesScreen from '../screens/rider/SearchRidesScreen';
import RideSearchResultsScreen from '../screens/rider/RideSearchResultsScreen';
import RideDetailsScreen from '../screens/rider/RideDetailsScreen';
import MyBookingsScreen from '../screens/rider/MyBookingsScreen';
import BookingDetailsScreen from '../screens/rider/BookingDetailsScreen';
import TrackRideScreen from '../screens/rider/TrackRideScreen';

// Shared Screens
import ProfileScreen from '../screens/shared/ProfileScreen';
import EditProfileScreen from '../screens/shared/EditProfileScreen';
import SupportScreen from '../screens/shared/SupportScreen';
import RateUserScreen from '../screens/shared/RateUserScreen';
import UserRatingsScreen from '../screens/shared/UserRatingsScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';

// Use hardcoded values instead of importing from theme
const COLORS = {
  primary: '#1E88E5',
  disabled: '#9E9E9E',
};

// Types for Rider Stack
export type RiderStackParamList = {
  RiderHome: undefined;
  SearchRides: undefined;
  RideSearchResults: { 
    startCoords: [number, number], 
    endCoords: [number, number],
    startAddress: string,
    endAddress: string,
    date?: string 
  };
  RideDetails: { rideId: string };
  BookingDetails: { bookingId: string };
  TrackRide: { bookingId: string };
  EditProfile: undefined;
  RateUser: {
    itemId: string;
    type: 'ride' | 'booking';
    ratedUserId: string;
    ratedUserName: string;
  };
  UserRatings: undefined;
  Notifications: undefined;
};

// Types for Rider Tab
export type RiderTabParamList = {
  HomeStack: undefined;
  MyBookings: undefined;
  Profile: undefined;
  Support: undefined;
};

const Stack = createNativeStackNavigator<RiderStackParamList>();
const Tab = createBottomTabNavigator<RiderTabParamList>();

// Rider stack navigator for home-related screens
const RiderHomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="RiderHome" 
        component={RiderHomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SearchRides" 
        component={SearchRidesScreen} 
        options={{ title: 'Search Rides' }}
      />
      <Stack.Screen 
        name="RideSearchResults" 
        component={RideSearchResultsScreen} 
        options={{ title: 'Available Rides' }}
      />
      <Stack.Screen 
        name="RideDetails" 
        component={RideDetailsScreen} 
        options={{ title: 'Ride Details' }}
      />
      <Stack.Screen 
        name="BookingDetails" 
        component={BookingDetailsScreen} 
        options={{ title: 'Booking Details' }}
      />
      <Stack.Screen 
        name="TrackRide" 
        component={TrackRideScreen} 
        options={{ 
          title: 'Track Ride',
          headerShown: false, // Full screen map view
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen 
        name="RateUser" 
        component={RateUserScreen} 
        options={{ title: 'Rate Driver' }}
      />
      <Stack.Screen 
        name="UserRatings" 
        component={UserRatingsScreen} 
        options={{ title: 'My Ratings' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
};

// Main rider tab navigator
const RiderNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.disabled,
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={RiderHomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'My Bookings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="book" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Support"
        component={SupportScreen}
        options={{
          tabBarLabel: 'Support',
          tabBarIcon: ({ color, size }) => (
            <Icon name="help-circle" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default RiderNavigator;