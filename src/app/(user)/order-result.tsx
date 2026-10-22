import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function OrderResultScreen() {
  const { orderId, walletVoucherId, status } = useLocalSearchParams();
  const { getOrderById, getWalletVoucherById } = useApp();

  const isSuccess = status !== 'FAILED';
  const order = getOrderById(orderId as string);
  const walletVoucher = getWalletVoucherById(walletVoucherId as string);

  return (
    <ScreenContainer scrollable edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.container}>
        {/* Status Illustration Icon */}
        <View
          style={[
            styles.statusCircle,
            isSuccess ? styles.statusCircleSuccess : styles.statusCircleFailed,
          ]}
        >
          <Ionicons
            name={isSuccess ? 'checkmark-circle' : 'close-circle'}
            size={64}
            color={isSuccess ? Colors.success : Colors.error}
          />
        </View>

        <Text style={styles.title}>
          {isSuccess ? 'Thanh Toán Thành Công! 🎉' : 'Giao Dịch Thất Bại'}
        </Text>
        <Text style={styles.subtitle}>
          {isSuccess
            ? 'Voucher ưu đãi thương hiệu của bạn đã được kích hoạt và lưu vào ví điện tử.'
            : 'Hệ thống chưa thể xử lý giao dịch thử nghiệm này. Vui lòng thử lại.'}
        </Text>

        {/* Order Receipt Card */}
        {order && (
          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <View>
                <Text style={styles.receiptNumberLabel}>Mã Đơn Hàng</Text>
                <Text style={styles.receiptNumberVal}>{order.id}</Text>
              </View>
              <View style={styles.paidBadge}>
                <Ionicons name="checkmark" size={12} color={Colors.success} />
                <Text style={styles.paidBadgeText}>
                  {order.status === 'PAID' ? 'ĐÃ THANH TOÁN' : order.status}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.itemRow}>
              <View style={styles.itemTexts}>
                <Text style={styles.itemBrand}>{order.brandName}</Text>
                <Text style={styles.itemTitle}>{order.voucherTitle}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(order.amount)}</Text>
            </View>

            {walletVoucher && (
              <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>Mã Passcode Voucher:</Text>
                <Text style={styles.codeValue}>{walletVoucher.voucherCode}</Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Phương Thức</Text>
              <Text style={styles.metaVal}>{order.paymentMethod}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Ngày Thanh Toán</Text>
              <Text style={styles.metaVal}>{formatDate(order.createdAt)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Tổng Tiền Đã Trả</Text>
              <Text style={styles.totalVal}>{formatCurrency(order.amount)}</Text>
            </View>
          </View>
        )}

        {/* Disclaimer Note */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.primaryCoral} />
          <Text style={styles.disclaimerText}>
            Giao dịch thành công: Bạn có thể kích hoạt và trải nghiệm sử dụng voucher trong Ví bất cứ lúc nào!
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <PrimaryButton
            title="Xem Trong Ví Voucher"
            onPress={() => router.replace('/(user)/wallet')}
            icon={<Ionicons name="wallet-outline" size={18} color={Colors.white} />}
            style={styles.actionBtn}
          />

          <SecondaryButton
            title="Quay Về Trang Chủ"
            onPress={() => router.replace('/(user)/home')}
            style={[styles.actionBtn, { marginTop: Spacing.sm }]}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  statusCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
    marginTop: Spacing.md,
    ...Shadows.card,
  },
  statusCircleSuccess: {
    backgroundColor: Colors.successLight,
  },
  statusCircleFailed: {
    backgroundColor: Colors.errorLight,
  },
  title: {
    ...Typography.h1,
    fontSize: 24,
    color: Colors.primaryText,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: Spacing.lg,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
    marginBottom: Spacing.base,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptNumberLabel: {
    ...Typography.caption,
    color: Colors.secondaryText,
  },
  receiptNumberVal: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: Colors.primaryText,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  paidBadgeText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '700',
    marginLeft: 3,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemTexts: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemBrand: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.secondaryText,
    textTransform: 'uppercase',
  },
  itemTitle: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.primaryText,
    marginTop: 2,
  },
  itemPrice: {
    ...Typography.h4,
    color: Colors.primaryCoral,
  },
  codeContainer: {
    backgroundColor: Colors.warmCream,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeLabel: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginBottom: 2,
  },
  codeValue: {
    ...Typography.h3,
    color: Colors.primaryCoral,
    letterSpacing: 2,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  metaLabel: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
  },
  metaVal: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.primaryText,
  },
  totalVal: {
    ...Typography.h3,
    color: Colors.primaryCoral,
    fontWeight: '800',
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warmCream,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
    width: '100%',
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  actions: {
    width: '100%',
  },
  actionBtn: {
    width: '100%',
  },
});
