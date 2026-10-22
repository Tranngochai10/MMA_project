import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { PAYMENT_METHODS } from '../../constants/categories';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

export default function CheckoutScreen() {
  const { voucherId } = useLocalSearchParams();
  const { getVoucherById, createOrder } = useApp();

  const voucher = getVoucherById(voucherId as string);

  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!voucher) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="alert-circle-outline"
          title="No Voucher Selected"
          message="Please select a voucher first to proceed to checkout."
          actionLabel="Go to Marketplace"
          onAction={() => router.replace('/(user)/discover')}
        />
      </ScreenContainer>
    );
  }

  const selectedMethodObj = PAYMENT_METHODS.find((p) => p.id === selectedPayment) || PAYMENT_METHODS[0];

  const handleConfirmPurchase = () => {
    setShowConfirmModal(false);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const { order, walletVoucher } = createOrder(voucher.id, selectedMethodObj.name);

      router.replace({
        pathname: '/(user)/order-result',
        params: {
          orderId: order.id,
          walletVoucherId: walletVoucher.id,
          status: 'SUCCESS',
        },
      });
    }, 1000);
  };

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader title="Thanh Toán" subtitle="Hoàn tất đơn mua voucher ưu đãi" showBack />

      <View style={styles.container}>
        {/* Voucher Order Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeader}>Chi Tiết Đơn Hàng</Text>
          <View style={styles.voucherItemRow}>
            <Image source={{ uri: voucher.coverImage }} style={styles.thumbImage} />
            <View style={styles.voucherTexts}>
              <Text style={styles.brandName}>{voucher.brandName}</Text>
              <Text style={styles.voucherTitle} numberOfLines={2}>
                {voucher.title}
              </Text>
              <View style={styles.discountPill}>
                <Text style={styles.discountPillText}>{voucher.discountDisplay}</Text>
              </View>
            </View>
          </View>

          {/* Pricing Breakdown */}
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Giá gốc voucher</Text>
              <Text style={styles.breakdownValStriked}>{formatCurrency(voucher.originalValue)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Ưu đãi giảm giá</Text>
              <Text style={styles.breakdownDiscount}>
                -{formatCurrency(voucher.originalValue - voucher.sellingPrice)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Phí giao dịch sàn</Text>
              <Text style={styles.freeBadge}>MIỄN PHÍ</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng Thanh Toán</Text>
              <Text style={styles.totalVal}>{formatCurrency(voucher.sellingPrice)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.paymentCard}>
          <Text style={styles.cardHeader}>Phương Thức Thanh Toán</Text>

          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedPayment === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                activeOpacity={0.8}
                onPress={() => setSelectedPayment(method.id)}
                style={[styles.paymentMethodRow, isSelected && styles.paymentMethodActive]}
              >
                <View style={styles.methodIconWrapper}>
                  <Ionicons
                    name={method.icon as any}
                    size={22}
                    color={isSelected ? Colors.primaryCoral : Colors.primaryText}
                  />
                </View>

                <View style={styles.methodInfo}>
                  <Text style={[styles.methodName, isSelected && styles.methodNameActive]}>
                    {method.name}
                  </Text>
                  {method.balance ? (
                    <Text style={styles.methodBalance}>Khả dụng: {method.balance}</Text>
                  ) : null}
                </View>

                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Demo Disclaimer Banner */}
        <View style={styles.disclaimerBanner}>
          <Ionicons name="information-circle" size={20} color={Colors.primaryCoral} />
          <View style={styles.disclaimerTextCol}>
            <Text style={styles.disclaimerTitle}>Giao Dịch Mô Phỏng An Toàn</Text>
            <Text style={styles.disclaimerMessage}>
              Giao dịch thử nghiệm không trừ tiền thẻ thật. Mã voucher sẽ xuất hiện ngay trong ví voucher của bạn sau khi xác nhận.
            </Text>
          </View>
        </View>

        {/* Purchase CTA */}
        <PrimaryButton
          title={`Thanh Toán Ngay • ${formatCurrency(voucher.sellingPrice)}`}
          onPress={() => setShowConfirmModal(true)}
          loading={loading}
          style={styles.purchaseBtn}
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>Hủy Bỏ Đơn Hàng</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        visible={showConfirmModal}
        title="Xác Nhận Mua Voucher"
        message={`Xác nhận thanh toán ${formatCurrency(
          voucher.sellingPrice
        )} qua phương thức ${selectedMethodObj.name}?`}
        confirmLabel="Thanh toán ngay"
        cancelLabel="Kiểm tra lại"
        icon="cart"
        disclaimer="Mã voucher điện tử sẽ được cấp ngay vào ví của bạn."
        onConfirm={handleConfirmPurchase}
        onCancel={() => setShowConfirmModal(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
    marginBottom: Spacing.base,
  },
  cardHeader: {
    ...Typography.h4,
    color: Colors.primaryText,
    marginBottom: Spacing.md,
  },
  voucherItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  thumbImage: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
    backgroundColor: Colors.lightPeach,
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
  },
  discountPill: {
    backgroundColor: Colors.lightPeach,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  discountPillText: {
    ...Typography.caption,
    fontWeight: '800',
    color: Colors.primaryCoral,
  },
  breakdownContainer: {
    marginTop: Spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  breakdownLabel: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
  },
  breakdownValStriked: {
    ...Typography.bodySmall,
    color: Colors.tertiaryText,
    textDecorationLine: 'line-through',
  },
  breakdownDiscount: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.success,
  },
  freeBadge: {
    ...Typography.caption,
    fontWeight: '800',
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  totalLabel: {
    ...Typography.h4,
    color: Colors.primaryText,
  },
  totalVal: {
    ...Typography.h2,
    color: Colors.primaryCoral,
    fontWeight: '900',
  },
  paymentCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
    marginBottom: Spacing.base,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.2,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.white,
  },
  paymentMethodActive: {
    borderColor: Colors.primaryCoral,
    backgroundColor: Colors.warmCream,
  },
  methodIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightPeach,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  methodNameActive: {
    color: Colors.primaryCoral,
    fontWeight: '700',
  },
  methodBalance: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.secondaryText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.primaryCoral,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryCoral,
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.lightPeach,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: '#FFDDC4',
    marginBottom: Spacing.lg,
  },
  disclaimerTextCol: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  disclaimerTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primaryCoral,
  },
  disclaimerMessage: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginTop: 2,
    lineHeight: 16,
  },
  purchaseBtn: {
    marginBottom: Spacing.sm,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelBtnText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.secondaryText,
  },
});
