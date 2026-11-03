import React, { useState } from 'react';
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
  const [width, setWidth] = useState(0);
  const columns = width >= 900 ? 3 : width > 0 && width < 340 ? 1 : 2;
  return (
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={[styles.grid, style]}>
      {vouchers.map((voucher) => (
        <View key={voucher.id} style={[styles.gridItem, { width: columns === 3 ? '32%' : columns === 1 ? '100%' : '48.2%' }]}>
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
