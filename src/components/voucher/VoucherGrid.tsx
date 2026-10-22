import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Voucher } from '../../types';
import { Spacing } from '../../constants/theme';
import { VoucherCard } from './VoucherCard';

interface VoucherGridProps {
  vouchers: Voucher[];
  onVoucherPress: (voucher: Voucher) => void;
  onFavoritePress?: (voucherId: string) => void;
  style?: ViewStyle;
}

export const VoucherGrid: React.FC<VoucherGridProps> = ({
  vouchers,
  onVoucherPress,
  onFavoritePress,
  style,
}) => {
  return (
    <View style={[styles.grid, style]}>
      {vouchers.map((voucher) => (
        <View key={voucher.id} style={styles.gridItem}>
          <VoucherCard
            voucher={voucher}
            onPress={() => onVoucherPress(voucher)}
            onFavoritePress={
              onFavoritePress ? () => onFavoritePress(voucher.id) : undefined
            }
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
  },
  gridItem: {
    width: '48.2%',
    marginBottom: Spacing.base,
  },
});
