import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import the authentication screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RegisterDriverScreen from '../screens/auth/RegisterDriverScreen';
import ServerStatusScreen from '../screens/shared/ServerStatusScreen';

// Define the types for our authentication navigation stack
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  RegisterDriver: undefined;
  ServerStatus: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RegisterDriver" component={RegisterDriverScreen} />
      <Stack.Screen name="ServerStatus" component={ServerStatusScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;