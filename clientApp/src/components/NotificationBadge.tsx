import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge } from 'react-native-paper';
import { COLORS } from '../utils/theme';
import useNotifications from '../hooks/useNotifications';

interface NotificationBadgeProps {
  icon: React.ReactNode;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ icon }) => {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) {
    return <>{icon}</>;
  }

  return (
    <View style={styles.container}>
      {icon}
      <Badge style={styles.badge} size={16}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </Badge>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    margin: 5,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -10,
    backgroundColor: COLORS.error,
  },
});

export default NotificationBadge;