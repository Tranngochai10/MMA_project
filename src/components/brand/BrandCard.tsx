import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Brand } from '../../types';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { BrandLogo } from './BrandLogo';

interface BrandCardProps {
  brand: Brand;
  onPress: () => void;
  variant?: 'circle' | 'card';
  onFavoritePress?: () => void;
}

export const BrandCard: React.FC<BrandCardProps> = ({
  brand,
  onPress,
  variant = 'circle',
  onFavoritePress,
}) => {
  if (variant === 'circle') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.circleItem}
      >
        <BrandLogo url={brand.logo} name={brand.name} size="md" />
        <Text style={styles.circleName} numberOfLines={1}>
          {brand.name}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.cardContainer}
    >
      <BrandLogo url={brand.logo} name={brand.name} size="lg" />
      <View style={styles.cardInfo}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardName}>{brand.name}</Text>
          {onFavoritePress && (
            <TouchableOpacity
              onPress={onFavoritePress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={brand.isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={brand.isFavorite ? Colors.primaryCoral : Colors.secondaryText}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.cardCategory}>{brand.category}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {brand.description}
        </Text>
        <View style={styles.cardMetaRow}>
          <View style={styles.badgeRow}>
            <Ionicons name="pricetag-outline" size={13} color={Colors.primaryCoral} />
            <Text style={styles.badgeText}>{brand.voucherCount} ưu đãi</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#FFB800" />
            <Text style={styles.ratingText}>{brand.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circleItem: {
    alignItems: 'center',
    marginRight: Spacing.md,
    width: 68,
  },
  circleName: {
    ...Typography.bodySmall,
    color: Colors.primaryText,
    fontWeight: '600',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    ...Shadows.card,
  },
  cardInfo: {
    flex: 1,
    marginLeft: Spacing.base,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    ...Typography.h4,
    color: Colors.primaryText,
  },
  cardCategory: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginTop: 1,
  },
  cardDescription: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
    marginTop: 4,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightPeach,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.primaryCoral,
    fontWeight: '700',
    marginLeft: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryText,
    marginLeft: 3,
  },
});
