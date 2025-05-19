import apiClient from './axios';

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  relatedId?: string;
  relatedType?: 'ride' | 'booking';
  createdAt: string;
}

// Get all notifications for the current user
export const getMyNotifications = async (page = 1, limit = 20) => {
  const response = await apiClient.get('/notifications', {
    params: { page, limit },
  });
  return response.data;
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  const response = await apiClient.put(`/notifications/${notificationId}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.put('/notifications/read-all');
  return response.data;
};

// Delete a notification
export const deleteNotification = async (notificationId: string) => {
  const response = await apiClient.delete(`/notifications/${notificationId}`);
  return response.data;
};