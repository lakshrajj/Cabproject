import apiClient from './axios';

// Types
export interface Rating {
  _id: string;
  rater: string;
  rated: string;
  ride: string;
  booking: string;
  rating: number;
  comment: string;
  raterType: 'driver' | 'rider';
  createdAt: string;
}

// Submit a rating for a ride (either driver rating rider or rider rating driver)
export const submitRating = async (ratingData: {
  ride: string;
  booking: string;
  rated: string;
  rating: number;
  comment?: string;
}) => {
  const response = await apiClient.post('/ratings', ratingData);
  return response.data;
};

// Get ratings given to a user
export const getRatingsForUser = async (userId: string, page = 1, limit = 10) => {
  const response = await apiClient.get(`/ratings/user/${userId}`, {
    params: { page, limit },
  });
  return response.data;
};

// Get average rating for a user
export const getUserAverageRating = async (userId: string) => {
  const response = await apiClient.get(`/ratings/user/${userId}/average`);
  return response.data;
};

// Get ratings given by the current user
export const getMyGivenRatings = async (page = 1, limit = 10) => {
  const response = await apiClient.get('/ratings/my-given-ratings', {
    params: { page, limit },
  });
  return response.data;
};

// Get ratings received by the current user
export const getMyReceivedRatings = async (page = 1, limit = 10) => {
  const response = await apiClient.get('/ratings/my-received-ratings', {
    params: { page, limit },
  });
  return response.data;
};