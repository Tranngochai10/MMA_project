import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VoucherStatus, WalletVoucherStatus, OrderStatus } from '../../types';
import { BorderRadius, Colors, Typography } from '../../constants/theme';

type CombinedStatus = VoucherStatus | WalletVoucherStatus | OrderStatus;

interface VoucherStatusBadgeProps {
  status: CombinedStatus;
  size?: 'sm' | 'md';
}

export const VoucherStatusBadge: React.FC<VoucherStatusBadgeProps> = ({
  status,
  size = 'sm',
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'PAID':
        return { label: 'Đã thanh toán', bg: Colors.successLight, color: Colors.success };
      case 'PENDING':
        return { label: 'Chờ xử lý', bg: Colors.warningLight, color: Colors.warning };
      case 'FAILED':
        return { label: 'Thất bại', bg: Colors.errorLight, color: Colors.error };
      case 'CANCELLED':
        return { label: 'Đã hủy', bg: Colors.disabled, color: Colors.secondaryText };
      case 'ACTIVE':
      case 'AVAILABLE':
        return {
          label: status === 'ACTIVE' ? 'Đang mở' : 'Khả dụng',
          bg: Colors.successLight,
          color: Colors.success,
        };
      case 'REDEEMED':
        return {
          label: 'Đã dùng',
          bg: Colors.primaryLight,
          color: Colors.primary,
        };
      case 'EXPIRED':
      case 'ENDED':
        return {
          label: status === 'EXPIRED' ? 'Hết hạn' : 'Đã kết thúc',
          bg: Colors.errorLight,
          color: Colors.error,
        };
      case 'PAUSED':
        return {
          label: 'Tạm dừng',
          bg: Colors.warningLight,
          color: Colors.warning,
        };
      case 'DRAFT':
        return {
          label: 'Bản nháp',
          bg: Colors.disabled,
          color: Colors.secondaryText,
        };
      default:
        return {
          label: status,
          bg: Colors.disabled,
          color: Colors.secondaryText,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        size === 'md' ? styles.badgeMd : null,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: config.color },
          size === 'md' ? styles.badgeTextMd : null,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
  },
  badgeText: {
    ...Typography.badge,
    fontSize: 12,
  },
  badgeTextMd: {
    fontSize: 12,
  },
});
