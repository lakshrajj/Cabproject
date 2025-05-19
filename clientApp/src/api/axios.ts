import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import apiConfig from '../config/apiConfig';

// Create an instance of axios with default configuration
const apiClient = axios.create({
  baseURL: apiConfig.baseUrl, // Now using the centralized configuration
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: apiConfig.timeout,
});

// Add an interceptor to include the JWT token in requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Check if error is a timeout or network error
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    const isNetworkError = !error.response && error.request;
    
    if (isTimeout || isNetworkError) {
      console.log('Connection error:', isTimeout ? 'Timeout' : 'Network error');
    }
    
    // Handle 401 Unauthorized errors by redirecting to login
    if (error.response && error.response.status === 401) {
      // Clear token and trigger logout
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // The AuthContext will handle the rest
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;