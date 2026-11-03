import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { mapOrder } from '../../../services/orderMapper';
import type { Order } from '../../../types';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { EmptyState } from '../../../components/common/EmptyState';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getOrderById, getWalletVoucherById } = useApp();

  const [loadedOrder, setLoadedOrder] = useState<Order>();
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api.order(String(id)).then(data => { if (active) setLoadedOrder(mapOrder(data)); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [id]);
  const order = loadedOrder || getOrderById(id as string);

  if (!order) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="receipt-outline"
          title="Order Not Found"
          message={error || "Loading order details..."}
          actionLabel="Back to Orders"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  const walletVoucher = order.walletVoucherId
    ? getWalletVoucherById(order.walletVoucherId)
    : undefined;

  return (
    <ScreenContainer scrollable>
      <AppHeader title={`Đơn hàng #${order.id}`} subtitle="Chi tiết giao dịch mua voucher" showBack />

      <View style={styles.container}>
        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusIconWrap}>
            <Ionicons
              name={order.status === 'PAID' ? 'checkmark-circle' : 'time-outline'}
              size={24}
              color={order.status === 'PAID' ? Colors.success : Colors.warning}
            />
          </View>
          <View style={styles.statusTexts}>
            <Text style={styles.statusTitle}>
              {order.status === 'PAID' ? 'Thanh toán thành công' : `Trạng thái: ${order.status}`}
            </Text>
            <Text style={styles.statusSub}>
              {order.status === 'PAID'
                ? 'Đơn hàng đã được xác nhận và voucher đã sẵn sàng trong ví của bạn.'
                : 'Giao dịch hiện đang ở trạng thái ' + order.status}
            </Text>
          </View>
        </View>

        {/* Voucher Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Voucher Đã Mua</Text>
          <View style={styles.voucherRow}>
            <BrandLogo url={order.brandLogo} name={order.brandName} size="md" />
            <View style={styles.voucherTexts}>
              <Text style={styles.brandName}>{order.brandName}</Text>
              <Text style={styles.voucherTitle}>{order.voucherTitle}</Text>
            </View>
          </View>

          {walletVoucher && (
            <View style={styles.walletCodeBox}>
              <Text style={styles.walletCodeLabel}>Mã Voucher Trong Ví</Text>
              <Text style={styles.walletCodeVal}>{walletVoucher.voucherCode}</Text>
              <Text style={styles.walletCodeStatus}>
                Trạng thái: {walletVoucher.status === 'AVAILABLE' ? 'Khả dụng' : walletVoucher.status}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi Tiết Thanh Toán</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã Đơn Hàng</Text>
            <Text style={styles.infoVal}>{order.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phương Thức</Text>
            <Text style={styles.infoVal}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời Gian Đặt</Text>
            <Text style={styles.infoVal}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng Thái</Text>
            <Text style={[styles.infoVal, { color: Colors.success, fontWeight: '700' }]}>
              {order.status === 'PAID' ? 'Đã thanh toán' : order.status}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng Thanh Toán</Text>
            <Text style={styles.totalVal}>{formatCurrency(order.amount)}</Text>
          </View>
        </View>

        {/* Action Button */}
        {order.status === 'PENDING' && order.paymentMethod === 'MB_BANK_TRANSFER' && order.paymentOrderId && (
          <PrimaryButton title="Xem QR và kiểm tra thanh toán" onPress={() => router.push({ pathname: '/(user)/checkout', params: { voucherId: order.voucherId, orderId: order.paymentOrderId } })} />
        )}
        {order.status === 'PAID' && (
          <PrimaryButton
            title="Mở Trong Ví Voucher"
            onPress={() => {
              if (order.walletVoucherId) {
                router.push(`/(user)/wallet/${order.walletVoucherId}`);
              } else {
                router.push('/(user)/wallet');
              }
            }}
            icon={<Ionicons name="wallet-outline" size={18} color={Colors.white} />}
            style={styles.actionBtn}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.base,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  statusIconWrap: {
    marginRight: Spacing.md,
  },
  statusTexts: {
    flex: 1,
  },
  statusTitle: {
    ...Typography.h4,
    color: Colors.primaryText,
  },
  statusSub: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginTop: 2,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.primaryText,
    marginBottom: Spacing.md,
  },
  voucherRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voucherTexts: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  brandName: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.secondaryText,
    textTransform: 'uppercase',
  },
  voucherTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.primaryText,
    marginTop: 2,
    fontSize: 22,
    lineHeight: 30,
  },
  walletCodeBox: {
    backgroundColor: Colors.warmCream,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  walletCodeLabel: {
    ...Typography.caption,
    color: Colors.secondaryText,
  },
  walletCodeVal: {
    ...Typography.h3,
    color: Colors.primaryCoral,
    letterSpacing: 2,
    fontWeight: '800',
    marginTop: 2,
  },
  walletCodeStatus: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '700',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  infoLabel: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
  },
  infoVal: {
    ...Typography.bodySmall,
    color: Colors.primaryText,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    ...Typography.h4,
    color: Colors.primaryText,
  },
  totalVal: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 26,
  },
  actionBtn: {
    marginTop: Spacing.sm,
  },
});
