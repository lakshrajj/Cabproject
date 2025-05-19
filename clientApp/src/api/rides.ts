import apiClient from './axios';

// Types
export interface Location {
  address: string;
  coordinates: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface Ride {
  _id: string;
  driver: string;
  startLocation: Location;
  endLocation: Location;
  departureTime: string;
  availableSeats: number;
  fare: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  description?: string;
  bookings: string[];
  createdAt: string;
}

export interface RideFilter {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  minSeats?: number;
  maxFare?: number;
  status?: string;
}

// Create a new ride (driver only)
export const createRide = async (rideData: {
  startLocation: Location;
  endLocation: Location;
  departureTime: string;
  availableSeats: number;
  fare: number;
  description?: string;
}) => {
  const response = await apiClient.post('/rides', rideData);
  return response.data;
};

// Get all rides with filters
export const getRides = async (filters: RideFilter = {}) => {
  const response = await apiClient.get('/rides', { params: filters });
  return response.data;
};

// Get rides created by logged in driver
export const getMyRides = async (filters: { page?: number; limit?: number; status?: string } = {}) => {
  const response = await apiClient.get('/rides/my-rides', { params: filters });
  return response.data;
};

// Get a single ride by ID
export const getRideById = async (rideId: string) => {
  const response = await apiClient.get(`/rides/${rideId}`);
  return response.data;
};

// Update a ride (driver only)
export const updateRide = async (
  rideId: string,
  rideData: {
    startLocation?: Location;
    endLocation?: Location;
    departureTime?: string;
    availableSeats?: number;
    fare?: number;
    description?: string;
  }
) => {
  const response = await apiClient.put(`/rides/${rideId}`, rideData);
  return response.data;
};

// Update ride status (driver only)
export const updateRideStatus = async (
  rideId: string,
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
) => {
  const response = await apiClient.put(`/rides/${rideId}/status`, { status });
  return response.data;
};

// Delete a ride (driver only)
export const deleteRide = async (rideId: string) => {
  const response = await apiClient.delete(`/rides/${rideId}`);
  return response.data;
};