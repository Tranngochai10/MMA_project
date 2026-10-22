import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { BrandLogo } from '../../../components/brand/BrandLogo';
import { VoucherStatusBadge } from '../../../components/voucher/VoucherStatusBadge';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { SuccessModal } from '../../../components/common/SuccessModal';
import { EmptyState } from '../../../components/common/EmptyState';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export default function WalletVoucherDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { getWalletVoucherById, redeemWalletVoucher } = useApp();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [redeemedTimestamp, setRedeemedTimestamp] = useState<string | null>(null);

  const voucher = getWalletVoucherById(id as string);

  if (!voucher) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="wallet-outline"
          title="Không tìm thấy voucher"
          message="Không thể tìm thấy voucher trong ví điện tử của bạn."
          actionLabel="Quay lại ví"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  const isAvailable = voucher.status === 'AVAILABLE';
  const isRedeemed = voucher.status === 'REDEEMED';
  const isExpired = voucher.status === 'EXPIRED';

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleConfirmUse = () => {
    setShowConfirmModal(false);
    const result = redeemWalletVoucher(voucher.id);
    if (result.success) {
      setRedeemedTimestamp(result.redeemedDate);
      setShowSuccessModal(true);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScreenContainer scrollable contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}>
        <AppHeader title="Thẻ voucher" subtitle="Thẻ ví điện tử" showBack />

        <View style={styles.container}>
          {/* Main Ticket Card */}
          <View style={styles.ticketCard}>
            {/* Top Brand & Status */}
            <View style={styles.ticketHeader}>
              <View style={styles.brandRow}>
                <BrandLogo url={voucher.brandLogo} name={voucher.brandName} size="md" />
                <View style={styles.brandInfo}>
                  <Text style={styles.brandName}>{voucher.brandName}</Text>
                  <Text style={styles.discountBadge}>{voucher.discountDisplay}</Text>
                </View>
              </View>
              <VoucherStatusBadge status={voucher.status} size="md" />
            </View>

            <Text style={styles.voucherTitle}>{voucher.title}</Text>

            {/* Voucher Code Passcode Box */}
            <View style={styles.codeBox}>
              <Text style={styles.codeBoxLabel}>Mã đổi ưu đãi</Text>
              <Text style={styles.codeText}>{voucher.voucherCode}</Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleCopyCode}
                style={styles.copyBtn}
              >
                <Ionicons
                  name={copiedCode ? 'checkmark-circle' : 'copy-outline'}
                  size={16}
                  color={copiedCode ? Colors.success : Colors.primaryCoral}
                />
                <Text
                  style={[
                    styles.copyBtnText,
                    copiedCode ? { color: Colors.success } : null,
                  ]}
                >
                  {copiedCode ? 'Đã sao chép mã' : 'Sao chép mã'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Ticket Tear Perforation */}
            <View style={styles.tearPerforation}>
              <View style={[styles.tearCircle, styles.tearLeft]} />
              <View style={styles.tearDashed} />
              <View style={[styles.tearCircle, styles.tearRight]} />
            </View>

            {/* Meta Dates Grid */}
            <View style={styles.datesGrid}>
              <View style={styles.dateCol}>
                <Text style={styles.dateLabel}>Ngày mua</Text>
                <Text style={styles.dateValue}>{formatDate(voucher.purchasedDate)}</Text>
              </View>
              <View style={styles.dateCol}>
                <Text style={styles.dateLabel}>Hạn sử dụng</Text>
                <Text style={styles.dateValue}>{formatDate(voucher.expirationDate)}</Text>
              </View>
              <View style={styles.dateCol}>
                <Text style={styles.dateLabel}>Mệnh giá</Text>
                <Text style={styles.dateValue}>{formatCurrency(voucher.originalValue)}</Text>
              </View>
            </View>

            {/* Simulated Redemption History */}
            {isRedeemed && (
              <View style={styles.redemptionHistoryBox}>
                <View style={styles.historyHeader}>
                  <Ionicons name="checkmark-done-circle" size={18} color="#2563EB" />
                  <Text style={styles.historyTitle}>Lịch sử đổi mã</Text>
                </View>
                <Text style={styles.historyText}>
                  • Đã đổi thành công lúc: {voucher.redeemedDate || redeemedTimestamp || 'Vừa xong'}
                </Text>
                <Text style={styles.historySub}>
                  Đã ghi nhận trong hệ thống đối soát của Quản lý cửa hàng.
                </Text>
              </View>
            )}
          </View>

          {/* Usage Terms & Conditions */}
          <View style={styles.conditionsCard}>
            <Text style={styles.conditionsTitle}>Điều khoản & Điều kiện</Text>
            {voucher.usageConditions.map((cond, index) => (
              <View key={index} style={styles.condItem}>
                <Ionicons name="checkmark" size={14} color={Colors.primaryCoral} />
                <Text style={styles.condText}>{cond}</Text>
              </View>
            ))}
          </View>

          {/* Simulated Usage Disclaimer */}
          <View style={styles.disclaimerBox}>
            <Ionicons name="information-circle" size={18} color={Colors.primaryCoral} />
            <Text style={styles.disclaimerText}>
              Đưa mã này cho nhân viên thu ngân hoặc nhập mã vào trang thanh toán trực tuyến của thương hiệu để nhận ưu đãi.
            </Text>
          </View>
        </View>
      </ScreenContainer>

      {/* Fixed Bottom Action Button */}
      <View style={[styles.fixedBottom, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {isAvailable ? (
          <PrimaryButton
            title="Sử dụng voucher"
            onPress={() => setShowConfirmModal(true)}
            icon={<Ionicons name="scan-outline" size={18} color={Colors.white} />}
          />
        ) : isRedeemed ? (
          <PrimaryButton
            title="Đã sử dụng"
            onPress={() => {}}
            disabled
            icon={<Ionicons name="checkmark-done" size={18} color={Colors.secondaryText} />}
          />
        ) : (
          <PrimaryButton
            title="Voucher đã hết hạn"
            onPress={() => {}}
            disabled
            icon={<Ionicons name="time" size={18} color={Colors.secondaryText} />}
          />
        )}
      </View>

      {/* Confirmation Dialog before redemption */}
      <ConfirmDialog
        visible={showConfirmModal}
        title="Xác nhận sử dụng voucher?"
        message={`Bạn có chắc chắn muốn sử dụng "${voucher.title}"? Thao tác này sẽ chuyển thẻ sang trạng thái ĐÃ DÙNG.`}
        confirmLabel="Xác nhận dùng"
        cancelLabel="Hủy"
        icon="checkmark-circle-outline"
        disclaimer="Thao tác này sẽ xác nhận đổi mã voucher ngay lập tức."
        onConfirm={handleConfirmUse}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Success Modal after redemption */}
      <SuccessModal
        visible={showSuccessModal}
        title="Đổi mã thành công! 🎉"
        message={`Thẻ ${voucher.brandName} (${voucher.voucherCode}) của bạn đã được đổi thành công.`}
        subMessage="Trạng thái đã được chuyển sang ĐÃ DÙNG và đồng bộ trên hệ thống đối soát cửa hàng."
        buttonLabel="Hoàn tất"
        onClose={() => setShowSuccessModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.warmCream,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  container: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
  },
  ticketCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
    position: 'relative',
    overflow: 'hidden',
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandInfo: {
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
    marginTop: 2,
  },
  voucherTitle: {
    ...Typography.h3,
    fontSize: 17,
    color: Colors.primaryText,
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  codeBox: {
    backgroundColor: Colors.warmCream,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    alignItems: 'center',
    marginVertical: Spacing.base,
    borderWidth: 1.5,
    borderColor: '#FFDDC4',
    borderStyle: 'dashed',
  },
  codeBoxLabel: {
    ...Typography.caption,
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeText: {
    ...Typography.h1,
    fontSize: 24,
    color: Colors.primaryCoral,
    fontWeight: '900',
    letterSpacing: 2,
    marginVertical: Spacing.xs,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
  },
  copyBtnText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryCoral,
    marginLeft: 4,
  },
  tearPerforation: {
    position: 'relative',
    marginVertical: Spacing.md,
    justifyContent: 'center',
  },
  tearDashed: {
    height: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  tearCircle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.warmCream,
    top: -10,
  },
  tearLeft: {
    left: -26,
  },
  tearRight: {
    right: -26,
  },
  datesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateCol: {
    alignItems: 'center',
  },
  dateLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.secondaryText,
  },
  dateValue: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primaryText,
    marginTop: 2,
  },
  redemptionHistoryBox: {
    backgroundColor: '#EFF6FF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.base,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: '#1E40AF',
    marginLeft: 6,
  },
  historyText: {
    ...Typography.caption,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  historySub: {
    ...Typography.caption,
    color: '#3B82F6',
    fontSize: 10,
    marginTop: 2,
  },
  conditionsCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
    ...Shadows.card,
  },
  conditionsTitle: {
    ...Typography.h4,
    color: Colors.primaryText,
    marginBottom: Spacing.sm,
  },
  condItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  condText: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.lightPeach,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: '#FFDDC4',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginLeft: Spacing.sm,
    flex: 1,
    lineHeight: 16,
  },
  fixedBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.tabBar,
  },
});
