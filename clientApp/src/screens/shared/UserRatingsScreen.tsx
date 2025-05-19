import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Card, Chip, Divider, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS } from '../../utils/theme';
import { getMyReceivedRatings, Rating } from '../../api/ratings';
import { formatDate } from '../../utils/formatters';
import useAuth from '../../hooks/useAuth';

const UserRatingsScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const response = await getMyReceivedRatings();
      setRatings(response.data.docs);
      
      // Calculate average rating
      if (response.data.docs.length > 0) {
        const totalRating = response.data.docs.reduce(
          (sum: number, rating: Rating) => sum + rating.rating,
          0
        );
        setAverageRating(totalRating / response.data.docs.length);
        
        // Calculate rating counts
        const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        response.data.docs.forEach((rating: Rating) => {
          counts[rating.rating] = (counts[rating.rating] || 0) + 1;
        });
        setRatingCounts(counts);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRatings();
  };

  const calculateRatingPercentage = (rating: number) => {
    if (ratings.length === 0) return 0;
    return (ratingCounts[rating] || 0) / ratings.length * 100;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryHeader}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userRole}>{user?.role === 'driver' ? 'Driver' : 'Rider'}</Text>
            </View>
            <View style={styles.ratingInfo}>
              <View style={styles.ratingCircle}>
                <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
                <Icon name="star" size={16} color={COLORS.warning} />
              </View>
              <Text style={styles.ratingCount}>{ratings.length} ratings</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.ratingBars}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <View key={rating} style={styles.ratingBarContainer}>
                <View style={styles.ratingBarLabel}>
                  <Text>{rating}</Text>
                  <Icon name="star" size={14} color={COLORS.warning} />
                </View>
                <View style={styles.ratingBarBackground}>
                  <View
                    style={[
                      styles.ratingBarFill,
                      { width: `${calculateRatingPercentage(rating)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.ratingBarCount}>{ratingCounts[rating] || 0}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      <View style={styles.ratingsSection}>
        <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
        
        {ratings.length > 0 ? (
          ratings.map((rating) => (
            <Card key={rating._id} style={styles.ratingCard}>
              <Card.Content>
                <View style={styles.ratingHeader}>
                  <View style={styles.raterInfo}>
                    <Avatar.Text
                      size={40}
                      label={rating.rater.name ? rating.rater.name.charAt(0).toUpperCase() : "?"}
                      backgroundColor={COLORS.primary}
                    />
                    <View style={styles.raterDetails}>
                      <Text style={styles.raterName}>{rating.rater.name || 'User'}</Text>
                      <Text style={styles.ratingDate}>{formatDate(rating.createdAt)}</Text>
                    </View>
                  </View>
                  <View style={styles.ratingValue}>
                    <Text style={styles.ratingNumber}>{rating.rating.toFixed(1)}</Text>
                    <Icon name="star" size={18} color={COLORS.warning} />
                  </View>
                </View>
                
                {rating.comment && (
                  <Text style={styles.ratingComment}>{rating.comment}</Text>
                )}
                
                <Chip
                  style={styles.ratingTypeChip}
                  textStyle={styles.ratingTypeText}
                >
                  {rating.raterType === 'driver' ? 'From Driver' : 'From Rider'}
                </Chip>
              </Card.Content>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="star-off" size={60} color={COLORS.disabled} />
            <Text style={styles.emptyText}>No ratings yet</Text>
            <Text style={styles.emptySubtext}>
              Ratings will appear here after completing rides
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    margin: 16,
    borderRadius: 10,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.placeholder,
  },
  ratingInfo: {
    alignItems: 'center',
  },
  ratingCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 5,
  },
  ratingNumber: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: COLORS.placeholder,
  },
  divider: {
    marginBottom: 15,
  },
  ratingBars: {
    marginTop: 10,
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingBarLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 30,
    marginRight: 10,
  },
  ratingBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
  },
  ratingBarCount: {
    marginLeft: 10,
    width: 30,
    textAlign: 'right',
    fontSize: 12,
    color: COLORS.placeholder,
  },
  ratingsSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingCard: {
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  raterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  raterDetails: {
    marginLeft: 10,
  },
  raterName: {
    fontWeight: 'bold',
  },
  ratingDate: {
    fontSize: 12,
    color: COLORS.placeholder,
  },
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingComment: {
    marginBottom: 10,
    lineHeight: 20,
  },
  ratingTypeChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
  },
  ratingTypeText: {
    fontSize: 12,
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
});

export default UserRatingsScreen;