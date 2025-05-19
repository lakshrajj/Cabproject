import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, IconButton, Badge, Divider, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS } from '../../utils/theme';
import useNotifications from '../../hooks/useNotifications';
import { Notification } from '../../api/notifications';
import { formatDate } from '../../utils/formatters';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleNotificationPress = (notification: Notification) => {
    // Mark notification as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.relatedType === 'ride' && notification.relatedId) {
      if (notification.type === 'ride_created' || notification.type === 'ride_updated') {
        navigation.navigate('RideDetails', { rideId: notification.relatedId });
      }
    } else if (notification.relatedType === 'booking' && notification.relatedId) {
      navigation.navigate('BookingDetails', { bookingId: notification.relatedId });
    }
  };

  // Helper function to get icon name and color based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return { name: 'information', color: COLORS.info };
      case 'success':
        return { name: 'check-circle', color: COLORS.success };
      case 'warning':
        return { name: 'alert-circle', color: COLORS.warning };
      case 'error':
        return { name: 'close-circle', color: COLORS.error };
      default:
        return { name: 'bell', color: COLORS.primary };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.notificationsList}
        contentContainerStyle={styles.notificationsContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadNotifications} />
        }
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => {
            const { name: iconName, color: iconColor } = getNotificationIcon(notification.type);
            return (
              <TouchableOpacity
                key={notification._id}
                onPress={() => handleNotificationPress(notification)}
              >
                <Card
                  style={[
                    styles.notificationCard,
                    !notification.isRead && styles.unreadNotification,
                  ]}
                >
                  <Card.Content style={styles.notificationContent}>
                    <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                      <Icon name={iconName} size={24} color={iconColor} />
                      {!notification.isRead && (
                        <Badge style={styles.unreadBadge} size={10} />
                      )}
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationTime}>
                        {formatDate(notification.createdAt)}
                      </Text>
                    </View>
                    <IconButton
                      icon="chevron-right"
                      size={24}
                      color={COLORS.disabled}
                      style={styles.arrowIcon}
                    />
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="bell-off" size={60} color={COLORS.disabled} />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>
              You'll see notifications about your rides and bookings here
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="refresh"
        style={styles.fab}
        onPress={loadNotifications}
        loading={isLoading}
        disabled={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    color: COLORS.background,
    opacity: 0.8,
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  notificationCard: {
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.placeholder,
  },
  arrowIcon: {
    margin: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  emptySubtext: {
    textAlign: 'center',
    color: COLORS.placeholder,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default NotificationsScreen;