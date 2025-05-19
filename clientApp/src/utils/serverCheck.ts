import NetInfo from '@react-native-community/netinfo';
import apiConfig from '../config/apiConfig';
import axios from 'axios';

// Utility to check if internet is available and server is reachable
export const checkServerStatus = async (): Promise<{ isConnected: boolean; serverReachable: boolean; message: string }> => {
  // First check if device has internet connectivity
  const netInfo = await NetInfo.fetch();
  
  if (!netInfo.isConnected) {
    return {
      isConnected: false,
      serverReachable: false,
      message: 'No internet connection. Please check your network settings.'
    };
  }
  
  // If we have internet, check if server is reachable
  try {
    // Very simple request that just checks if server responds
    // No authentication or complex logic required
    await axios.get(apiConfig.baseUrl.replace('/api', ''), {
      timeout: 5000,
      validateStatus: () => true // Accept any status code
    });
    
    return {
      isConnected: true,
      serverReachable: true,
      message: 'Server is reachable'
    };
  } catch (error) {
    return {
      isConnected: true,
      serverReachable: false,
      message: 'Server is not reachable. Please check server address in config.'
    };
  }
};

// Debug function to check multiple server IP options
export const checkMultipleServers = async (): Promise<Record<string, boolean>> => {
  const serverOptions = [
    'http://10.0.2.2:5000',      // Android emulator localhost
    'http://localhost:5000',     // iOS simulator
    'http://127.0.0.1:5000',     // Direct localhost
    'http://192.168.0.102:5000', // Your actual LAN IP
  ];
  
  const results: Record<string, boolean> = {};
  
  for (const server of serverOptions) {
    try {
      await axios.get(server, { 
        timeout: 3000,
        validateStatus: () => true
      });
      results[server] = true;
    } catch (error) {
      results[server] = false;
    }
  }
  
  return results;
};