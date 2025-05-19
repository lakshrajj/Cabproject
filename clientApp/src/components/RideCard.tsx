import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Divider, Badge, useTheme as usePaperTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Ride } from '../api/rides';
import { formatDate, formatTime, formatCurrency } from '../utils/formatters';
// Temporarily disabled theme: import { useTheme } from '../context/BasicThemeContext';

// Status badge colors are now dynamic and set within the component

interface RideCardProps {
  ride: Ride;
  onPress: () => void;
}

const RideCard: React.FC<RideCardProps> = ({ ride, onPress }) => {
  // Temporarily disabled theme
  // const { colors, isDarkMode } = useTheme();
  const colors = {
    primary: '#1E88E5',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#212121',
    border: '#BDBDBD',
    subtext: '#616161',
    success: '#388E3C',
    error: '#D32F2F',
    info: '#1976D2',
    warning: '#FFA000',
    disabled: '#9E9E9E',
    divider: '#E0E0E0',
    shadow: '#000000',
  };
  const isDarkMode = false;
  const paperTheme = usePaperTheme();
  
  // Dynamic status badge colors based on current theme
  const STATUS_COLORS = {
    scheduled: colors.primary,
    'in-progress': colors.info,
    completed: colors.success,
    cancelled: colors.error,
    pending: colors.warning,
    accepted: colors.success,
    rejected: colors.error,
  };
  
  // Dynamic styles based on current theme
  const styles = StyleSheet.create({
    card: {
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      backgroundColor: colors.card,
      ...isDarkMode
        ? { borderWidth: 1, borderColor: colors.border } 
        : { elevation: 3 },
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    title: {
      fontSize: 18,
      flexShrink: 1,
      color: colors.text,
    },
    statusBadge: {
      paddingHorizontal: 8,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 6,
    },
    icon: {
      marginRight: 8,
      marginTop: 3,
    },
    locationText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    divider: {
      marginVertical: 12,
      backgroundColor: colors.divider,
    },
    detailsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
      marginBottom: 8,
    },
    detailText: {
      marginLeft: 6,
      fontSize: 14,
      color: colors.subtext,
    },
  });
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      style={isDarkMode ? { 
        shadowColor: 'transparent',
        elevation: 0
      } : {}}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>
              {ride.startLocation.address.split(',')[0]} to{' '}
              {ride.endLocation.address.split(',')[0]}
            </Title>
            <Badge
              style={[
                styles.statusBadge,
                { backgroundColor: STATUS_COLORS[ride.status] },
              ]}
            >
              {ride.status}
            </Badge>
          </View>

          <View style={styles.locationContainer}>
            <Icon name="map-marker" size={20} color={colors.primary} style={styles.icon} />
            <Paragraph style={styles.locationText}>
              From: {ride.startLocation.address}
            </Paragraph>
          </View>

          <View style={styles.locationContainer}>
            <Icon name="map-marker-check" size={20} color={colors.success} style={styles.icon} />
            <Paragraph style={styles.locationText}>
              To: {ride.endLocation.address}
            </Paragraph>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Icon name="calendar" size={18} color={colors.subtext} />
              <Paragraph style={styles.detailText}>
                {formatDate(ride.departureTime)}
              </Paragraph>
            </View>

            <View style={styles.detailItem}>
              <Icon name="clock-outline" size={18} color={colors.subtext} />
              <Paragraph style={styles.detailText}>
                {formatTime(ride.departureTime)}
              </Paragraph>
            </View>

            <View style={styles.detailItem}>
              <Icon name="account-multiple" size={18} color={colors.subtext} />
              <Paragraph style={styles.detailText}>
                {ride.availableSeats} seats
              </Paragraph>
            </View>

            <View style={styles.detailItem}>
              <Icon name="cash" size={18} color={colors.subtext} />
              <Paragraph style={styles.detailText}>
                {formatCurrency(ride.fare)}
              </Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

// Removed static styles as we now use dynamic styles

export default RideCard;