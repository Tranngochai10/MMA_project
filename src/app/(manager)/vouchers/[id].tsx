import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { VoucherStatusBadge } from '../../../components/voucher/VoucherStatusBadge';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { EmptyState } from '../../../components/common/EmptyState';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../../constants/theme';
import { useApp } from '../../../context/AppContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { VoucherStatus } from '../../../types';

export default function ManagerVoucherDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getVoucherById, updateVoucherStatus } = useApp();

  const [confirmStatus, setConfirmStatus] = useState<VoucherStatus | null>(null);

  const voucher = getVoucherById(id as string);

  if (!voucher) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="pricetag-outline"
          title="Campaign Not Found"
          message="Could not locate the requested voucher campaign."
          actionLabel="Back to Campaigns"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  const issuedCount = voucher.totalQuantity - voucher.availableQuantity;
  const campaignRevenue = issuedCount * voucher.sellingPrice;

  const handleConfirmStatus = () => {
    if (confirmStatus) {
      updateVoucherStatus(voucher.id, confirmStatus);
      setConfirmStatus(null);
    }
  };

  return (
    <ScreenContainer scrollable>
      {/* Header */}
      <AppHeader
        title="Chi Tiết Chiến Dịch"
        subtitle={`Mã: ${voucher.id}`}
        showBack
        rightAction={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/(manager)/vouchers/${voucher.id}/edit`)}
            style={styles.editBtn}
          >
            <Ionicons name="create-outline" size={18} color={Colors.primaryCoral} />
            <Text style={styles.editBtnText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {/* Banner Image with Status Badge */}
        <View style={styles.coverWrapper}>
          <Image source={{ uri: voucher.coverImage }} style={styles.coverImage} />
          <View style={styles.statusBadgeWrap}>
            <VoucherStatusBadge status={voucher.status} size="md" />
          </View>
        </View>

        {/* Campaign Info Card */}
        <View style={styles.card}>
          <Text style={styles.brandName}>{voucher.brandName}</Text>
          <Text style={styles.voucherTitle}>{voucher.title}</Text>
          <Text style={styles.description}>{voucher.description}</Text>

          <View style={styles.divider} />

          {/* Quick Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Đã Bán</Text>
              <Text style={styles.metricVal}>
                {issuedCount} / {voucher.totalQuantity}
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Còn Lại</Text>
              <Text style={styles.metricVal}>{voucher.availableQuantity}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Doanh Thu</Text>
              <Text style={[styles.metricVal, { color: Colors.success }]}>
                {formatCurrency(campaignRevenue)}
              </Text>
            </View>
          </View>
        </View>

        {/* Campaign Status Management Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quản Lý Trạng Thái</Text>
          <Text style={styles.cardSub}>
            Thay đổi trạng thái để kiểm soát việc hiển thị và phân phối voucher trên ứng dụng khách hàng.
          </Text>

          <View style={styles.statusControlsRow}>
            {voucher.status !== 'ACTIVE' && voucher.status !== 'ENDED' && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setConfirmStatus('ACTIVE')}
                style={[styles.statusBtn, styles.activateBtn]}
              >
                <Ionicons name="play" size={18} color={Colors.success} />
                <Text style={[styles.statusBtnText, { color: Colors.success }]}>
                  {voucher.status === 'PAUSED' ? 'Tiếp Tục Chạy' : 'Kích Hoạt Ngay'}
                </Text>
              </TouchableOpacity>
            )}

            {voucher.status === 'ACTIVE' && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setConfirmStatus('PAUSED')}
                style={[styles.statusBtn, styles.pauseBtn]}
              >
                <Ionicons name="pause" size={18} color={Colors.warning} />
                <Text style={[styles.statusBtnText, { color: Colors.warning }]}>
                  Tạm Dừng Chiến Dịch
                </Text>
              </TouchableOpacity>
            )}

            {voucher.status !== 'ENDED' && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setConfirmStatus('ENDED')}
                style={[styles.statusBtn, styles.endBtn]}
              >
                <Ionicons name="stop-circle" size={18} color={Colors.error} />
                <Text style={[styles.statusBtnText, { color: Colors.error }]}>
                  Kết Thúc Chiến Dịch
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Pricing & Dates Detail */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tài Chính & Thời Gian</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Giá Bán Ưu Đãi</Text>
            <Text style={styles.detailVal}>{formatCurrency(voucher.sellingPrice)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Giá Gốc</Text>
            <Text style={styles.detailVal}>{formatCurrency(voucher.originalValue)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mức Giảm Giá</Text>
            <Text style={[styles.detailVal, { color: Colors.primaryCoral, fontWeight: '800' }]}>
              {voucher.discountDisplay}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày Bắt Đầu</Text>
            <Text style={styles.detailVal}>{formatDate(voucher.startDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ngày Hết Hạn</Text>
            <Text style={styles.detailVal}>{formatDate(voucher.expirationDate)}</Text>
          </View>
        </View>

        {/* Terms & Conditions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Điều Khoản Áp Dụng</Text>
          {voucher.usageConditions.map((cond, idx) => (
            <View key={idx} style={styles.condItem}>
              <View style={styles.bullet} />
              <Text style={styles.condText}>{cond}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Confirmation Dialog */}
      {confirmStatus && (
        <ConfirmDialog
          visible={true}
          title="Xác nhận đổi trạng thái"
          message={`Bạn có chắc chắn muốn chuyển trạng thái chiến dịch sang ${confirmStatus}?`}
          confirmLabel="Xác nhận cập nhật"
          cancelLabel="Hủy bỏ"
          isDestructive={confirmStatus === 'ENDED'}
          onConfirm={handleConfirmStatus}
          onCancel={() => setConfirmStatus(null)}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightPeach,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: '#FFDDC4',
  },
  editBtnText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primaryCoral,
    marginLeft: 4,
  },
  container: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  coverWrapper: {
    height: 180,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.base,
    ...Shadows.card,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusBadgeWrap: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
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
  brandName: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.secondaryText,
    textTransform: 'uppercase',
  },
  voucherTitle: {
    ...Typography.h2,
    fontSize: 20,
    color: Colors.primaryText,
    marginTop: 2,
  },
  description: {
    ...Typography.body,
    color: Colors.secondaryText,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.warmCream,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.secondaryText,
  },
  metricVal: {
    ...Typography.h4,
    color: Colors.primaryText,
    marginTop: 2,
    fontWeight: '800',
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.primaryText,
    marginBottom: 4,
  },
  cardSub: {
    ...Typography.caption,
    color: Colors.secondaryText,
    marginBottom: Spacing.md,
    lineHeight: 16,
  },
  statusControlsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.card,
    borderWidth: 1.5,
  },
  activateBtn: {
    borderColor: Colors.success,
    backgroundColor: Colors.successLight,
  },
  pauseBtn: {
    borderColor: Colors.warning,
    backgroundColor: Colors.warningLight,
  },
  endBtn: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  statusBtnText: {
    ...Typography.caption,
    fontWeight: '700',
    marginLeft: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  detailLabel: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
  },
  detailVal: {
    ...Typography.bodySmall,
    color: Colors.primaryText,
    fontWeight: '600',
  },
  condItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryCoral,
    marginTop: 6,
    marginRight: 8,
  },
  condText: {
    ...Typography.bodySmall,
    color: Colors.secondaryText,
    flex: 1,
    lineHeight: 18,
  },
});
