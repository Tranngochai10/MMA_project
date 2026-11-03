import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Voucher, VoucherStatus } from '../../types';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../constants/theme';
import { VoucherStatusBadge } from '../voucher/VoucherStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ManagerVoucherCardProps {
  voucher: Voucher;
  onPress: () => void;
  onEdit: () => void;
  onStatusChange: (status: VoucherStatus) => void;
}

export const ManagerVoucherCard: React.FC<ManagerVoucherCardProps> = ({
  voucher,
  onPress,
  onEdit,
  onStatusChange,
}) => {
  const [actionsOpen, setActionsOpen] = useState(false);
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.brandCol}>
          <Text style={styles.brandName}>{voucher.brandName}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {voucher.title}
          </Text>
        </View>
        <VoucherStatusBadge status={voucher.status} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Giá bán</Text>
          <Text style={styles.statValue}>{formatCurrency(voucher.sellingPrice)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Mức giảm</Text>
          <Text style={styles.statValue}>{voucher.discountDisplay}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Còn lại</Text>
          <Text style={styles.statValue}>
            {voucher.availableQuantity}/{voucher.totalQuantity}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Hạn dùng</Text>
          <Text style={styles.statValue}>{formatDate(voucher.expirationDate)}</Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onEdit}
          style={styles.actionBtn}
        >
          <Ionicons name="create-outline" size={16} color={Colors.primaryText} />
          <Text style={styles.actionBtnText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Thao tác trạng thái" accessibilityState={{ expanded: actionsOpen }} onPress={() => setActionsOpen(!actionsOpen)} style={styles.actionBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color={Colors.secondaryText} />
        </TouchableOpacity>

        {actionsOpen && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%', justifyContent: 'flex-end' }}>
        {voucher.status === 'ACTIVE' ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onStatusChange('PAUSED')}
            style={[styles.actionBtn, styles.warningBtn]}
          >
            <Ionicons name="pause-outline" size={16} color={Colors.warning} />
            <Text style={[styles.actionBtnText, { color: Colors.warning }]}>Tạm dừng</Text>
          </TouchableOpacity>
        ) : voucher.status === 'PAUSED' ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onStatusChange('ACTIVE')}
            style={[styles.actionBtn, styles.successBtn]}
          >
            <Ionicons name="play-outline" size={16} color={Colors.success} />
            <Text style={[styles.actionBtnText, { color: Colors.success }]}>Kích hoạt</Text>
          </TouchableOpacity>
        ) : voucher.status === 'DRAFT' ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onStatusChange('ACTIVE')}
            style={[styles.actionBtn, styles.successBtn]}
          >
            <Ionicons name="rocket-outline" size={16} color={Colors.success} />
            <Text style={[styles.actionBtnText, { color: Colors.success }]}>Phát hành</Text>
          </TouchableOpacity>
        ) : null}

        {voucher.status !== 'ENDED' && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onStatusChange('ENDED')}
            style={[styles.actionBtn, styles.dangerBtn]}
          >
            <Ionicons name="stop-circle-outline" size={16} color={Colors.error} />
            <Text style={[styles.actionBtnText, { color: Colors.error }]}>Kết thúc</Text>
          </TouchableOpacity>
        )}
        </View>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  brandCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  brandName: {
    ...Typography.caption,
    color: Colors.secondaryText,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    ...Typography.h4,
    color: Colors.primaryText,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.warmCream,
    padding: 12,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.md,
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    alignItems: 'flex-start',
    width: '46%',
  },
  statLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.secondaryText,
  },
  statValue: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primaryText,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    minHeight: 44,
  },
  actionBtnText: {
    ...Typography.caption,
    fontWeight: '600',
    marginLeft: 4,
    color: Colors.primaryText,
  },
  warningBtn: {
    borderColor: Colors.warningLight,
    backgroundColor: Colors.warningLight,
  },
  successBtn: {
    borderColor: Colors.successLight,
    backgroundColor: Colors.successLight,
  },
  dangerBtn: {
    borderColor: Colors.errorLight,
    backgroundColor: Colors.errorLight,
  },
});
