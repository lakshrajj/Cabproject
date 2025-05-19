import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';

import { getMyNotifications, Notification, markNotificationAsRead } from '../api/notifications';
import useAuth from '../hooks/useAuth';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load notifications when the user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  // Calculate unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter((notification) => !notification.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await getMyNotifications();
      if (response && response.data && response.data.docs) {
        setNotifications(response.data.docs);
      } else {
        setNotifications([]);
        console.log('No notifications found or empty response');
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Initialize with empty array to prevent undefined errors
      setNotifications([]);
      
      // Don't show alert for common connection issues
      if (!error.toString().includes('Network Error') && 
          !error.toString().includes('timeout') &&
          !error.toString().includes('404')) {
        Alert.alert(
          'Notification Error',
          'Could not load notifications. Please try again later.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markNotificationAsRead('all');
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};