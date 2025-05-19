// API Configuration
// Contains settings for API connections

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

// Server API configurations for different environments
const apiConfigs = {
  // Development environment options
  emulator: {
    android: {
      baseUrl: 'http://10.0.2.2:5000/api', // Special IP for Android emulator to reach localhost
      timeout: 10000 // 10 seconds
    },
    ios: {
      baseUrl: 'http://localhost:5000/api', // iOS simulator can use localhost directly
      timeout: 10000
    }
  },
  
  // Physical device options - replace with your actual server IP address
  device: {
    local: {
      baseUrl: 'http://192.168.0.102:5000/api', // Your actual local network IP
      timeout: 15000
    },
    production: {
      baseUrl: 'https://your-production-server.com/api', // Production server URL
      timeout: 15000
    }
  }
};

// DIFFERENT CONFIGURATION OPTIONS

// UNCOMMENT ONE OF THESE BASED ON YOUR SETUP
// ---------------------------------------

// For Android Emulator
// const ACTIVE_CONFIG: ApiConfig = apiConfigs.emulator.android;

// For iOS Simulator
// const ACTIVE_CONFIG: ApiConfig = apiConfigs.emulator.ios;

// For physical device on your local network
const ACTIVE_CONFIG: ApiConfig = apiConfigs.device.local;

// For production deployment
// const ACTIVE_CONFIG: ApiConfig = apiConfigs.device.production;

export default ACTIVE_CONFIG;