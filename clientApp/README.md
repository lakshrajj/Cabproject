# RideShare Mobile App

A React Native carpooling application with real-time tracking, ride booking, and route planning.

## Features

- User authentication (phone/email login)
- Driver flow: Post rides with pickup, drop, date/time, fare, and available seats
- Rider flow: Search rides by location, date, time, and book a ride
- Live tracking of driver location using Google Maps
- Display estimated pickup ETA for riders and real-time trip progress
- Rating system for both drivers and riders
- In-app notifications for ride status updates

## Tech Stack

- React Native with Expo
- React Navigation for routing and navigation
- React Native Paper for UI components
- React Native Maps for location and mapping features
- Axios for API communication
- Formik & Yup for form handling and validation
- AsyncStorage for local storage

## Installation & Setup

1. Make sure you have Node.js and npm installed
2. Install Expo CLI: `npm install -g expo-cli`
3. Clone the repository
4. Navigate to the project directory: `cd clientApp`
5. Install dependencies: `npm install`
6. Start the development server: `npm start`

## Running the App

- For iOS simulator: `npm run ios`
- For Android emulator: `npm run android`
- For web development: `npm run web`

## Backend API

The app connects to a Node.js/Express backend with MongoDB. Make sure the backend server is running before using the app.

## Project Structure

- `/assets` - App icons, images, and other assets
- `/src/api` - API service and endpoint handlers
- `/src/components` - Reusable UI components
- `/src/context` - Context providers (Auth, etc)
- `/src/hooks` - Custom React hooks
- `/src/navigation` - Navigation configuration
- `/src/screens` - App screens
  - `/auth` - Authentication screens
  - `/driver` - Driver-specific screens
  - `/rider` - Rider-specific screens
  - `/shared` - Screens shared between drivers and riders
- `/src/services` - Business logic services
- `/src/utils` - Utility functions and constants

## Environment Setup

- You'll need to set up an `.env` file with:
  - `API_URL`: Backend API URL
  - `GOOGLE_MAPS_API_KEY`: For map and location services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request