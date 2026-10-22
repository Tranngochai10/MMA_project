import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WalletVoucher } from '../../types';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { BrandLogo } from '../brand/BrandLogo';
import { VoucherStatusBadge } from './VoucherStatusBadge';
import { formatDate } from '../../utils/formatters';

interface WalletVoucherCardProps {
  walletVoucher: WalletVoucher;
  onPress: () => void;
}

export const WalletVoucherCard: React.FC<WalletVoucherCardProps> = ({
  walletVoucher,
  onPress,
}) => {
  const isAvailable = walletVoucher.status === 'AVAILABLE';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.card,
        !isAvailable ? styles.cardInactive : null,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <BrandLogo
            url={walletVoucher.brandLogo}
            name={walletVoucher.brandName}
            size="sm"
          />
          <View style={styles.brandTextCol}>
            <Text style={styles.brandName}>{walletVoucher.brandName}</Text>
            <Text style={styles.discountBadge}>{walletVoucher.discountDisplay}</Text>
          </View>
        </View>

        <VoucherStatusBadge status={walletVoucher.status} />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {walletVoucher.title}
      </Text>

      {/* Dashed voucher tear line */}
      <View style={styles.tearLineContainer}>
        <View style={[styles.cutoutCircle, styles.cutoutLeft]} />
        <View style={styles.dashedLine} />
        <View style={[styles.cutoutCircle, styles.cutoutRight]} />
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Mã voucher</Text>
          <Text style={styles.codeValue}>{walletVoucher.voucherCode}</Text>
        </View>

        <View style={styles.expiryContainer}>
          <Text style={styles.expiryLabel}>
            {walletVoucher.status === 'REDEEMED' ? 'Đã đổi' : 'Hạn dùng'}
          </Text>
          <Text style={styles.expiryValue}>
            {walletVoucher.status === 'REDEEMED' && walletVoucher.redeemedDate
              ? walletVoucher.redeemedDate.split(' ')[0]
              : formatDate(walletVoucher.expirationDate)}
          </Text>
        </View>

        <View style={styles.viewDetailsBtn}>
          <Text style={styles.viewDetailsText}>Xem</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primaryCoral} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.card,
    position: 'relative',
    overflow: 'hidden',
  },
  cardInactive: {
    opacity: 0.78,
    backgroundColor: '#FAFAFA',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextCol: {
    marginLeft: Spacing.sm,
  },
  brandName: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.secondaryText,
    textTransform: 'uppercase',
  },
  discountBadge: {
    ...Typography.badge,
    color: Colors.primaryCoral,
    fontWeight: '800',
    marginTop: 1,
  },
  title: {
    ...Typography.h4,
    fontSize: 15,
    marginTop: Spacing.md,
    color: Colors.primaryText,
    lineHeight: 20,
  },
  tearLineContainer: {
    position: 'relative',
    marginVertical: Spacing.md,
    justifyContent: 'center',
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  cutoutCircle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.warmCream,
    top: -8,
  },
  cutoutLeft: {
    left: -24,
  },
  cutoutRight: {
    right: -24,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeContainer: {
    flex: 1.2,
  },
  codeLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.secondaryText,
  },
  codeValue: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.primaryText,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  expiryContainer: {
    flex: 1,
  },
  expiryLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.secondaryText,
  },
  expiryValue: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.primaryText,
    marginTop: 1,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightPeach,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  viewDetailsText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryCoral,
    marginRight: 2,
  },
});
