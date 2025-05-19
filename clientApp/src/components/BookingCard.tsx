import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Divider, Badge } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Booking } from '../api/bookings';
import { formatDate, formatTime, formatCurrency } from '../utils/formatters';
import { COLORS } from '../utils/theme';

// Status badge colors
const STATUS_COLORS = {
  pending: COLORS.warning,
  accepted: COLORS.success,
  rejected: COLORS.error,
  cancelled: COLORS.error,
  completed: COLORS.info,
};

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
  showRideDetails?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  onPress,
  showRideDetails = false 
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>
              {booking.pickupLocation.address.split(',')[0]} to{' '}
              {booking.dropLocation.address.split(',')[0]}
            </Title>
            <Badge
              style={[
                styles.statusBadge,
                { backgroundColor: STATUS_COLORS[booking.status] },
              ]}
            >
              {booking.status}
            </Badge>
          </View>

          {showRideDetails && (
            <>
              <View style={styles.locationContainer}>
                <Icon name="map-marker" size={20} color={COLORS.primary} style={styles.icon} />
                <Paragraph style={styles.locationText}>
                  Pickup: {booking.pickupLocation.address}
                </Paragraph>
              </View>

              <View style={styles.locationContainer}>
                <Icon name="map-marker-check" size={20} color={COLORS.success} style={styles.icon} />
                <Paragraph style={styles.locationText}>
                  Drop: {booking.dropLocation.address}
                </Paragraph>
              </View>

              <Divider style={styles.divider} />
            </>
          )}

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Icon name="calendar" size={18} color={COLORS.text} />
              <Paragraph style={styles.detailText}>
                {formatDate(booking.createdAt)}
              </Paragraph>
            </View>

            <View style={styles.detailItem}>
              <Icon name="account-multiple" size={18} color={COLORS.text} />
              <Paragraph style={styles.detailText}>
                {booking.seats} {booking.seats === 1 ? 'seat' : 'seats'}
              </Paragraph>
            </View>

            <View style={styles.detailItem}>
              <Icon name="cash" size={18} color={COLORS.text} />
              <Paragraph style={styles.detailText}>
                {formatCurrency(booking.totalFare)}
              </Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    flexShrink: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
    marginTop: 3,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
  },
  divider: {
    marginVertical: 12,
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
    marginLeft: 4,
    fontSize: 14,
  },
});

export default BookingCard;