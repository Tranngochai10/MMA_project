import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';

interface PriceDisplayProps {
  sellingPrice: number;
  originalValue?: number;
  discountDisplay?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  sellingPrice,
  originalValue,
  discountDisplay,
  size = 'md',
  style,
}) => {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  return (
    <View style={[styles.container, style]}>
      <View style={styles.priceRow}>
        <Text
          style={[
            styles.sellingPrice,
            isLarge && styles.sellingPriceLg,
            isSmall && styles.sellingPriceSm,
          ]}
        >
          {formatCurrency(sellingPrice)}
        </Text>
        {originalValue && originalValue > sellingPrice ? (
          <Text
            style={[
              styles.originalValue,
              isLarge && styles.originalValueLg,
              isSmall && styles.originalValueSm,
            ]}
          >
            {formatCurrency(originalValue)}
          </Text>
        ) : null}
      </View>
      {discountDisplay ? (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{discountDisplay}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sellingPrice: {
    ...Typography.h4,
    color: Colors.primaryCoral,
    fontWeight: '800',
  },
  sellingPriceSm: {
    fontSize: 13,
  },
  sellingPriceLg: {
    fontSize: 22,
  },
  originalValue: {
    ...Typography.caption,
    textDecorationLine: 'line-through',
    color: Colors.tertiaryText,
    marginLeft: 6,
  },
  originalValueSm: {
    fontSize: 10,
  },
  originalValueLg: {
    fontSize: 14,
  },
  discountBadge: {
    backgroundColor: Colors.lightPeach,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryCoral,
    fontSize: 10,
  },
});
