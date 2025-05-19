import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'rider' | 'driver' | 'admin';
  profilePicture?: string;
  driverDetails?: {
    carModel: string;
    carColor: string;
    licensePlate: string;
    licenseNumber: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignout: boolean;
  connectionError: string | null;
  register: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'rider' | 'driver';
  }) => Promise<void>;
  login: (emailOrPhone: string, password: string, useEmail: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: {
    name?: string;
    phone?: string;
    profilePicture?: string;
  }) => Promise<void>;
  updateDriverDetails: (driverData: {
    carModel: string;
    carColor: string;
    licensePlate: string;
    licenseNumber: string;
  }) => Promise<void>;
  checkConnection: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignout, setIsSignout] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Attempt to restore token on startup
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          setUser(JSON.parse(userString));
        }
      } catch (e) {
        console.log('Failed to restore authentication state:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Add a function to check connection
  const checkConnection = async () => {
    try {
      await authApi.checkServerConnection();
      setConnectionError(null);
      return true;
    } catch (error: any) {
      setConnectionError(error.message);
      return false;
    }
  };

  const authContext: AuthContextType = {
    user,
    isLoading,
    isSignout,
    connectionError,
    checkConnection,

    register: async (userData) => {
      setIsLoading(true);
      try {
        // Try to check server connection first
        try {
          await authApi.checkServerConnection();
        } catch (connectionError) {
          console.error('Server connection check failed:', connectionError);
          // If connection check fails, throw a more specific error
          throw new Error('Unable to connect to server. Please check your internet connection.');
        }
        
        // If server is reachable, proceed with registration
        const response = await authApi.register(userData);
        
        if (response.token) {
          await AsyncStorage.setItem('token', response.token);
          await AsyncStorage.setItem('user', JSON.stringify(response.user));
          setUser(response.user);
        }
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },

    login: async (emailOrPhone, password, useEmail) => {
      setIsLoading(true);
      try {
        // Try to check server connection first
        try {
          await authApi.checkServerConnection();
        } catch (connectionError) {
          console.error('Server connection check failed:', connectionError);
          // If connection check fails, throw a more specific error
          throw new Error('Unable to connect to server. Please check your internet connection.');
        }
        
        // If server is reachable, proceed with login
        let response;
        if (useEmail) {
          response = await authApi.loginWithEmail(emailOrPhone, password);
        } else {
          response = await authApi.loginWithPhone(emailOrPhone, password);
        }
        
        if (response.token) {
          await AsyncStorage.setItem('token', response.token);
          await AsyncStorage.setItem('user', JSON.stringify(response.user));
          setUser(response.user);
        }
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },

    logout: async () => {
      setIsLoading(true);
      setIsSignout(true);
      try {
        await authApi.logout();
        setUser(null);
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        setIsLoading(false);
      }
    },

    updateProfile: async (profileData) => {
      setIsLoading(true);
      try {
        const response = await authApi.updateProfile(profileData);
        if (response.success && user) {
          const updatedUser = { ...user, ...profileData };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('Update profile error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },

    updateDriverDetails: async (driverData) => {
      setIsLoading(true);
      try {
        const response = await authApi.updateDriverDetails(driverData);
        if (response.success && user) {
          const updatedUser = { 
            ...user, 
            driverDetails: driverData 
          };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('Update driver details error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};