import apiClient from './axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Test server connection
export const checkServerConnection = async () => {
  try {
    // Try a simpler endpoint first that might be more likely to respond
    const response = await apiClient.get('/', { 
      timeout: 5000,
      validateStatus: function (status) {
        // Accept any status code as valid for this check
        // We just want to know if the server is reachable
        return true;
      }
    });
    console.log('Server connection check response:', response.status);
    return { success: true, status: response.status };
  } catch (error: any) {
    console.error('Server connection error:', error.message);
    
    // Provide more specific error information
    let errorMessage = 'Unable to connect to server.';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Connection timed out. Server is not responding.';
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Network error. Please check your internet connection and server IP address.';
    }
    
    throw new Error(errorMessage);
  }
};

// User register
export const register = async (userData: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'rider' | 'driver';
}) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

// User login with email
export const loginWithEmail = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password });
  
  // Store the token and user data
  if (response.data.token) {
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

// User login with phone
export const loginWithPhone = async (phone: string, password: string) => {
  const response = await apiClient.post('/auth/login', { phone, password });
  
  // Store the token and user data
  if (response.data.token) {
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

// Get current user profile
export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

// Logout
export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
  return { success: true };
};

// Update profile
export const updateProfile = async (profileData: {
  name?: string;
  phone?: string;
  profilePicture?: string;
}) => {
  const response = await apiClient.put('/users/profile', profileData);
  
  // Update stored user data
  const userData = await AsyncStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    await AsyncStorage.setItem(
      'user',
      JSON.stringify({ ...user, ...profileData })
    );
  }
  
  return response.data;
};

// Update driver details
export const updateDriverDetails = async (driverData: {
  carModel: string;
  carColor: string;
  licensePlate: string;
  licenseNumber: string;
}) => {
  const response = await apiClient.put('/users/driver-details', driverData);
  return response.data;
};