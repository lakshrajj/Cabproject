import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../utils/theme';

interface RatingStarsProps {
  defaultRating?: number;
  maxRating?: number;
  disabled?: boolean;
  size?: number;
  label?: string;
  showLabel?: boolean;
  onRatingChange?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  defaultRating = 0,
  maxRating = 5,
  disabled = false,
  size = 30,
  label = 'Rate your experience',
  showLabel = true,
  onRatingChange,
}) => {
  const [rating, setRating] = useState(defaultRating);

  const handleRatingChange = (newRating: number) => {
    if (!disabled) {
      setRating(newRating);
      onRatingChange && onRatingChange(newRating);
    }
  };

  return (
    <View style={styles.container}>
      {showLabel && <Text style={styles.label}>{label}</Text>}
      <View style={styles.starsContainer}>
        {Array.from({ length: maxRating }).map((_, index) => {
          const currentRating = index + 1;
          const filled = currentRating <= rating;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleRatingChange(currentRating)}
              disabled={disabled}
              style={styles.starButton}
            >
              <Icon
                name={filled ? 'star' : 'star-outline'}
                size={size}
                color={filled ? COLORS.warning : COLORS.disabled}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      {rating > 0 && (
        <Text style={styles.ratingText}>
          {rating}.0 / {maxRating}.0
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starButton: {
    padding: 5,
  },
  ratingText: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RatingStars;