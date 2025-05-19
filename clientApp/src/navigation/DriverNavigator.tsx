import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Driver Screens
import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import MyRidesScreen from '../screens/driver/MyRidesScreen';
import CreateRideScreen from '../screens/driver/CreateRideScreen';
import RideDetailsScreen from '../screens/driver/RideDetailsScreen';
import ActiveRideScreen from '../screens/driver/ActiveRideScreen';
import RideBookingsScreen from '../screens/driver/RideBookingsScreen';

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

// Types for Driver Stack
export type DriverStackParamList = {
  DriverHome: undefined;
  CreateRide: undefined;
  RideDetails: { rideId: string };
  ActiveRide: { rideId: string };
  RideBookings: { rideId: string };
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

// Types for Driver Tab
export type DriverTabParamList = {
  HomeStack: undefined;
  MyRides: undefined;
  Profile: undefined;
  Support: undefined;
};

const Stack = createNativeStackNavigator<DriverStackParamList>();
const Tab = createBottomTabNavigator<DriverTabParamList>();

// Driver stack navigator for home-related screens
const DriverHomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="DriverHome" 
        component={DriverHomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CreateRide" 
        component={CreateRideScreen} 
        options={{ title: 'Create Ride' }}
      />
      <Stack.Screen 
        name="RideDetails" 
        component={RideDetailsScreen} 
        options={{ title: 'Ride Details' }}
      />
      <Stack.Screen 
        name="ActiveRide" 
        component={ActiveRideScreen} 
        options={{ 
          title: 'Active Ride',
          headerShown: false, // Full screen map view
        }}
      />
      <Stack.Screen 
        name="RideBookings" 
        component={RideBookingsScreen} 
        options={{ title: 'Bookings' }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen 
        name="RateUser" 
        component={RateUserScreen} 
        options={{ title: 'Rate User' }}
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

// Main driver tab navigator
const DriverNavigator = () => {
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
        component={DriverHomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MyRides"
        component={MyRidesScreen}
        options={{
          tabBarLabel: 'My Rides',
          tabBarIcon: ({ color, size }) => (
            <Icon name="car" color={color} size={size} />
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

export default DriverNavigator;