import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RatingStars from '../../components/RatingStars';
import { COLORS } from '../../utils/theme';
import { submitRating } from '../../api/ratings';
import { getRideById } from '../../api/rides';
import { getBookingById } from '../../api/bookings';

// This is a shared screen that can be used by both drivers and riders
// The route params will determine the context
interface RateUserRouteParams {
  // The ID of the ride or booking
  itemId: string;
  // Whether we're rating a ride (driver rating rider) or a booking (rider rating driver)
  type: 'ride' | 'booking';
  // The ID of the user who will receive the rating
  ratedUserId: string;
  // Name of the user being rated
  ratedUserName: string;
}

const RateUserScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RateUserRouteParams;
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      setLoading(true);
      
      if (params.type === 'ride') {
        // Load ride details (for driver rating rider)
        const response = await getRideById(params.itemId);
        setDetails(response.data);
      } else {
        // Load booking details (for rider rating driver)
        const response = await getBookingById(params.itemId);
        setDetails(response.data);
        
        // Also load ride details for context
        const rideResponse = await getRideById(response.data.ride);
        setDetails(prevDetails => ({
          ...prevDetails,
          ride: rideResponse.data,
        }));
      }
    } catch (error) {
      console.error('Error loading details:', error);
      Alert.alert('Error', 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const ratingData = {
        ride: params.type === 'ride' ? params.itemId : details.ride._id,
        booking: params.type === 'booking' ? params.itemId : details.bookings[0]._id,
        rated: params.ratedUserId,
        rating,
        comment: comment.trim() || undefined,
      };
      
      await submitRating(ratingData);
      
      Alert.alert(
        'Rating Submitted',
        'Thank you for your feedback!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Rate Your Experience</Text>
        
        <View style={styles.userInfoContainer}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>
              {params.ratedUserName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{params.ratedUserName}</Text>
          <Text style={styles.userType}>
            {params.type === 'ride' ? 'Rider' : 'Driver'}
          </Text>
        </View>
        
        <View style={styles.ratingContainer}>
          <RatingStars
            defaultRating={rating}
            onRatingChange={setRating}
            size={50}
            label="Rate your experience"
          />
        </View>
        
        <View style={styles.commentContainer}>
          <Text style={styles.commentLabel}>Additional Comments (Optional)</Text>
          <TextInput
            mode="outlined"
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us more about your experience..."
            multiline
            numberOfLines={4}
            style={styles.commentInput}
          />
        </View>
        
        <View style={styles.buttonsContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
            disabled={submitting}
          >
            Skip
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmitRating}
            style={styles.button}
            loading={submitting}
            disabled={submitting || rating === 0}
          >
            Submit Rating
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: COLORS.primary,
  },
  userInfoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userType: {
    fontSize: 16,
    color: COLORS.placeholder,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  commentContainer: {
    marginBottom: 30,
  },
  commentLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  commentInput: {
    backgroundColor: COLORS.background,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default RateUserScreen;