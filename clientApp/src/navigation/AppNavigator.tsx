import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AuthNavigator from './AuthNavigator';
import DriverNavigator from './DriverNavigator';
import RiderNavigator from './RiderNavigator';

// Type definitions for our navigation structure
export type RootStackParamList = {
  Auth: undefined;
  DriverApp: undefined;
  RiderApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const auth = useContext(AuthContext);
  const { colors } = useTheme();

  if (auth?.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {auth?.user ? (
        auth.user.role === 'driver' ? (
          <Stack.Screen name="DriverApp" component={DriverNavigator} />
        ) : (
          <Stack.Screen name="RiderApp" component={RiderNavigator} />
        )
      ) : (
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{
            animationTypeForReplace: auth?.isSignout ? 'pop' : 'push',
          }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;