import apiClient from './axios';
import { Location } from './rides';

// Booking interface
export interface Booking {
  _id: string;
  ride: string;
  rider: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  seats: number;
  pickupLocation: Location;
  dropLocation: Location;
  totalFare: number;
  createdAt: string;
}

// Create a new booking (rider only)
export const createBooking = async (bookingData: {
  ride: string;
  seats: number;
  pickupLocation: Location;
  dropLocation: Location;
}) => {
  const response = await apiClient.post('/bookings', bookingData);
  return response.data;
};

// Get all bookings for a ride (driver or admin only)
export const getBookingsForRide = async (
  rideId: string,
  filters: { page?: number; limit?: number; status?: string } = {}
) => {
  const response = await apiClient.get(`/bookings/ride/${rideId}`, {
    params: filters,
  });
  return response.data;
};

// Get bookings made by logged in rider
export const getMyBookings = async (
  filters: { page?: number; limit?: number; status?: string } = {}
) => {
  const response = await apiClient.get('/bookings/my-bookings', {
    params: filters,
  });
  return response.data;
};

// Get a single booking by ID
export const getBookingById = async (bookingId: string) => {
  const response = await apiClient.get(`/bookings/${bookingId}`);
  return response.data;
};

// Update booking status (driver only)
export const updateBookingStatus = async (
  bookingId: string,
  status: 'accepted' | 'rejected' | 'completed' | 'cancelled'
) => {
  const response = await apiClient.put(`/bookings/${bookingId}/status`, {
    status,
  });
  return response.data;
};

// Cancel a booking (rider only)
export const cancelBooking = async (bookingId: string) => {
  const response = await apiClient.put(`/bookings/${bookingId}/cancel`);
  return response.data;
};