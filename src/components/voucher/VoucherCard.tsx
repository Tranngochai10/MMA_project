import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Voucher } from '../../types';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { BrandLogo } from '../brand/BrandLogo';
import { PriceDisplay } from './PriceDisplay';
import { formatDate } from '../../utils/formatters';

interface VoucherCardProps {
  voucher: Voucher;
  onPress: () => void;
  onFavoritePress?: () => void;
  style?: ViewStyle;
}

export const VoucherCard: React.FC<VoucherCardProps> = ({
  voucher,
  onPress,
  onFavoritePress,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {/* Top Banner Image with Overlay Logo & Favorite */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: voucher.coverImage }}
          style={styles.coverImage}
        />
        <View style={styles.topRow}>
          <BrandLogo
            url={voucher.brandLogo}
            name={voucher.brandName}
            size="sm"
            style={styles.logoBadge}
          />
          {onFavoritePress && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onFavoritePress}
              style={styles.favoriteButton}
            >
              <Ionicons
                name={voucher.isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color={voucher.isFavorite ? Colors.primaryCoral : Colors.secondaryText}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Discount Tag */}
        <View style={styles.discountTag}>
          <Text style={styles.discountTagText}>{voucher.discountDisplay}</Text>
        </View>
      </View>

      {/* Card Body */}
      <View style={styles.content}>
        <Text style={styles.brandName} numberOfLines={1}>
          {voucher.brandName}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {voucher.title}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={12} color={Colors.secondaryText} />
          <Text style={styles.expiryText}>HSD: {formatDate(voucher.expirationDate)}</Text>
        </View>

        <View style={styles.divider} />

        <PriceDisplay
          sellingPrice={voucher.sellingPrice}
          originalValue={voucher.originalValue}
          size="sm"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  imageContainer: {
    width: '100%',
    height: 110,
    backgroundColor: Colors.lightPeach,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topRow: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoBadge: {
    ...Shadows.soft,
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  discountTag: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.primaryCoral,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  discountTagText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    padding: Spacing.md,
  },
  brandName: {
    ...Typography.caption,
    color: Colors.secondaryText,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...Typography.body,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryText,
    marginTop: 2,
    lineHeight: 18,
    minHeight: 36,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  expiryText: {
    ...Typography.caption,
    color: Colors.secondaryText,
    fontSize: 11,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
});
